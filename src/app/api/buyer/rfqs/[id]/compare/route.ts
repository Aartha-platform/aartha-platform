import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqById } from '@/lib/storeAdapter';
import { rfqQuotes } from '@/data/rfqQuotes';

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

    // Simulated matching logic: filter quotes that correspond to the GIDC category or return a subset
    const matchedQuotes = rfqQuotes.filter((q) => {
      const qCat = q.supplier.companyName.toLowerCase();
      // Match some suppliers based on category keywords
      if (rfq.category.includes('pharma') && (qCat.includes('chemical') || qCat.includes('bhavnagar'))) return true;
      if (rfq.category.includes('textile') && qCat.includes('textile')) return true;
      if (rfq.category.includes('machinery') && qCat.includes('precision')) return true;
      return Math.random() > 0.3; // fallback randomized matching
    });

    // Make sure we have at least 2 quotes to compare
    const quotes = matchedQuotes.length >= 2 ? matchedQuotes : rfqQuotes.slice(0, 3);

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
