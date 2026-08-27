import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

interface PricePoint {
  month: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  unit: string;
}

const mockPriceIndexes: Record<string, PricePoint[]> = {
  'pharma-healthcare': [
    { month: 'Jan', minPrice: 12.5, maxPrice: 14.2, avgPrice: 13.4, unit: 'USD/kg' },
    { month: 'Feb', minPrice: 12.8, maxPrice: 14.5, avgPrice: 13.7, unit: 'USD/kg' },
    { month: 'Mar', minPrice: 13.0, maxPrice: 15.0, avgPrice: 14.1, unit: 'USD/kg' },
    { month: 'Apr', minPrice: 12.9, maxPrice: 14.8, avgPrice: 13.9, unit: 'USD/kg' },
    { month: 'May', minPrice: 13.2, maxPrice: 15.2, avgPrice: 14.3, unit: 'USD/kg' },
    { month: 'Jun', minPrice: 13.5, maxPrice: 15.5, avgPrice: 14.6, unit: 'USD/kg' },
  ],
  'textiles-apparel': [
    { month: 'Jan', minPrice: 2.1, maxPrice: 2.5, avgPrice: 2.3, unit: 'USD/meter' },
    { month: 'Feb', minPrice: 2.1, maxPrice: 2.6, avgPrice: 2.35, unit: 'USD/meter' },
    { month: 'Mar', minPrice: 2.2, maxPrice: 2.7, avgPrice: 2.45, unit: 'USD/meter' },
    { month: 'Apr', minPrice: 2.25, maxPrice: 2.8, avgPrice: 2.5, unit: 'USD/meter' },
    { month: 'May', minPrice: 2.3, maxPrice: 2.9, avgPrice: 2.6, unit: 'USD/meter' },
    { month: 'Jun', minPrice: 2.4, maxPrice: 3.1, avgPrice: 2.75, unit: 'USD/meter' },
  ],
  'machinery-industrial': [
    { month: 'Jan', minPrice: 4200, maxPrice: 4700, avgPrice: 4450, unit: 'USD/ton' },
    { month: 'Feb', minPrice: 4300, maxPrice: 4800, avgPrice: 4550, unit: 'USD/ton' },
    { month: 'Mar', minPrice: 4250, maxPrice: 4750, avgPrice: 4500, unit: 'USD/ton' },
    { month: 'Apr', minPrice: 4400, maxPrice: 4900, avgPrice: 4650, unit: 'USD/ton' },
    { month: 'May', minPrice: 4500, maxPrice: 5100, avgPrice: 4800, unit: 'USD/ton' },
    { month: 'Jun', minPrice: 4600, maxPrice: 5200, avgPrice: 4900, unit: 'USD/ton' },
  ]
};

const defaultIndex = [
  { month: 'Jan', minPrice: 100, maxPrice: 120, avgPrice: 110, unit: 'Points' },
  { month: 'Feb', minPrice: 102, maxPrice: 122, avgPrice: 112, unit: 'Points' },
  { month: 'Mar', minPrice: 105, maxPrice: 125, avgPrice: 115, unit: 'Points' },
  { month: 'Apr', minPrice: 104, maxPrice: 126, avgPrice: 115, unit: 'Points' },
  { month: 'May', minPrice: 108, maxPrice: 130, avgPrice: 119, unit: 'Points' },
  { month: 'Jun', minPrice: 110, maxPrice: 132, avgPrice: 121, unit: 'Points' },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { category } = await params;
    const history = mockPriceIndexes[category] || defaultIndex;
    return NextResponse.json({
      success: true,
      category,
      history,
      lastUpdated: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
