import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderById, saveOrder, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';
import { checkCsrf } from '@/lib/csrf';
import { validateTransition } from '@/lib/tradeStateMachine';
import { evaluateReleaseConditions, canBuyerWaiveInspection } from '@/lib/releaseConditions';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { PurchaseOrder } from '@/types';
import { SettlementInstruction } from '@/types/payment';

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
    const { orderId, waiveRemainingInspection } = body as {
      orderId?: string;
      waiveRemainingInspection?: boolean;
    };

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = (await getOrderById(orderId)) as PurchaseOrder | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization check: Must be buyer who owns the order, or admin
    const buyerEmail = session.email || '';
    const waiveCheck = canBuyerWaiveInspection(order, buyerEmail, session.role);
    if (!waiveCheck.allowed) {
      return NextResponse.json({ error: waiveCheck.reason }, { status: 403 });
    }

    // Deterministic release evaluation (buyer waive bypasses inspection window countdown)
    const releaseEval = evaluateReleaseConditions(order, {
      requireInspectionWindowExpired: waiveRemainingInspection ? false : false, // explicit buyer acceptance authorizes release
    });

    if (!releaseEval.eligible) {
      return NextResponse.json(
        {
          error: 'Release conditions not yet satisfied.',
          unmetConditions: releaseEval.unmetConditions,
        },
        { status: 400 }
      );
    }

    // State machine check: Transition to release_authorized (or released/settled)
    const transitionCheck = validateTransition(order.tradeAssuranceStatus, 'released', session.role);
    if (!transitionCheck.allowed) {
      return NextResponse.json({ error: transitionCheck.reason }, { status: 400 });
    }

    const settlementId = `SETTLE-${Date.now()}-${crypto.randomInt(1000, 9999)}`;
    const supplierAmount = order.subtotalAmount;
    const platformFeeAmount = order.platformFeeAmount;

    // 1. Append RELEASE_AUTHORIZED event to transaction ledger
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'RELEASE_AUTHORIZED',
      actor: `${session.role}:${session.email || session.userId}`,
      idempotencyKey: `release_auth_${order.id}`,
      newState: 'release_authorized',
      metadata: {
        settlementId,
        supplierAmount,
        platformFeeAmount,
        waivedEarly: !!waiveRemainingInspection,
      },
    });

    // 2. Create and append SETTLEMENT_INITIATED event to transaction ledger
    const mockProviderTransferRef = `trf_${crypto.randomBytes(8).toString('hex')}`;
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'SETTLEMENT_INITIATED',
      actor: 'system:orchestrator',
      providerEventId: mockProviderTransferRef,
      idempotencyKey: `settlement_init_${order.id}`,
      newState: 'settled',
      metadata: {
        settlementId,
        supplierId: order.supplierId,
        supplierAmount,
        platformFeeAmount,
      },
    });

    // 3. Update order state to released/completed
    const updatedOrder: PurchaseOrder = {
      ...order,
      tradeAssuranceStatus: 'released',
      status: 'completed',
      settlementInstructionId: settlementId,
      releasedAt: new Date().toISOString(),
    };

    await saveOrder(updatedOrder);

    const settlementInstruction: SettlementInstruction = {
      id: settlementId,
      transactionId: order.id,
      paymentIntentId: order.paymentIntentId || 'legacy',
      supplierId: order.supplierId,
      supplierAmount,
      platformFeeAmount,
      status: 'completed',
      providerTransferRef: mockProviderTransferRef,
      initiatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await saveAuditEvent({
      action: 'FUNDS_RELEASED',
      details: `Release authorized for ${order.supplierCompany}: ₹${(supplierAmount / 100).toLocaleString('en-IN')}. Settlement instruction ${settlementId} logged.`,
      actorRole: session.role,
    });

    console.log(`\n===============================================================`);
    console.log(`[Artha Assurance Release Log] Release Authorized for PO ${order.poNumber}`);
    console.log(`Settlement ID: ${settlementId}`);
    console.log(`Supplier Settlement: ₹${(supplierAmount / 100).toLocaleString('en-IN')} -> ${order.supplierCompany}`);
    console.log(`Platform Fee: ₹${(platformFeeAmount / 100).toLocaleString('en-IN')}`);
    console.log(`===============================================================\n`);

    return NextResponse.json({
      success: true,
      message: `Inspection passed! Release of ₹${(supplierAmount / 100).toLocaleString('en-IN')} authorized for supplier settlement.`,
      settlement: settlementInstruction,
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Assurance release error:', err);
    return NextResponse.json({ error: 'Failed to release funds.' }, { status: 500 });
  }
}
