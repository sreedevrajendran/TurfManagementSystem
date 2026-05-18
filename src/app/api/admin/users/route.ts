import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      _count: { select: { bookings: true } },
      bookings: {
        where: { status: { not: "CANCELLED" } },
        select: { amount: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}
