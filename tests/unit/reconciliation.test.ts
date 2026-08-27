/**
 * tests/unit/reconciliation.test.ts
 * Unit tests for Minimum Viable Reconciliation Engine.
 */

import { reconcileTransaction } from '@/lib/reconciliation';
import { MockPaymentRail } from '@/lib/mockPaymentRail';
import { saveOrder } from '@/lib/storeAdapter';
import { appendTransactionEvent } from '@/lib/transactionLedger';
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

export async function runReconciliationTests() {
  console.log('\n--- Running Minimum Viable Reconciliation Tests ---');

  const mockRail = new MockPaymentRail();

  await test('Produces match entry when Artha and Provider amounts are identical', async () => {
    const orderId = `po-recon-${Date.now()}`;
    const testOrder: PurchaseOrder = {
      id: orderId,
      poNumber: 'ATH-PO-RECON1',
      buyerEmail: 'buyer@test.in',
      buyerName: 'Buyer',
      buyerCompany: 'Buyer Co',
      supplierId: 'supp-01',
      supplierSlug: 'supp-01',
      supplierCompany: 'Supplier Co',
      items: [],
      subtotalAmount: 100000,
      platformFeeAmount: 3000,
      totalAmount: 100000, // 1000 INR
      currency: 'INR',
      tradeAssuranceStatus: 'payment_confirmed',
      status: 'active',
      providerPaymentRef: 'mock_pay_123',
      inspectionPeriodDays: 7,
      createdAt: new Date().toISOString(),
    };

    await saveOrder(testOrder);

    appendTransactionEvent({
      orderId,
      eventType: 'PAYMENT_CAPTURED',
      actor: 'provider:mock',
      providerEventId: 'mock_pay_123',
      idempotencyKey: `recon_test_match_${orderId}`,
      newState: 'payment_confirmed',
      metadata: {
        amount: 100000,
        currency: 'INR',
      },
    });

    const recon = await reconcileTransaction(orderId, mockRail);
    assert.strictEqual(recon.type, 'match');
    assert.strictEqual(recon.severity, 'info');
    assert.strictEqual(recon.discrepancy, 0);
  });

  await test('Flags critical exception on amount mismatch between Artha and Provider', async () => {
    const orderId = `po-recon-mismatch-${Date.now()}`;
    const testOrder: PurchaseOrder = {
      id: orderId,
      poNumber: 'ATH-PO-MISMATCH',
      buyerEmail: 'buyer@test.in',
      buyerName: 'Buyer',
      buyerCompany: 'Buyer Co',
      supplierId: 'supp-01',
      supplierSlug: 'supp-01',
      supplierCompany: 'Supplier Co',
      items: [],
      subtotalAmount: 200000,
      platformFeeAmount: 6000,
      totalAmount: 200000, // Artha expects ₹2000
      currency: 'INR',
      tradeAssuranceStatus: 'payment_confirmed',
      status: 'active',
      providerPaymentRef: 'mock_pay_123', // Mock rail returns ₹1000 (100000 paise)
      inspectionPeriodDays: 7,
      createdAt: new Date().toISOString(),
    };

    await saveOrder(testOrder);

    appendTransactionEvent({
      orderId,
      eventType: 'PAYMENT_CAPTURED',
      actor: 'provider:mock',
      providerEventId: 'mock_pay_123',
      idempotencyKey: `recon_test_mismatch_${orderId}`,
      newState: 'payment_confirmed',
      metadata: {
        amount: 200000,
        currency: 'INR',
      },
    });

    const recon = await reconcileTransaction(orderId, mockRail);
    assert.strictEqual(recon.type, 'mismatch');
    assert.strictEqual(recon.severity, 'critical');
    assert.strictEqual(recon.discrepancy, 100000); // 1000 INR difference detected
  });

  await test('Flags missing provider reference exception if order was marked confirmed without external reference', async () => {
    const orderId = `po-recon-missing-${Date.now()}`;
    const testOrder: PurchaseOrder = {
      id: orderId,
      poNumber: 'ATH-PO-NOREF',
      buyerEmail: 'buyer@test.in',
      buyerName: 'Buyer',
      buyerCompany: 'Buyer Co',
      supplierId: 'supp-01',
      supplierSlug: 'supp-01',
      supplierCompany: 'Supplier Co',
      items: [],
      subtotalAmount: 50000,
      platformFeeAmount: 1500,
      totalAmount: 51500,
      currency: 'INR',
      tradeAssuranceStatus: 'awaiting_payment',
      status: 'pending_payment',
      inspectionPeriodDays: 7,
      createdAt: new Date().toISOString(),
    };

    await saveOrder(testOrder);

    const recon = await reconcileTransaction(orderId, mockRail);
    assert.strictEqual(recon.type, 'missing_provider');
  });
}
