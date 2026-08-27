import { NextRequest, NextResponse } from 'next/server';
import { createBuyerSession, createSupplierSession, createAdminSession } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';
import { saveAuditEvent, getUserByEmail, verifyPassword } from '@/lib/storeAdapter';
import { isBusinessEmail } from '@/lib/validation';
import { checkRateLimit, getIp } from '@/lib/rateLimit';

// Cloudflare Turnstile validation function
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[Turnstile Security Warning] TURNSTILE_SECRET_KEY is not defined. Bypassing check in development.');
    return true;
  }
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip,
      }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification failed:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { role, email, password, phone, gstin, adminSecret, turnstileToken } = body as Record<string, string>;

    if (!role || !['buyer', 'supplier', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    const ip = getIp(request);

    // Verify Cloudflare Turnstile bot token
    if (role !== 'admin' && turnstileToken) {
      const isHuman = await verifyTurnstile(turnstileToken, ip);
      if (!isHuman) {
        return NextResponse.json({ error: 'Security verification failed. Please refresh and try again.' }, { status: 403 });
      }
    }

    // ── Buyer Login ─────────────────────────────────────────────────────────
    if (role === 'buyer') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Business email and password are required.' }, { status: 400 });
      }
      if (!isBusinessEmail(email)) {
        return NextResponse.json(
          { error: 'Free email addresses are not allowed. Use your corporate email.' },
          { status: 400 }
        );
      }

      // Check if user exists in database
      const user = await getUserByEmail(email);
      if (!user) {
        // Prevent account enumeration by returning a generic invalid credentials message
        return NextResponse.json({ error: 'Invalid business email or password.' }, { status: 401 });
      }

      // Check if the user has verified their email address
      if (!user.isVerified) {
        return NextResponse.json({
          error: 'Your business profile is not verified yet. Please enter the OTP code sent to your email.',
          unverified: true,
          email,
        }, { status: 403 });
      }

      // Verify scrypt hashed password
      const isPasswordCorrect = verifyPassword(password, user.passwordHash);
      if (!isPasswordCorrect) {
        return NextResponse.json({ error: 'Invalid business email or password.' }, { status: 401 });
      }

      const token = await createBuyerSession(email);
      if (!token) {
        return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 401 });
      }

      await saveAuditEvent({ action: 'BUYER_LOGIN', details: `Buyer signed in: ${email}`, actorRole: 'buyer' });
      const response = NextResponse.json({ success: true, role: 'buyer' });
      return setSessionCookie(response, token);
    }

    // ── Supplier Login ───────────────────────────────────────────────────────
    if (role === 'supplier') {
      if (!phone) {
        return NextResponse.json({ error: 'Registered phone number is required.' }, { status: 400 });
      }
      const result = await createSupplierSession(phone, gstin);
      if (!result) {
        return NextResponse.json(
          { error: 'No verified supplier found with these credentials. Contact support if you believe this is an error.' },
          { status: 401 }
        );
      }
      await saveAuditEvent({
        action: 'SUPPLIER_LOGIN',
        details: `Supplier signed in: ${result.companyName} (${result.supplierId})`,
        actorRole: 'supplier',
        actorId: result.supplierId,
      });
      const response = NextResponse.json({
        success: true,
        role: 'supplier',
        supplierId: result.supplierId,
        supplierSlug: result.supplierSlug,
        companyName: result.companyName,
      });
      return setSessionCookie(response, result.token);
    }

    // ── Admin Login ──────────────────────────────────────────────────────────
    if (role === 'admin') {
      const cleanSecret = (adminSecret || '').trim();
      if (!cleanSecret) {
        return NextResponse.json({ error: 'Admin credentials required.' }, { status: 400 });
      }
      const token = await createAdminSession(cleanSecret);
      if (!token) {
        return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
      }
      await saveAuditEvent({ action: 'ADMIN_LOGIN', details: 'Admin signed in.', actorRole: 'admin' });
      const response = NextResponse.json({ success: true, role: 'admin' });
      return setSessionCookie(response, token);
    }

    return NextResponse.json({ error: 'Unhandled role.' }, { status: 400 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error during login.' }, { status: 500 });
  }
}
