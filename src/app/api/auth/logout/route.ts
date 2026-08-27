import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getServerSession, SESSION_COOKIE_NAME } from '@/lib/session';
import { destroySession } from '@/lib/auth';
import { saveAuditEvent } from '@/lib/storeAdapter';

export async function POST(request: NextRequest) {
  const session = getServerSession(request);
  if (session) {
    await saveAuditEvent({
      action: 'LOGOUT',
      details: `${session.role} signed out (userId: ${session.userId})`,
      actorRole: session.role,
      actorId: session.userId,
    });
  }
  
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await destroySession(token);
  }
  
  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
