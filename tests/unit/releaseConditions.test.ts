/**
 * tests/unit/releaseConditions.test.ts
 * Unit tests for Deterministic Release Condition Engine.
 */

import { evaluateReleaseConditions, canBuyerWaiveInspection } from '@/lib/releaseConditions';
import { PurchaseOrder } from '@/types';
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

function createMockOrder(overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  return {
    id: 'po-test-unit-001',
    poNumber: 'ATH-PO-999999',
    buyerEmail: 'buyer@test.in',
    buyerName: 'Buyer Org',
    buyerCompany: 'Buyer Enterprise Ltd',
    supplierId: 'supp-01',
    supplierSlug: 'supp-01-slug',
    supplierCompany: 'Precision Machining GIDC',
    items: [],
    subtotalAmount: 100000,
    platformFeeAmount: 3000,
    totalAmount: 103000,
    currency: 'INR',
    tradeAssuranceStatus: 'awaiting_payment',
    status: 'pending_payment',
    inspectionPeriodDays: 7,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function runReleaseConditionTests() {
  console.log('\n--- Running Deterministic Release Condition Tests ---');

  test('REJECT: Order awaiting payment is not eligible for release', () => {
    const order = createMockOrder({ tradeAssuranceStatus: 'awaiting_payment' });
    const res = evaluateReleaseConditions(order);
    assert.strictEqual(res.eligible, false);
    assert.ok(res.unmetConditions.includes('Payment has not been confirmed by authorized payment partner.'));
  });

  test('REJECT: Paid order without shipment evidence is not eligible for release', () => {
    const order = createMockOrder({
      tradeAssuranceStatus: 'payment_confirmed',
      paidAt: new Date().toISOString(),
    });
    const res = evaluateReleaseConditions(order);
    assert.strictEqual(res.eligible, false);
    assert.ok(res.unmetConditions.includes('Consignment dispatch tracking (AWB/LR) has not been uploaded.'));
  });

  test('REJECT: Shipped order with active 7-day inspection window is not eligible unless waived', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const order = createMockOrder({
      tradeAssuranceStatus: 'inspection_period',
      paidAt: new Date().toISOString(),
      shippedAt: new Date().toISOString(),
      shippingDetails: {
        carrier: 'VRL Logistics',
        trackingId: 'VRL-123456',
        estimatedDelivery: '3 days',
        shippedAt: new Date().toISOString(),
      },
      deliveredAt: new Date().toISOString(),
      inspectionEndsAt: futureDate,
    });

    const res = evaluateReleaseConditions(order);
    assert.strictEqual(res.eligible, false);
    assert.ok(res.unmetConditions.some((c) => c.includes('Quality inspection period active')));
  });

  test('ELIGIBLE: Expired inspection period with all evidence is eligible for release', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    const order = createMockOrder({
      tradeAssuranceStatus: 'inspection_period',
      paidAt: new Date().toISOString(),
      shippedAt: new Date().toISOString(),
      shippingDetails: {
        carrier: 'VRL Logistics',
        trackingId: 'VRL-123456',
        estimatedDelivery: '3 days',
        shippedAt: new Date().toISOString(),
      },
      deliveredAt: new Date().toISOString(),
      inspectionEndsAt: pastDate,
    });

    const res = evaluateReleaseConditions(order);
    assert.strictEqual(res.eligible, true);
    assert.strictEqual(res.unmetConditions.length, 0);
  });

  test('REJECT: Disputed order is strictly blocked from release', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    const order = createMockOrder({
      tradeAssuranceStatus: 'disputed',
      paidAt: new Date().toISOString(),
      shippedAt: new Date().toISOString(),
      shippingDetails: {
        carrier: 'VRL Logistics',
        trackingId: 'VRL-123456',
        estimatedDelivery: '3 days',
        shippedAt: new Date().toISOString(),
      },
      deliveredAt: new Date().toISOString(),
      inspectionEndsAt: pastDate,
    });

    const res = evaluateReleaseConditions(order);
    assert.strictEqual(res.eligible, false);
    assert.ok(res.unmetConditions.some((c) => c.includes('Active Aartha Protect dispute')));
  });

  test('Buyer who owns order can waive remaining inspection window', () => {
    const order = createMockOrder({
      buyerEmail: 'buyer@enterprise.in',
      shippedAt: new Date().toISOString(),
    });
    const res = canBuyerWaiveInspection(order, 'buyer@enterprise.in', 'buyer');
    assert.strictEqual(res.allowed, true);
  });

  test('Unauthorized third party cannot waive inspection', () => {
    const order = createMockOrder({
      buyerEmail: 'buyer@enterprise.in',
      shippedAt: new Date().toISOString(),
    });
    const res = canBuyerWaiveInspection(order, 'attacker@hacker.in', 'buyer');
    assert.strictEqual(res.allowed, false);
    assert.ok(res.reason?.includes('Only the ordering buyer'));
  });

  test('Supplier cannot waive inspection for buyer', () => {
    const order = createMockOrder({
      buyerEmail: 'buyer@enterprise.in',
      shippedAt: new Date().toISOString(),
    });
    const res = canBuyerWaiveInspection(order, 'supplier@factory.in', 'supplier');
    assert.strictEqual(res.allowed, false);
  });
}
