/**
 * runtimeStore.ts
 * [INTERIM: Filesystem-backed in-process store]
 * Persists data to data/artha-store.json in the project root.
 * Swap the adapter in storeAdapter.ts to use Postgres/Supabase in production.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredRFQ {
  id: string;
  product: string;
  category: string;
  description?: string;
  quantity: string;
  unit: string;
  targetPrice?: string;
  specifications?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  status: 'pending' | 'routed' | 'quoted' | 'closed';
  submittedAt: string;
  whatsapp?: string;
  buyerVerificationTier?: string;
}

export interface StoredApplication {
  id: string;
  companyName: string;
  sellerType: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  gstin: string;
  iec?: string;
  category: string;
  subcategories: string[];
  certifications: string[];
  city: string;
  gidcZone?: string;
  fullAddress: string;
  preferredVisitDate?: string;
  status: 'pending' | 'scheduled' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface StoredEnquiry {
  id: string;
  supplierId?: string;
  supplierSlug?: string;
  productName: string;
  quantity: string;
  unit: string;
  targetPrice?: string;
  message: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  status: 'new' | 'viewed' | 'replied';
  submittedAt: string;
}

export interface StoredAuditEvent {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  actorRole?: string;
  actorId?: string;
}

export interface StoredSession {
  token: string;
  role: 'buyer' | 'supplier' | 'admin' | 'buyer_admin' | 'buyer_member' | 'supplier_admin' | 'supplier_member' | 'artha_operator' | 'artha_admin';
  userId: string;
  orgId?: string;
  orgRole?: string;
  supplierId?: string;
  supplierSlug?: string;
  email?: string;
  companyName?: string;
  expiresAt: string; // ISO string
}

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'buyer' | 'supplier';
  contactName: string;
  companyName: string;
  phone?: string;
  gstin?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface StoredOTP {
  email: string;
  otpHash: string;
  expiresAt: string;
  attempts: number;
}

import { TransactionOutcome } from '../types';

interface StoreShape {
  rfqs: StoredRFQ[];
  applications: StoredApplication[];
  enquiries: StoredEnquiry[];
  auditLog: StoredAuditEvent[];
  sessions: Record<string, StoredSession>;
  users: StoredUser[];
  otps: Record<string, StoredOTP>;
  orders: any[];
  disputes: any[];
  suppliers: any[];
  outcomes: TransactionOutcome[];
  deals?: any[];
  dealEvents?: any[];
}

// ── Filesystem Helpers ────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'artha-store.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): StoreShape {
  ensureDataDir();
  const defaultStore: StoreShape = {
    rfqs: [],
    applications: [],
    enquiries: [],
    auditLog: [],
    sessions: {},
    users: [],
    otps: {},
    orders: [],
    disputes: [],
    suppliers: [],
    outcomes: [],
  };
  if (!fs.existsSync(STORE_FILE)) {
    return defaultStore;
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultStore,
      ...parsed,
      users: parsed.users || [],
      otps: parsed.otps || {},
      orders: parsed.orders || [],
      disputes: parsed.disputes || [],
      outcomes: parsed.outcomes || [],
    };
  } catch {
    return defaultStore;
  }
}

function writeStore(data: StoreShape): void {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── ID Generation ─────────────────────────────────────────────────────────────

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

// ── RFQ Operations ────────────────────────────────────────────────────────────

export function saveRfq(rfq: Omit<StoredRFQ, 'id' | 'submittedAt' | 'status'>): StoredRFQ {
  const store = readStore();
  const record: StoredRFQ = {
    ...rfq,
    id: generateRfqId(),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  store.rfqs.unshift(record);
  writeStore(store);
  return record;
}

export function getRfqs(): StoredRFQ[] {
  return readStore().rfqs;
}

export function getRfqById(id: string): StoredRFQ | undefined {
  return readStore().rfqs.find(r => r.id === id);
}

// ── Application Operations ────────────────────────────────────────────────────

export function saveApplication(
  app: Omit<StoredApplication, 'id' | 'submittedAt' | 'status'>
): StoredApplication {
  const store = readStore();
  const record: StoredApplication = {
    ...app,
    id: generateAppId(),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  store.applications.unshift(record);
  writeStore(store);
  return record;
}

export function getApplications(): StoredApplication[] {
  return readStore().applications;
}

export function updateApplicationStatus(
  id: string,
  status: StoredApplication['status'],
  fields?: Partial<StoredApplication>
): StoredApplication | undefined {
  const store = readStore();
  const index = store.applications.findIndex(a => a.id === id);
  if (index === -1) return undefined;
  
  const record = {
    ...store.applications[index],
    status,
    ...fields,
  };
  store.applications[index] = record;
  writeStore(store);
  return record;
}

// ── Enquiry Operations ────────────────────────────────────────────────────────

export function saveEnquiry(
  enq: Omit<StoredEnquiry, 'id' | 'submittedAt' | 'status'>
): StoredEnquiry {
  const store = readStore();
  const record: StoredEnquiry = {
    ...enq,
    id: generateEnquiryId(),
    status: 'new',
    submittedAt: new Date().toISOString(),
  };
  store.enquiries.unshift(record);
  writeStore(store);
  return record;
}

export function getEnquiries(): StoredEnquiry[] {
  return readStore().enquiries;
}

// ── Audit Log Operations ──────────────────────────────────────────────────────

export function saveAuditEvent(
  event: Omit<StoredAuditEvent, 'id' | 'timestamp'>
): StoredAuditEvent {
  const store = readStore();
  const record: StoredAuditEvent = {
    ...event,
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
  };
  store.auditLog.unshift(record);
  // Keep last 500 events
  if (store.auditLog.length > 500) {
    store.auditLog = store.auditLog.slice(0, 500);
  }
  writeStore(store);
  return record;
}

export function getAuditLog(): StoredAuditEvent[] {
  return readStore().auditLog;
}

// ── Session Operations ────────────────────────────────────────────────────────

export function saveSession(session: StoredSession): void {
  const store = readStore();
  // Prune expired sessions
  const now = new Date();
  for (const token of Object.keys(store.sessions)) {
    if (new Date(store.sessions[token].expiresAt) < now) {
      delete store.sessions[token];
    }
  }
  store.sessions[session.token] = session;
  writeStore(store);
}

export function getSession(token: string): StoredSession | null {
  const store = readStore();
  const session = store.sessions[token];
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    // Expired — clean up
    delete store.sessions[token];
    writeStore(store);
    return null;
  }
  return session;
}

export function deleteSession(token: string): void {
  const store = readStore();
  delete store.sessions[token];
  writeStore(store);
}

// ── Password Hashing Helpers ──────────────────────────────────────────────────

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

// ── User Operations ───────────────────────────────────────────────────────────

export function saveUser(user: Omit<StoredUser, 'id' | 'createdAt'>): StoredUser {
  const store = readStore();
  const record: StoredUser = {
    ...user,
    id: `usr-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  store.users.push(record);
  writeStore(store);
  return record;
}

export function getUserByEmail(email: string): StoredUser | null {
  const store = readStore();
  return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function verifyUser(email: string): boolean {
  const store = readStore();
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  user.isVerified = true;
  writeStore(store);
  return true;
}

export function updateUserPassword(email: string, newPasswordHash: string): boolean {
  const store = readStore();
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  user.passwordHash = newPasswordHash;
  user.isVerified = true; // Password reset also implicitly confirms account ownership
  writeStore(store);
  return true;
}

// ── OTP Operations ────────────────────────────────────────────────────────────

export function saveOtp(identifier: string, otp: string, ttlMs: number = 120 * 1000): void {
  const store = readStore();
  const keyName = identifier.toLowerCase().trim();
  
  // Hash the OTP before storing it to protect against DB leaks
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = `${salt}:${crypto.scryptSync(otp, salt, 32).toString('hex')}`;
  
  store.otps[keyName] = {
    email: keyName,
    otpHash,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    attempts: 0,
  };
  writeStore(store);
}

export function verifyOtp(identifier: string, otp: string): { success: boolean; error?: string } {
  const store = readStore();
  const keyName = identifier.toLowerCase().trim();
  const record = store.otps[keyName];
  if (!record) return { success: false, error: 'No verification code found.' };
  
  if (new Date(record.expiresAt) < new Date()) {
    delete store.otps[keyName];
    writeStore(store);
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }
  
  if (record.attempts >= 3) {
    delete store.otps[keyName];
    writeStore(store);
    return { success: false, error: 'Too many failed verification attempts. Please request a new code.' };
  }
  
  const [salt, key] = record.otpHash.split(':');
  const computedHash = crypto.scryptSync(otp, salt, 32).toString('hex');
  const match = crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(computedHash, 'hex'));
  
  if (match) {
    delete store.otps[keyName];
    writeStore(store);
    return { success: true };
  } else {
    record.attempts += 1;
    writeStore(store);
    return { success: false, error: `Invalid verification code. ${3 - record.attempts} attempts remaining.` };
  }
}

export function deleteOtp(identifier: string): void {
  const store = readStore();
  const keyName = identifier.toLowerCase().trim();
  delete store.otps[keyName];
  writeStore(store);
}

// ── Order & Aartha Protect Operations ──────────────────────────────────────────────────

export function saveOrder(order: any): void {
  const store = readStore();
  const index = store.orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    store.orders[index] = order;
  } else {
    store.orders.unshift(order);
  }
  writeStore(store);
}

export function getOrderById(id: string): any | null {
  const store = readStore();
  return store.orders.find((o) => o.id === id) || null;
}

export function getOrdersByBuyer(email: string): any[] {
  const store = readStore();
  return store.orders.filter((o) => o.buyerEmail.toLowerCase() === email.toLowerCase());
}

export function getOrdersBySupplier(supplierId: string): any[] {
  const store = readStore();
  return store.orders.filter((o) => o.supplierId === supplierId);
}

export function saveDispute(dispute: any): void {
  const store = readStore();
  const index = store.disputes.findIndex((d) => d.id === dispute.id);
  if (index >= 0) {
    store.disputes[index] = dispute;
  } else {
    store.disputes.unshift(dispute);
  }
  writeStore(store);
}

export function getDisputeByOrderId(orderId: string): any | null {
  const store = readStore();
  return store.disputes.find((d) => d.orderId === orderId) || null;
}

// ── Supplier Operations ────────────────────────────────────────────────────────

import { suppliers as seedSuppliers } from '../data/suppliers';

export function getSuppliers(options?: { includeDemo?: boolean }): any[] {
  const store = readStore();
  if (!store.suppliers || store.suppliers.length === 0) {
    store.suppliers = [...seedSuppliers];
    writeStore(store);
  }
  const includeDemo = options?.includeDemo ?? (process.env.NODE_ENV !== 'production');
  if (!includeDemo) {
    return store.suppliers.filter((s: any) => !s.isDemo);
  }
  return store.suppliers;
}

export function getSupplierBySlug(slug: string): any | null {
  const list = getSuppliers();
  return list.find((s) => s.slug === slug) || null;
}

export function getSupplierById(id: string): any | null {
  const list = getSuppliers();
  return list.find((s) => s.id === id) || null;
}

export function saveSupplier(supplier: any): void {
  const store = readStore();
  if (!store.suppliers) store.suppliers = [...seedSuppliers];
  const idx = store.suppliers.findIndex((s) => s.id === supplier.id || s.slug === supplier.slug);
  if (idx >= 0) {
    store.suppliers[idx] = supplier;
  } else {
    store.suppliers.unshift(supplier);
  }
  writeStore(store);
}

// ── Transaction Outcome Operations (Compounding Moat) ─────────────────────────

export function saveOutcome(outcome: Omit<TransactionOutcome, 'id' | 'recordedAt'> & { id?: string; recordedAt?: string }): TransactionOutcome {
  const store = readStore();
  const record: TransactionOutcome = {
    ...outcome,
    id: outcome.id || `OUT-${Date.now()}-${crypto.randomInt(100, 999)}`,
    recordedAt: outcome.recordedAt || new Date().toISOString(),
  };

  const existingIdx = store.outcomes.findIndex(o => o.id === record.id);
  if (existingIdx >= 0) {
    store.outcomes[existingIdx] = record;
  } else {
    store.outcomes.unshift(record);
  }

  writeStore(store);
  return record;
}

export function getOutcomes(filter?: { rfqId?: string; supplierId?: string; stage?: string }): TransactionOutcome[] {
  const store = readStore();
  let list = store.outcomes || [];
  if (filter?.rfqId) list = list.filter(o => o.rfqId === filter.rfqId);
  if (filter?.supplierId) list = list.filter(o => o.supplierId === filter.supplierId);
  if (filter?.stage) list = list.filter(o => o.stage === filter.stage);
  return list;
}

export function getOutcomeById(id: string): TransactionOutcome | null {
  const store = readStore();
  return store.outcomes.find(o => o.id === id) || null;
}

// ── Deal Room Operations ───────────────────────────────────────────────────────

export function saveDeal(deal: any): any {
  const store = readStore();
  if (!store.deals) store.deals = [];
  const record = {
    ...deal,
    id: deal.id || `DEAL-${Date.now()}-${crypto.randomInt(100, 999)}`,
    createdAt: deal.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = store.deals.findIndex((d: any) => d.id === record.id);
  if (existingIdx >= 0) {
    store.deals[existingIdx] = record;
  } else {
    store.deals.unshift(record);
  }

  writeStore(store);
  return record;
}

export function getDealById(id: string): any | null {
  const store = readStore();
  if (!store.deals) return null;
  return store.deals.find((d: any) => d.id === id) || null;
}

export function getDeals(filter?: { buyerOrgId?: string; supplierId?: string; rfqId?: string }): any[] {
  const store = readStore();
  let list = store.deals || [];
  if (filter?.buyerOrgId) list = list.filter((d: any) => d.buyerOrgId === filter.buyerOrgId);
  if (filter?.supplierId) list = list.filter((d: any) => d.supplierId === filter.supplierId);
  if (filter?.rfqId) list = list.filter((d: any) => d.rfqId === filter.rfqId);
  return list;
}

export function saveDealEvent(event: any): any {
  const store = readStore();
  if (!store.dealEvents) store.dealEvents = [];
  const record = {
    ...event,
    id: event.id || `EV-${Date.now()}-${crypto.randomInt(100, 999)}`,
    createdAt: event.createdAt || new Date().toISOString(),
  };
  store.dealEvents.unshift(record);
  writeStore(store);
  return record;
}

export function getDealEvents(dealId: string): any[] {
  const store = readStore();
  if (!store.dealEvents) return [];
  return store.dealEvents.filter((e: any) => e.dealId === dealId);
}

// ── Platform Stats ─────────────────────────────────────────────────────────────

export function getStats() {
  const store = readStore();
  const suppliersList = getSuppliers();
  const verifiedCount = suppliersList.filter((s) => s.isVerified).length;
  const buyerUsers = store.users.filter((u) => u.role === 'buyer').length;

  return {
    totalSuppliers: suppliersList.length,
    verifiedSuppliers: verifiedCount,
    totalRfqs: store.rfqs.length,
    totalApplications: store.applications.length,
    totalBuyers: buyerUsers,
    totalOutcomes: (store.outcomes || []).length,
  };
}


