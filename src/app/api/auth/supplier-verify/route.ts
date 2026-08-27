import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, saveAuditEvent } from '@/lib/storeAdapter';
import { createSupplierSession } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { phone, otp } = body as { phone?: string; otp?: string };

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and verification code are required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone format.' }, { status: 400 });
    }

    // Verify OTP code against hashed database record
    const otpVerification = await verifyOtp(cleanPhone, otp);
    if (!otpVerification.success) {
      return NextResponse.json({ error: otpVerification.error || 'Invalid verification code.' }, { status: 401 });
    }

    // Create session token after successful OTP validation
    const sessionResult = await createSupplierSession(cleanPhone);
    if (!sessionResult) {
      return NextResponse.json({ error: 'Failed to initiate supplier workspace session.' }, { status: 500 });
    }

    await saveAuditEvent({
      action: 'SUPPLIER_LOGIN',
      details: `Supplier logged in via OTP: ${sessionResult.companyName} (${sessionResult.supplierId})`,
      actorRole: 'supplier',
      actorId: sessionResult.supplierId,
    });

    const response = NextResponse.json({
      success: true,
      role: 'supplier',
      supplierId: sessionResult.supplierId,
      supplierSlug: sessionResult.supplierSlug,
      companyName: sessionResult.companyName,
    });

    return setSessionCookie(response, sessionResult.token);
  } catch (err) {
    console.error('Supplier OTP verification error:', err);
    return NextResponse.json({ error: 'Server error verifying code.' }, { status: 500 });
  }
}
