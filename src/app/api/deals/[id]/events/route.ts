import { NextRequest, NextResponse } from 'next/server';
import { getDealById, getDealEvents, saveDealEvent } from '@/lib/storeAdapter';
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

    const isAuthorized = checkResourceAccess(
      { userId: session.userId, orgId: session.orgId, role: session.role },
      'deal',
      'read',
      { orgId: deal.buyerOrgId, allowedSupplierIds: [deal.supplierId] }
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const events = await getDealEvents(id);
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error('[Deal Events GET Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}

export async function POST(
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
    const { eventType, message, metadata, newState } = body;

    const newEvent = await saveDealEvent({
      dealId: id,
      eventType: eventType || 'NOTE_ADDED',
      actor: session.email || session.userId,
      actorRole: session.role,
      newState,
      message,
      metadata,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: any) {
    console.error('[Deal Events POST Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}
