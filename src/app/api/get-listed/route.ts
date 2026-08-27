import { NextRequest, NextResponse } from 'next/server';
import { saveApplication, saveAuditEvent } from '@/lib/storeAdapter';
import { supplierApplicationSchema, isBusinessEmail } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { getSupplierApplicationEmail } from '@/lib/emailTemplates';

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = supplierApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!isBusinessEmail(data.email)) {
      return NextResponse.json(
        { error: 'Free email addresses are not allowed. Use your official company email.' },
        { status: 400 }
      );
    }

    const record = await saveApplication(data);

    await saveAuditEvent({
      action: 'SUPPLIER_APPLICATION',
      details: `New supplier application from ${record.companyName} (GSTIN: ${record.gstin}) — ID: ${record.id}`,
    });

    // Trigger confirmation email using centralized template
    const emailData = getSupplierApplicationEmail({
      contactName: record.contactName,
      companyName: record.companyName,
      applicationId: record.id,
      gstin: record.gstin,
      city: record.city,
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
