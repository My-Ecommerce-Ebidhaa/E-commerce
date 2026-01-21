import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = ['/account', '/admin', '/platform'];

// Routes that require specific roles
const roleProtectedRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/platform': ['SUPER_ADMIN'],
  '/account': ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
};

// Public routes (accessible without authentication)
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes (except auth check)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get the JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If user is authenticated and trying to access public auth routes, redirect to appropriate dashboard
  if (token && isPublicRoute) {
    const role = token.role as string;
    let redirectUrl = '/';

    if (role === 'SUPER_ADMIN') {
      redirectUrl = '/platform';
    } else if (role === 'ADMIN') {
      redirectUrl = '/admin';
    } else {
      redirectUrl = '/account';
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If the route is protected and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // If authenticated, check role-based access
  if (token && isProtectedRoute) {
    const userRole = token.role as string;

    // Find the matching route and check permissions
    for (const [route, allowedRoles] of Object.entries(roleProtectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        break;
      }
    }
  }

  // Extract tenant from subdomain
  let tenantSlug: string | null = null;

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:3000';

  if (hostname.includes(platformDomain)) {
    // Subdomain-based tenant
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== platformDomain.split('.')[0]) {
      tenantSlug = subdomain;
    }
  } else {
    // Custom domain - would need to look up in database
    tenantSlug = hostname.split('.')[0];
  }

  // Default tenant for local development
  if (!tenantSlug && hostname.includes('localhost')) {
    tenantSlug = 'demo';
  }

  // Add tenant info to headers for server components
  const response = NextResponse.next();

  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
  }

  // Set geo info (simplified - in production, use request.geo)
  response.headers.set('x-user-country', 'US');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
