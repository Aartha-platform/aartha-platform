import { NextRequest, NextResponse } from 'next/server';
import { isBusinessEmail } from '@/lib/validation';
import { getUserByEmail, verifyOtp, hashPassword, updateUserPassword, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, code, newPassword } = body as { email?: string; code?: string; newPassword?: string };

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Email, verification code, and new password are required.' }, { status: 400 });
    }

    if (!isBusinessEmail(email)) {
      return NextResponse.json({ error: 'Valid business email is required.' }, { status: 400 });
    }

    if (newPassword.length < 15) {
      return NextResponse.json(
        { error: 'Password must be at least 15 characters long (NIST standard passphrase).' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'No account registered under this email.' }, { status: 404 });
    }

    // Verify OTP code against stored reset key
    const otpRes = await verifyOtp(`reset:${email.toLowerCase()}`, code.trim());
    if (!otpRes.success) {
      return NextResponse.json({ error: otpRes.error || 'Invalid or expired verification code.' }, { status: 400 });
    }

    // Hash the new password and update record
    const passwordHash = hashPassword(newPassword);
    const updated = await updateUserPassword(email, passwordHash);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update account password.' }, { status: 500 });
    }

    await saveAuditEvent({
      action: 'PASSWORD_RESET_SUCCESS',
      details: `Password reset successfully completed for user ${email}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Server error processing password reset.' }, { status: 500 });
  }
}
