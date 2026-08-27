import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { category } = await params;

    return NextResponse.json({
      success: true,
      agentApiVersion: 'v1',
      category,
      pricingMetrics: {
        currency: 'USD',
        unit: 'MT',
        indexValue: 124.5,
        changeRateMonthlyPercent: '+1.2%',
        historicalBenchmarkHigh: 154.0,
        historicalBenchmarkLow: 98.0,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
