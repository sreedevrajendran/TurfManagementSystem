import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let pricing = await prisma.pricing.findUnique({
      where: { id: "default" }
    });
    
    if (!pricing) {
      pricing = await prisma.pricing.create({
        data: { id: "default", offPeak: 800, peak: 1200, peakStart: 19 }
      });
    }
    
    return NextResponse.json(pricing);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
