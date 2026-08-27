import { NextRequest, NextResponse } from 'next/server';
import { saveEnquiry, saveAuditEvent } from '@/lib/storeAdapter';
import { isBusinessEmail } from '@/lib/validation';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

// JSON-LD Agent schema representation of a direct factory enquiry
const agentEnquirySchema = z.object({
  '@context': z.string().optional(),
  '@type': z.string().optional(),
  supplierId: z.string().min(1),
  supplierSlug: z.string().optional(),
  productName: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().default('units'),
  targetPrice: z.string().optional(),
  message: z.string().min(5),
  buyerDetails: z.object({
    contactName: z.string().min(2),
    companyName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8)
  })
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Agent Authorization Check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized agent token. Include Bearer token.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = agentEnquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;

    if (!isBusinessEmail(data.buyerDetails.email)) {
      return NextResponse.json({ error: 'Please use a corporate business email domain.' }, { status: 400 });
    }

    // Map JSON-LD fields to database schema format
    const record = await saveEnquiry({
      supplierId: data.supplierId,
      supplierSlug: data.supplierSlug || '',
      productName: data.productName,
      quantity: data.quantity,
      unit: data.unit,
      targetPrice: data.targetPrice || '',
      message: data.message,
      contactName: data.buyerDetails.contactName,
      companyName: data.buyerDetails.companyName,
      email: data.buyerDetails.email,
      phone: data.buyerDetails.phone
    });

    await saveAuditEvent({
      action: 'AGENT_ENQUIRY_SUBMITTED',
      details: `Autonomous Agent sent direct enquiry ${record.id} for "${record.productName}" to Supplier ID ${record.supplierId}`,
      actorRole: 'agent',
    });

    return NextResponse.json({
      success: true,
      agentApiVersion: 'v1',
      enquiryId: record.id,
      status: record.status,
      submittedAt: record.submittedAt,
      message: 'Direct supplier enquiry processed and delivered to supplier dashboard.',
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing enquiry payload.' }, { status: 500 });
  }
}
