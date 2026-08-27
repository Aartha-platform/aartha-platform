import { NextRequest, NextResponse } from 'next/server';
import { saveRfq, getRfqs, saveAuditEvent } from '@/lib/storeAdapter';
import { getServerSession } from '@/lib/session';
import { isBusinessEmail } from '@/lib/validation';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { getRfqSubmittedEmail } from '@/lib/emailTemplates';

const rfqInputSchema = z.object({
  product: z.string().min(3, 'Product name must be at least 3 characters.'),
  category: z.string().min(1, 'Category is required.'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required.'),
  unit: z.string().min(1, 'Unit is required.'),
  targetPrice: z.string().optional(),
  specifications: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required.'),
  contactName: z.string().min(2, 'Contact name is required.'),
  email: z.string().email('Invalid email.'),
  phone: z.string().min(8, 'Phone number is required.'),
  country: z.string().min(1, 'Country is required.'),
  whatsapp: z.string().optional(),
  buyerVerificationTier: z.string().optional(),
});

// POST /api/rfq — submit a new RFQ
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = rfqInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!isBusinessEmail(data.email)) {
      return NextResponse.json(
        { error: 'Free email addresses are not allowed. Use a corporate email.' },
        { status: 400 }
      );
    }

    const record = await saveRfq(data);

    await saveAuditEvent({
      action: 'RFQ_SUBMITTED',
      details: `RFQ ${record.id} submitted for "${record.product}" by ${record.companyName} (${record.email})`,
    });

    // Trigger confirmation email using centralized template
    const emailData = getRfqSubmittedEmail({
      contactName: record.contactName,
      companyName: record.companyName,
      rfqId: record.id,
      product: record.product,
      quantity: record.quantity,
      unit: record.unit,
      category: record.category,
    });

    await sendEmail({
      to: record.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    return NextResponse.json({
      success: true,
      id: record.id,
      status: record.status,
      submittedAt: record.submittedAt,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// GET /api/rfq — list RFQs (authenticated users only)
export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const session = getServerSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const rfqs = await getRfqs();
  // Buyers see their own RFQs; admins see all
  if (session.role === 'buyer') {
    return NextResponse.json(rfqs.filter(r => r.email === session.email));
  }
  if (session.role === 'admin') {
    return NextResponse.json(rfqs);
  }
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}
