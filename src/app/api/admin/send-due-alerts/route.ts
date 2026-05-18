import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendDueAlert } from "@/lib/email";

// POST /api/admin/send-due-alerts → blast due reminder emails to all users with pending dues
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get all DUE bookings that have a linked user with an email
  const dueBookings = await prisma.booking.findMany({
    where: { status: "DUE", user: { email: { not: null } } },
    include: { user: true, team: true },
  });

  let sent = 0;
  for (const booking of dueBookings) {
    if (booking.user?.email) {
      try {
        await sendDueAlert({
          to: booking.user.email,
          name: booking.user.name || "Customer",
          teamName: booking.team?.name || "Your Team",
          amount: booking.amount,
          date: booking.date.toLocaleDateString("en-IN"),
        });
        sent++;
      } catch (e) {
        console.error(`Failed to send due alert to ${booking.user.email}:`, e);
      }
    }
  }

  return NextResponse.json({ success: true, sent, total: dueBookings.length });
}
