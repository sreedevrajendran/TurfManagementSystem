import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as any).role === "ADMIN";

  try {
    const { date, startTime, durationHours, teamName, phone, amount } = await req.json();

    if (!date || startTime === undefined || !teamName || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create the Team record
    let team = null;
    if (isAdmin && phone) {
      // Admin provides team details — upsert by phone
      team = await prisma.team.upsert({
        where: { phone },
        update: { name: teamName },
        create: { name: teamName, phone },
      });
    } else if (!isAdmin) {
      // Regular user — find or create team by their name + userId as phone fallback
      const userPhone = `USER-${(session.user as any).id}`;
      team = await prisma.team.upsert({
        where: { phone: userPhone },
        update: { name: teamName },
        create: { name: teamName, phone: userPhone },
      });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        startTime: Number(startTime),
        durationHours: Number(durationHours),
        amount: Number(amount),
        status: "DUE",
        teamId: team?.id ?? undefined,
        userId: (session.user as any).id ?? undefined,
      },
    });

    // Send confirmation email
    const userEmail = session.user?.email;
    if (userEmail) {
      try {
        await sendBookingConfirmation({
          to: userEmail,
          name: session.user?.name || "Customer",
          teamName: teamName.trim(),
          date: new Date(date).toLocaleDateString("en-IN"),
          startTime: Number(startTime),
          duration: Number(durationHours),
          amount: Number(amount),
        });
      } catch (e) {
        console.error("Confirmation email failed:", e);
      }
    }

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: err.message || "Booking failed" }, { status: 500 });
  }
}
