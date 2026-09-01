import { NextRequest, NextResponse } from 'next/server';
import { matchSuppliersHybridPipeline } from '@/lib/matching';
import { suppliers } from '@/data/suppliers';
import { getServerSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = getServerSession(req);
    const body = await req.json();

    const { query, requirements, topK, sessionId } = body;
    const input = requirements || query;

    if (!input) {
      return NextResponse.json(
        { error: 'Missing sourcing requirement query or requirements object.' },
        { status: 400 }
      );
    }

    const result = await matchSuppliersHybridPipeline(suppliers, input, {
      topK: typeof topK === 'number' ? topK : 10,
      sessionId,
      buyerId: session?.userId,
      buyerEmail: session?.email,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/matching] Error during hybrid matching:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process matching pipeline.' },
      { status: 500 }
    );
  }
}
