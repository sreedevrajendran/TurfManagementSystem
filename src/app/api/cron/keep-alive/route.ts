import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // If CRON_SECRET is configured on Vercel, enforce it for automated security
      const url = new URL(request.url);
      const secretParam = url.searchParams.get('secret');
      if (secretParam !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Raw lightweight query
    await prisma.$queryRaw`SELECT 1 as alive`;

    // 2. Read from pricing/bookings to generate real database activity
    const pricing = await prisma.pricing.findFirst();
    const totalBookings = await prisma.booking.count();

    return NextResponse.json({ 
      success: true, 
      status: 'active',
      timestamp: new Date().toISOString(),
      message: 'Supabase database is active and kept alive.',
      stats: {
        totalBookings,
        pricingFound: Boolean(pricing),
      }
    });
  } catch (error: any) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to keep database alive', 
        details: error?.message || 'Unknown database error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
