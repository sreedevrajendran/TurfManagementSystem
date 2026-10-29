import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { timingSafeCompare } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization') || '';

    // Enforce authentication via Bearer token
    if (cronSecret) {
      const expectedAuth = `Bearer ${cronSecret}`;
      if (!timingSafeCompare(authHeader, expectedAuth)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, reject if CRON_SECRET is not configured to avoid open unauthenticated pings
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 403 });
    }

    // 1. Raw lightweight query to keep DB alive
    await prisma.$queryRaw`SELECT 1 as alive`;

    // 2. Perform a light read
    await prisma.pricing.findFirst({ select: { id: true } });

    return NextResponse.json({ 
      success: true, 
      status: 'active',
      timestamp: new Date().toISOString(),
      message: 'Database keep-alive ping successful.'
    });
  } catch (error: any) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to keep database alive', 
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
