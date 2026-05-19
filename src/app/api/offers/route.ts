import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/offers → public active offers
export async function GET() {
  const now = new Date();
  const offers = await prisma.specialOffer.findMany({
    where: { 
      active: true,
      endDate: { gte: now }, // not expired
    },
    orderBy: { discountPct: "desc" }
  });
  return NextResponse.json(offers);
}
