import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use userId directly from JWT token (set in auth.ts session callback)
    const userId = (session.user as any).id as string | undefined;

    // Build where clause — prefer userId (faster), fallback to email lookup
    let bookings;
    if (userId) {
      bookings = await prisma.booking.findMany({
        where: { userId },
        include: { team: true },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      });
    } else {
      // Fallback: look up user by email first
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json([]);
      }
      bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: { team: true },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      });
    }

    // Safely serialize dates
    const serialized = bookings.map((b) => ({
      id: b.id,
      date: b.date ? new Date(b.date).toISOString() : null,
      startTime: b.startTime,
      durationHours: b.durationHours,
      amount: b.amount,
      status: b.status,
      sport: b.sport,
      teamName: b.team?.name ?? null,
      phone: b.team?.phone ?? null,
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null,
    }));

    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("[/api/user/bookings] Error:", err?.message, err?.stack);
    return NextResponse.json(
      { error: "Failed to load bookings", detail: err?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}
