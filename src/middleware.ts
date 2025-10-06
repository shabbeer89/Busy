// Global middleware for Next.js application
import { NextRequest, NextResponse } from 'next/server';
import { apiSecurityHeaders, pageSecurityHeaders } from '@/lib/security-headers';
import { apiCORSMiddleware } from '@/lib/cors';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply security headers based on route type
  if (pathname.startsWith('/api/')) {
    // API routes get API-specific security headers
    return apiSecurityHeaders(request);
  } else {
    // Page routes get page-specific security headers
    return pageSecurityHeaders(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};