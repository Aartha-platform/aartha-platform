/**
 * session.ts
 * Server-side cookie helpers for reading/writing the session cookie.
 * 100% compatible with both Edge runtime (middleware) and Node.js runtime (API routes).
 */

import { NextRequest, NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'artha-session';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 8 * 60 * 60, // 8 hours in seconds
  secure: process.env.NODE_ENV === 'production',
};

export interface SessionPayload {
  role: 'buyer' | 'supplier' | 'admin';
  userId: string;
  supplierId?: string;
  supplierSlug?: string;
  email?: string;
  companyName?: string;
  expiresAt: string;
}

// ── Read session from incoming request (Edge-safe) ───────────────────────────

import { verifyToken } from './token';
import { generateCsrfToken, setCsrfCookie } from './csrf';

export function getServerSession(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token) as SessionPayload | null;
    if (!payload) return null;

    // Check expiration date
    if (new Date(payload.expiresAt) < new Date()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ── Set session cookie on a response ─────────────────────────────────────────

export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
  const csrfToken = generateCsrfToken();
  setCsrfCookie(response, csrfToken);
  return response;
}

// ── Clear session cookie ──────────────────────────────────────────────────────

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  response.cookies.set('_csrf', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
