import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up user by email to ensure we get the correct DB id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return NextResponse.json([]);
    }
    
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: { team: true },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    // Safely serialize dates & clean phone
    const serialized = bookings.map((b) => {
      let rawPhone = b.team?.phone ?? '';
      let cleanPhone = rawPhone.includes('_') ? rawPhone.split('_')[0] : rawPhone;
      if (cleanPhone === 'NO_PHONE' || cleanPhone.startsWith('USER-')) cleanPhone = '';

      return {
        id: b.id,
        date: b.date ? new Date(b.date).toISOString() : null,
        startTime: b.startTime,
        durationHours: b.durationHours,
        amount: b.amount,
        status: b.status,
        sport: b.sport,
        reason: b.reason,
        teamName: b.teamName || b.team?.name || null,
        phone: b.phone || cleanPhone || null,
        updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null,
      };
    });

    return NextResponse.json(serialized, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (err: any) {
    console.error("[/api/user/bookings] Error:", err?.message, err?.stack);
    return NextResponse.json(
      { error: "Failed to load bookings. Please try again later." },
      { status: 500 }
    );
  }
}
