import { NextRequest, NextResponse } from 'next/server';
import { suppliers } from '@/data/suppliers';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';
    const gidcZone = searchParams.get('gidcZone')?.toLowerCase() || '';
    const minQualityScore = parseInt(searchParams.get('minQualityScore') || '0');

    const results = suppliers.filter((s) => {
      const matchQ = !q || s.companyName.toLowerCase().includes(q) || s.about?.toLowerCase().includes(q) || s.products.some(p => p.toLowerCase().includes(q));
      const matchCat = !category || s.category.toLowerCase().includes(category);
      const matchGidc = !gidcZone || s.location.gidcZone?.toLowerCase().includes(gidcZone);
      const matchScore = s.qualityScore.total >= minQualityScore;

      return matchQ && matchCat && matchGidc && matchScore;
    });

    return NextResponse.json({
      success: true,
      agentApiVersion: 'v1',
      totalFound: results.length,
      suppliers: results.map((s) => ({
        id: s.id,
        companyName: s.companyName,
        slug: s.slug,
        category: s.category,
        location: s.location,
        isVerified: s.isVerified,
        verificationTier: s.verificationTier,
        qualityScore: s.qualityScore.total,
        moq: s.moq,
        responseTime: s.avgResponseTimeHours ? `<${s.avgResponseTimeHours}h` : 'N/A',
        products: s.products,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
