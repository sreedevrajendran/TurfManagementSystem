import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

  const { title, description, discountPct, fixedPrice, slotType, startDate, endDate } = await req.json();

  const offer = await prisma.specialOffer.create({
    data: {
      title,
      description,
      discountPct: Number(discountPct) || 0,
      fixedPrice: fixedPrice !== undefined && fixedPrice !== '' ? Number(fixedPrice) : null,
      slotType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      active: true,
    },
  });



  return NextResponse.json(offer);
}

// PATCH /api/admin/offers → toggle active status
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, active } = await req.json();
  const offer = await prisma.specialOffer.update({
    where: { id },
    data: { active },
  });
  return NextResponse.json(offer);
}

// DELETE /api/admin/offers → delete offer
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();
  await prisma.specialOffer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
