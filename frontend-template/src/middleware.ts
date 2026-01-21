import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract tenant from subdomain
  // Format: tenant-slug.platform.com or custom domain
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
    // For now, extract from hostname
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
