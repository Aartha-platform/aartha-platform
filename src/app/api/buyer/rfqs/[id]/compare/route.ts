import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqById, getDeals } from '@/lib/storeAdapter';
import { suppliers } from '@/data/suppliers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const rfq = await getRfqById(id);

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found.' }, { status: 404 });
    }

    // Verify buyer owns the RFQ
    if (rfq.email !== session.email) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // Retrieve active Deal Room records for this RFQ
    const deals = await getDeals({ rfqId: id });
    const quotes = deals
      .filter((d: any) => d.commercials?.quotePrice)
      .map((d: any, idx: number) => {
        const s = suppliers.find((sup) => sup.id === d.supplierId);
        return {
          id: `q-${d.id}`,
          supplier: {
            id: d.supplierId,
            companyName: d.supplierCompanyName,
            location: s?.location || { city: 'Gujarat', state: 'Gujarat', country: 'India', fullAddress: 'Gujarat, India' },
            isVerified: s?.isVerified ?? true,
            reviewAvgScore: s?.rating ?? 4.8,
          },
          trustScore: d.evidence?.supplierQualityScore ?? s?.qualityScore?.total ?? 90,
          quotePrice: d.commercials.quotePrice,
          quotePriceDisplay: `${d.commercials.currency || '$'}${d.commercials.quotePrice} / unit`,
          moq: d.commercials.moq || s?.moq || '100 units',
          leadTime: `${d.commercials.leadTimeDays || 14} days`,
          responseTime: '2 hours',
          certifications: d.evidence?.certificationsVerified || s?.certifications || ['ISO 9001'],
          isBestPrice: idx === 0,
        };
      });

    return NextResponse.json({
      success: true,
      rfqId: id,
      rfqProduct: rfq.product,
      comparisonMatrix: quotes,
      compareDate: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
