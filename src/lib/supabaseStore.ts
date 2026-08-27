import { supabase } from './supabaseClient';
import crypto from 'crypto';
import {
  StoredRFQ,
  StoredApplication,
  StoredEnquiry,
  StoredAuditEvent,
  StoredSession,
  StoredUser,
} from './runtimeStore';

// ID Generators
export function generateRfqId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = crypto.randomInt(1000, 9999);
  return `RFQ-${year}-${month}-${rand}`;
}

export function generateAppId(): string {
  return `APP-${Date.now()}-${crypto.randomInt(100, 999)}`;
}

export function generateEnquiryId(): string {
  return `ENQ-${Date.now()}-${crypto.randomInt(100, 999)}`;
}

export function generateAuditId(): string {
  return `AUD-${Date.now()}-${crypto.randomInt(100, 999)}`;
}

// Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}

// ── RFQ Operations ────────────────────────────────────────────────────────────
export async function saveRfq(rfq: Omit<StoredRFQ, 'id' | 'submittedAt' | 'status'>): Promise<StoredRFQ> {
  const record: StoredRFQ = {
    ...rfq,
    id: generateRfqId(),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  const { error } = await supabase.from('rfqs').insert([record]);
  if (error) throw error;
  return record;
}

export async function getRfqs(): Promise<StoredRFQ[]> {
  const { data, error } = await supabase.from('rfqs').select('*').order('submittedAt', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getRfqById(id: string): Promise<StoredRFQ | undefined> {
  const { data, error } = await supabase.from('rfqs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || undefined;
}

// ── Application Operations ────────────────────────────────────────────────────
export async function saveApplication(
  app: Omit<StoredApplication, 'id' | 'submittedAt' | 'status'>
): Promise<StoredApplication> {
  const record: StoredApplication = {
    ...app,
    id: generateAppId(),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  const { error } = await supabase.from('applications').insert([record]);
  if (error) throw error;
  return record;
}

export async function getApplications(): Promise<StoredApplication[]> {
  const { data, error } = await supabase.from('applications').select('*').order('submittedAt', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateApplicationStatus(
  id: string,
  status: StoredApplication['status'],
  fields?: Partial<StoredApplication>
): Promise<StoredApplication | undefined> {
  const updatePayload = {
    status,
    ...fields,
  };
  const { data, error } = await supabase
    .from('applications')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data || undefined;
}

// ── Enquiry Operations ────────────────────────────────────────────────────────
export async function saveEnquiry(
  enq: Omit<StoredEnquiry, 'id' | 'submittedAt' | 'status'>
): Promise<StoredEnquiry> {
  const record: StoredEnquiry = {
    ...enq,
    id: generateEnquiryId(),
    status: 'new',
    submittedAt: new Date().toISOString(),
  };
  const { error } = await supabase.from('enquiries').insert([record]);
  if (error) throw error;
  return record;
}

export async function getEnquiries(): Promise<StoredEnquiry[]> {
  const { data, error } = await supabase.from('enquiries').select('*').order('submittedAt', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Audit Log Operations ──────────────────────────────────────────────────────
export async function saveAuditEvent(
  event: Omit<StoredAuditEvent, 'id' | 'timestamp'>
): Promise<StoredAuditEvent> {
  const record: StoredAuditEvent = {
    ...event,
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
  };
  const { error } = await supabase.from('audit_log').insert([record]);
  if (error) throw error;
  return record;
}

export async function getAuditLog(): Promise<StoredAuditEvent[]> {
  const { data, error } = await supabase.from('audit_log').select('*').order('timestamp', { ascending: false }).limit(500);
  if (error) throw error;
  return data || [];
}

// ── Session Operations ────────────────────────────────────────────────────────
export async function saveSession(session: StoredSession): Promise<void> {
  const { error } = await supabase.from('sessions').upsert([session]);
  if (error) throw error;
}

export async function getSession(token: string): Promise<StoredSession | null> {
  const { data, error } = await supabase.from('sessions').select('*').eq('token', token).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  
  if (new Date(data.expiresAt) < new Date()) {
    await deleteSession(token);
    return null;
  }
  return data as StoredSession;
}

export async function deleteSession(token: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('token', token);
  if (error) throw error;
}

// ── User Operations ───────────────────────────────────────────────────────────
export async function saveUser(user: Omit<StoredUser, 'id' | 'createdAt'>): Promise<StoredUser> {
  const record: StoredUser = {
    ...user,
    id: `usr-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  const { error } = await supabase.from('users').insert([record]);
  if (error) throw error;
  return record;
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
  if (error) throw error;
  return data as StoredUser | null;
}

export async function verifyUser(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .update({ isVerified: true })
    .eq('email', email.toLowerCase())
    .select();
  if (error) throw error;
  return (data && data.length > 0) || false;
}

export async function updateUserPassword(email: string, newPasswordHash: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .update({ passwordHash: newPasswordHash, isVerified: true })
    .eq('email', email.toLowerCase())
    .select();
  if (error) throw error;
  return (data && data.length > 0) || false;
}

// ── OTP Operations ────────────────────────────────────────────────────────────
export async function saveOtp(identifier: string, otp: string, ttlMs: number = 120 * 1000): Promise<void> {
  const keyName = identifier.toLowerCase().trim();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = `${salt}:${crypto.scryptSync(otp, salt, 32).toString('hex')}`;
  
  const record = {
    email: keyName,
    otpHash,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    attempts: 0,
  };
  
  const { error } = await supabase.from('otps').upsert([record]);
  if (error) throw error;
}

export async function verifyOtp(identifier: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const keyName = identifier.toLowerCase().trim();
  const { data: record, error: fetchError } = await supabase.from('otps').select('*').eq('email', keyName).maybeSingle();
  if (fetchError) throw fetchError;
  if (!record) return { success: false, error: 'No verification code found.' };
  
  if (new Date(record.expiresAt) < new Date()) {
    await deleteOtp(keyName);
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }
  
  if (record.attempts >= 3) {
    await deleteOtp(keyName);
    return { success: false, error: 'Too many failed verification attempts. Please request a new code.' };
  }
  
  const [salt, key] = record.otpHash.split(':');
  const computedHash = crypto.scryptSync(otp, salt, 32).toString('hex');
  const match = crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(computedHash, 'hex'));
  
  if (match) {
    await deleteOtp(keyName);
    return { success: true };
  } else {
    const attempts = record.attempts + 1;
    await supabase.from('otps').update({ attempts }).eq('email', keyName);
    return { success: false, error: `Invalid verification code. ${3 - attempts} attempts remaining.` };
  }
}

export async function deleteOtp(identifier: string): Promise<void> {
  const keyName = identifier.toLowerCase().trim();
  const { error } = await supabase.from('otps').delete().eq('email', keyName);
  if (error) throw error;
}

// ── Order & Aartha Protect Operations ──────────────────────────────────────────────────
export async function saveOrder(order: any): Promise<void> {
  const { error } = await supabase.from('orders').upsert([order]);
  if (error) throw error;
}

export async function getOrderById(id: string): Promise<any | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getOrdersByBuyer(email: string): Promise<any[]> {
  const { data, error } = await supabase.from('orders').select('*').eq('buyerEmail', email.toLowerCase());
  if (error) throw error;
  return data || [];
}

export async function getOrdersBySupplier(supplierId: string): Promise<any[]> {
  const { data, error } = await supabase.from('orders').select('*').eq('supplierId', supplierId);
  if (error) throw error;
  return data || [];
}

export async function saveDispute(dispute: any): Promise<void> {
  const { error } = await supabase.from('disputes').upsert([dispute]);
  if (error) throw error;
}

export async function getDisputeByOrderId(orderId: string): Promise<any | null> {
  const { data, error } = await supabase.from('disputes').select('*').eq('orderId', orderId).maybeSingle();
  if (error) throw error;
  return data || null;
}

// ── Supplier Operations ────────────────────────────────────────────────────────

import { suppliers as seedSuppliers } from '../data/suppliers';

export async function getSuppliers(options?: { includeDemo?: boolean }): Promise<any[]> {
  let query = supabase.from('suppliers').select('*');
  const includeDemo = options?.includeDemo ?? (process.env.NODE_ENV !== 'production');
  if (!includeDemo) {
    query = query.eq('is_demo', false);
  }
  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) {
    // Auto-seed table if in dev or demo is requested
    if (includeDemo) {
      const { error: seedErr } = await supabase.from('suppliers').insert(seedSuppliers);
      if (!seedErr) return seedSuppliers;
    }
    return [];
  }
  return data;
}

export async function getSupplierBySlug(slug: string): Promise<any | null> {
  const { data, error } = await supabase.from('suppliers').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getSupplierById(id: string): Promise<any | null> {
  const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function saveSupplier(supplier: any): Promise<void> {
  const { error } = await supabase.from('suppliers').upsert([supplier]);
  if (error) throw error;
}

// ── Transaction Outcome Operations (Compounding Moat) ─────────────────────────

export async function saveOutcome(outcome: any): Promise<any> {
  const record = {
    ...outcome,
    id: outcome.id || `OUT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    recordedAt: outcome.recordedAt || new Date().toISOString(),
  };
  const { data, error } = await supabase.from('transaction_outcomes').upsert([record]).select().single();
  if (error) throw error;
  return data;
}

export async function getOutcomes(filter?: { rfqId?: string; supplierId?: string; stage?: string }): Promise<any[]> {
  let query = supabase.from('transaction_outcomes').select('*').order('recordedAt', { ascending: false });
  if (filter?.rfqId) query = query.eq('rfqId', filter.rfqId);
  if (filter?.supplierId) query = query.eq('supplierId', filter.supplierId);
  if (filter?.stage) query = query.eq('stage', filter.stage);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getOutcomeById(id: string): Promise<any | null> {
  const { data, error } = await supabase.from('transaction_outcomes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
}

// ── Deal Room Operations ───────────────────────────────────────────────────────

export async function saveDeal(deal: any): Promise<any> {
  const record = {
    id: deal.id || `DEAL-${Date.now()}-${crypto.randomInt(100, 999)}`,
    buyer_org_id: deal.buyer_org_id || deal.buyerOrgId || null,
    buyer_email: deal.buyer_email || deal.buyerEmail || null,
    supplier_id: deal.supplier_id || deal.supplierId || null,
    rfq_id: deal.rfq_id || deal.rfqId || null,
    status: deal.status || 'draft',
    terms: deal.terms || {},
    created_at: deal.created_at || deal.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('deals').upsert([record]);
  if (error) throw error;
  return record;
}

export async function getDealById(id: string): Promise<any | null> {
  const { data, error } = await supabase.from('deals').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getDeals(filter?: { buyerOrgId?: string; supplierId?: string; rfqId?: string }): Promise<any[]> {
  let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
  if (filter?.buyerOrgId) query = query.eq('buyer_org_id', filter.buyerOrgId);
  if (filter?.supplierId) query = query.eq('supplier_id', filter.supplierId);
  if (filter?.rfqId) query = query.eq('rfq_id', filter.rfqId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveDealEvent(event: any): Promise<any> {
  const record = {
    ...event,
    id: event.id || `EV-${Date.now()}-${crypto.randomInt(100, 999)}`,
    created_at: event.createdAt || new Date().toISOString(),
  };
  const { error } = await supabase.from('deal_events').insert([record]);
  if (error) throw error;
  return record;
}

export async function getDealEvents(dealId: string): Promise<any[]> {
  const { data, error } = await supabase.from('deal_events').select('*').eq('deal_id', dealId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Transaction Event Ledger (PostgreSQL Immutable Stream) ────────────────────

export async function appendTransactionEvent(event: any): Promise<{ event: any; isDuplicate: boolean }> {
  // 1. Check idempotency in PostgreSQL
  const { data: existing } = await supabase
    .from('transaction_events')
    .select('*')
    .eq('idempotency_key', event.idempotencyKey)
    .maybeSingle();

  if (existing) {
    return { event: existing, isDuplicate: true };
  }

  const record = {
    id: event.id || `TXEV-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
    order_id: event.orderId,
    deal_id: event.dealId || null,
    event_type: event.eventType,
    actor: event.actor,
    provider_event_id: event.providerEventId || null,
    idempotency_key: event.idempotencyKey,
    previous_state: event.previousState || null,
    new_state: event.newState || null,
    metadata: event.metadata || {},
    created_at: event.createdAt || new Date().toISOString(),
  };

  const { error } = await supabase.from('transaction_events').insert([record]);
  if (error) {
    // Catch unique constraint violation on race condition
    if (error.code === '23505') {
      const { data: raceExisting } = await supabase
        .from('transaction_events')
        .select('*')
        .eq('idempotency_key', event.idempotencyKey)
        .maybeSingle();
      return { event: raceExisting || record, isDuplicate: true };
    }
    throw error;
  }

  return { event: record, isDuplicate: false };
}

export async function getTransactionEventsByOrder(orderId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('transaction_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Platform Stats ─────────────────────────────────────────────────────────────

export async function getStats() {
  const [suppliersRes, rfqsRes, appsRes, usersRes, outcomesRes] = await Promise.all([
    supabase.from('suppliers').select('id, isVerified', { count: 'exact' }),
    supabase.from('rfqs').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
    supabase.from('transaction_outcomes').select('id', { count: 'exact', head: true }),
  ]);

  const suppliersList = suppliersRes.data || [];
  const verifiedCount = suppliersList.filter((s: any) => s.isVerified).length;

  return {
    totalSuppliers: suppliersRes.count ?? suppliersList.length,
    verifiedSuppliers: verifiedCount,
    totalRfqs: rfqsRes.count ?? 0,
    totalApplications: appsRes.count ?? 0,
    totalBuyers: usersRes.count ?? 0,
    totalOutcomes: outcomesRes.count ?? 0,
  };
}


