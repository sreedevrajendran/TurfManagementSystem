import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminNewBookingNotification } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

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

  try {
    const { date, startTime, durationHours, teamName, phone, amount, sport = 'FOOTBALL' } = await req.json();

    if (!date || startTime === undefined || !teamName || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      const isValidPhone = digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91'));
      if (!isValidPhone) {
        return NextResponse.json({ error: "Invalid phone number. Must be exactly 10 digits." }, { status: 400 });
      }
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

    // ── Create isolated Team record for this booking ────────────────────────
    // Using a unique key prevents overwriting team names across past bookings
    const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : '';
    const uniqueTeamPhone = `${cleanPhone || 'NO_PHONE'}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    const team = await prisma.team.create({
      data: {
        name: teamName.trim(),
        phone: uniqueTeamPhone,
      },
    });

    // ── Timezone-aware validation in IST (Asia/Kolkata = UTC+5:30) ─────────
    const nowUtc = new Date().getTime();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(nowUtc + istOffset);

    const bookingDate = new Date(date);
    const bookingDateUtc = bookingDate.getTime();
    const istBooking = new Date(bookingDateUtc + istOffset);

    const istBookingDateStr = `${istBooking.getUTCFullYear()}-${String(istBooking.getUTCMonth() + 1).padStart(2, '0')}-${String(istBooking.getUTCDate()).padStart(2, '0')}`;
    const istNowDateStr = `${istNow.getUTCFullYear()}-${String(istNow.getUTCMonth() + 1).padStart(2, '0')}-${String(istNow.getUTCDate()).padStart(2, '0')}`;

    const isPastDate = istBookingDateStr < istNowDateStr;
    const isToday = istBookingDateStr === istNowDateStr;
    const isPastHour = isToday && Number(startTime) < istNow.getUTCHours();

    if ((isPastDate || isPastHour) && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot book slots in the past. Please select a valid future time.' },
        { status: 400 }
      );
    }

    // ── Conflict check — prevent double-booking same slot ────────────────────
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: bookingDate,
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
        date: bookingDate,
        startTime: Number(startTime),
        durationHours: Number(durationHours),
        amount: Number(amount),
        sport,
        status: "DUE",
        teamName: teamName.trim(),
        phone: cleanPhone || null,
        teamId: team?.id ?? undefined,
        userId: dbUser.id,
      },
    });

    // Notify admin safely (send user-provided booking name, NOT the Gmail name)
    sendAdminNewBookingNotification({
      date: new Date(date).toLocaleDateString('en-IN'),
      startTime: `${startTime}:00`,
      durationHours: Number(durationHours),
      totalPrice: Number(amount),
      court: sport,
      userName: teamName.trim(),
      userEmail: session.user.email,
      phone: cleanPhone || 'Not provided',
    }).catch(err => console.error("Email notification failed:", err));

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong while processing your booking. Please try again in a moment." },
      { status: 500 }
    );
  }
}
