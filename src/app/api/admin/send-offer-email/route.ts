import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendSpecialOffer } from "@/lib/email";

// POST /api/admin/send-offer-email  → send special offer email to all registered users
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { offerId } = await req.json();

  const offer = await prisma.specialOffer.findUnique({ where: { id: offerId } });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  // Get all registered users with emails
  const users = await prisma.user.findMany({
    where: { email: { not: null }, role: "CUSTOMER" },
    select: { email: true, name: true },
  });

  let sent = 0;
  for (const user of users) {
    if (user.email) {
      try {
        await sendSpecialOffer({
          to: user.email,
          name: user.name || "Valued Customer",
          offerTitle: offer.title,
          offerDescription: offer.description || "",
          discountPct: offer.discountPct,
          slotType: offer.slotType,
          validUntil: offer.endDate.toLocaleDateString("en-IN"),
        });
        sent++;
      } catch (e) {
        console.error(`Failed to send offer email to ${user.email}:`, e);
      }
    }
  }

  return NextResponse.json({ success: true, sent, total: users.length });
}
