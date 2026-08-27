import { NextRequest, NextResponse } from 'next/server';
import { saveAuditEvent } from '@/lib/storeAdapter';
import { getServerSession } from '@/lib/session';

function requireAdmin(request: NextRequest) {
  const session = getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { accountId, accountName, action } = body as {
      accountId: string;
      accountName: string;
      action: 'safe' | 'monitor' | 'block';
    };

    if (!accountId || !accountName || !action) {
      return NextResponse.json({ error: 'accountId, accountName, and action are required.' }, { status: 400 });
    }

    const actionLabel =
      action === 'safe' ? 'FRAUD_CLEARED' :
      action === 'monitor' ? 'FRAUD_MONITOR_FLAG' : 'FRAUD_BLOCK';

    saveAuditEvent({
      action: actionLabel,
      details: `Flagged account "${accountName}" (${accountId}) marked as ${action.toUpperCase()} by admin override.`,
      actorRole: 'admin',
    });

    return NextResponse.json({ success: true, accountId, action });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
