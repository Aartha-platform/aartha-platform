import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const stats = await getStats();
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch platform statistics' },
      { status: 500 }
    );
  }
}
