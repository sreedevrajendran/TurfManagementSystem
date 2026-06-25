import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This prevents Next.js from caching this route, ensuring it runs every time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Optional: Secure the route if you add a CRON_SECRET in Vercel
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // A lightweight query to keep the database connection active
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection is active and kept alive!' 
    });
  } catch (error) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json(
      { error: 'Failed to keep database alive' }, 
      { status: 500 }
    );
  }
}
