import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { user: { email: session.user.email } },
    include: { team: true },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  // Serialize all dates to ISO strings for safe client transfer
  const serialized = bookings.map((b) => ({
    id: b.id,
    date: b.date.toISOString(),
    startTime: b.startTime,
    durationHours: b.durationHours,
    amount: b.amount,
    status: b.status,
    teamName: b.team?.name ?? null,
  }));

  return NextResponse.json(serialized);
}
