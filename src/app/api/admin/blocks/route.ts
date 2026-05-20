import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendBlockAnnouncement, sendBlockCancelledAnnouncement, sendCancellationEmail } from "@/lib/email";

const fmtHour = (h: number) => `${h % 12 || 12}:00 ${h >= 12 ? "PM" : "AM"}`;
const fmtTime = (t: string) => { const [h] = t.split(":").map(Number); return fmtHour(h); };

function eachDay(from: Date, to: Date) {
  const days: Date[] = [];
  const cur = new Date(from); cur.setHours(0, 0, 0, 0);
  const end = new Date(to); end.setHours(0, 0, 0, 0);
  while (cur <= end) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return days;
}

// POST → create block (single day or date range) + email all users
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { startDate, endDate, startTime, endTime, reason } = await req.json();
  if (!startDate || !endDate || startTime === undefined || endTime === undefined || !reason)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const startHour = parseInt(startTime);
  const endHour = parseInt(endTime);
  // Full-day block if start=0 end=24, else partial
  const duration = endHour > startHour ? endHour - startHour : 24;

  const days = eachDay(new Date(startDate), new Date(endDate));

  // Create one BLOCKED booking per day
  const blocks = await Promise.all(
    days.map(day =>
      prisma.booking.create({
        data: { date: day, startTime: startHour, durationHours: duration, amount: 0, status: "BLOCKED", reason },
      })
    )
  );

  // Cancel overlapping real bookings across all days
  let cancelledCount = 0;
  for (const day of days) {
    const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
    
    // Fetch all active bookings for the day to filter mathematically overlapping ones in JS
    const dayBookings = await prisma.booking.findMany({
      where: { 
        date: { gte: dayStart, lte: dayEnd }, 
        status: { notIn: ["CANCELLED", "BLOCKED"] } 
      },
      include: { user: true, team: true },
    });

    const overlapping = dayBookings.filter(b => {
      const bStart = b.startTime;
      const bEnd = b.startTime + b.durationHours;
      return bStart < endHour && startHour < bEnd;
    });

    for (const b of overlapping) {
      await prisma.booking.update({ where: { id: b.id }, data: { status: "CANCELLED" } });
      cancelledCount++;
      if (b.user?.email) {
        try {
          await sendCancellationEmail({
            to: b.user.email,
            name: b.user.name || "Customer",
            teamName: b.team?.name || b.user.name || "Unknown Team",
            date: new Date(b.date).toLocaleDateString("en-IN"),
            startTime: b.startTime,
            duration: b.durationHours,
            reason,
          });
        } catch (e) { console.error("Individual cancel email failed:", e); }
      }
    }
  }

  // Email all users
  try {
    const users = await prisma.user.findMany({ select: { email: true } });
    const emails = users.map(u => u.email).filter(Boolean) as string[];
    const dateLabel = startDate === endDate
      ? new Date(startDate).toLocaleDateString("en-IN")
      : `${new Date(startDate).toLocaleDateString("en-IN")} – ${new Date(endDate).toLocaleDateString("en-IN")}`;
    await sendBlockAnnouncement({ toList: emails, date: dateLabel, startTime: fmtTime(startTime), endTime: fmtTime(endTime), reason });
  } catch (e) { console.error("Block email failed:", e); }

  return NextResponse.json({ success: true, blockIds: blocks.map(b => b.id), cancelledCount });
}

// PATCH → edit reason on a block
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, reason } = await req.json();
  const updated = await prisma.booking.update({ where: { id }, data: { reason } });
  return NextResponse.json({ success: true, block: updated });
}

// DELETE → remove block + email users
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  const block = await prisma.booking.findUnique({ where: { id } });
  if (!block || block.status !== "BLOCKED")
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.booking.delete({ where: { id } });

  try {
    const users = await prisma.user.findMany({ select: { email: true } });
    const emails = users.map(u => u.email).filter(Boolean) as string[];
    await sendBlockCancelledAnnouncement({
      toList: emails,
      date: new Date(block.date).toLocaleDateString("en-IN"),
      reason: block.reason || "Scheduled block",
    });
  } catch (e) { console.error("Block cancel email failed:", e); }

  return NextResponse.json({ success: true });
}
