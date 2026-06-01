import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/offers → public active offers
export async function GET() {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today (local/UTC) to allow active offers on their end date
  const offers = await prisma.specialOffer.findMany({
    where: { 
      active: true,
      endDate: { gte: now }, // not expired
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(offers);
}
