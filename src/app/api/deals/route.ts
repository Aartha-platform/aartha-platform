import { NextRequest, NextResponse } from 'next/server';
import { getDeals, saveDeal, saveDealEvent, getRfqById, getSupplierById } from '@/lib/storeAdapter';
import { verifySession } from '@/lib/auth';
import { checkResourceAccess } from '@/lib/authorization';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('artha_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    let filter: any = {};
    if (session.role === 'buyer') {
      filter.buyerOrgId = session.orgId || `org-buyer-${session.userId}`;
    } else if (session.role === 'supplier') {
      filter.supplierId = session.supplierId;
    }

    const deals = await getDeals(filter);
    return NextResponse.json({ success: true, deals });
  } catch (error: any) {
    console.error('[Deals API GET Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('artha_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = await request.json();
    const { rfqId, supplierId, quoteId } = body;

    if (!rfqId || !supplierId) {
      return NextResponse.json({ error: 'Missing rfqId or supplierId' }, { status: 400 });
    }

    const rfq = await getRfqById(rfqId);
    const supplier = await getSupplierById(supplierId);

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const buyerOrgId = session.orgId || `org-buyer-${session.userId}`;

    // Create immutable snapshots at deal creation time
    const dealRecord = {
      id: `DEAL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerOrgId,
      buyerEmail: session.email || 'buyer@enterprise.com',
      buyerCompanyName: session.companyName || 'Enterprise Buyer Corp',
      supplierId: supplier.id,
      supplierSlug: supplier.slug,
      supplierCompanyName: supplier.companyName,
      rfqId,
      quoteId,
      status: 'qualification' as const,
      requirementsSnapshot: {
        productName: rfq?.product || 'Custom Industrial Components',
        category: rfq?.category || supplier.category,
        specification: rfq?.specifications || rfq?.description,
        quantity: rfq?.quantity || '1000 Units',
        targetPrice: rfq?.targetPrice,
        currency: 'INR',
        destination: rfq?.country || 'India',
      },
      evidenceSnapshot: {
        supplierQualityScore: supplier.qualityScore?.total || 85,
        verificationTier: supplier.verificationTier || 'verified_supplier',
        gstinVerified: !!supplier.verificationDetails?.gstin,
        physicalAuditPassed: supplier.auditRecords ? supplier.auditRecords.some((a: any) => a.passed) : false,
        auditGrade: supplier.auditRecords?.[0]?.grade || 'A',
        certificationsVerified: supplier.certifications || [],
        evidenceTimestamp: new Date().toISOString(),
      },
      commercialSnapshot: {
        moq: supplier.moq || '100 Units',
        leadTimeDays: 14,
        paymentTerms: 'Aartha Protect Milestone (Razorpay)',
        platformFeePercent: 3.0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveDeal(dealRecord);

    // Record creation event in immutable ledger
    await saveDealEvent({
      dealId: saved.id,
      eventType: 'DEAL_CREATED',
      actor: session.email || session.userId,
      actorRole: session.role,
      newState: 'qualification',
      message: 'Deal Room initiated for qualified RFQ match.',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, deal: saved }, { status: 201 });
  } catch (error: any) {
    console.error('[Deals API POST Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}
