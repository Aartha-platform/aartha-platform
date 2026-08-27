/**
 * storeAdapter.ts
 * Public adapter facade — all API routes import from here.
 * Dynamically routes to Supabase PostgreSQL or filesystem JSON based on environment variables.
 */

import * as runtimeStore from './runtimeStore';
import * as supabaseStore from './supabaseStore';

const isProduction = process.env.NODE_ENV === 'production';
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build';
const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
);

// In production runtime (not build phase), fail closed if PostgreSQL is missing
if (isProduction && !isBuildPhase && !isSupabaseEnabled) {
  throw new Error(
    '[FATAL ERROR] Artha Production Gate: Production deployment requires PostgreSQL / Supabase credentials. ' +
    'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) environment variables. ' +
    'Silent fallback to local JSON is strictly forbidden in production.'
  );
}

if (isSupabaseEnabled) {
  console.log('[Artha Store Adapter] Database mode: Supabase PostgreSQL Active');
} else {
  console.log('[Artha Store Adapter] Database mode: Dev Offline JSON Store Active (data/artha-store.json)');
}

const store = isSupabaseEnabled ? supabaseStore : runtimeStore;

// ── Pass-through Type Exports ───────────────────────────────────────────────
export type {
  StoredRFQ,
  StoredApplication,
  StoredEnquiry,
  StoredAuditEvent,
  StoredSession,
  StoredUser,
  StoredOTP,
} from './runtimeStore';

// ── Synchronous Crypto Helpers ───────────────────────────────────────────────
// Keep synchronous to avoid breaking auth performance (pure CPU math)
export function hashPassword(password: string): string {
  return store.hashPassword(password);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  return store.verifyPassword(password, storedHash);
}

// ── Async Store Interfaces ──────────────────────────────────────────────────

// RFQs
export async function saveRfq(rfq: any) {
  return store.saveRfq(rfq);
}
export async function getRfqs() {
  return store.getRfqs();
}
export async function getRfqById(id: string) {
  return store.getRfqById(id);
}

// Applications
export async function saveApplication(app: any) {
  return store.saveApplication(app);
}
export async function getApplications() {
  return store.getApplications();
}
export async function updateApplicationStatus(id: string, status: any, fields?: any) {
  return store.updateApplicationStatus(id, status, fields);
}

// Enquiries
export async function saveEnquiry(enq: any) {
  return store.saveEnquiry(enq);
}
export async function getEnquiries() {
  return store.getEnquiries();
}

// Audit Log
export async function saveAuditEvent(event: any) {
  return store.saveAuditEvent(event);
}
export async function getAuditLog() {
  return store.getAuditLog();
}

// Sessions
export async function saveSession(session: any) {
  return store.saveSession(session);
}
export async function getSession(token: string) {
  return store.getSession(token);
}
export async function deleteSession(token: string) {
  return store.deleteSession(token);
}

// Users
export async function saveUser(user: any) {
  return store.saveUser(user);
}
export async function getUserByEmail(email: string) {
  return store.getUserByEmail(email);
}
export async function verifyUser(email: string) {
  return store.verifyUser(email);
}
export async function updateUserPassword(email: string, passwordHash: string) {
  return store.updateUserPassword(email, passwordHash);
}

// OTPs
export async function saveOtp(identifier: string, otp: string, ttlMs?: number) {
  return store.saveOtp(identifier, otp, ttlMs);
}
export async function verifyOtp(identifier: string, otp: string) {
  return store.verifyOtp(identifier, otp);
}
export async function deleteOtp(identifier: string) {
  return store.deleteOtp(identifier);
}

// Orders & Aartha Protect
export async function saveOrder(order: any) {
  return store.saveOrder(order);
}
export async function getOrderById(id: string) {
  return store.getOrderById(id);
}
export async function getOrdersByBuyer(email: string) {
  return store.getOrdersByBuyer(email);
}
export async function getOrdersBySupplier(supplierId: string) {
  return store.getOrdersBySupplier(supplierId);
}
export async function saveDispute(dispute: any) {
  return store.saveDispute(dispute);
}
export async function getDisputeByOrderId(orderId: string) {
  return store.getDisputeByOrderId(orderId);
}

// Suppliers
export async function getSuppliers(options?: { includeDemo?: boolean }) {
  return store.getSuppliers(options);
}
export async function getSupplierBySlug(slug: string) {
  return store.getSupplierBySlug(slug);
}
export async function getSupplierById(id: string) {
  return store.getSupplierById(id);
}
export async function saveSupplier(supplier: any) {
  return store.saveSupplier(supplier);
}

// Transaction Outcomes (Compounding Moat)
export async function saveOutcome(outcome: any) {
  return store.saveOutcome(outcome);
}
export async function getOutcomes(filter?: { rfqId?: string; supplierId?: string; stage?: string }) {
  return store.getOutcomes(filter);
}
export async function getOutcomeById(id: string) {
  return store.getOutcomeById(id);
}

// Deal Room Operations
export async function saveDeal(deal: any) {
  return store.saveDeal(deal);
}
export async function getDealById(id: string) {
  return store.getDealById(id);
}
export async function getDeals(filter?: { buyerOrgId?: string; supplierId?: string; rfqId?: string }) {
  return store.getDeals(filter);
}
export async function saveDealEvent(event: any) {
  return store.saveDealEvent(event);
}
export async function getDealEvents(dealId: string) {
  return store.getDealEvents(dealId);
}

// Platform Stats
export async function getStats() {
  return store.getStats();
}


