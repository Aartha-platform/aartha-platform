import { NextRequest, NextResponse } from 'next/server';
import { getAuditLog, saveAuditEvent } from '@/lib/storeAdapter';
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

  const log = await getAuditLog();
  // Provide up to 200 most recent events
  return NextResponse.json({ log: log.slice(0, 200), total: log.length });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, details } = body as { action: string; details: string };

    if (!action || !details) {
      return NextResponse.json({ error: 'action and details are required.' }, { status: 400 });
    }

    const event = await saveAuditEvent({ action, details, actorRole: 'admin' });
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
