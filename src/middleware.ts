import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes and their requirements
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
  '/scan-token',
];

const tenantRoutes = [
  '/[tenant]/dashboard',
  '/[tenant]/profile',
  '/[tenant]/ideas',
  '/[tenant]/offers',
  '/[tenant]/matches',
  '/[tenant]/messages',
  '/[tenant]/favorites',
  '/[tenant]/settings',
  '/[tenant]/wallet',
  '/[tenant]/scan-token',
];

const adminRoutes = [
  '/admin',
];

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/tenant-select',
];

// Helper function to check if user is admin
async function checkIfAdminUser(user: any): Promise<boolean> {
  try {
    // For now, check if email is test@example.com (admin user)
    // In production, you'd query your users table to check user_type
    return user?.email === 'test@example.com';
  } catch (error) {
    console.error('Error checking admin user:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // Create response object for cookie handling
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Get NextAuth session token
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET!
  });

  const session = token ? { user: token } : null;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isTenantRoute = tenantRoutes.some(route => {
    const pattern = route.replace('[tenant]', '[^/]+');
    return new RegExp(`^${pattern}`).test(pathname);
  });
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Extract tenant slug from URL for tenant-scoped routes
  let tenantSlug = null;
  if (pathname.startsWith('/')) {
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && !['admin', 'auth', 'tenant-select'].includes(pathParts[0])) {
      tenantSlug = pathParts[0];
    }
  }

  // Handle tenant validation for tenant-scoped routes
  if (tenantSlug && isTenantRoute && session) {
    // TODO: Implement tenant validation with NextAuth session
    // For now, allow access if user is authenticated
    console.log('Tenant route access:', tenantSlug);
  }

  // Handle authentication requirements
  if (isProtectedRoute || isTenantRoute || isAdminRoute) {
    if (!session) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For admin routes, check if user has admin privileges
    if (isAdminRoute) {
      // TODO: Implement admin role checking
      // For now, allow access - will be implemented with proper RBAC
    }

    // For tenant routes, ensure tenant context is available
    if (isTenantRoute && !tenantSlug) {
      return NextResponse.redirect(new URL('/tenant-select', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/auth/login' || pathname === '/auth/register') && session) {
    // Check if user is admin (you'll need to implement this check)
    const isAdminUser = await checkIfAdminUser(session.user);

    if (isAdminUser) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // If user has tenant context, redirect to tenant dashboard
    if (tenantSlug) {
      return NextResponse.redirect(new URL(`/${tenantSlug}/dashboard`, request.url));
    }
    // Otherwise redirect to general dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If authenticated user is on public routes and no tenant context, suggest tenant selection
  if (isPublicRoute && session && !tenantSlug) {
    // Optional: redirect to tenant selection for better UX
    // return NextResponse.redirect(new URL('/tenant-select', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
