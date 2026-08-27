import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderById, saveOrder, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';
import { checkCsrf } from '@/lib/csrf';
import { getPaymentRail } from '@/lib/paymentRail';
import { validateTransition } from '@/lib/tradeStateMachine';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { PurchaseOrder } from '@/types';
import { RefundRecord } from '@/types/payment';

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
    const { orderId, reason, amount } = body as {
      orderId?: string;
      reason?: string;
      amount?: number;
    };

    if (!orderId || !reason) {
      return NextResponse.json(
        { error: 'Order ID and detailed reason for refund are required.' },
        { status: 400 }
      );
    }

    const order = (await getOrderById(orderId)) as PurchaseOrder | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization check: Only ordering buyer or admin can initiate refunds
    const isBuyer = session.role === 'buyer' && session.email?.toLowerCase() === order.buyerEmail.toLowerCase();
    const isAdmin = session.role === 'admin';

    if (!isBuyer && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to initiate a refund for this order.' }, { status: 403 });
    }

    // State machine check
    const transitionCheck = validateTransition(order.tradeAssuranceStatus, 'refunded', session.role);
    if (!transitionCheck.allowed) {
      return NextResponse.json({ error: transitionCheck.reason }, { status: 400 });
    }

    const refundAmount = amount && amount > 0 ? amount : order.totalAmount;
    const providerRef = order.providerPaymentRef || order.razorpayPaymentId;

    if (!providerRef) {
      return NextResponse.json(
        { error: 'Cannot process refund: No payment reference found for this order.' },
        { status: 400 }
      );
    }

    const rail = getPaymentRail();

    // 1. Log REFUND_INITIATED in transaction ledger
    const refundId = `REF-${Date.now()}-${crypto.randomInt(1000, 9999)}`;
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'REFUND_INITIATED',
      actor: `${session.role}:${session.email || session.userId}`,
      idempotencyKey: `refund_init_${order.id}_${Date.now()}`,
      metadata: {
        refundId,
        amount: refundAmount,
        reason,
      },
    });

    // 2. Execute refund via PaymentRail
    const refundResult = await rail.refund({
      transactionId: order.id,
      providerPaymentRef: providerRef,
      amount: refundAmount,
      reason,
    });

    if (!refundResult.success) {
      appendTransactionEvent({
        orderId: order.id,
        eventType: 'REFUND_REQUESTED',
        actor: 'system',
        idempotencyKey: `refund_fail_${order.id}_${Date.now()}`,
        metadata: {
          error: refundResult.error,
        },
      });

      return NextResponse.json(
        { error: `Payment partner refund failed: ${refundResult.error || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // 3. Log REFUND_COMPLETED in transaction ledger
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'REFUND_COMPLETED',
      actor: `provider:${rail.providerName}`,
      providerEventId: refundResult.providerRefundRef,
      idempotencyKey: `refund_comp_${order.id}_${refundResult.providerRefundRef}`,
      newState: 'refunded',
      metadata: {
        refundId,
        amount: refundAmount,
        providerRefundRef: refundResult.providerRefundRef,
      },
    });

    // 4. Update order state
    const updatedOrder: PurchaseOrder = {
      ...order,
      tradeAssuranceStatus: 'refunded',
      status: 'cancelled',
    };

    await saveOrder(updatedOrder);

    const refundRecord: RefundRecord = {
      id: refundId,
      transactionId: order.id,
      paymentIntentId: order.paymentIntentId || 'legacy',
      amount: refundAmount,
      reason,
      status: 'completed',
      providerRefundRef: refundResult.providerRefundRef,
      initiatedBy: session.email || session.userId,
      initiatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    await saveAuditEvent({
      action: 'ORDER_REFUNDED',
      details: `Refund of ₹${(refundAmount / 100).toLocaleString('en-IN')} executed for PO ${order.poNumber}. Reason: ${reason}`,
      actorRole: session.role,
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${(refundAmount / 100).toLocaleString('en-IN')} successfully processed via payment partner.`,
      refund: refundRecord,
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Trade assurance refund error:', err);
    return NextResponse.json({ error: 'Failed to process refund.' }, { status: 500 });
  }
}
