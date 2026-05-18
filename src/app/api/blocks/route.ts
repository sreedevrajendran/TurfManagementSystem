import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/blocks → public: return active BLOCKED slots (today and future)
export async function GET() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const blocks = await prisma.booking.findMany({
    where: {
      status: "BLOCKED",
      date: { gte: now },
    },
    select: {
      id: true,
      date: true,
      startTime: true,
      durationHours: true,
      reason: true,
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(blocks);
}
