import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/mark-paid  → mark booking as PAID and send thank you email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { bookingId } = await req.json();

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PAID" },
    include: { user: true, team: true },
  });



  return NextResponse.json({ success: true, booking });
}
