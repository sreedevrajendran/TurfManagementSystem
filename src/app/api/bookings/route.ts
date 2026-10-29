import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminNewBookingNotification } from "@/lib/email";
import { sanitizeText, sanitizePhone } from "@/lib/sanitize";
import { calculateServerPrice } from "@/lib/pricing";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  
  if (!dateStr) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  const startOfDay = new Date(dateStr);
  if (isNaN(startOfDay.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  // Set the start and end of the requested day in local time
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
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to book." }, { status: 401 });
  }

  const isAdmin = (session.user as any).role === "ADMIN";
  const userEmail = session.user.email;
  const userName = session.user.name;
  const userImage = (session.user as any)?.image;

  try {
    const body = await req.json();
    const { date, startTime, durationHours = 1, teamName, phone, amount, sport = 'FOOTBALL' } = body;

    // ── Input Validation & Sanitization ─────────────────────────────────────
    if (!date || startTime === undefined || !teamName) {
      return NextResponse.json({ error: "Missing required fields: date, startTime, teamName" }, { status: 400 });
    }

    const cleanTeamName = sanitizeText(teamName, 50);
    if (cleanTeamName.length < 2) {
      return NextResponse.json({ error: "Team name must be at least 2 characters long." }, { status: 400 });
    }

    const startHour = Number(startTime);
    if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23) {
      return NextResponse.json({ error: "Invalid start time. Must be an hour between 0 and 23." }, { status: 400 });
    }

    const durHours = Number(durationHours);
    if (!Number.isInteger(durHours) || durHours < 1 || durHours > 4) {
      return NextResponse.json({ error: "Invalid duration. Bookings can be between 1 and 4 hours." }, { status: 400 });
    }

    const validSports = ['FOOTBALL', 'CRICKET'];
    const selectedSport = validSports.includes(sport) ? sport : 'FOOTBALL';

    let cleanPhone: string | null = null;
    if (phone && String(phone).trim() !== '') {
      cleanPhone = sanitizePhone(String(phone));
      if (!cleanPhone) {
        return NextResponse.json({ error: "Invalid phone number. Must be a valid 10-digit number." }, { status: 400 });
      }
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json({ error: "Invalid booking date." }, { status: 400 });
    }
    bookingDate.setHours(0, 0, 0, 0);

    // ── Timezone-aware validation in IST (Asia/Kolkata = UTC+5:30) ─────────
    const nowUtc = Date.now();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(nowUtc + istOffset);

    const istBooking = new Date(bookingDate.getTime() + istOffset);
    const istBookingDateStr = `${istBooking.getUTCFullYear()}-${String(istBooking.getUTCMonth() + 1).padStart(2, '0')}-${String(istBooking.getUTCDate()).padStart(2, '0')}`;
    const istNowDateStr = `${istNow.getUTCFullYear()}-${String(istNow.getUTCMonth() + 1).padStart(2, '0')}-${String(istNow.getUTCDate()).padStart(2, '0')}`;

    const isPastDate = istBookingDateStr < istNowDateStr;
    const isToday = istBookingDateStr === istNowDateStr;
    const isPastHour = isToday && startHour < istNow.getUTCHours();

    if ((isPastDate || isPastHour) && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot book slots in the past. Please select a valid future time.' },
        { status: 400 }
      );
    }

    // Limit forward booking window (e.g. max 60 days ahead)
    const maxFutureMs = 60 * 24 * 60 * 60 * 1000;
    if (bookingDate.getTime() - Date.now() > maxFutureMs && !isAdmin) {
      return NextResponse.json(
        { error: 'Bookings can only be made up to 60 days in advance.' },
        { status: 400 }
      );
    }

    // ── Server-Side Authoritative Pricing ──────────────────────────────────
    // Prevent client-side price tampering by recalculating against active DB rates
    const serverPricing = await calculateServerPrice(bookingDate, startHour, durHours);
    let finalAmount = serverPricing.totalAmount;

    // Admin can specify a custom price, but for regular customers, enforce server price
    if (isAdmin && amount !== undefined && !isNaN(Number(amount)) && Number(amount) >= 0) {
      finalAmount = Number(amount);
    }

    // ── Atomic Conflict Check & Booking Creation in Transaction ────────────
    const bookingResult = await prisma.$transaction(async (tx) => {
      // 1. Acquire transaction advisory lock on date to strictly serialize concurrent requests on the same day
      const lockKey = `booking_lock_${bookingDate.toISOString().slice(0, 10)}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      // 2. Ensure user exists in DB
      const dbUser = await tx.user.upsert({
        where: { email: userEmail },
        update: {
          name: userName ? sanitizeText(userName, 50) : undefined,
          image: userImage ?? undefined,
        },
        create: {
          email: userEmail,
          name: userName ? sanitizeText(userName, 50) : null,
          image: userImage ?? null,
          role: isAdmin ? "ADMIN" : "CUSTOMER",
        },
      });

      // 3. Idempotency check: If the same user already reserved this exact slot, return it without duplicating
      const existingUserBooking = await tx.booking.findFirst({
        where: {
          userId: dbUser.id,
          date: bookingDate,
          startTime: startHour,
          status: { not: 'CANCELLED' },
        },
      });
      if (existingUserBooking) {
        return existingUserBooking;
      }

      // 4. Find all active bookings on that date
      const activeBookings = await tx.booking.findMany({
        where: {
          date: bookingDate,
          status: { not: 'CANCELLED' },
        },
        select: {
          id: true,
          startTime: true,
          durationHours: true,
        },
      });

      // Check for interval overlap: [startHour, startHour + durHours) vs [b.startTime, b.startTime + b.durationHours)
      const hasConflict = activeBookings.some((b) => {
        const bStart = b.startTime;
        const bEnd = b.startTime + b.durationHours;
        const reqStart = startHour;
        const reqEnd = startHour + durHours;
        return reqStart < bEnd && bStart < reqEnd;
      });

      if (hasConflict) {
        throw new Error("CONFLICT_SLOT_BOOKED");
      }

      // Create isolated Team record
      const uniqueTeamPhone = `${cleanPhone || 'NO_PHONE'}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const team = await tx.team.create({
        data: {
          name: cleanTeamName,
          phone: uniqueTeamPhone,
        },
      });

      // Create Booking record
      const newBooking = await tx.booking.create({
        data: {
          date: bookingDate,
          startTime: startHour,
          durationHours: durHours,
          amount: finalAmount,
          sport: selectedSport as any,
          status: "DUE",
          teamName: cleanTeamName,
          phone: cleanPhone,
          teamId: team.id,
          userId: dbUser.id,
        },
      });

      return newBooking;
    });

    // Notify admin safely via email (sanitized inputs)
    sendAdminNewBookingNotification({
      date: bookingDate.toLocaleDateString('en-IN'),
      startTime: `${startHour}:00`,
      durationHours: durHours,
      totalPrice: finalAmount,
      court: selectedSport,
      userName: cleanTeamName,
      userEmail: session.user.email,
      phone: cleanPhone || 'Not provided',
    }).catch(err => console.error("Email notification failed:", err));

    return NextResponse.json({ success: true, booking: bookingResult });
  } catch (err: any) {
    if (err?.message === "CONFLICT_SLOT_BOOKED") {
      return NextResponse.json(
        { error: 'This slot has already been booked. Please choose another time.' },
        { status: 409 }
      );
    }
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong while processing your booking. Please try again in a moment." },
      { status: 500 }
    );
  }
}
