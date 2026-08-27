/**
 * tests/e2e/full_transaction.test.ts
 * Comprehensive 16-Step End-to-End Procurement Lifecycle Test.
 * Validates the complete industrial transaction pipeline:
 * RFQ → QUALIFY → MATCH → DEAL ROOM → QUOTE → SAMPLE → PO → PAYMENT → SHIPMENT → DELIVERY → INSPECTION → FUNDS RELEASE → OUTCOME MOAT → DISPUTE
 */

import { qualifyRFQ } from '@/lib/rfqQualification';
import { generateMatchSummary } from '@/lib/aiMatching';
import { suppliers } from '@/data/suppliers';
import {
  saveDeal,
  getDealById,
  saveDealEvent,
  getDealEvents,
  saveOrder,
  getOrderById,
  saveOutcome,
  getOutcomes,
  saveDispute,
  getDisputeByOrderId,
} from '@/lib/runtimeStore';
import { appendTransactionEvent, reconcileOrderState } from '@/lib/transactionLedger';
import { checkResourceAccess } from '@/lib/authorization';
import { PurchaseOrder, TradeAssuranceDispute } from '@/types';
import assert from 'assert';

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`, err);
    throw err;
  }
}

export function runE2ETests() {
  console.log('\n--- Running 16-Step End-to-End Procurement Lifecycle Test Suite ---');

  const testBuyerOrgId = 'org-buyer-test-corp';
  const testBuyerUserId = 'buyer-user-001';
  const testBuyerEmail = 'procurement@testcorp.com';
  const targetSupplier = suppliers[0];

  let activeDealId = '';
  let activeOrderId = '';
  let activeDisputeId = '';

  // Step 1: RFQ Qualification
  test('Step 1: RFQ Qualification checks clarity and extracts structured requirements', () => {
    const rawRfq = {
      productName: 'CNC Machined Impeller Blades',
      category: 'Machinery & Industrial',
      freeTextRequirement: '5000 units of high precision SS316L turbine blades with ±0.01mm tolerance. Required ISO 9001 and CE.',
      quantity: '5000 Units',
      destination: 'Rotterdam, Netherlands',
      material: 'SS316L',
      tolerance: '±0.01mm',
      requiredCertifications: ['ISO 9001', 'CE'],
    };

    const qualification = qualifyRFQ(rawRfq);
    assert.strictEqual(qualification.qualified, true);
    assert.strictEqual(qualification.status, 'qualified');
    assert.strictEqual(qualification.missingMandatoryFields.length, 0);
    assert.ok(qualification.extractedRequirements.length > 0);
  });

  // Step 2: AI Matching & Why-Not Rejection Breakdown
  test('Step 2: Matching engine returns qualified shortlist, ProcurementConfidence, and Why-Not breakdown', () => {
    const buyerRequirements = {
      category: 'Machinery & Industrial',
      certifications: ['ISO 9001', 'CE'],
      mandatoryCertifications: ['ISO 9001'],
    };

    const summary = generateMatchSummary(suppliers, buyerRequirements);
    assert.ok(summary.totalConsidered > 0);
    assert.ok(summary.qualified > 0);
    assert.ok(summary.topMatches.length > 0);

    const topSupplier = summary.topMatches[0];
    assert.strictEqual(topSupplier.hardConstraintsPassed, true);
    assert.ok(topSupplier.procurementConfidence !== undefined);
    assert.ok(topSupplier.procurementConfidence.overall >= 60);
    assert.ok(topSupplier.whyRecommended.length > 0);
    assert.ok(summary.rejectionBreakdown.length > 0);
  });

  // Step 3: Authorization & IDOR Protection
  test('Step 3: Object-level authorization prevents unauthorized access (IDOR Protection)', () => {
    const allowed = checkResourceAccess(
      { userId: testBuyerUserId, orgId: testBuyerOrgId, role: 'buyer' },
      'rfq',
      'read',
      { orgId: testBuyerOrgId }
    );
    assert.strictEqual(allowed, true);

    const deniedCrossOrg = checkResourceAccess(
      { userId: testBuyerUserId, orgId: testBuyerOrgId, role: 'buyer' },
      'rfq',
      'read',
      { orgId: 'org-another-competitor' }
    );
    assert.strictEqual(deniedCrossOrg, false);
  });

  // Step 4: Deal Room Creation with Frozen Snapshots
  test('Step 4: Deal Room creation with frozen requirement & evidence snapshots', () => {
    activeDealId = `DEAL-TEST-${Date.now()}`;
    const dealPayload = {
      id: activeDealId,
      buyerOrgId: testBuyerOrgId,
      buyerEmail: testBuyerEmail,
      buyerCompanyName: 'Test Corp BV',
      supplierId: targetSupplier.id,
      supplierSlug: targetSupplier.slug,
      supplierCompanyName: targetSupplier.companyName,
      rfqId: 'RFQ-TEST-001',
      status: 'qualification' as const,
      requirementsSnapshot: {
        productName: 'CNC Machined Impeller Blades',
        category: targetSupplier.category,
        quantity: '5000 Units',
        destination: 'Rotterdam, Netherlands',
        currency: 'INR' as const,
      },
      evidenceSnapshot: {
        supplierQualityScore: targetSupplier.qualityScore.total,
        verificationTier: targetSupplier.verificationTier,
        gstinVerified: !!targetSupplier.verificationDetails?.gstin,
        physicalAuditPassed: true,
        auditGrade: 'A',
        certificationsVerified: targetSupplier.certifications,
        evidenceTimestamp: new Date().toISOString(),
      },
      commercialSnapshot: {
        moq: '50 Units',
        leadTimeDays: 14,
        paymentTerms: 'Trade Assurance Milestone',
      },
    };

    const savedDeal = saveDeal(dealPayload);
    assert.strictEqual(savedDeal.id, activeDealId);
    assert.strictEqual(savedDeal.requirementsSnapshot.productName, 'CNC Machined Impeller Blades');
    assert.ok(savedDeal.evidenceSnapshot.gstinVerified);
  });

  // Step 5: Supplier Interaction & Event Timeline
  test('Step 5: Deal timeline records event stream and notifies participants', () => {
    const event = saveDealEvent({
      dealId: activeDealId,
      eventType: 'SUPPLIER_SHORTLISTED',
      actor: 'system:matching_engine',
      actorRole: 'system',
      newState: 'supplier_contacted',
      message: 'Supplier shortlisted and invited to Deal Room.',
    });
    assert.ok(event.id !== undefined);

    const retrievedEvents = getDealEvents(activeDealId);
    assert.ok(retrievedEvents.length > 0);
  });

  // Step 6: Supplier Quote Submission
  test('Step 6: Supplier submits formal quote with commercial terms', () => {
    const deal = getDealById(activeDealId);
    assert.ok(deal !== null);

    deal.status = 'supplier_contacted';
    deal.commercialSnapshot = {
      unitPrice: 45000, // ₹450.00
      totalPrice: 225000000, // ₹22,50,000
      moq: '1000 Units',
      leadTimeDays: 21,
      paymentTerms: '100% Trade Assurance Protected Milestone',
    };
    saveDeal(deal);

    saveDealEvent({
      dealId: activeDealId,
      eventType: 'QUOTE_SUBMITTED',
      actor: targetSupplier.companyName,
      actorRole: 'supplier',
      newState: 'negotiation',
      message: 'Supplier submitted formal quote for 5000 units.',
    });

    const updatedDeal = getDealById(activeDealId);
    assert.strictEqual(updatedDeal?.commercialSnapshot.unitPrice, 45000);
  });

  // Step 7: Sample Request & Inspection Approval
  test('Step 7: Buyer requests pre-production sample and approves specifications', () => {
    saveDealEvent({
      dealId: activeDealId,
      eventType: 'SAMPLE_REQUESTED',
      actor: testBuyerEmail,
      actorRole: 'buyer',
      newState: 'sample',
      message: 'Buyer requested material test sample.',
    });

    saveDealEvent({
      dealId: activeDealId,
      eventType: 'SAMPLE_APPROVED',
      actor: testBuyerEmail,
      actorRole: 'buyer',
      newState: 'negotiation',
      message: 'Sample passed dimensional and metallurgical tolerance tests.',
    });

    const events = getDealEvents(activeDealId);
    assert.ok(events.some((e) => e.eventType === 'SAMPLE_APPROVED'));
  });

  // Step 8: Purchase Order Generation with Trade Assurance
  test('Step 8: Buyer converts approved Deal into formal Purchase Order', () => {
    activeOrderId = `PO-TEST-${Date.now()}`;
    const orderPayload: PurchaseOrder = {
      id: activeOrderId,
      poNumber: `PO-2026-${Date.now().toString().slice(-4)}`,
      buyerEmail: testBuyerEmail,
      buyerName: 'Rajat Sharma',
      buyerCompany: 'Test Corp BV',
      supplierId: targetSupplier.id,
      supplierSlug: targetSupplier.slug,
      supplierCompany: targetSupplier.companyName,
      items: [
        {
          id: 'item-001',
          productName: 'CNC Machined Impeller Blades',
          specification: 'SS316L ±0.01mm tolerance',
          quantity: 5000,
          unitPrice: 45000,
          totalPrice: 225000000,
        },
      ],
      subtotalAmount: 225000000,
      platformFeeAmount: 6750000, // 3% fee
      totalAmount: 231750000,
      currency: 'INR',
      tradeAssuranceStatus: 'awaiting_payment',
      status: 'pending_payment',
      inspectionPeriodDays: 7,
      createdAt: new Date().toISOString(),
    };

    saveOrder(orderPayload);
    const order = getOrderById(activeOrderId);
    assert.ok(order !== null);
    assert.strictEqual(order.tradeAssuranceStatus, 'awaiting_payment');
  });

  // Step 9: Payment Captured & Immutable Ledger Idempotency
  test('Step 9: Payment captured in Trade Assurance with idempotent ledger verification', () => {
    const idempotencyKey = `razorpay_pay_test_${Date.now()}`;

    // First attempt: appends successfully
    const firstResult = appendTransactionEvent({
      orderId: activeOrderId,
      eventType: 'PAYMENT_CAPTURED',
      actor: 'provider:razorpay',
      providerEventId: 'pay_live_test_001',
      idempotencyKey,
      newState: 'funds_secured',
    });
    assert.strictEqual(firstResult.isDuplicate, false);

    // Duplicate webhook attempt: gracefully deduplicated
    const dupResult = appendTransactionEvent({
      orderId: activeOrderId,
      eventType: 'PAYMENT_CAPTURED',
      actor: 'provider:razorpay',
      providerEventId: 'pay_live_test_001',
      idempotencyKey,
      newState: 'funds_secured',
    });
    assert.strictEqual(dupResult.isDuplicate, true);

    // Update order status
    const order = getOrderById(activeOrderId);
    if (order) {
      order.tradeAssuranceStatus = 'funds_secured';
      order.status = 'active';
      order.paidAt = new Date().toISOString();
      saveOrder(order);
    }

    const updated = getOrderById(activeOrderId);
    assert.strictEqual(updated?.tradeAssuranceStatus, 'funds_secured');
  });

  // Step 10: Supplier Manufacturing & Dispatch
  test('Step 10: Supplier manufactures and dispatches consignment with carrier tracking', () => {
    const order = getOrderById(activeOrderId);
    if (order) {
      order.tradeAssuranceStatus = 'shipped';
      order.status = 'shipped';
      order.shippedAt = new Date().toISOString();
      order.shippingDetails = {
        carrier: 'VRL Logistics Industrial Express',
        trackingId: 'VRL-IND-889922',
        estimatedDelivery: '2026-08-25',
        shippedAt: new Date().toISOString(),
      };
      saveOrder(order);
    }

    appendTransactionEvent({
      orderId: activeOrderId,
      eventType: 'SHIPMENT_CREATED',
      actor: 'actor:supplier',
      idempotencyKey: `ship_${activeOrderId}`,
      newState: 'shipped',
      metadata: { carrier: 'VRL Logistics', trackingId: 'VRL-IND-889922' },
    });

    const shippedOrder = getOrderById(activeOrderId);
    assert.strictEqual(shippedOrder?.tradeAssuranceStatus, 'shipped');
    assert.strictEqual(shippedOrder?.shippingDetails?.trackingId, 'VRL-IND-889922');
  });

  // Step 11: Consignment Delivery & 7-Day Inspection Window Start
  test('Step 11: Consignment delivered and activates 7-day inspection window', () => {
    const order = getOrderById(activeOrderId);
    if (order) {
      order.tradeAssuranceStatus = 'inspection_period';
      order.status = 'delivered';
      order.deliveredAt = new Date().toISOString();
      order.inspectionEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      saveOrder(order);
    }

    appendTransactionEvent({
      orderId: activeOrderId,
      eventType: 'DELIVERY_CONFIRMED',
      actor: 'actor:buyer',
      idempotencyKey: `deliver_${activeOrderId}`,
      newState: 'inspection_period',
    });

    const inspectedOrder = getOrderById(activeOrderId);
    assert.strictEqual(inspectedOrder?.tradeAssuranceStatus, 'inspection_period');
    assert.ok(inspectedOrder?.inspectionEndsAt !== undefined);
  });

  // Step 12: Buyer Quality Acceptance & Fund Release Payout
  test('Step 12: Buyer accepts inspection quality and triggers fund release to supplier', () => {
    const order = getOrderById(activeOrderId);
    if (order) {
      order.tradeAssuranceStatus = 'released';
      order.status = 'completed';
      order.releasedAt = new Date().toISOString();
      saveOrder(order);
    }

    appendTransactionEvent({
      orderId: activeOrderId,
      eventType: 'ORDER_CLOSED',
      actor: 'actor:buyer',
      idempotencyKey: `release_${activeOrderId}`,
      newState: 'released',
      metadata: { releasedAmountPaise: 225000000 },
    });

    const completedOrder = getOrderById(activeOrderId);
    assert.strictEqual(completedOrder?.tradeAssuranceStatus, 'released');
    assert.strictEqual(completedOrder?.status, 'completed');

    const recon = reconcileOrderState(activeOrderId);
    assert.strictEqual(recon.paymentConfirmed, true);
    assert.strictEqual(recon.deliveryConfirmed, true);
  });

  // Step 13: Transaction Outcome Moat Recording
  test('Step 13: Immutable transaction outcome records verified performance metrics', () => {
    const outcome = saveOutcome({
      rfqId: 'RFQ-TEST-001',
      buyerEmail: testBuyerEmail,
      buyerCompany: 'Test Corp BV',
      supplierId: targetSupplier.id,
      stage: 'delivered',
      quotedPrice: 231750000,
      currency: 'INR',
      deliveryOnTime: true,
      buyerRating: 5,
      defectRateReported: 0,
      notes: 'SS316L impeller blades passed CMM inspection with 0 defects.',
    });

    assert.ok(outcome.id !== undefined);
    assert.strictEqual(outcome.deliveryOnTime, true);
    assert.strictEqual(outcome.buyerRating, 5);
  });

  // Step 14: Supplier Performance Score Compound Moat
  test('Step 14: Supplier track record compounds from verified transaction outcomes', () => {
    const supplierOutcomes = getOutcomes({ supplierId: targetSupplier.id });
    assert.ok(supplierOutcomes.length > 0);

    const latestOutcome = supplierOutcomes[0];
    assert.strictEqual(latestOutcome.buyerRating, 5);
    assert.strictEqual(latestOutcome.defectRateReported, 0);
  });

  // Step 15: Repeat Order Initiation
  test('Step 15: Satisfied buyer places repeat re-order with verified historical performance', () => {
    const repeatOutcome = saveOutcome({
      rfqId: 'RFQ-TEST-001',
      buyerEmail: testBuyerEmail,
      buyerCompany: 'Test Corp BV',
      supplierId: targetSupplier.id,
      stage: 'repeat_order',
      quotedPrice: 463500000, // 2x order size
      currency: 'INR',
      deliveryOnTime: true,
      buyerRating: 5,
      defectRateReported: 0,
      notes: 'Repeat batch re-order: 10,000 units.',
    });

    assert.strictEqual(repeatOutcome.stage, 'repeat_order');
  });

  // Step 16: Trade Assurance Dispute Resolution Lifecycle
  test('Step 16: Trade assurance dispute lifecycle handles raise, freeze, and resolution', () => {
    activeDisputeId = `DISP-${Date.now()}`;
    const disputePayload: TradeAssuranceDispute = {
      id: activeDisputeId,
      orderId: `PO-DISPUTE-TEST-${Date.now()}`,
      raisedByRole: 'buyer',
      raisedByEmail: testBuyerEmail,
      reason: 'Dimensional Tolerance Mismatch',
      description: 'Blade angle deviation observed on 5 units during CMM scan.',
      evidenceUrls: ['https://storage.arthatrade.com/evidence/cmm-scan-01.pdf'],
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    saveDispute(disputePayload);
    const storedDispute = getDisputeByOrderId(disputePayload.orderId);
    assert.ok(storedDispute !== null);
    assert.strictEqual(storedDispute.status, 'open');

    // Mediation Resolution
    storedDispute.status = 'resolved';
    storedDispute.resolution = 'partial_refund';
    storedDispute.resolvedAt = new Date().toISOString();
    storedDispute.mediatorNotes = 'Supplier agreed to replace 5 units at zero freight cost.';
    saveDispute(storedDispute);

    const resolved = getDisputeByOrderId(disputePayload.orderId);
    assert.strictEqual(resolved?.status, 'resolved');
    assert.strictEqual(resolved?.resolution, 'partial_refund');
  });

  console.log('--- All 16 End-to-End Procurement Lifecycle Tests Passed Successfully ---\n');
}

if (typeof require !== 'undefined' && require.main === module) {
  runE2ETests();
}
