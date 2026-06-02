import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminNewBookingNotification } from "@/lib/email";


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

    // ── Find or create Team record ───────────────────────────────────────────
    let team = null;
    const teamPhone = phone && phone.trim() !== '' ? phone.trim() : `USER-${dbUser.id}`;
    
    team = await prisma.team.upsert({
      where: { phone: teamPhone },
      update: { name: teamName },
      create: { name: teamName, phone: teamPhone },
    });

    const bookingDate = new Date(date);
    const serverNow = new Date();
    
    const bookingMidnight = new Date(bookingDate);
    bookingMidnight.setHours(0, 0, 0, 0);
    
    const serverMidnight = new Date(serverNow);
    serverMidnight.setHours(0, 0, 0, 0);

    const isPastDate = bookingMidnight < serverMidnight;
    const isPastHour = bookingMidnight.getTime() === serverMidnight.getTime() && Number(startTime) < serverNow.getHours();

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
        teamId: team?.id ?? undefined,
        userId: dbUser.id,
      },
    });

    // Notify admin
    await sendAdminNewBookingNotification({
      date: new Date(date).toLocaleDateString(),
      startTime: `${startTime}:00`,
      durationHours: Number(durationHours),
      totalPrice: Number(amount),
      court: sport,
      userName: session.user.name,
      userEmail: session.user.email,
      phone: phone,
    });

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: err.message || "Booking failed" }, { status: 500 });
  }
}
