import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent, saveOrder } from '@/lib/storeAdapter';

export async function POST(request: NextRequest) {
  try {
    const session = getServerSession(request);
    const body = await request.json();
    const { tier, billingCycle, amount, companyName, gstin } = body;

    if (!tier || !amount) {
      return NextResponse.json({ error: 'Missing required parameters (tier, amount).' }, { status: 400 });
    }

    const orderId = `SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userEmail = session?.email || body.email || 'guest@artha.local';

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrder: any = null;

    if (razorpayKeyId && razorpayKeySecret) {
      try {
        // @ts-ignore - dynamic import fallback when optional dependency razorpay is not yet installed
        const RazorpayModule = await import('razorpay');
        const Razorpay = RazorpayModule.default || RazorpayModule;
        const instance = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        razorpayOrder = await instance.orders.create({
          amount: Math.round(amount * 100), // convert to paise
          currency: 'INR',
          receipt: orderId,
          notes: {
            tier,
            billingCycle: billingCycle || 'yearly',
            companyName: companyName || '',
            gstin: gstin || '',
            email: userEmail,
          },
        });
      } catch (rzErr: any) {
        console.error('[Razorpay Order Error]:', rzErr);
      }
    }

    const orderRecord = {
      id: orderId,
      poNumber: orderId,
      buyerEmail: userEmail,
      buyerName: session?.companyName || companyName || 'Subscriber',
      buyerCompany: companyName || 'Company',
      supplierId: 'AARTHA-SUB',
      supplierSlug: 'aartha-subscription',
      supplierCompany: 'Aartha Platform',
      items: [{ name: `Subscription: ${tier} (${billingCycle || 'yearly'})`, quantity: 1, unitPrice: amount }],
      subtotalAmount: amount,
      platformFeeAmount: 0,
      totalAmount: amount,
      currency: 'INR',
      tradeAssuranceStatus: 'pending',
      status: 'pending',
      razorpayOrderId: razorpayOrder?.id || null,
      createdAt: new Date().toISOString(),
    };

    await saveOrder(orderRecord);

    await saveAuditEvent({
      action: 'SUBSCRIPTION_CHECKOUT_INITIATED',
      details: `Subscription checkout for ${tier} (${amount} INR) initiated by ${userEmail}`,
      actorRole: session?.role || 'guest',
      actorId: session?.userId,
    });

    return NextResponse.json({
      success: true,
      orderId,
      razorpayOrderId: razorpayOrder?.id || null,
      razorpayKeyId: razorpayKeyId || null,
      amount,
      currency: 'INR',
      tier,
      isLiveGateway: !!razorpayOrder,
    });
  } catch (error: any) {
    console.error('[Checkout API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
