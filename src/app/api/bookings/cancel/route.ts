import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminCancelBookingNotification } from "@/lib/email";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId || typeof bookingId !== 'string' || bookingId.length > 50) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, team: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking has already been cancelled." }, { status: 400 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    
    // Check if the user owns the booking or is an admin
    if (booking.user?.email !== session.user.email && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You cannot cancel another user's booking" }, { status: 403 });
    }

    // Only allow customer cancellation if the slot is at least 2 hours away
    const now = new Date();
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(booking.startTime, 0, 0, 0);

    const timeDiffMs = bookingDate.getTime() - now.getTime();

    if (timeDiffMs < 2 * 60 * 60 * 1000 && !isAdmin) {
      return NextResponse.json({ error: "Cannot cancel a slot within 2 hours of its start time or after it has started." }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    // Format time in 12-hour format
    const start12Hour = booking.startTime % 12 || 12;
    const ampm = booking.startTime >= 12 ? 'PM' : 'AM';

    const rawPhone = booking.phone || booking.team?.phone || '';
    const cleanPhone = rawPhone.includes('_') ? rawPhone.split('_')[0] : rawPhone;

    // Notify admin
    sendAdminCancelBookingNotification({
      date: new Date(booking.date).toLocaleDateString('en-IN'),
      startTime: `${booking.startTime}:00 (${start12Hour}:00 ${ampm})`,
      court: booking.sport,
      userName: sanitizeText(session.user.name || booking.teamName || 'User'),
      userEmail: session.user.email,
      phone: cleanPhone !== 'NO_PHONE' ? cleanPhone : 'Not provided',
    }).catch(err => console.error("Cancel email notification failed:", err));

    return NextResponse.json({ success: true, booking: updatedBooking });

  } catch (err: any) {
    console.error("Cancel booking error:", err);
    return NextResponse.json({ error: "Something went wrong while cancelling the booking. Please try again or contact us." }, { status: 500 });
  }
}
