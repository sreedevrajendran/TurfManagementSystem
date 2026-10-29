import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// In-memory rate limiting map for Edge / Serverless instance
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_GENERAL_REQUESTS = 120; // 120 req/min for general API calls
const MAX_SENSITIVE_REQUESTS = 30; // 30 req/min for sensitive actions (bookings, admin, auth)

export async function proxy(req: NextRequest) {
  // Extract true client IP safely from forwarded headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0].trim() : null) ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  const path = req.nextUrl.pathname;

  // 1. Web Application Firewall (WAF) & Tiered Rate Limiting
  if (path.startsWith('/api/')) {
    const isSensitive = 
      path.startsWith('/api/bookings') || 
      path.startsWith('/api/admin') || 
      path.startsWith('/api/auth');
    
    const maxAllowed = isSensitive ? MAX_SENSITIVE_REQUESTS : MAX_GENERAL_REQUESTS;
    const rateKey = `${ip}:${isSensitive ? 'sens' : 'gen'}`;
    const now = Date.now();
    const rateData = rateLimitMap.get(rateKey) ?? { count: 0, lastReset: now };

    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count++;
      if (rateData.count > maxAllowed) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests - Rate limit exceeded. Please try again later.' }),
          {
            status: 429,
            headers: { 
              'Content-Type': 'application/json', 
              'Retry-After': '60',
              'X-Content-Type-Options': 'nosniff'
            },
          }
        );
      }
    }
    
    // Garbage collection to prevent memory exhaustion in edge worker
    if (rateLimitMap.size > 5000) rateLimitMap.clear();
    rateLimitMap.set(rateKey, rateData);
  }

  // 2. HTTP Method Filtering (Firewall)
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(req.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // 3. Strict Admin Route Protection at the Edge
  // Protect all /admin/* (except /admin-login) AND all /api/admin/* paths
  const isAdminPath = (path.startsWith('/admin') && path !== '/admin-login') || path.startsWith('/api/admin');
  
  if (isAdminPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== 'ADMIN') {
      if (path.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - Unauthorized Admin Access' }),
          {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              'X-Content-Type-Options': 'nosniff'
            },
          }
        );
      }
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }
  }

  // 4. Attach Security Headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
