/**
 * reconciliation.ts
 * Minimum Viable Reconciliation Engine for Aartha Protect.
 * 
 * CORE PRINCIPLE:
 * Real financial transactions MUST NEVER run with zero reconciliation.
 * Before settlement or ledger closing, Artha compares its internal event ledger
 * against the external payment partner's records to detect amount discrepancies,
 * missing events, or status mismatches.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getPaymentRail, PaymentRail } from './paymentRail';
import { getTransactionEventsByOrder } from './transactionLedger';
import { getOrderById } from './storeAdapter';
import { ReconciliationEntry, ReconciliationType, ReconciliationSeverity } from '@/types/payment';

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RECON_DIR = path.join(process.cwd(), 'data');
const RECON_FILE = path.join(RECON_DIR, 'reconciliation-log.json');

const memoryReconciliationLogs: ReconciliationEntry[] = [];

function ensureReconFile() {
  try {
    if (!fs.existsSync(RECON_DIR)) {
      fs.mkdirSync(RECON_DIR, { recursive: true });
    }
    if (!fs.existsSync(RECON_FILE)) {
      fs.writeFileSync(RECON_FILE, JSON.stringify([]), 'utf8');
    }
  } catch {
    // Read-only serverless filesystem (Vercel)
  }
}

export function readReconciliationLog(): ReconciliationEntry[] {
  try {
    ensureReconFile();
    if (!fs.existsSync(RECON_FILE)) {
      return memoryReconciliationLogs;
    }
    const raw = fs.readFileSync(RECON_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return memoryReconciliationLogs;
  }
}

export function appendReconciliationEntry(entry: ReconciliationEntry) {
  memoryReconciliationLogs.unshift(entry);
  try {
    ensureReconFile();
    const logs = readReconciliationLog();
    logs.unshift(entry);
    fs.writeFileSync(RECON_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch {
    // Serverless read-only filesystem fallback
  }
}

/**
 * Reconciles a single transaction between Artha's internal ledger and the payment partner.
 */
export async function reconcileTransaction(
  orderId: string,
  railInstance?: PaymentRail
): Promise<ReconciliationEntry> {
  const rail = railInstance || getPaymentRail();
  const events = getTransactionEventsByOrder(orderId);
  const order = await getOrderById(orderId);

  const captureEvent = events.find(
    (e) => e.eventType === 'PAYMENT_CAPTURED' || e.eventType === 'PAYMENT_AUTHORIZED'
  );

  const expectedAmount = order?.totalAmount || captureEvent?.metadata?.amount || 0;
  const providerRef = order?.providerPaymentRef || order?.razorpayPaymentId || captureEvent?.providerEventId;

  // Case 1: Artha has order but no provider payment reference
  if (!providerRef) {
    const entry: ReconciliationEntry = {
      id: `RECON-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      transactionId: orderId,
      arthaAmount: expectedAmount,
      providerAmount: 0,
      discrepancy: expectedAmount,
      type: 'missing_provider',
      severity: expectedAmount > 0 ? 'critical' : 'info',
      details: 'Order exists in Artha but has no external payment partner reference logged.',
      createdAt: new Date().toISOString(),
    };
    appendReconciliationEntry(entry);
    return entry;
  }

  // Case 2: Query provider status
  try {
    const providerStatus = await rail.getPaymentStatus(providerRef);
    const providerAmount = providerStatus.amount || 0;
    const discrepancy = Math.abs(expectedAmount - providerAmount);

    let type: ReconciliationType = 'match';
    let severity: ReconciliationSeverity = 'info';
    let details = 'Artha internal ledger and payment partner records match perfectly.';

    if (discrepancy > 0) {
      type = 'mismatch';
      severity = 'critical';
      details = `Amount discrepancy detected! Artha expected ₹${expectedAmount / 100}, but provider captured ₹${providerAmount / 100}. (Diff: ₹${discrepancy / 100})`;
    } else if (providerStatus.status !== 'captured' && (order?.tradeAssuranceStatus === 'funds_secured' || order?.tradeAssuranceStatus === 'payment_confirmed')) {
      type = 'mismatch';
      severity = 'warning';
      details = `State discrepancy: Artha shows payment confirmed, but provider status is "${providerStatus.status}".`;
    }

    const entry: ReconciliationEntry = {
      id: `RECON-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      transactionId: orderId,
      arthaAmount: expectedAmount,
      providerAmount,
      discrepancy,
      type,
      severity,
      details,
      createdAt: new Date().toISOString(),
    };

    appendReconciliationEntry(entry);
    return entry;
  } catch (err: any) {
    const entry: ReconciliationEntry = {
      id: `RECON-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      transactionId: orderId,
      arthaAmount: expectedAmount,
      providerAmount: 0,
      discrepancy: expectedAmount,
      type: 'missing_provider',
      severity: 'critical',
      details: `Failed to query payment partner for reconciliation: ${err.message}`,
      createdAt: new Date().toISOString(),
    };
    appendReconciliationEntry(entry);
    return entry;
  }
}

/**
 * Returns all active reconciliation exceptions requiring administrative review.
 */
export function getReconciliationExceptions(): ReconciliationEntry[] {
  const logs = readReconciliationLog();
  return logs.filter((log) => log.type !== 'match' && !log.resolvedAt);
}
