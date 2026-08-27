import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOutcomes, saveOutcome } from '@/lib/storeAdapter';
import { calculateFunnelMetrics } from '@/lib/outcomes';
import { checkRateLimit } from '@/lib/rateLimit';

const outcomeSchema = z.object({
  id: z.string().optional(),
  rfqId: z.string().min(1, 'RFQ ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().optional(),
  buyerEmail: z.string().email().optional(),
  buyerCompany: z.string().optional(),
  stage: z.enum([
    'matched',
    'quoted',
    'sample_requested',
    'sample_accepted',
    'order_placed',
    'delivered',
    'repeat_order',
    'closed',
    'lost',
    'stalled',
  ]),
  quotedPrice: z.number().optional(),
  currency: z.string().default('INR'),
  responseTimeHours: z.number().optional(),
  deliveryOnTime: z.boolean().optional(),
  defectRateReported: z.number().optional(),
  buyerRating: z.number().min(1).max(5).optional(),
  evidenceHash: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;
    const stage = searchParams.get('stage') || undefined;

    const outcomes = await getOutcomes({ rfqId, supplierId, stage });
    const funnel = calculateFunnelMetrics(outcomes);

    return NextResponse.json({
      success: true,
      data: outcomes,
      funnel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch transaction outcomes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const validated = outcomeSchema.parse(body);

    const saved = await saveOutcome(validated);

    return NextResponse.json({
      success: true,
      message: 'Transaction outcome recorded successfully',
      data: saved,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record transaction outcome' },
      { status: 500 }
    );
  }
}
