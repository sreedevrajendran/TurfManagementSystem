import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/offers → public active offers
export async function GET() {
  const now = new Date();
  const offers = await prisma.specialOffer.findMany({
    where: { 
      active: true,
      endDate: { gte: now }, // not expired
      startDate: { lte: now } // has started
    },
    orderBy: { discountPct: "desc" }
  });
  return NextResponse.json(offers);
}
