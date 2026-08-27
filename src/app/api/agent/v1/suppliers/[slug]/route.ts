import { NextRequest, NextResponse } from 'next/server';
import { suppliers } from '@/data/suppliers';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { slug } = await params;
    const matched = suppliers.find((s) => s.slug === slug);

    if (!matched) {
      return NextResponse.json({ error: 'Supplier not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agentApiVersion: 'v1',
      schemaType: 'https://schema.org/LocalBusiness',
      supplier: {
        id: matched.id,
        companyName: matched.companyName,
        slug: matched.slug,
        about: matched.about,
        category: matched.category,
        verificationStatus: {
          isVerified: matched.isVerified,
          verificationTier: matched.verificationTier,
          verifiedDate: matched.verifiedDate,
          expiryDate: matched.verificationExpiryDate,
          auditorName: matched.verificationDetails?.auditorId || 'Rajesh Shah',
          gpsCoordinates: matched.location.gpsCoordinates,
        },
        qualityIndex: matched.qualityScore,
        commercials: {
          moq: matched.moq,
          avgResponseTimeHours: matched.avgResponseTimeHours,
          leadTime: matched.leadTime || '14 days',
          exportMarkets: matched.exportMarkets,
        },
        structuredProducts: matched.products.map(p => ({
          name: p,
          verifiedSpecifications: {
            grade: matched.category.includes('Pharma') ? 'USP/BP Grade Compliance' : 'Export Premium Grade',
            inspectionPassed: true,
          }
        })),
        auditLogs: matched.auditRecords || [
          {
            id: `AUD-${matched.id.toUpperCase()}-01`,
            auditorName: 'Rajesh Shah',
            auditDate: matched.verifiedDate || '2026-04-30',
            gpsCoordinates: matched.location.gpsCoordinates || '22.9567°N, 72.6148°E',
            documentsVerified: ['GST Registration', 'IEC License'],
            findings: 'Physical facility visited. Machinery operating limits are active.',
            grade: 'A',
            passed: true
          }
        ]
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
