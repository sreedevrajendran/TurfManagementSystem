import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendBlockAnnouncement, sendBlockCancelledAnnouncement } from "@/lib/email";

const formatHour = (t: string) => {
  const [h] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:00 ${ampm}`;
};

// POST /api/admin/blocks → create block + email all users
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { date, startTime, endTime, reason } = await req.json();
  if (!date || startTime === undefined || endTime === undefined || !reason)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const startHour = parseInt(startTime);
  const endHour = parseInt(endTime);
  const duration = endHour > startHour ? endHour - startHour : 1;
  const blockDate = new Date(date);

  // Create BLOCKED booking entry in DB
  const block = await prisma.booking.create({
    data: {
      date: blockDate,
      startTime: startHour,
      durationHours: duration,
      amount: 0,
      status: "BLOCKED",
      reason,
    },
  });

  // Cancel any overlapping real bookings on that date/time
  const dayStart = new Date(date); dayStart.setHours(0,0,0,0);
  const dayEnd = new Date(date); dayEnd.setHours(23,59,59,999);
  const overlapping = await prisma.booking.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["CANCELLED", "BLOCKED"] },
      startTime: { gte: startHour, lt: endHour },
    },
    include: { user: { select: { email: true, name: true } } },
  });
  for (const b of overlapping) {
    await prisma.booking.update({ where: { id: b.id }, data: { status: "CANCELLED" } });
  }

  // Email all registered users about the block
  try {
    const users = await prisma.user.findMany({ select: { email: true } });
    const emails = users.map(u => u.email).filter(Boolean) as string[];
    await sendBlockAnnouncement({
      toList: emails,
      date: blockDate.toLocaleDateString("en-IN"),
      startTime: formatHour(startTime),
      endTime: formatHour(endTime),
      reason,
    });
  } catch (e) {
    console.error("Block email failed:", e);
  }

  return NextResponse.json({ success: true, block, cancelledCount: overlapping.length });
}

// DELETE /api/admin/blocks → unblock + email all users
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  const block = await prisma.booking.findUnique({ where: { id } });
  if (!block || block.status !== "BLOCKED")
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.booking.delete({ where: { id } });

  // Notify all users that the block was lifted
  try {
    const users = await prisma.user.findMany({ select: { email: true } });
    const emails = users.map(u => u.email).filter(Boolean) as string[];
    await sendBlockCancelledAnnouncement({
      toList: emails,
      date: new Date(block.date).toLocaleDateString("en-IN"),
      reason: block.reason || "Scheduled block",
    });
  } catch (e) {
    console.error("Block cancel email failed:", e);
  }

  return NextResponse.json({ success: true });
}
