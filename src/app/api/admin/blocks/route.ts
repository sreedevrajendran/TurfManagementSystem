import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

function eachDay(from: Date, to: Date) {
  const days: Date[] = [];
  const cur = new Date(from); cur.setHours(0, 0, 0, 0);
  const end = new Date(to); end.setHours(0, 0, 0, 0);
  while (cur <= end) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return days;
}

// POST → create block (single day or date range)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { startDate, endDate, startTime, endTime, reason } = await req.json();
    if (!startDate || !endDate || startTime === undefined || endTime === undefined || !reason)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (parsedStart > parsedEnd) {
      return NextResponse.json({ error: "Start date must be before or equal to end date" }, { status: 400 });
    }

    const diffDays = Math.ceil((parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      return NextResponse.json({ error: "Date range cannot exceed 90 days" }, { status: 400 });
    }

    const startHour = parseInt(startTime, 10);
    const endHour = parseInt(endTime, 10);
    if (isNaN(startHour) || isNaN(endHour) || startHour < 0 || startHour > 24 || endHour < 0 || endHour > 24 || startHour > endHour) {
      return NextResponse.json({ error: "Invalid time range. Hours must be between 0 and 24." }, { status: 400 });
    }

    const cleanReason = sanitizeText(reason, 200);
    if (!cleanReason) {
      return NextResponse.json({ error: "A valid reason is required." }, { status: 400 });
    }

    const duration = endHour > startHour ? endHour - startHour : 24;
    const days = eachDay(parsedStart, parsedEnd);

    // Create one BLOCKED booking per day
    const blocks = await Promise.all(
      days.map(day =>
        prisma.booking.create({
          data: {
            date: day,
            startTime: startHour,
            durationHours: duration,
            amount: 0,
            status: "BLOCKED",
            reason: cleanReason,
          },
        })
      )
    );

    // Cancel overlapping real bookings across all days
    let cancelledCount = 0;
    for (const day of days) {
      const allActiveBookings = await prisma.booking.findMany({
        where: { 
          status: { notIn: ["CANCELLED", "BLOCKED"] } 
        },
        include: { user: true, team: true },
      });

      const targetDateStr = day.toDateString();

      const overlapping = allActiveBookings.filter(b => {
        if (new Date(b.date).toDateString() !== targetDateStr) return false;
        const bStart = b.startTime;
        const bEnd = b.startTime + b.durationHours;
        return bStart < endHour && startHour < bEnd;
      });

      for (const b of overlapping) {
        await prisma.booking.update({
          where: { id: b.id },
          data: {
            status: "CANCELLED",
            reason: `Cancelled due to: ${cleanReason}`,
          },
        });
        cancelledCount++;
      }
    }

    return NextResponse.json({ success: true, blockIds: blocks.map(b => b.id), cancelledCount });
  } catch (err: any) {
    console.error("Admin block error:", err);
    return NextResponse.json({ error: "Failed to create block" }, { status: 500 });
  }
}

// PATCH → edit reason on a block
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, reason } = await req.json();
    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: "Invalid block ID" }, { status: 400 });
    }

    const cleanReason = sanitizeText(reason, 200);
    if (!cleanReason) {
      return NextResponse.json({ error: "A valid reason is required." }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { reason: cleanReason },
    });
    return NextResponse.json({ success: true, block: updated });
  } catch (err: any) {
    console.error("Edit block error:", err);
    return NextResponse.json({ error: "Failed to edit block" }, { status: 500 });
  }
}

// DELETE → remove block
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: "Invalid block ID" }, { status: 400 });
    }

    const block = await prisma.booking.findUnique({ where: { id } });
    if (!block || block.status !== "BLOCKED")
      return NextResponse.json({ error: "Block not found" }, { status: 404 });

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete block error:", err);
    return NextResponse.json({ error: "Failed to delete block" }, { status: 500 });
  }
}
