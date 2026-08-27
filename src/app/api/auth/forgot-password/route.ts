import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, saveOtp, saveAuditEvent } from '@/lib/storeAdapter';
import { isBusinessEmail } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { getPasswordResetEmail } from '@/lib/emailTemplates';

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || !isBusinessEmail(email)) {
      return NextResponse.json({ error: 'Valid business email is required.' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    // Return generic success to prevent account enumeration if user doesn't exist
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists under this corporate email, a reset verification code has been sent.',
      });
    }

    // Generate 6-digit cryptographic OTP code
    const resetOtp = crypto.randomInt(100000, 999999).toString();

    // Store OTP valid for 15 minutes (15 * 60 * 1000 ms)
    await saveOtp(`reset:${email.toLowerCase()}`, resetOtp, 15 * 60 * 1000);

    await saveAuditEvent({
      action: 'PASSWORD_RESET_REQUESTED',
      details: `Password reset code requested for ${email}`,
    });

    const emailData = getPasswordResetEmail(resetOtp, email);
    await sendEmail({
      to: email,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Aartha Password Reset Dev Log] Reset OTP for ${email}: ${resetOtp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists under this corporate email, a reset verification code has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Server error processing password reset request.' }, { status: 500 });
  }
}
