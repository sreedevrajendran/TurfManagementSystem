import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/mark-paid  → mark booking as PAID
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId || typeof bookingId !== 'string' || bookingId.length > 50) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
      include: { user: true, team: true },
    });

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Mark paid error:", err);
    return NextResponse.json({ error: "Failed to mark booking as paid" }, { status: 500 });
  }
}
