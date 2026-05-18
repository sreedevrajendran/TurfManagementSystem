import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendBlockAnnouncement } from "@/lib/email";

// POST /api/admin/send-block-email → resend block notification to list of emails
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { emails, date, startTime, endTime, reason } = await req.json();
  if (!emails?.length || !date || !reason)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await sendBlockAnnouncement({ toList: emails, date, startTime, endTime, reason });
  return NextResponse.json({ success: true, sent: emails.length });
}
