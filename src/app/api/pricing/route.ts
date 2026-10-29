import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let pricing = await prisma.pricing.findUnique({
      where: { id: "default" }
    });
    
    if (!pricing) {
      pricing = await prisma.pricing.create({
        data: { id: "default", offPeak: 800, peak: 1100, peakStart: 19 }
      });
    }
    
    return NextResponse.json(pricing, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Pricing Error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
