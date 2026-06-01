import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { offPeak, peak, peakStart } = await req.json();

    const pricing = await prisma.pricing.upsert({
      where: { id: "default" },
      update: { offPeak: Number(offPeak), peak: Number(peak), peakStart: Number(peakStart) },
      create: { id: "default", offPeak: Number(offPeak), peak: Number(peak), peakStart: Number(peakStart) },
    });

    return NextResponse.json({ success: true, pricing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update pricing" }, { status: 500 });
  }
}
