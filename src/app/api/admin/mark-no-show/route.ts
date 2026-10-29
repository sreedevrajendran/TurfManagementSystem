import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId || typeof bookingId !== 'string' || bookingId.length > 50) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, team: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot mark a cancelled booking as no-show." }, { status: 400 });
    }

    // Apply a 50% penalty
    const penaltyAmount = Math.round(booking.amount * 0.5);

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "DUE",
        amount: penaltyAmount,
      },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err: any) {
    console.error("Mark no-show error:", err);
    return NextResponse.json({ error: "Failed to mark no-show penalty. Please try again." }, { status: 500 });
  }
}
