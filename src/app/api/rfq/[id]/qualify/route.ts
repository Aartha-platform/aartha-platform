import { NextRequest, NextResponse } from 'next/server';
import { qualifyRFQ } from '@/lib/rfqQualification';
import { getRfqById, saveRfq } from '@/lib/storeAdapter';
import { verifySession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('artha_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const rfq = await getRfqById(id);
    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const answers = body.clarificationAnswers || {};

    const qualificationResult = qualifyRFQ({
      productName: rfq.product,
      category: rfq.category,
      freeTextRequirement: rfq.description || rfq.specifications,
      quantity: rfq.quantity,
      destination: rfq.country,
      ...body,
    });

    return NextResponse.json({
      success: true,
      rfqId: id,
      qualification: qualificationResult,
    });
  } catch (error: any) {
    console.error('[RFQ Qualify API Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}
