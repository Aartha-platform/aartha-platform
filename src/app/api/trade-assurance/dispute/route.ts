import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderById, saveOrder, saveDispute, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';
import { checkCsrf } from '@/lib/csrf';
import { validateTransition } from '@/lib/tradeStateMachine';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { PurchaseOrder, TradeAssuranceDispute } from '@/types';

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
    const { orderId, raisedByRole, raisedByEmail, reason, description, evidenceUrls } = body as {
      orderId?: string;
      raisedByRole?: 'buyer' | 'supplier';
      raisedByEmail?: string;
      reason?: string;
      description?: string;
      evidenceUrls?: string[];
    };

    if (!orderId || !raisedByEmail || !reason || !description) {
      return NextResponse.json(
        { error: 'Order ID, email, dispute reason, and detailed description are required.' },
        { status: 400 }
      );
    }

    const order = (await getOrderById(orderId)) as PurchaseOrder | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization check: Caller must be buyer/supplier of this order, or admin
    const isBuyer = session.role === 'buyer' && session.email?.toLowerCase() === order.buyerEmail.toLowerCase();
    const isSupplier = session.role === 'supplier' && session.supplierId === order.supplierId;
    const isAdmin = session.role === 'admin';

    if (!isBuyer && !isSupplier && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to file a dispute on this order.' }, { status: 403 });
    }

    // State machine check
    const transitionCheck = validateTransition(order.tradeAssuranceStatus, 'disputed', session.role);
    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { error: transitionCheck.reason || 'Cannot raise a dispute on an order whose funds have already been settled or refunded.' },
        { status: 400 }
      );
    }

    const disputeId = `disp-${crypto.randomBytes(6).toString('hex')}`;
    const dispute: TradeAssuranceDispute = {
      id: disputeId,
      orderId: order.id,
      raisedByRole: raisedByRole || (session.role as any) || 'buyer',
      raisedByEmail: raisedByEmail || session.email || order.buyerEmail,
      reason,
      description,
      evidenceUrls: evidenceUrls || [],
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    await saveDispute(dispute);

    // Append DISPUTE_OPENED event to transaction ledger
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'DISPUTE_OPENED',
      actor: `${session.role}:${session.email || session.userId}`,
      idempotencyKey: `dispute_${disputeId}`,
      newState: 'disputed',
      metadata: {
        disputeId,
        reason,
        raisedByRole: dispute.raisedByRole,
      },
    });

    // Protect transaction under disputed status
    const updatedOrder: PurchaseOrder = {
      ...order,
      tradeAssuranceStatus: 'disputed',
      status: 'disputed',
      disputedAt: new Date().toISOString(),
    };

    await saveOrder(updatedOrder);

    await saveAuditEvent({
      action: 'DISPUTE_RAISED',
      details: `Trade Dispute Raised on PO ${order.poNumber}: ${reason}`,
      actorRole: session.role,
    });

    console.log(`\n===============================================================`);
    console.log(`[Aartha Protect Dispute Guard] Dispute ${disputeId} Filed on PO ${order.poNumber}`);
    console.log(`Aartha Protect dispute filed. Settlement blocked pending resolution.`);
    console.log(`Reason: ${reason}`);
    console.log(`===============================================================\n`);

    return NextResponse.json({
      success: true,
      message: 'Dispute registered. Settlement blocked pending Aartha Protect mediation.',
      dispute,
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Trade assurance dispute error:', err);
    return NextResponse.json({ error: 'Failed to record dispute.' }, { status: 500 });
  }
}
