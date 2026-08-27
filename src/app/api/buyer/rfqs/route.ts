import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqs, saveRfq, saveAuditEvent } from '@/lib/storeAdapter';
import { isBusinessEmail } from '@/lib/validation';
import { z } from 'zod';

const buyerRfqSchema = z.object({
  product: z.string().min(3),
  category: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().min(1),
  targetPrice: z.string().optional(),
  description: z.string().optional(),
  country: z.string().min(1),
  whatsapp: z.string().optional(),
  buyerVerificationTier: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const allRfqs = await getRfqs();
    const rfqs = allRfqs.filter((r) => r.email === session.email);
    return NextResponse.json({ success: true, rfqs });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = buyerRfqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;

    const record = await saveRfq({
      ...data,
      companyName: session.companyName || 'Business Buyer Ltd.',
      contactName: 'Verified Buyer Representative',
      email: session.email || 'buyer@artha.verified',
      phone: '+1-555-0199',
    });

    await saveAuditEvent({
      action: 'BUYER_RFQ_SUBMITTED',
      details: `Buyer ${session.email} submitted RFQ ${record.id} for "${record.product}"`,
      actorRole: 'buyer',
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      rfq: record
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
