import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    
    // Check if the user owns the booking or is an admin
    if (booking.user.email !== session.user.email && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional: Only allow cancellation if the slot is in the future
    const now = new Date();
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(booking.startTime, 0, 0, 0);

    if (now >= bookingDate && !isAdmin) {
      return NextResponse.json({ error: "Cannot cancel a slot that has already started or passed." }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    return NextResponse.json({ success: true, booking: updatedBooking });

  } catch (err: any) {
    console.error("Cancel booking error:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel booking" }, { status: 500 });
  }
}
