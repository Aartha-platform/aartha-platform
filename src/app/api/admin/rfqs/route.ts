import { NextRequest, NextResponse } from 'next/server';
import { getRfqs, saveAuditEvent } from '@/lib/storeAdapter';
import { getServerSession } from '@/lib/session';

function requireAdmin(request: NextRequest) {
  const session = getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const rfqs = await getRfqs();
  return NextResponse.json({ rfqs, total: rfqs.length });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { rfqId, action } = body as { rfqId: string; action: string };

    if (!rfqId || !action) {
      return NextResponse.json({ error: 'rfqId and action are required.' }, { status: 400 });
    }

    await saveAuditEvent({
      action: 'ADMIN_RFQ_ACTION',
      details: `Admin performed "${action}" on RFQ ${rfqId}`,
      actorRole: 'admin',
    });

    return NextResponse.json({ success: true, rfqId, action });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
