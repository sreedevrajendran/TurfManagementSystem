import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendBookingConfirmation, sendAdminBookingAlert } from "@/lib/email";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  
  if (!dateStr) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  // Set the start and end of the requested day in local time
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        startTime: true,
        durationHours: true,
      },
    });

    // Expand duration into array of booked hours
    const bookedHours: number[] = [];
    bookings.forEach(b => {
      for (let i = 0; i < b.durationHours; i++) {
        bookedHours.push((b.startTime + i) % 24);
      }
    });

    return NextResponse.json(bookedHours);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as any).role === "ADMIN";

  try {
    const { date, startTime, durationHours, teamName, phone, amount } = await req.json();

    if (!date || startTime === undefined || !teamName || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Ensure User exists in DB (upsert by email) ──────────────────────────
    // This handles the case where NextAuth JWT + PrismaAdapter hasn't saved
    // the user to the DB yet (foreign key fix).
    const dbUser = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        name: session.user.name ?? undefined,
        image: (session.user as any).image ?? undefined,
      },
      create: {
        email: session.user.email,
        name: session.user.name ?? null,
        image: (session.user as any).image ?? null,
        role: isAdmin ? "ADMIN" : "CUSTOMER",
      },
    });

    // ── Find or create Team record ───────────────────────────────────────────
    let team = null;
    if (isAdmin && phone) {
      team = await prisma.team.upsert({
        where: { phone },
        update: { name: teamName },
        create: { name: teamName, phone },
      });
    } else {
      // Regular user — use their DB user ID as a unique phone key
      const userPhone = `USER-${dbUser.id}`;
      team = await prisma.team.upsert({
        where: { phone: userPhone },
        update: { name: teamName },
        create: { name: teamName, phone: userPhone },
      });
    }

    // ── Conflict check — prevent double-booking same slot ────────────────────
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: new Date(date),
        startTime: Number(startTime),
        status: { not: 'CANCELLED' },
      },
    });
    if (existingBooking) {
      return NextResponse.json(
        { error: 'This slot has already been booked. Please choose another time.' },
        { status: 409 }
      );
    }

    // ── Create Booking ───────────────────────────────────────────────────────
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        startTime: Number(startTime),
        durationHours: Number(durationHours),
        amount: Number(amount),
        status: "DUE",
        teamId: team?.id ?? undefined,
        userId: dbUser.id,
      },
    });

    // -- Find active offer that applies to this booking (if any)
    let appliedOffer: { title: string; discountPct: number; slotType: string } | null = null;
    let originalAmount: number | undefined;
    try {
      const bookingDate = new Date(date);
      const isPeak = Number(startTime) >= 18 || Number(startTime) < 6;
      const slotLabel = isPeak ? 'PEAK' : 'OFF_PEAK';
      const offer = await prisma.specialOffer.findFirst({
        where: {
          active: true,
          startDate: { lte: bookingDate },
          endDate: { gte: bookingDate },
          OR: [{ slotType: 'BOTH' }, { slotType: slotLabel }],
        },
        select: { title: true, discountPct: true, slotType: true },
      });
      appliedOffer = offer;
      if (offer) {
        // Compute base price without discount (peak=800, off-peak=400 per hour)
        const basePerHour = isPeak ? 800 : 400;
        originalAmount = basePerHour * Number(durationHours);
      }
    } catch { /* non-critical */ }

    // -- Send confirmation email to user
    try {
      await sendBookingConfirmation({
        to: session.user.email,
        name: session.user.name || "Customer",
        teamName: teamName.trim(),
        date: new Date(date).toLocaleDateString("en-IN"),
        startTime: Number(startTime),
        duration: Number(durationHours),
        amount: Number(amount),
        originalAmount,
        offer: appliedOffer,
      });
    } catch (e) {
      console.error("Confirmation email failed:", e);
    }

    // -- Send alert email to admin
    try {
      await sendAdminBookingAlert({
        userName: session.user.name || "Unknown",
        userEmail: session.user.email,
        teamName: teamName.trim(),
        date: new Date(date).toLocaleDateString("en-IN"),
        startTime: Number(startTime),
        duration: Number(durationHours),
        amount: Number(amount),
      });
    } catch (e) {
      console.error("Admin booking alert email failed:", e);
    }

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: err.message || "Booking failed" }, { status: 500 });
  }
}
