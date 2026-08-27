import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, saveOrder, saveAuditEvent } from '@/lib/storeAdapter';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { getPaymentRail } from '@/lib/paymentRail';
import { validateTransition } from '@/lib/tradeStateMachine';
import { reconcileTransaction } from '@/lib/reconciliation';
import { sendEmail } from '@/lib/email';
import { getPaymentConfirmedEmail } from '@/lib/emailTemplates';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // 1. Verify webhook signature via PaymentRail adapter
    const rail = getPaymentRail();
    const verification = rail.verifyWebhook(rawBody, signature);

    if (!verification.isValid) {
      console.error(`[Webhook Gate] Verification rejected: ${verification.error}`);
      return NextResponse.json({ error: verification.error || 'Invalid signature' }, { status: 400 });
    }

    const { event, providerPaymentId, providerOrderId, amount, currency, rawPayload } = verification;
    const paymentId = providerPaymentId || `pay_unknown_${Date.now()}`;
    const orderId = providerOrderId || 'unassigned_order';

    // 2. Replay Protection: If timestamp is present, reject webhooks older than 10 minutes
    if (rawPayload?.created_at) {
      const eventTimestampMs = rawPayload.created_at * 1000;
      const ageMinutes = (Date.now() - eventTimestampMs) / (1000 * 60);
      if (ageMinutes > 10) {
        console.warn(`[Webhook Replay Guard] Stale webhook rejected: ${ageMinutes.toFixed(1)} mins old.`);
        return NextResponse.json({ error: 'Stale webhook rejected (replay protection)' }, { status: 400 });
      }
    }

    // 3. Idempotency Check & Event Ledger Persistence
    const idempotencyKey = `webhook_${event}_${paymentId}`;
    const { isDuplicate } = appendTransactionEvent({
      orderId,
      eventType: event === 'payment.captured' || event === 'order.paid' ? 'PAYMENT_CAPTURED' : 'PAYMENT_AUTHORIZED',
      actor: `provider:${rail.providerName}`,
      providerEventId: paymentId,
      idempotencyKey,
      newState: 'payment_confirmed',
      metadata: {
        amount,
        currency,
        provider: rail.providerName,
        event,
      },
    });

    if (isDuplicate) {
      return NextResponse.json({ success: true, message: 'Event already processed (idempotent).' });
    }

    // 4. State Machine Transition & Order Persistence
    if (event === 'payment.captured' || event === 'order.paid') {
      const order = await getOrderById(orderId);
      if (order) {
        const transition = validateTransition(order.tradeAssuranceStatus, 'payment_confirmed', 'system');
        if (transition.allowed) {
          order.tradeAssuranceStatus = 'payment_confirmed';
          order.status = 'active';
          order.paidAt = new Date().toISOString();
          order.providerPaymentRef = paymentId;
          order.razorpayPaymentId = paymentId; // legacy alias
          await saveOrder(order);

          // Automated P0 Reconciliation check
          await reconcileTransaction(order.id, rail);

          // Dispatch Aartha Protect confirmation email to buyer
          if (order.buyerEmail) {
            const formattedAmount = ((order.totalAmount || amount || 0) / 100).toLocaleString('en-IN');
            const emailData = getPaymentConfirmedEmail({
              buyerName: order.buyerName || 'Valued Buyer',
              orderId: order.id,
              poNumber: order.poNumber || order.id,
              amountInrFormatted: formattedAmount,
              providerPaymentRef: paymentId,
            });
            await sendEmail({
              to: order.buyerEmail,
              subject: emailData.subject,
              html: emailData.html,
            });
          }
        } else {
          console.warn(`[Webhook State Gate] Transition rejected for order ${orderId}: ${transition.reason}`);
        }
      }

      await saveAuditEvent({
        action: 'ORDER_PAYMENT_CONFIRMED',
        details: `Payment confirmed for Order ${orderId}. Provider Ref: ${paymentId}. Amount: ₹${(amount || 0) / 100}`,
        actorRole: 'system',
      });

      return NextResponse.json({ success: true, message: 'Payment confirmed in Aartha Protect ledger.' });
    }

    return NextResponse.json({ success: true, message: `Event ${event} recorded in ledger.` });
  } catch (error: any) {
    console.error('[Webhook Fatal Error]:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}
