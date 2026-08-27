/**
 * transactionEvent.ts
 * Type definitions for Immutable Transaction Event Ledger & Payment Hardening.
 */

export type TransactionEventType =
  | 'ORDER_CREATED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_CAPTURED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_EXPIRED'
  | 'SUPPLIER_ACCEPTED'
  | 'PRODUCTION_STARTED'
  | 'MILESTONE_SUBMITTED'
  | 'INSPECTION_REQUESTED'
  | 'INSPECTION_PASSED'
  | 'SHIPMENT_CREATED'
  | 'DELIVERY_CONFIRMED'
  | 'INSPECTION_WINDOW_OPENED'
  | 'RELEASE_AUTHORIZED'
  | 'SETTLEMENT_INITIATED'
  | 'SETTLEMENT_COMPLETED'
  | 'SETTLEMENT_FAILED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'REFUND_INITIATED'
  | 'REFUND_REQUESTED'
  | 'REFUND_COMPLETED'
  | 'RECONCILIATION_EXCEPTION'
  | 'ORDER_CLOSED';

export interface TransactionEvent {
  id: string;
  orderId: string;
  dealId?: string;
  eventType: TransactionEventType;
  actor: string;
  providerEventId?: string; // Razorpay payment ID / webhook event ID
  idempotencyKey: string; // Unique key to prevent double-processing
  previousState?: string;
  newState?: string;
  metadata?: Record<string, any>;
  createdAt: string; // ISO date
}

export interface PaymentWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        status: string;
        receipt?: string;
      };
    };
  };
  created_at: number;
}
