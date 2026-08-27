/**
 * middleware.ts — Route protection for Aartha Platform
 *
 * Protected routes:
 *   /admin             → requires role=admin
 *   /supplier-dashboard → requires role=supplier
 *   /dashboard          → requires role=buyer
 *
 * All unauthenticated access to protected routes is redirected to /signin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

// Routes requiring authentication
const PROTECTED_ROUTES: Array<{
  prefix: string;
  allowedRoles: Array<'buyer' | 'supplier' | 'admin'>;
}> = [
  { prefix: '/admin', allowedRoles: ['admin'] },
  { prefix: '/supplier-dashboard', allowedRoles: ['supplier'] },
  { prefix: '/dashboard', allowedRoles: ['buyer'] },
  { prefix: '/checkout', allowedRoles: ['buyer', 'supplier', 'admin'] },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = getServerSession(request);

  // Redirect already-authenticated users away from /signin and /signup
  if (pathname === '/signin' || pathname === '/signup') {
    if (session) {
      const target =
        session.role === 'admin'
          ? '/admin'
          : session.role === 'supplier'
          ? '/supplier-dashboard'
          : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Check if path matches any protected route
  const protection = PROTECTED_ROUTES.find(r => pathname.startsWith(r.prefix));
  if (!protection) {
    return NextResponse.next();
  }

  // Not authenticated at all
  if (!session) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Authenticated but role not allowed for this route
  if (!protection.allowedRoles.includes(session.role)) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    signinUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(signinUrl);
  }

  // All good — pass through
  const response = NextResponse.next();

  // Attach Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/supplier-dashboard',
    '/supplier-dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/checkout',
    '/checkout/:path*',
    '/signin',
    '/signup',
  ],
};

