import { NextRequest, NextResponse } from 'next/server';
import { isBusinessEmail } from '@/lib/validation';
import { saveAuditEvent, getUserByEmail, saveUser, saveOtp, hashPassword } from '@/lib/storeAdapter';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { getOtpEmail } from '@/lib/emailTemplates';
import crypto from 'crypto';

const registerSchema = z.object({
  email: z.string().email('Invalid email.'),
  phone: z.string().min(8, 'Phone is required.'),
  companyName: z.string().min(2, 'Company name is required.'),
  contactName: z.string().min(2, 'Contact name is required.'),
  password: z.string().min(15, 'Password must be at least 15 characters.'),
  role: z.enum(['buyer', 'supplier']).default('buyer'),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, phone, companyName, contactName, password, role } = parsed.data;

    if (!isBusinessEmail(email)) {
      return NextResponse.json({ error: 'Please use a corporate business email domain.' }, { status: 400 });
    }

    // Check if user is already registered
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: 'An account with this email address already exists.' }, { status: 400 });
      }
      // If user exists but is unverified, we can re-send OTP
    }

    // Hash the password and save user (if new)
    const passwordHash = hashPassword(password);
    if (!existingUser) {
      await saveUser({
        email,
        passwordHash,
        role,
        phone,
        companyName,
        contactName,
        isVerified: false,
      });
    }

    // Generate secure 6-digit OTP code using crypto.randomInt
    const secureOtp = crypto.randomInt(100000, 999999).toString();

    // Store OTP in database (valid for 120 seconds / 2 minutes)
    await saveOtp(email, secureOtp, 120 * 1000);

    await saveAuditEvent({
      action: 'USER_REGISTER_INIT',
      details: `User registered (${role}) from company ${companyName}. Verification OTP generated.`,
    });

    // Trigger verification email using centralized template
    try {
      const emailData = getOtpEmail(secureOtp, email);
      const emailRes = await sendEmail({
        to: email,
        subject: emailData.subject,
        html: emailData.html,
      });
      if (!emailRes.success) {
        console.warn('[Register] Email dispatch returned false, check Resend API key / verified domain.');
      }
    } catch (emailErr) {
      console.error('[Register] Email delivery failed non-fatally:', emailErr);
    }

    // Only log OTP in development — NEVER in production logs
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Aartha OTP Dev Log] Verification OTP code for ${email} is: ${secureOtp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification OTP sent successfully.',
      verificationCodeNeeded: true,
      email,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Registration failed:', err);
    return NextResponse.json({ 
      error: 'Server error during registration.',
      details: err?.message || String(err)
    }, { status: 500 });
  }
}
