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

    const bookings = await prisma.booking.findMany({
      where: { user: { email: session.user.email } },
      include: { team: true },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    // Safely serialize — handles both Date objects and strings
    const serialized = bookings.map((b) => ({
      id: b.id,
      date: b.date ? new Date(b.date).toISOString() : null,
      startTime: b.startTime,
      durationHours: b.durationHours,
      amount: b.amount,
      status: b.status,
      teamName: b.team?.name ?? null,
    }));

    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("[/api/user/bookings] Error:", err);
    return NextResponse.json(
      { error: "Failed to load bookings", detail: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
