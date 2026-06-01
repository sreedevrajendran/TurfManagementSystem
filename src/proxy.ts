import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Very basic in-memory rate limiting map for Edge. 
// Note: In serverless/edge environments, this state is cleared on cold starts
// and isn't shared across regions, but it prevents rapid brute-forcing on a single instance.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute per IP

export async function proxy(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  const path = req.nextUrl.pathname;

  // 1. Basic Web Application Firewall (WAF) & Rate Limiting
  // Only rate limit API routes to prevent locking users out of static assets
  if (path.startsWith('/api/')) {
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count++;
      if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
        return new NextResponse(JSON.stringify({ error: 'Too Many Requests - Firewall Block' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
        });
      }
    }
    // Simple garbage collection to prevent memory leaks in the Map
    if (rateLimitMap.size > 5000) rateLimitMap.clear();
    rateLimitMap.set(ip, rateData);
  }

  // 2. HTTP Method Filtering (Firewall)
  // Block any non-standard methods (e.g. TRACE, TRACK)
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(req.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // 3. Strict Admin Route Protection at the Edge
  // Protect all /admin/* and /api/admin/* paths
  if (path.startsWith('/admin') && path !== '/admin-login') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If there's no token or the user is not an ADMIN, deny access at the edge
    if (!token || token.role !== 'ADMIN') {
      // Redirect to login or home if they try to access /admin pages directly
      if (!path.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/admin-login', req.url));
      }
      // Return 403 for API requests
      return new NextResponse(JSON.stringify({ error: 'Forbidden - Unauthorized Admin Access' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 4. Set secure cookie flags if not already set (NextAuth handles this mostly, but good practice)
  const response = NextResponse.next();
  
  // Enforce HSTS strictly in code as well
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
