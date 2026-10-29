import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

// GET /api/admin/offers → list all offers
export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const offers = await prisma.specialOffer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(offers);
}

// POST /api/admin/offers → create new offer
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, discountPct, fixedPrice, slotType, startDate, endDate } = body;

    const cleanTitle = sanitizeText(title, 100);
    if (!cleanTitle) {
      return NextResponse.json({ error: "Offer title is required." }, { status: 400 });
    }

    const cleanDesc = description ? sanitizeText(description, 500) : null;

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (parsedStart > parsedEnd) {
      return NextResponse.json({ error: "Start date must be before or equal to end date" }, { status: 400 });
    }

    const validSlotTypes = ['PEAK', 'OFF_PEAK', 'BOTH'];
    const safeSlotType = validSlotTypes.includes(slotType) ? slotType : 'BOTH';

    const numDiscount = Number(discountPct) || 0;
    if (numDiscount < 0 || numDiscount > 100) {
      return NextResponse.json({ error: "Discount percentage must be between 0 and 100." }, { status: 400 });
    }

    let safeFixedPrice: number | null = null;
    if (fixedPrice !== undefined && fixedPrice !== null && fixedPrice !== '') {
      const numFixed = Number(fixedPrice);
      if (isNaN(numFixed) || numFixed <= 0 || numFixed > 100000) {
        return NextResponse.json({ error: "Fixed price must be a positive number up to 100,000." }, { status: 400 });
      }
      safeFixedPrice = numFixed;
    }

    const offer = await prisma.specialOffer.create({
      data: {
        title: cleanTitle,
        description: cleanDesc,
        discountPct: numDiscount,
        fixedPrice: safeFixedPrice,
        slotType: safeSlotType as any,
        startDate: parsedStart,
        endDate: parsedEnd,
        active: true,
      },
    });

    return NextResponse.json(offer);
  } catch (err: any) {
    console.error("Create offer error:", err);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

// PATCH /api/admin/offers → toggle active status
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, active } = await req.json();
    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
    }

    if (typeof active !== 'boolean') {
      return NextResponse.json({ error: "Active status must be a boolean." }, { status: 400 });
    }

    const offer = await prisma.specialOffer.update({
      where: { id },
      data: { active },
    });
    return NextResponse.json(offer);
  } catch (err: any) {
    console.error("Toggle offer error:", err);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

// DELETE /api/admin/offers → delete offer
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
    }

    await prisma.specialOffer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete offer error:", err);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
