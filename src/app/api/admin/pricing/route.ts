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

    const numOffPeak = Number(offPeak);
    const numPeak = Number(peak);
    const numPeakStart = Number(peakStart);

    if (
      isNaN(numOffPeak) || numOffPeak < 0 || numOffPeak > 50000 ||
      isNaN(numPeak) || numPeak < 0 || numPeak > 50000 ||
      !Number.isInteger(numPeakStart) || numPeakStart < 0 || numPeakStart > 23
    ) {
      return NextResponse.json(
        { error: "Invalid pricing parameters. Prices must be between 0 and 50,000, and peak start must be an hour (0-23)." },
        { status: 400 }
      );
    }

    const pricing = await prisma.pricing.upsert({
      where: { id: "default" },
      update: { offPeak: numOffPeak, peak: numPeak, peakStart: numPeakStart },
      create: { id: "default", offPeak: numOffPeak, peak: numPeak, peakStart: numPeakStart },
    });

    return NextResponse.json({ success: true, pricing });
  } catch (err: any) {
    console.error("Pricing update error:", err);
    return NextResponse.json({ error: "Failed to update pricing. Please try again." }, { status: 500 });
  }
}
