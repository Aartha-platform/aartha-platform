import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveOrder, saveAuditEvent } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerSession } from '@/lib/session';
import { checkCsrf } from '@/lib/csrf';
import { getPaymentRail } from '@/lib/paymentRail';
import { appendTransactionEvent } from '@/lib/transactionLedger';
import { PurchaseOrder, OrderLineItem } from '@/types';
import { suppliers } from '@/data/suppliers';

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
    const {
      buyerEmail,
      buyerName,
      buyerCompany,
      supplierId,
      items,
      rfqId,
      quoteId,
    } = body as {
      buyerEmail?: string;
      buyerName?: string;
      buyerCompany?: string;
      supplierId?: string;
      items?: Array<{ productName: string; specification?: string; quantity: number; unitPrice: number }>;
      rfqId?: string;
      quoteId?: string;
    };

    if (!buyerEmail || !supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Buyer email, supplier ID, and at least one order line item are required.' },
        { status: 400 }
      );
    }

    // Authorization: Role check & ownership validation
    if (session.role === 'buyer' && session.email?.toLowerCase() !== buyerEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized email mapping in purchase order.' }, { status: 403 });
    }

    if (session.role === 'supplier') {
      return NextResponse.json({ error: 'Suppliers are not authorized to create Purchase Orders.' }, { status: 403 });
    }

    const supplier = suppliers.find((s) => s.id === supplierId || s.slug === supplierId);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found.' }, { status: 404 });
    }

    // Calculate line item totals in paise (₹1 = 100 paise)
    let subtotalAmount = 0;
    const formattedItems: OrderLineItem[] = items.map((item, idx) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const pricePaise = Math.round(Number(item.unitPrice) * 100);
      const totalPaise = qty * pricePaise;
      subtotalAmount += totalPaise;

      return {
        id: `item-${idx + 1}-${Date.now()}`,
        productName: item.productName || 'Industrial Component',
        specification: item.specification || 'Standard Industrial Grade',
        quantity: qty,
        unitPrice: pricePaise,
        totalPrice: totalPaise,
      };
    });

    // 3% Aartha Protect Platform Fee
    const platformFeeAmount = Math.round(subtotalAmount * 0.03);
    const totalAmount = subtotalAmount + platformFeeAmount;

    const orderId = `po-${crypto.randomBytes(6).toString('hex')}`;
    const poNumber = `ATH-PO-${Date.now().toString().slice(-6)}`;

    // Generate canonical PaymentIntent via PaymentRail abstraction
    const rail = getPaymentRail();
    const intentResult = await rail.createPaymentIntent({
      transactionId: orderId,
      amount: totalAmount,
      currency: 'INR',
      buyerEmail,
      buyerName: buyerName || 'Enterprise Buyer',
      metadata: {
        poNumber,
        supplierCompany: supplier.companyName,
      },
    });

    const newOrder: PurchaseOrder = {
      id: orderId,
      poNumber,
      rfqId,
      quoteId,
      buyerEmail,
      buyerName: buyerName || 'Enterprise Buyer',
      buyerCompany: buyerCompany || 'Corporate Sourcing Group',
      supplierId: supplier.id,
      supplierSlug: supplier.slug,
      supplierCompany: supplier.companyName,

      items: formattedItems,
      subtotalAmount,
      platformFeeAmount,
      totalAmount,
      currency: 'INR',

      tradeAssuranceStatus: 'awaiting_payment',
      status: 'pending_payment',

      // Canonical Artha Payment Orchestration Identity
      paymentIntentId: intentResult.intent.id,
      providerName: rail.providerName,
      providerOrderRef: intentResult.providerOrderId,
      razorpayOrderId: intentResult.providerOrderId, // legacy alias

      inspectionPeriodDays: 7,
      createdAt: new Date().toISOString(),
    };

    await saveOrder(newOrder);

    // Record immutable ORDER_CREATED event in transaction ledger
    appendTransactionEvent({
      orderId,
      eventType: 'ORDER_CREATED',
      actor: `buyer:${buyerEmail}`,
      idempotencyKey: `order_created_${orderId}`,
      newState: 'awaiting_payment',
      metadata: {
        totalAmount,
        platformFeeAmount,
        poNumber,
        providerOrderRef: intentResult.providerOrderId,
      },
    });

    await saveAuditEvent({
      action: 'ORDER_CREATED',
      details: `Secure PO Created: ${poNumber} for ₹${(totalAmount / 100).toLocaleString('en-IN')}`,
      actorRole: 'buyer',
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      paymentIntent: intentResult.intent,
      razorpayOrderId: intentResult.providerOrderId,
      razorpayKeyId: intentResult.providerKeyId || process.env.RAZORPAY_KEY_ID || '',
    });
  } catch (err) {
    console.error('Assurance order creation error:', err);
    return NextResponse.json({ error: 'Failed to generate Purchase Order.' }, { status: 500 });
  }
}
