import { NextRequest, NextResponse } from 'next/server';
import { categories } from '@/data/categories';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
