import { NextRequest, NextResponse } from 'next/server';
import { lookupTrustRegistry } from '@/lib/trustCenter';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateGSTINLive } from '@/lib/gstinService';

const verifyBusinessSchema = z.object({
  gstin: z.string().optional(),
  iec: z.string().optional(),
  domain: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = verifyBusinessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { gstin, iec, domain } = parsed.data;

    if (!gstin && !iec && !domain) {
      return NextResponse.json({ error: 'At least one identifier (GSTIN, IEC, or domain) must be provided.' }, { status: 400 });
    }

    // Try lookup in trust registry database
    const matched = lookupTrustRegistry(gstin || iec || domain || '');

    if (matched) {
      return NextResponse.json({
        success: true,
        entityFound: true,
        source: 'Artha Trust Registry',
        companyName: matched.companyName,
        gstin: matched.gstin,
        iec: matched.iec,
        verificationTier: matched.verificationTier,
        status: 'Active',
      });
    }

    // Live GSP Validation lookup
    if (gstin) {
      const liveCheck = await validateGSTINLive(gstin);
      if (liveCheck.valid) {
        return NextResponse.json({
          success: true,
          entityFound: true,
          source: liveCheck.message ? 'Artha Validator (Format Checked)' : 'Ministry of Finance (GSP Live Gateway)',
          companyName: liveCheck.entityName,
          gstin: gstin.toUpperCase(),
          status: liveCheck.status || 'Active',
          registrationType: liveCheck.registrationType,
          taxVerificationDate: new Date().toISOString().split('T')[0],
        });
      } else {
        return NextResponse.json({
          success: true,
          entityFound: false,
          message: liveCheck.error || 'Invalid GSTIN format or checksum validation failed.',
        });
      }
    }

    if (iec && /^[0-9]{10}$/.test(iec)) {
      return NextResponse.json({
        success: true,
        entityFound: true,
        source: 'DGFT Registry (Mock Gateway)',
        companyName: 'Simulated GIDC Exporter Corp.',
        iec,
        status: 'Active',
        iecVerificationDate: new Date().toISOString().split('T')[0],
      });
    }

    return NextResponse.json({
      success: true,
      entityFound: false,
      message: 'No matching verified entity was found in the registries.',
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
