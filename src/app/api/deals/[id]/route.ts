import { NextRequest, NextResponse } from 'next/server';
import { getDealById, saveDeal, saveDealEvent } from '@/lib/storeAdapter';
import { verifySession } from '@/lib/auth';
import { checkResourceAccess } from '@/lib/authorization';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('artha_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const deal = await getDealById(id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Object-level authorization check
    const isAuthorized = checkResourceAccess(
      { userId: session.userId, orgId: session.orgId, role: session.role },
      'deal',
      'read',
      { orgId: deal.buyerOrgId, allowedSupplierIds: [deal.supplierId] }
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this deal' }, { status: 403 });
    }

    return NextResponse.json({ success: true, deal });
  } catch (error: any) {
    console.error('[Deal Single GET Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('artha_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const deal = await getDealById(id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const isAuthorized = checkResourceAccess(
      { userId: session.userId, orgId: session.orgId, role: session.role },
      'deal',
      'update',
      { orgId: deal.buyerOrgId, allowedSupplierIds: [deal.supplierId] }
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const previousState = deal.status;
    const updated = await saveDeal({
      ...deal,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });

    if (body.status && body.status !== previousState) {
      await saveDealEvent({
        dealId: id,
        eventType: `STATUS_CHANGED_${body.status.toUpperCase()}`,
        actor: session.email || session.userId,
        actorRole: session.role,
        previousState,
        newState: body.status,
        message: body.message || `Deal status updated to ${body.status}`,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, deal: updated });
  } catch (error: any) {
    console.error('[Deal Single PATCH Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}
