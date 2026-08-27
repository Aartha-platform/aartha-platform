import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqById } from '@/lib/storeAdapter';
import { suppliers } from '@/data/suppliers';
import { llmMatch } from '@/lib/aiMatching';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const rfq = await getRfqById(id);
    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found.' }, { status: 404 });
    }

    // Call llmMatch to get GPT-4o or fallback matches
    const matches = await llmMatch({
      product: rfq.product,
      category: rfq.category,
      quantity: rfq.quantity,
      certifications: [],
      destination: rfq.country || 'Germany'
    }, suppliers);

    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
