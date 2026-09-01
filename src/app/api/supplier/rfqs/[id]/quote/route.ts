import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqById, saveAuditEvent, getDeals, saveDeal, saveDealEvent, saveRfq } from '@/lib/storeAdapter';
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
    const rfq = await getRfqById(id);

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found.' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = quoteInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const quoteData = parsed.data;

    await saveAuditEvent({
      action: 'SUPPLIER_QUOTE_SUBMITTED',
      details: `Supplier ${session.companyName} submitted quote for RFQ ${id}. Price: ${quoteData.unitPrice}/${quoteData.priceUnit}, Lead time: ${quoteData.leadTimeDays} days`,
      actorRole: 'supplier',
      actorId: session.userId,
    });

    // Update Deal Room with commercial snapshot
    const deals = await getDeals({ rfqId: id });
    let matchedDeal = deals.find((d: any) => d.supplierId === session.supplierId) || deals[0];

    if (matchedDeal) {
      matchedDeal = await saveDeal({
        ...matchedDeal,
        status: 'negotiation',
        commercials: {
          quotePrice: quoteData.unitPrice,
          currency: quoteData.priceUnit.includes('$') || quoteData.priceUnit.toLowerCase().includes('usd') ? 'USD' : 'INR',
          moq: quoteData.moq,
          leadTimeDays: quoteData.leadTimeDays,
          paymentTerms: quoteData.remarks || 'Standard Trade Terms',
        },
        updatedAt: new Date().toISOString(),
      });

      await saveDealEvent({
        dealId: matchedDeal.id,
        eventType: 'COMMUNICATION_LOG',
        title: 'Supplier Commercial Quote Submitted',
        description: `Factory ${session.companyName} submitted quotation: ${quoteData.unitPrice} per ${quoteData.priceUnit}, Lead time: ${quoteData.leadTimeDays} days.`,
        actorRole: 'supplier',
        actorId: session.userId,
        actorName: session.companyName,
        metadata: quoteData,
      });
    }

    // Update RFQ status to 'quoted'
    await saveRfq({
      ...rfq,
      status: 'quoted',
    });

    return NextResponse.json({
      success: true,
      quoteId: `q-${Date.now()}`,
      rfqId: id,
      dealId: matchedDeal ? matchedDeal.id : null,
      submittedAt: new Date().toISOString(),
      message: 'Quote submitted successfully and routed to buyer Deal Room.',
    });
  } catch (err: any) {
    console.error('[API Quote POST] Error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
