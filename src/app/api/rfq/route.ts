import { NextRequest, NextResponse } from 'next/server';
import { saveRfq, getRfqs, saveAuditEvent, saveDeal, saveDealEvent } from '@/lib/storeAdapter';
import { getServerSession } from '@/lib/session';
import { isBusinessEmail } from '@/lib/validation';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { getRfqSubmittedEmail } from '@/lib/emailTemplates';
import { matchSuppliersHybridPipeline } from '@/lib/matching';
import { suppliers } from '@/data/suppliers';

const rfqInputSchema = z.object({
  product: z.string().min(3, 'Product name must be at least 3 characters.'),
  category: z.string().min(1, 'Category is required.'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required.'),
  unit: z.string().min(1, 'Unit is required.'),
  targetPrice: z.string().optional(),
  specifications: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required.'),
  contactName: z.string().min(2, 'Contact name is required.'),
  email: z.string().email('Invalid email.'),
  phone: z.string().min(8, 'Phone number is required.'),
  country: z.string().min(1, 'Country is required.'),
  whatsapp: z.string().optional(),
  buyerVerificationTier: z.string().optional(),
});

// POST /api/rfq — submit a new RFQ
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = rfqInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!isBusinessEmail(data.email)) {
      return NextResponse.json(
        { error: 'Free email addresses are not allowed. Use a corporate email.' },
        { status: 400 }
      );
    }

    const record = await saveRfq(data);

    await saveAuditEvent({
      action: 'RFQ_SUBMITTED',
      details: `RFQ ${record.id} submitted for "${record.product}" by ${record.companyName} (${record.email})`,
    });

    // ── Execute Real Hybrid Matching Pipeline ───────────────────────────────
    let topDeal: any = null;
    let topMatches: any[] = [];
    let qualifiedCount = 0;

    try {
      const matchResult = await matchSuppliersHybridPipeline(suppliers, {
        product: data.product,
        category: data.category,
        rawQuery: `${data.product} in ${data.category} ${data.specifications || ''}`.trim(),
      }, {
        topK: 5,
        buyerEmail: data.email,
      });

      topMatches = matchResult.matches;
      qualifiedCount = matchResult.qualifiedCount;

      if (topMatches.length > 0) {
        const primaryMatch = topMatches[0];
        const supplierObj = suppliers.find((s) => s.id === primaryMatch.supplierId);

        const dealRecord = await saveDeal({
          buyerOrgId: data.email,
          buyerEmail: data.email,
          buyerCompanyName: data.companyName,
          supplierId: primaryMatch.supplierId,
          supplierSlug: supplierObj?.slug || primaryMatch.supplierId,
          supplierCompanyName: primaryMatch.companyName,
          rfqId: record.id,
          status: 'matching',
          requirements: {
            productName: data.product,
            category: data.category,
            specification: data.specifications || '',
            quantity: `${data.quantity} ${data.unit}`,
            targetPrice: data.targetPrice || '',
            currency: 'USD',
            destination: data.country || 'India',
          },
          evidence: {
            supplierQualityScore: primaryMatch.matchScore,
            verificationTier: supplierObj?.verificationTier || 'verified_supplier',
            gstinVerified: !!supplierObj?.verificationDetails?.gstin,
            physicalAuditPassed: (supplierObj?.auditRecords?.length ?? 0) > 0,
            auditGrade: supplierObj?.auditRecords?.[0]?.grade || 'A',
            certificationsVerified: supplierObj?.certifications || [],
            evidenceTimestamp: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        topDeal = dealRecord;

        await saveDealEvent({
          dealId: dealRecord.id,
          eventType: 'REQUIREMENT_LOCKED',
          title: 'RFQ Submitted & Matched to Factory',
          description: `RFQ ${record.id} for "${record.product}" matched to ${primaryMatch.companyName} (${primaryMatch.matchScore}/100 match score) via Hybrid Retrieval Engine.`,
          actorRole: 'buyer',
          actorId: data.email,
          evidenceAttached: true,
        });
      }
    } catch (matchErr) {
      console.warn('[RFQ Pipeline] Hybrid matching on submit warning:', matchErr);
    }

    // Trigger confirmation email using centralized template
    const emailData = getRfqSubmittedEmail({
      contactName: record.contactName,
      companyName: record.companyName,
      rfqId: record.id,
      product: record.product,
      quantity: record.quantity,
      unit: record.unit,
      category: record.category,
    });

    await sendEmail({
      to: record.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    return NextResponse.json({
      success: true,
      id: record.id,
      status: 'routed',
      submittedAt: record.submittedAt,
      dealId: topDeal ? topDeal.id : null,
      matches: topMatches.slice(0, 3),
      qualifiedCount,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/rfq POST] Error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// GET /api/rfq — list RFQs (authenticated users only)
export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const session = getServerSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const rfqs = await getRfqs();
  // Buyers see their own RFQs; admins see all
  if (session.role === 'buyer') {
    return NextResponse.json(rfqs.filter(r => r.email === session.email));
  }
  if (session.role === 'admin') {
    return NextResponse.json(rfqs);
  }
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}
