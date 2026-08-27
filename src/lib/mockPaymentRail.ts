/**
 * mockPaymentRail.ts
 * In-memory Mock Payment Rail for Development & Automated Testing.
 * 
 * Provides deterministic simulation of payment intent creation, webhook processing,
 * status checks, and refunds without making outbound network calls.
 */

import crypto from 'crypto';
import {
  PaymentRail,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  PaymentStatusResult,
  WebhookVerifyResult,
  CreateRefundParams,
  RefundExecutionResult,
} from './paymentRail';
import { PaymentIntent } from '@/types/payment';

export class MockPaymentRail implements PaymentRail {
  readonly providerName = 'mock' as const;

  private mockPayments = new Map<string, { status: string; amount: number; currency: string }>();

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const providerOrderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;
    const intentId = `PI-${Date.now()}-${crypto.randomInt(1000, 9999)}`;

    const intent: PaymentIntent = {
      id: intentId,
      transactionId: params.transactionId,
      amount: params.amount,
      currency: params.currency,
      status: 'created',
      providerName: 'mock',
      providerOrderRef: providerOrderId,
      buyerEmail: params.buyerEmail,
      createdAt: new Date().toISOString(),
      metadata: params.metadata || {},
    };

    // Pre-populate mock record
    this.mockPayments.set(providerOrderId, {
      status: 'captured',
      amount: params.amount,
      currency: params.currency,
    });

    return {
      intent,
      providerOrderId,
      providerKeyId: 'mock_key_id_dev',
      isLiveGateway: false,
    };
  }

  async getPaymentStatus(providerPaymentRef: string): Promise<PaymentStatusResult> {
    const record = this.mockPayments.get(providerPaymentRef);
    if (record) {
      return {
        providerPaymentRef,
        status: record.status as any,
        amount: record.amount,
        currency: record.currency,
        capturedAt: new Date().toISOString(),
      };
    }

    // Default simulated captured response for test fixtures
    return {
      providerPaymentRef,
      status: 'captured',
      amount: 100000, // 1000 INR in paise
      currency: 'INR',
      capturedAt: new Date().toISOString(),
    };
  }

  verifyWebhook(rawBody: string, signature: string | null): WebhookVerifyResult {
    try {
      const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      
      // In mock mode, check if explicitly marked invalid or missing signature in strict test
      if (signature === 'invalid_signature_test') {
        return { isValid: false, error: 'Mock invalid signature test' };
      }

      const event = payload.event || 'payment.captured';
      const paymentObj = payload.payload?.payment?.entity || payload.payment || payload;
      const providerPaymentId = paymentObj.id || payload.payment_id || `mock_pay_${Date.now()}`;
      const providerOrderId = paymentObj.order_id || payload.order_id || 'mock_order_default';
      const amount = paymentObj.amount || payload.amount || 0;
      const currency = paymentObj.currency || 'INR';

      return {
        isValid: true,
        event,
        providerPaymentId,
        providerOrderId,
        amount,
        currency,
        rawPayload: payload,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: `Mock webhook parse failed: ${err.message}`,
      };
    }
  }

  async refund(params: CreateRefundParams): Promise<RefundExecutionResult> {
    const providerRefundRef = `mock_rfnd_${crypto.randomBytes(6).toString('hex')}`;
    
    return {
      success: true,
      providerRefundRef,
      status: 'completed',
    };
  }
}
