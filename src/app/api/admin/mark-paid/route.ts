import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendPaymentThankYou } from "@/lib/email";

// POST /api/admin/mark-paid  → mark booking as PAID and send thank you email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { bookingId } = await req.json();

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PAID" },
    include: { user: true, team: true },
  });

  // Send thank you email if we have the user's email
  if (booking.user?.email) {
    try {
      await sendPaymentThankYou({
        to: booking.user.email,
        name: booking.user.name || "Customer",
        teamName: booking.team?.name || "Your Team",
        amount: booking.amount,
        date: booking.date.toLocaleDateString("en-IN"),
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }
  }

  return NextResponse.json({ success: true, booking });
}
