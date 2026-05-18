import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";

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

    // ── Send confirmation email ──────────────────────────────────────────────
    try {
      await sendBookingConfirmation({
        to: session.user.email,
        name: session.user.name || "Customer",
        teamName: teamName.trim(),
        date: new Date(date).toLocaleDateString("en-IN"),
        startTime: Number(startTime),
        duration: Number(durationHours),
        amount: Number(amount),
      });
    } catch (e) {
      console.error("Confirmation email failed:", e);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: err.message || "Booking failed" }, { status: 500 });
  }
}
