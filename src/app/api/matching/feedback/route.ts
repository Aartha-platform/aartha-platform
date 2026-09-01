import { NextRequest, NextResponse } from 'next/server';
import { recordMatchFeedback, FeedbackSignalTypeSchema } from '@/lib/matching';
import { getServerSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = getServerSession(req);
    const body = await req.json();

    const {
      supplierId,
      signalType,
      queryText,
      queryStructured,
      rejectionReason,
      matchScore,
      positionInResults,
      sessionId,
    } = body;

    if (!supplierId || !signalType) {
      return NextResponse.json(
        { error: 'supplierId and signalType are required.' },
        { status: 400 }
      );
    }

    const parsedSignal = FeedbackSignalTypeSchema.safeParse(signalType);
    if (!parsedSignal.success) {
      return NextResponse.json(
        { error: `Invalid signalType: "${signalType}". Allowed: ${FeedbackSignalTypeSchema.options.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await recordMatchFeedback({
      supplierId,
      signalType: parsedSignal.data,
      buyerId: session?.userId,
      buyerEmail: session?.email,
      queryText,
      queryStructured,
      rejectionReason,
      matchScore,
      positionInResults,
      sessionId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/matching/feedback] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record feedback signal.' },
      { status: 500 }
    );
  }
}
