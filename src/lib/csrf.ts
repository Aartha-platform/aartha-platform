/**
 * CSRF Protection — Double-Submit Cookie Pattern
 * Generates a random token, sets it as a cookie, and validates it on POST requests.
 */

import { NextRequest, NextResponse } from 'next/server';

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function setCsrfCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('_csrf', token, {
    httpOnly: false, // JS needs to read it to send in header
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return response;
}

export function checkCsrf(request: NextRequest): NextResponse | null {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null;
  }
  const cookieToken = request.cookies.get('_csrf')?.value;
  const headerToken = request.headers.get('x-csrf-token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json(
      { error: 'CSRF validation failed. Request blocked for security.' },
      { status: 403 }
    );
  }
  return null;
}
