import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqById, saveAuditEvent } from '@/lib/storeAdapter';
import { z } from 'zod';

const quoteInputSchema = z.object({
  unitPrice: z.number().positive(),
  priceUnit: z.string(),
  moq: z.string(),
  leadTimeDays: z.number().positive(),
  validityDays: z.number().positive(),
  remarks: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'supplier') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const rfq = getRfqById(id);

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found.' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = quoteInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const quoteData = parsed.data;

    saveAuditEvent({
      action: 'SUPPLIER_QUOTE_SUBMITTED',
      details: `Supplier ${session.companyName} submitted quote for RFQ ${id}. Price: ${quoteData.unitPrice}/${quoteData.priceUnit}, Lead time: ${quoteData.leadTimeDays} days`,
      actorRole: 'supplier',
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      quoteId: `q-${Date.now()}`,
      rfqId: id,
      submittedAt: new Date().toISOString(),
      message: 'Quote submitted successfully and routed to buyer workspace.',
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
