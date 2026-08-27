/**
 * paymentRail.ts
 * Provider-Agnostic Payment Infrastructure Abstraction for Aartha.
 * 
 * CORE PRINCIPLE:
 * Business domain logic MUST NEVER depend on provider-specific APIs (Razorpay, Cashfree, PayU).
 * All interaction routes through this PaymentRail interface.
 */

import { PaymentIntent } from '@/types/payment';

export interface CreatePaymentIntentParams {
  transactionId: string;        // Artha Purchase Order ID (e.g. "po-xxxx")
  amount: number;               // Amount in paise
  currency: 'INR' | 'USD';
  buyerEmail: string;
  buyerName?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  intent: PaymentIntent;
  providerOrderId: string;      // External provider reference (e.g. "order_xxxx")
  providerKeyId?: string;       // Public key for frontend SDK (e.g. Razorpay key ID)
  isLiveGateway: boolean;
}

export interface PaymentStatusResult {
  providerPaymentRef: string;
  status: 'captured' | 'authorized' | 'failed' | 'refunded' | 'pending';
  amount: number;               // in paise
  currency: string;
  method?: string;
  capturedAt?: string;
}

export interface WebhookVerifyResult {
  isValid: boolean;
  event?: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  amount?: number;              // in paise
  currency?: string;
  rawPayload?: any;
  error?: string;
}

export interface CreateRefundParams {
  transactionId: string;
  providerPaymentRef: string;
  amount: number;               // in paise
  reason: string;
}

export interface RefundExecutionResult {
  success: boolean;
  providerRefundRef?: string;
  status: 'completed' | 'pending' | 'failed';
  error?: string;
}

export interface PaymentRail {
  readonly providerName: 'razorpay' | 'cashfree' | 'mock';

  /**
   * Creates a payment intent & external order with the payment partner.
   */
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;

  /**
   * Fetches the current payment status directly from the provider.
   */
  getPaymentStatus(providerPaymentRef: string): Promise<PaymentStatusResult>;

  /**
   * Verifies the cryptographic HMAC signature of an incoming webhook payload.
   */
  verifyWebhook(rawBody: string, signature: string | null): WebhookVerifyResult;

  /**
   * Initiates a refund through the provider's payment rails.
   */
  refund(params: CreateRefundParams): Promise<RefundExecutionResult>;
}

// Lazy-loaded factory to prevent circular dependencies
let activeRailInstance: PaymentRail | null = null;

export function getPaymentRail(): PaymentRail {
  if (activeRailInstance) {
    return activeRailInstance;
  }

  const configuredProvider = process.env.PAYMENT_PROVIDER?.toLowerCase();

  if (configuredProvider === 'razorpay' || (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RazorpayAdapter } = require('./razorpayAdapter');
    activeRailInstance = new RazorpayAdapter();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MockPaymentRail } = require('./mockPaymentRail');
    activeRailInstance = new MockPaymentRail();
  }

  return activeRailInstance!;
}

/**
 * Resets the active payment rail instance (useful for test injection).
 */
export function setPaymentRailForTesting(rail: PaymentRail | null) {
  activeRailInstance = rail;
}
