import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'supplier') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Return mock historical datasets for Recharts charts
    const responseRateHistory = [
      { month: 'Jan', rate: 92 },
      { month: 'Feb', rate: 94 },
      { month: 'Mar', rate: 95 },
      { month: 'Apr', rate: 95 },
      { month: 'May', rate: 97 },
      { month: 'Jun', rate: 98 },
    ];

    const leadTimeComparisons = [
      { category: 'Your Average', days: 8.5 },
      { category: 'GIDC Cluster Average', days: 12.4 },
      { category: 'Global Directory Average', days: 18.2 },
    ];

    return NextResponse.json({
      success: true,
      supplierId: session.supplierId,
      responseRateHistory,
      leadTimeComparisons,
      totalQuotesSent: 24,
      totalOrdersExecuted: 18,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
