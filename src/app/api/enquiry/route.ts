import { NextRequest, NextResponse } from 'next/server';
import { saveEnquiry, saveAuditEvent } from '@/lib/storeAdapter';
import { isBusinessEmail } from '@/lib/validation';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { getEnquiryRoutedEmail } from '@/lib/emailTemplates';

const enquiryInputSchema = z.object({
  supplierId: z.string().optional(),
  supplierSlug: z.string().optional(),
  productName: z.string().min(1, 'Product name is required.'),
  quantity: z.string().min(1, 'Quantity is required.'),
  unit: z.string().min(1, 'Unit is required.'),
  targetPrice: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  contactName: z.string().min(2, 'Contact name is required.'),
  companyName: z.string().min(2, 'Company name is required.'),
  email: z.string().email('Invalid email.'),
  phone: z.string().min(8, 'Phone number is required.'),
  whatsapp: z.string().optional(),
  buyerVerificationTier: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = enquiryInputSchema.safeParse(body);

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

    const record = await saveEnquiry(data);

    await saveAuditEvent({
      action: 'ENQUIRY_SUBMITTED',
      details: `Enquiry ${record.id} [Tier: ${data.buyerVerificationTier || 'Unverified'}] from ${record.companyName} for supplier ${record.supplierSlug || 'general'}`,
    });

    // Trigger confirmation email using centralized template
    const emailData = getEnquiryRoutedEmail({
      contactName: record.contactName,
      companyName: record.companyName,
      enquiryId: record.id,
      productName: record.productName,
      quantity: record.quantity,
      unit: record.unit,
      targetSupplier: record.supplierSlug || 'GIDC Verified Cluster',
    });

    await sendEmail({
      to: record.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    return NextResponse.json({
      success: true,
      id: record.id,
      submittedAt: record.submittedAt,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
