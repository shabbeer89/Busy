// Global middleware for Next.js application with Supabase Auth
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { apiSecurityHeaders, pageSecurityHeaders } from '@/lib/security-headers';
import { apiCORSMiddleware } from '@/lib/cors';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response object to mutate
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/ideas',
    '/offers',
    '/matches',
    '/messages',
    '/favorites',
    '/settings',
    '/wallet',
    '/analytics',
    '/babt-protected'
  ];

  // Define auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/auth/login', '/auth/register'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Handle protected routes
  if (isProtectedRoute && !session) {
    // Redirect to login if not authenticated
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle auth routes when already authenticated
  if (isAuthRoute && session) {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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