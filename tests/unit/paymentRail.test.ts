/**
 * tests/unit/paymentRail.test.ts
 * Unit tests for PaymentRail abstraction, MockPaymentRail, and RazorpayAdapter.
 */

import { MockPaymentRail } from '@/lib/mockPaymentRail';
import { RazorpayAdapter } from '@/lib/razorpayAdapter';
import crypto from 'crypto';
import assert from 'assert';

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res && typeof (res as any).then === 'function') {
      return (res as any).then(() => console.log(`  ✓ PASS: ${name}`));
    }
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`, err);
    throw err;
  }
}

export async function runPaymentRailTests() {
  console.log('\n--- Running PaymentRail & Adapter Security Tests ---');

  const rail = new MockPaymentRail();

  // MockPaymentRail tests
  await test('Creates canonical payment intent with Artha transaction ID', async () => {
    const res = await rail.createPaymentIntent({
      transactionId: 'po-test-123456',
      amount: 2500000,
      currency: 'INR',
      buyerEmail: 'buyer@enterprise.in',
    });

    assert.ok(res.intent.id.startsWith('PI-'));
    assert.strictEqual(res.intent.transactionId, 'po-test-123456');
    assert.strictEqual(res.intent.amount, 2500000);
    assert.strictEqual(res.intent.providerName, 'mock');
    assert.ok(res.providerOrderId.startsWith('mock_order_'));
    assert.strictEqual(res.isLiveGateway, false);
  });

  await test('Fetches payment status accurately', async () => {
    const statusRes = await rail.getPaymentStatus('mock_pay_123');
    assert.strictEqual(statusRes.status, 'captured');
    assert.strictEqual(statusRes.currency, 'INR');
  });

  test('Verifies mock webhook payload correctly', () => {
    const validPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_999',
            order_id: 'order_test_888',
            amount: 500000,
            currency: 'INR',
          },
        },
      },
    });

    const res = rail.verifyWebhook(validPayload, 'valid_sig_header');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.providerPaymentId, 'pay_test_999');
    assert.strictEqual(res.providerOrderId, 'order_test_888');
    assert.strictEqual(res.amount, 500000);
  });

  await test('Executes mock refund successfully', async () => {
    const refundRes = await rail.refund({
      transactionId: 'po-test-123456',
      providerPaymentRef: 'pay_test_999',
      amount: 500000,
      reason: 'Inspection quality failure',
    });

    assert.strictEqual(refundRes.success, true);
    assert.strictEqual(refundRes.status, 'completed');
    assert.ok(refundRes.providerRefundRef?.startsWith('mock_rfnd_'));
  });

  // RazorpayAdapter HMAC SHA256 security tests
  const originalSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const testSecret = 'test_webhook_secret_key_12345';
  process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

  try {
    test('Validates authentic HMAC SHA256 signature correctly', () => {
      const adapter = new RazorpayAdapter();
      const rawBody = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_rzp_live_123',
              order_id: 'order_rzp_live_456',
              amount: 750000,
              currency: 'INR',
            },
          },
        },
      });

      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(rawBody)
        .digest('hex');

      const res = adapter.verifyWebhook(rawBody, validSignature);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.providerPaymentId, 'pay_rzp_live_123');
      assert.strictEqual(res.providerOrderId, 'order_rzp_live_456');
    });

    test('REJECTS forged or altered webhook payload', () => {
      const adapter = new RazorpayAdapter();
      const rawBody = JSON.stringify({ event: 'payment.captured', amount: 1000 });
      const forgedSignature = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      const res = adapter.verifyWebhook(rawBody, forgedSignature);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('HMAC signature verification failed'));
    });
  } finally {
    process.env.RAZORPAY_WEBHOOK_SECRET = originalSecret;
  }
}
