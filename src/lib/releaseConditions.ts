/**
 * releaseConditions.ts
 * Deterministic Release Condition Engine for Aartha Protect.
 * 
 * CORE PRINCIPLE:
 * Money movement authorization MUST be 100% deterministic, evidence-backed, and auditable.
 * AI models may extract, parse, or classify inspection evidence, but AI NEVER directly
 * triggers or authorizes financial release.
 */

import { PurchaseOrder } from '@/types';
import { ReleasePolicy, ReleaseConditionResult } from '@/types/payment';

export const DEFAULT_RELEASE_POLICY: ReleasePolicy = {
  requirePaymentConfirmed: true,
  requireShipmentEvidence: true,
  requireDeliveryConfirmed: true,
  requireInspectionWindowExpired: true,
  inspectionWindowDays: 7,
  requireNoActiveDispute: true,
};

/**
 * Deterministically evaluates whether a Purchase Order satisfies all contractual
 * release conditions to unlock supplier settlement.
 */
export function evaluateReleaseConditions(
  order: PurchaseOrder,
  customPolicy: Partial<ReleasePolicy> = {}
): ReleaseConditionResult {
  const policy: ReleasePolicy = {
    ...DEFAULT_RELEASE_POLICY,
    ...customPolicy,
  };

  const unmetConditions: string[] = [];

  // Condition 1: Payment must be confirmed by payment partner
  const isPaid = !!order.paidAt || [
    'payment_confirmed',
    'funds_secured',
    'in_production',
    'shipped',
    'delivered',
    'inspection_period',
  ].includes(order.tradeAssuranceStatus);

  if (policy.requirePaymentConfirmed && !isPaid) {
    unmetConditions.push('Payment has not been confirmed by authorized payment partner.');
  }

  // Condition 2: Dispatch / Shipment evidence must be recorded
  const hasShipment = !!order.shippedAt || !!order.shippingDetails?.trackingId;
  if (policy.requireShipmentEvidence && !hasShipment) {
    unmetConditions.push('Consignment dispatch tracking (AWB/LR) has not been uploaded.');
  }

  // Condition 3: Physical delivery must be confirmed
  const hasDelivery = !!order.deliveredAt || [
    'delivered',
    'inspection_period',
    'release_authorized',
    'settled',
    'released',
  ].includes(order.tradeAssuranceStatus);

  if (policy.requireDeliveryConfirmed && !hasDelivery) {
    unmetConditions.push('Buyer physical consignment receipt has not been confirmed.');
  }

  // Condition 4: Quality inspection period (7-day window)
  if (policy.requireInspectionWindowExpired && order.inspectionEndsAt) {
    const inspectionEnd = new Date(order.inspectionEndsAt).getTime();
    const now = Date.now();
    if (now < inspectionEnd) {
      const remainingHours = Math.ceil((inspectionEnd - now) / (1000 * 60 * 60));
      unmetConditions.push(
        `Quality inspection period active (${remainingHours} hours remaining). Buyer may accept early or wait for automatic release.`
      );
    }
  }

  // Condition 5: No active dispute
  if (policy.requireNoActiveDispute && order.tradeAssuranceStatus === 'disputed') {
    unmetConditions.push('Active Aartha Protect dispute is open. Settlement blocked pending resolution.');
  }

  // Condition 6: Terminal state check
  if (order.tradeAssuranceStatus === 'settled' || order.tradeAssuranceStatus === 'released') {
    unmetConditions.push('Funds have already been authorized and released for this order.');
  }

  if (order.tradeAssuranceStatus === 'refunded' || order.tradeAssuranceStatus === 'cancelled') {
    unmetConditions.push(`Order is in terminal state: "${order.tradeAssuranceStatus}".`);
  }

  return {
    eligible: unmetConditions.length === 0,
    unmetConditions,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Checks if the buyer has explicit authority to waive the remaining inspection
 * period early and immediately authorize release.
 */
export function canBuyerWaiveInspection(
  order: PurchaseOrder,
  callerEmail: string,
  callerRole: string
): { allowed: boolean; reason?: string } {
  if (callerRole !== 'admin' && callerEmail.toLowerCase() !== order.buyerEmail.toLowerCase()) {
    return {
      allowed: false,
      reason: 'Only the ordering buyer or platform administrator can authorize early release.',
    };
  }

  if (order.tradeAssuranceStatus === 'disputed') {
    return {
      allowed: false,
      reason: 'Cannot waive inspection while a dispute is actively under review.',
    };
  }

  if (!order.shippedAt) {
    return {
      allowed: false,
      reason: 'Cannot waive inspection prior to goods shipment.',
    };
  }

  return { allowed: true };
}
