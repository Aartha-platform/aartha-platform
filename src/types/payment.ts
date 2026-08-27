/**
 * payment.ts
 * Canonical Financial and Payment Orchestration Type Definitions for Aartha.
 * 
 * DESIGN PRINCIPLE:
 * Artha owns the canonical transaction identity (id, transactionId, paymentIntentId).
 * External payment provider IDs (e.g. Razorpay order_id, payment_id) are strictly
 * treated as external metadata references, NEVER as internal primary keys.
 */

export type PaymentIntentStatus =
  | 'created'
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'expired'
  | 'refunded';

export interface PaymentIntent {
  id: string;                          // Canonical Artha Intent ID (e.g. "PI-1724500000-xxxx")
  transactionId: string;               // Associated Purchase Order ID (e.g. "po-xxxx")
  amount: number;                      // Amount in paise (₹1 = 100 paise)
  currency: 'INR' | 'USD';
  status: PaymentIntentStatus;
  providerName: 'razorpay' | 'cashfree' | 'mock';
  providerOrderRef?: string;           // Provider's external order ID (e.g. "order_xxxx")
  providerPaymentRef?: string;         // Provider's external payment ID (e.g. "pay_xxxx")
  buyerEmail: string;
  createdAt: string;                   // ISO 8601
  confirmedAt?: string;
  failedAt?: string;
  metadata?: Record<string, string>;
}

export type SettlementStatus =
  | 'pending'
  | 'initiated'
  | 'completed'
  | 'failed';

export interface SettlementInstruction {
  id: string;                          // Canonical Settlement ID (e.g. "SETTLE-xxxx")
  transactionId: string;
  paymentIntentId: string;
  supplierId: string;
  supplierAmount: number;              // Net payable to supplier in paise
  platformFeeAmount: number;           // Retained platform commission in paise
  status: SettlementStatus;
  providerTransferRef?: string;        // External transfer ID from PA (e.g. Razorpay Route transfer_id)
  initiatedAt?: string;
  completedAt?: string;
  failedReason?: string;
  createdAt: string;
}

export type RefundStatus =
  | 'pending'
  | 'initiated'
  | 'completed'
  | 'failed';

export interface RefundRecord {
  id: string;                          // Canonical Refund ID (e.g. "REF-xxxx")
  transactionId: string;
  paymentIntentId: string;
  amount: number;                      // Refund amount in paise
  reason: string;
  status: RefundStatus;
  providerRefundRef?: string;          // External refund reference from PA (e.g. "rfnd_xxxx")
  initiatedBy: string;                 // User ID or role
  initiatedAt: string;
  completedAt?: string;
  failedReason?: string;
}

export type ReconciliationType =
  | 'match'
  | 'mismatch'
  | 'missing_artha'
  | 'missing_provider';

export type ReconciliationSeverity =
  | 'info'
  | 'warning'
  | 'critical';

export interface ReconciliationEntry {
  id: string;                          // Recon event ID (e.g. "RECON-xxxx")
  transactionId: string;
  arthaAmount: number;                 // Amount recorded in Artha ledger
  providerAmount: number;              // Amount captured at payment aggregator
  discrepancy: number;                 // Math.abs(arthaAmount - providerAmount)
  type: ReconciliationType;
  severity: ReconciliationSeverity;
  details?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface ReleasePolicy {
  requirePaymentConfirmed: boolean;      // Must be confirmed by provider
  requireShipmentEvidence: boolean;       // Must have dispatch AWB/LR logged
  requireDeliveryConfirmed: boolean;      // Buyer must confirm delivery
  requireInspectionWindowExpired: boolean; // 7-day quality window must lapse or be waived
  inspectionWindowDays: number;           // Default: 7 days
  requireNoActiveDispute: boolean;        // Must not be in open dispute
}

export interface ReleaseConditionResult {
  eligible: boolean;
  unmetConditions: string[];
  evaluatedAt: string;
}
