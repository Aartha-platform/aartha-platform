import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getUserByEmail } from '@/lib/storeAdapter';

export async function GET(request: NextRequest) {
  const session = getServerSession(request);
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  let contactName = '';
  let companyName = session.companyName || '';

  if (session.email) {
    const user = await getUserByEmail(session.email);
    if (user) {
      contactName = user.contactName;
      companyName = user.companyName;
    }
  }

  return NextResponse.json({
    authenticated: true,
    role: session.role,
    userId: session.userId,
    supplierId: session.supplierId,
    supplierSlug: session.supplierSlug,
    email: session.email,
    companyName: companyName,
    contactName: contactName,
  });
}

