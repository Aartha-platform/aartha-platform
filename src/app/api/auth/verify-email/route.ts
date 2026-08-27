import { NextRequest, NextResponse } from 'next/server';
import { createBuyerSession, createSupplierSession } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';
import { saveAuditEvent, verifyOtp, verifyUser } from '@/lib/storeAdapter';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Verification code must be 6 digits.'),
  role: z.enum(['buyer', 'supplier']).default('buyer'),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, code, role, phone } = parsed.data;

    // Validate using the database verification function
    const otpVerification = await verifyOtp(email, code);
    if (!otpVerification.success) {
      return NextResponse.json({ error: otpVerification.error || 'Invalid verification code.' }, { status: 400 });
    }

    // Mark the user's business email as verified
    await verifyUser(email);

    let token = null;

    if (role === 'buyer') {
      token = await createBuyerSession(email);
    } else {
      // For supplier verification simulation
      const supResult = await createSupplierSession(phone || '+91 72084 32138');
      if (supResult) {
        token = supResult.token;
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Failed to establish verified session.' }, { status: 400 });
    }

    await saveAuditEvent({
      action: 'USER_VERIFY_SUCCESS',
      details: `User verified email ${email} with OTP code. Token session issued.`,
    });

    const response = NextResponse.json({
      success: true,
      role,
      email,
      message: 'Session verified successfully.',
    });

    return setSessionCookie(response, token);
  } catch (err) {
    console.error('OTP Verification error:', err);
    return NextResponse.json({ error: 'Server error during verification.' }, { status: 500 });
  }
}
