import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendBlockEndedAnnouncement } from "@/lib/email";

/**
 * Vercel Cron — runs at the top of every hour.
 * Finds blocks that have just ended and emails users that the turf is now open.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use IST (UTC+5:30)
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const currentHour = now.getHours();

  const todayIST = new Date(now);
  todayIST.setHours(0, 0, 0, 0);

  // If currentHour is 0, the block ended at midnight, which was technically the previous day's booking record.
  const targetDate = currentHour === 0 ? new Date(todayIST.getTime() - 24 * 60 * 60 * 1000) : todayIST;

  const blocks = await prisma.booking.findMany({
    where: {
      date: targetDate,
      status: "BLOCKED",
    },
  });

  // Check if (startTime + durationHours) % 24 equals the current hour.
  // Wait, if it's duration 24, it wraps around to startTime.
  // So if it started at 0 and duration is 24, end time is 0 (midnight next day).
  const endedBlocks = blocks.filter(b => (b.startTime + b.durationHours) % 24 === currentHour);

  let sent = 0;
  if (endedBlocks.length > 0) {
    const users = await prisma.user.findMany({ select: { email: true } });
    const emails = users.map(u => u.email).filter(Boolean) as string[];

    for (const block of endedBlocks) {
      try {
        await sendBlockEndedAnnouncement({
          toList: emails,
          date: new Date(block.date).toLocaleDateString("en-IN"),
          reason: block.reason || "Scheduled block",
        });
        sent++;
      } catch (e) {
        console.error("Failed to send block ended email:", e);
      }
    }
  }

  return NextResponse.json({ success: true, checkedBlocks: endedBlocks.length, sent });
}
