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

export async function GET(req: NextRequest) {
  try {
    const session = getServerSession(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || searchParams.get('query') || '';
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const topKParam = searchParams.get('topK');
    const topK = topKParam ? parseInt(topKParam, 10) : 10;

    if (!q && !category) {
      return NextResponse.json(
        { error: 'Provide at least a query (q) or category parameter.' },
        { status: 400 }
      );
    }

    const input = {
      product: q || category || 'General Industrial Supplies',
      category: category || '',
      subcategory,
      rawQuery: q || category || '',
    };

    const result = await matchSuppliersHybridPipeline(suppliers, input, {
      topK: isNaN(topK) ? 10 : topK,
      buyerId: session?.userId,
      buyerEmail: session?.email,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/matching GET] Error during hybrid matching:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process matching pipeline.' },
      { status: 500 }
    );
  }
}
