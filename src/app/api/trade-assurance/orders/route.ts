import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByBuyer, getOrdersBySupplier } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const session = getServerSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const buyerEmail = searchParams.get('buyerEmail');
    const supplierId = searchParams.get('supplierId');

    let orders: any[] = [];

    if (session.role === 'buyer') {
      const emailToCheck = buyerEmail || session.email;
      if (!emailToCheck || emailToCheck.toLowerCase() !== session.email?.toLowerCase()) {
        return NextResponse.json({ error: 'Unauthorized to view these orders.' }, { status: 403 });
      }
      orders = await getOrdersByBuyer(emailToCheck);
    } else if (session.role === 'supplier') {
      const idToCheck = supplierId || session.supplierId;
      if (!idToCheck || idToCheck !== session.supplierId) {
        return NextResponse.json({ error: 'Unauthorized to view these orders.' }, { status: 403 });
      }
      orders = await getOrdersBySupplier(idToCheck);
    } else if (session.role === 'admin') {
      if (buyerEmail) {
        orders = await getOrdersByBuyer(buyerEmail);
      } else if (supplierId) {
        orders = await getOrdersBySupplier(supplierId);
      } else {
        return NextResponse.json({ error: 'buyerEmail or supplierId parameter is required for admin lookup.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Role not recognized.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error('Fetch trade assurance orders error:', err);
    return NextResponse.json({ error: 'Failed to retrieve trade assurance orders.' }, { status: 500 });
  }
}
