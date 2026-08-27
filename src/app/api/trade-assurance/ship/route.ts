import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, saveOrder, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';
import { checkCsrf } from '@/lib/csrf';
import { validateTransition } from '@/lib/tradeStateMachine';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { PurchaseOrder, ShippingDetails } from '@/types';

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const csrfError = checkCsrf(request);
  if (csrfError) return csrfError;

  const session = getServerSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, carrier, trackingId, estimatedDelivery, invoiceUrl } = body as {
      orderId?: string;
      carrier?: string;
      trackingId?: string;
      estimatedDelivery?: string;
      invoiceUrl?: string;
    };

    if (!orderId || !carrier || !trackingId) {
      return NextResponse.json(
        { error: 'Order ID, transport carrier, and tracking AWB/LR number are required.' },
        { status: 400 }
      );
    }

    const order = (await getOrderById(orderId)) as PurchaseOrder | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization check: Caller must be supplier for this order, or admin
    if (
      session.role !== 'admin' &&
      (session.role !== 'supplier' || session.supplierId !== order.supplierId)
    ) {
      return NextResponse.json({ error: 'Unauthorized. Only the assigned supplier can record shipment.' }, { status: 403 });
    }

    // State machine validation
    const transitionCheck = validateTransition(order.tradeAssuranceStatus, 'shipped', session.role);
    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { error: transitionCheck.reason || 'Cannot ship order until payment is confirmed.' },
        { status: 400 }
      );
    }

    const shippingDetails: ShippingDetails = {
      carrier,
      trackingId,
      estimatedDelivery: estimatedDelivery || 'Within 5-7 business days',
      shippedAt: new Date().toISOString(),
      invoiceUrl: invoiceUrl || undefined,
    };

    const updatedOrder: PurchaseOrder = {
      ...order,
      tradeAssuranceStatus: 'shipped',
      status: 'shipped',
      shippingDetails,
      shippedAt: new Date().toISOString(),
    };

    await saveOrder(updatedOrder);

    // Append SHIPMENT_CREATED event to transaction ledger
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'SHIPMENT_CREATED',
      actor: `supplier:${order.supplierId}`,
      idempotencyKey: `shipment_${order.id}_${trackingId}`,
      newState: 'shipped',
      metadata: {
        carrier,
        trackingId,
        estimatedDelivery: shippingDetails.estimatedDelivery,
      },
    });

    await saveAuditEvent({
      action: 'ORDER_SHIPPED',
      details: `Supplier Shipped PO ${order.poNumber} via ${carrier} (AWB: ${trackingId})`,
      actorRole: 'supplier',
      actorId: order.supplierId,
    });

    return NextResponse.json({
      success: true,
      message: 'Dispatch details updated. Buyer has been notified.',
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Assurance ship order error:', err);
    return NextResponse.json({ error: 'Failed to record dispatch details.' }, { status: 500 });
  }
}
