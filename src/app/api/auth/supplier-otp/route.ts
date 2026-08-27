import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveOtp } from '@/lib/storeAdapter';
import { checkRateLimit, getIp } from '@/lib/rateLimit';
import { suppliers } from '@/data/suppliers';

// Cloudflare Turnstile validation helper
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[Turnstile Warning] TURNSTILE_SECRET_KEY not set. Bypassing check in development.');
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
    const { phone, turnstileToken } = body as { phone?: string; turnstileToken?: string };

    if (!phone) {
      return NextResponse.json({ error: 'Mobile phone number is required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    const ip = getIp(request);

    // Turnstile Bot Protection
    if (turnstileToken) {
      const isHuman = await verifyTurnstile(turnstileToken, ip);
      if (!isHuman) {
        return NextResponse.json({ error: 'Bot protection check failed. Please refresh and try again.' }, { status: 403 });
      }
    }

    // Lookup verified supplier by registered phone number
    const matched = suppliers.find(
      s => (s.phone && s.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))) && s.isVerified
    );

    if (!matched) {
      return NextResponse.json(
        { error: 'No active supplier account registered under this phone number. Please contact your Artha Account Manager for onboarding.' },
        { status: 404 }
      );
    }

    // Generate cryptographically secure 6-digit OTP code
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Store hashed OTP valid for 120 seconds
    saveOtp(cleanPhone, otpCode, 120 * 1000);

    // Development Log for immediate manual testing
    console.log(`\n===============================================================`);
    console.log(`[Supplier OTP Security Log] Login OTP for ${matched.companyName} (${cleanPhone}): ${otpCode}`);
    console.log(`===============================================================\n`);

    return NextResponse.json({
      success: true,
      message: `OTP sent to +91-XXXXX-${cleanPhone.slice(-4)}. Valid for 2 minutes.`,
      companyName: matched.companyName,
    });
  } catch (err) {
    console.error('Supplier OTP generation error:', err);
    return NextResponse.json({ error: 'Server error generating OTP.' }, { status: 500 });
  }
}
