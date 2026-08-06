import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminCancelBookingNotification } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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
      include: { user: true, team: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    
    // Check if the user owns the booking or is an admin
    if (booking.user?.email !== session.user.email && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow user cancellation if the slot is more than 30 minutes away
    const now = new Date();
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(booking.startTime, 0, 0, 0);

    const timeDiffMs = bookingDate.getTime() - now.getTime();

    if (timeDiffMs < 30 * 60 * 1000 && !isAdmin) {
      return NextResponse.json({ error: "Cannot cancel a slot within 30 minutes of its start time or after it has started." }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    // Format time in 12-hour format
    const start12Hour = booking.startTime % 12 || 12;
    const ampm = booking.startTime >= 12 ? 'PM' : 'AM';

    // Notify admin
    sendAdminCancelBookingNotification({
      date: new Date(booking.date).toLocaleDateString('en-IN'),
      startTime: `${booking.startTime}:00 (${start12Hour}:00 ${ampm})`,
      court: booking.sport,
      userName: session.user.name,
      userEmail: session.user.email,
      phone: booking.team?.phone,
    }).catch(err => console.error("Cancel email notification failed:", err));

    return NextResponse.json({ success: true, booking: updatedBooking });

  } catch (err: any) {
    console.error("Cancel booking error:", err);
    return NextResponse.json({ error: "Something went wrong while cancelling the booking. Please try again or contact us." }, { status: 500 });
  }
}
