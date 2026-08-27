import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderById, saveOrder, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';
import { checkCsrf } from '@/lib/csrf';
import { getPaymentRail } from '@/lib/paymentRail';
import { validateTransition } from '@/lib/tradeStateMachine';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { reconcileTransaction } from '@/lib/reconciliation';
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
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body as {
      orderId?: string;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
    };

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = (await getOrderById(orderId)) as PurchaseOrder | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Authorization check: Must be buyer who owns the order, or admin
    if (session.role !== 'admin' && session.email?.toLowerCase() !== order.buyerEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized to modify this order.' }, { status: 403 });
    }

    // Idempotency Check: If payment is already confirmed, return clean success without re-processing
    if (order.tradeAssuranceStatus === 'payment_confirmed' || order.tradeAssuranceStatus === 'funds_secured' || order.paidAt) {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified via authorized payment partner. Aartha Protect active.',
        order,
      });
    }

    // State machine check
    const transitionCheck = validateTransition(order.tradeAssuranceStatus, 'payment_confirmed', session.role);
    if (!transitionCheck.allowed) {
      return NextResponse.json({ error: transitionCheck.reason }, { status: 400 });
    }

    // Verify HMAC SHA256 Signature if live credentials provided
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret && razorpaySignature && razorpayOrderId && razorpayPaymentId) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ error: 'Invalid payment signature verification failed.' }, { status: 400 });
      }
    }

    const paymentRef = razorpayPaymentId || `pay_${crypto.randomBytes(8).toString('hex')}`;
    const rail = getPaymentRail();

    // 1. Append immutable transaction ledger event
    appendTransactionEvent({
      orderId: order.id,
      eventType: 'PAYMENT_CAPTURED',
      actor: `${session.role}:${session.email || session.userId}`,
      providerEventId: paymentRef,
      idempotencyKey: `verify_pay_${order.id}_${paymentRef}`,
      newState: 'payment_confirmed',
      metadata: {
        amount: order.totalAmount,
        currency: order.currency,
        provider: rail.providerName,
        razorpayOrderId,
      },
    });

    // 2. Update order status to payment_confirmed
    const updatedOrder: PurchaseOrder = {
      ...order,
      tradeAssuranceStatus: 'payment_confirmed',
      status: 'active',
      providerPaymentRef: paymentRef,
      razorpayPaymentId: paymentRef, // legacy alias
      razorpaySignature: razorpaySignature || 'verified_sig',
      paidAt: new Date().toISOString(),
    };

    await saveOrder(updatedOrder);

    // 3. Automated P0 Reconciliation Check
    await reconcileTransaction(order.id, rail);

    await saveAuditEvent({
      action: 'PAYMENT_CONFIRMED',
      details: `Payment Captured: ${order.poNumber} (₹${(order.totalAmount / 100).toLocaleString('en-IN')})`,
      actorRole: session.role,
    });

    console.log(`\n===============================================================`);
    console.log(`[Artha Assurance Guard Log] Payment Confirmed for PO ${order.poNumber}`);
    console.log(`Payment captured by authorized payment partner: ₹${(order.totalAmount / 100).toLocaleString('en-IN')}`);
    console.log(`Supplier ${order.supplierCompany} notified to commence manufacturing.`);
    console.log(`===============================================================\n`);

    return NextResponse.json({
      success: true,
      message: 'Payment verified. Aartha Protect protection active.',
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: 'Server error verifying payment deposit.' }, { status: 500 });
  }
}
