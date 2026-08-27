import { NextRequest, NextResponse } from 'next/server';
import { getFeedbackStats } from '@/lib/feedbackStore';

export async function GET(request: NextRequest) {
  try {
    const stats = await getFeedbackStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return NextResponse.json({ error: 'Server error fetching stats.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
