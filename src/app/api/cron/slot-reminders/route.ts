import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSlotReminder } from "@/lib/email";

/**
 * Vercel Cron — runs every minute.
 * When the current time is HH:50 (10 minutes before the next hour),
 * we find all active bookings starting at HH+1:00 today
 * and send a "10 minutes away" reminder email to the user.
 *
 * Secured by CRON_SECRET env var.
 */
export async function GET(req: NextRequest) {
  // Verify secret so only Vercel cron (or admin) can trigger this
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use IST (UTC+5:30)
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Only fire at the :50 mark (within a 1-minute window to handle cron jitter)
  if (currentMinute < 49 || currentMinute > 51) {
    return NextResponse.json({ skipped: true, reason: "Not the :50 mark", time: `${currentHour}:${currentMinute}` });
  }

  // The slot we need to remind about starts 10 min from now → next hour
  const targetHour = (currentHour + 1) % 24;

  // Get today's date range in IST
  const todayIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  todayIST.setHours(0, 0, 0, 0);
  const tomorrowIST = new Date(todayIST);
  tomorrowIST.setDate(tomorrowIST.getDate() + 1);

  // Find active bookings starting at targetHour today
  const bookings = await prisma.booking.findMany({
    where: {
      date: { gte: todayIST, lt: tomorrowIST },
      startTime: targetHour,
      status: { in: ["DUE", "PENDING", "PAID"] },
    },
    include: {
      user: { select: { email: true, name: true } },
      team: { select: { name: true } },
    },
  });

  const results: string[] = [];

  for (const booking of bookings) {
    if (!booking.user?.email) continue;
    try {
      await sendSlotReminder({
        to: booking.user.email,
        name: booking.user.name || "Player",
        teamName: booking.team?.name || "Your Team",
        date: new Date(booking.date).toLocaleDateString("en-IN"),
        startTime: booking.startTime,
        duration: booking.durationHours,
        amount: booking.amount,
      });
      results.push(`✅ ${booking.user.email}`);
    } catch (e) {
      results.push(`❌ ${booking.user.email}: ${e}`);
    }
  }

  return NextResponse.json({
    sent: results.length,
    targetHour,
    results,
  });
}
