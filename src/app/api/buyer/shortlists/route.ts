import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent } from '@/lib/storeAdapter';
import { suppliers } from '@/data/suppliers';

// Using a simple in-memory session shortlist cache
const shortlistsDb: Record<string, string[]> = {
  'buyer@artha.verified': ['s1', 's4'],
};

export async function GET(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const email = session.email || 'buyer@artha.verified';
    const list = shortlistsDb[email] || [];

    return NextResponse.json({
      success: true,
      supplierIds: list,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { supplierId, action } = body; // action: 'add' | 'remove'

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId is required.' }, { status: 400 });
    }

    const email = session.email || 'buyer@artha.verified';
    if (!shortlistsDb[email]) {
      shortlistsDb[email] = [];
    }

    const list = shortlistsDb[email];
    const supplier = suppliers.find(s => s.id === supplierId);
    const supplierName = supplier ? supplier.companyName : `Supplier ${supplierId}`;

    if (action === 'remove') {
      shortlistsDb[email] = list.filter((id) => id !== supplierId);
    } else {
      if (!list.includes(supplierId)) {
        list.push(supplierId);

        // Enforce Mock Alert Event logging
        saveAuditEvent({
          action: 'BUYER_SHORTLIST_ALERT',
          details: `Shortlist alert active for "${supplierName}". Mock alert setup email dispatched to ${email}.`,
          actorRole: 'buyer',
          actorId: email
        });
      }
    }

    return NextResponse.json({
      success: true,
      supplierIds: shortlistsDb[email],
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
