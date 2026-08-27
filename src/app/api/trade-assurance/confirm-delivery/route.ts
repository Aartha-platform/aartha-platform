import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, saveOrder, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';
import { checkCsrf } from '@/lib/csrf';
import { validateTransition } from '@/lib/tradeStateMachine';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { PurchaseOrder } from '@/types';

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
    const { orderId } = body as { orderId?: string };

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = (await getOrderById(orderId)) as PurchaseOrder | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization check: Must be buyer who owns the order, or admin
    if (session.role !== 'admin' && session.email?.toLowerCase() !== order.buyerEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized to confirm delivery for this order.' }, { status: 403 });
    }

    // State machine check
    const transitionCheck = validateTransition(order.tradeAssuranceStatus, 'inspection_period', session.role);
    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { error: transitionCheck.reason || 'Delivery confirmation can only be recorded after goods are marked as shipped.' },
        { status: 400 }
      );
    }

    // Set 7-day inspection window
    const inspectionEnd = new Date();
    inspectionEnd.setDate(inspectionEnd.getDate() + (order.inspectionPeriodDays || 7));

    const updatedOrder: PurchaseOrder = {
      ...order,
      tradeAssuranceStatus: 'inspection_period',
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
      inspectionEndsAt: inspectionEnd.toISOString(),
    };

    await saveOrder(updatedOrder);

    // Append DELIVERY_CONFIRMED and INSPECTION_WINDOW_OPENED events to transaction ledger
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'DELIVERY_CONFIRMED',
      actor: `buyer:${session.email || session.userId}`,
      idempotencyKey: `delivery_${order.id}_${Date.now()}`,
      newState: 'delivered',
      metadata: {
        inspectionPeriodDays: order.inspectionPeriodDays || 7,
        inspectionEndsAt: inspectionEnd.toISOString(),
      },
    });

    appendTransactionEvent({
      orderId: order.id,
      eventType: 'INSPECTION_WINDOW_OPENED',
      actor: 'system',
      idempotencyKey: `inspection_opened_${order.id}`,
      newState: 'inspection_period',
      metadata: {
        inspectionEndsAt: inspectionEnd.toISOString(),
      },
    });

    await saveAuditEvent({
      action: 'DELIVERY_CONFIRMED',
      details: `Delivery confirmed for PO ${order.poNumber}. 7-Day inspection window started.`,
      actorRole: session.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery confirmed. 7-Day quality inspection period is now active.',
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Delivery confirmation error:', err);
    return NextResponse.json({ error: 'Failed to record delivery confirmation.' }, { status: 500 });
  }
}
