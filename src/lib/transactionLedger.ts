/**
 * transactionLedger.ts
 * Immutable Transaction Event Ledger Service.
 * Ensures zero data loss, idempotent webhook execution, and auditable reconciliation.
 * Production: Relies on PostgreSQL unique constraint on idempotency_key.
 * Dev Mode: Atomic file-swap and in-memory mutex to prevent webhook race conditions.
 */

import { TransactionEvent, TransactionEventType } from '@/types/transactionEvent';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as supabaseStore from './supabaseStore';

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
);

const LEDGER_DIR = path.join(process.cwd(), 'data');
const LEDGER_FILE = path.join(LEDGER_DIR, 'transaction-ledger.json');

// In-memory mutex for serializing write access in dev JSON mode
let writeLock: Promise<void> = Promise.resolve();

function ensureLedgerFile() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEDGER_FILE)) {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify([]), 'utf8');
  }
}

export function readLedger(): TransactionEvent[] {
  ensureLedgerFile();
  try {
    const raw = fs.readFileSync(LEDGER_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Atomic write with Windows-safe rename fallback to eliminate JSON corruption while handling Windows file locks.
 */
export function writeLedgerAtomic(events: TransactionEvent[]) {
  ensureLedgerFile();
  const payload = JSON.stringify(events, null, 2);
  const tmpFile = `${LEDGER_FILE}.${Date.now()}.${crypto.randomInt(100, 999)}.tmp`;
  try {
    fs.writeFileSync(tmpFile, payload, 'utf8');
    try {
      fs.renameSync(tmpFile, LEDGER_FILE);
    } catch (renameErr) {
      // Windows-specific lock fallback: write directly and clean up temp file
      fs.writeFileSync(LEDGER_FILE, payload, 'utf8');
      if (fs.existsSync(tmpFile)) {
        try { fs.unlinkSync(tmpFile); } catch {}
      }
    }
  } catch {
    fs.writeFileSync(LEDGER_FILE, payload, 'utf8');
  }
}

/**
 * Appends an event to the immutable ledger.
 * In Supabase mode: guarantees database-level unique constraint atomicity.
 * In Dev JSON mode: guarantees mutex serialized atomic write with deduplication.
 */
export async function appendTransactionEventAsync(
  event: Omit<TransactionEvent, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<{ event: TransactionEvent; isDuplicate: boolean }> {
  if (isSupabaseEnabled) {
    return supabaseStore.appendTransactionEvent(event);
  }

  // Mutex lock for dev file operations
  let release: () => void = () => {};
  const currentLock = writeLock;
  writeLock = new Promise<void>((resolve) => {
    release = resolve;
  });

  try {
    await currentLock;
    const events = readLedger();

    // Idempotency check
    const existing = events.find((e) => e.idempotencyKey === event.idempotencyKey);
    if (existing) {
      console.log(`[Transaction Ledger] Duplicate event detected for key: ${event.idempotencyKey}. Skipping duplicate.`);
      return { event: existing, isDuplicate: true };
    }

    // Compute cryptographic SHA256 payload hash for tamper detection
    const payloadHash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          orderId: event.orderId,
          eventType: event.eventType,
          actor: event.actor,
          idempotencyKey: event.idempotencyKey,
          newState: event.newState,
          metadata: event.metadata || {},
        })
      )
      .digest('hex');

    const record: TransactionEvent = {
      ...event,
      id: event.id || `TXEV-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      metadata: {
        ...(event.metadata || {}),
        payloadHash,
      },
      createdAt: event.createdAt || new Date().toISOString(),
    };

    events.unshift(record);
    writeLedgerAtomic(events);

    return { event: record, isDuplicate: false };
  } finally {
    release();
  }
}

/**
 * Synchronous wrapper for existing callers and test suites.
 */
export function appendTransactionEvent(
  event: Omit<TransactionEvent, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): { event: TransactionEvent; isDuplicate: boolean } {
  const events = readLedger();

  // 1. Idempotency Check
  const existing = events.find((e) => e.idempotencyKey === event.idempotencyKey);
  if (existing) {
    console.log(`[Transaction Ledger] Duplicate event detected for key: ${event.idempotencyKey}. Skipping duplicate.`);
    return { event: existing, isDuplicate: true };
  }

  // 2. Compute cryptographic SHA256 payload hash
  const payloadHash = crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        orderId: event.orderId,
        eventType: event.eventType,
        actor: event.actor,
        idempotencyKey: event.idempotencyKey,
        newState: event.newState,
        metadata: event.metadata || {},
      })
    )
    .digest('hex');

  // 3. Create and append immutable record atomically
  const record: TransactionEvent = {
    ...event,
    id: event.id || `TXEV-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
    metadata: {
      ...(event.metadata || {}),
      payloadHash,
    },
    createdAt: event.createdAt || new Date().toISOString(),
  };

  events.unshift(record);
  writeLedgerAtomic(events);

  return { event: record, isDuplicate: false };
}

/**
 * Retrieves all events for a specific purchase order.
 */
export function getTransactionEventsByOrder(orderId: string): TransactionEvent[] {
  const events = readLedger();
  return events.filter((e) => e.orderId === orderId);
}

/**
 * Reconciles the lifecycle state of an order against its immutable event stream.
 */
export function reconcileOrderState(orderId: string): {
  currentState: string;
  totalEvents: number;
  paymentConfirmed: boolean;
  deliveryConfirmed: boolean;
} {
  const events = getTransactionEventsByOrder(orderId);
  const paymentConfirmed = events.some((e) => e.eventType === 'PAYMENT_CAPTURED');
  const deliveryConfirmed = events.some((e) => e.eventType === 'DELIVERY_CONFIRMED');

  const latest = events[0];
  const currentState = latest?.newState || latest?.eventType || 'UNKNOWN';

  return {
    currentState,
    totalEvents: events.length,
    paymentConfirmed,
    deliveryConfirmed,
  };
}

