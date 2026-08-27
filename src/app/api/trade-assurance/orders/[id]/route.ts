import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, getDisputeByOrderId } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const session = getServerSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization checks
    const isBuyer = session.role === 'buyer' && session.email?.toLowerCase() === order.buyerEmail.toLowerCase();
    const isSupplier = session.role === 'supplier' && session.supplierId === order.supplierId;
    const isAdmin = session.role === 'admin';

    if (!isBuyer && !isSupplier && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to view this order details.' }, { status: 403 });
    }

    const dispute = await getDisputeByOrderId(id);

    return NextResponse.json({
      success: true,
      order,
      dispute: dispute || null,
    });
  } catch (err) {
    console.error('Fetch order detail error:', err);
    return NextResponse.json({ error: 'Failed to retrieve order details.' }, { status: 500 });
  }
}
