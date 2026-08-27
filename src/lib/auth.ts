/**
 * auth.ts
 * Session token creation and verification using HMAC-SHA256.
 * No external JWT library required.
 *
 * Session secret: set ARTHA_SESSION_SECRET in environment.
 * Fallback dev secret is used if not set (never use in production).
 */

import crypto from 'crypto';
import { saveSession, getSession, deleteSession, StoredSession, getSuppliers } from './storeAdapter';
import { suppliers as defaultSeedSuppliers } from '@/data/suppliers';
import { isBusinessEmail } from './validation';
import { createToken, verifyToken } from './token';

// ── Secret ─────────────────────────────────────────────────────────────────────

const SESSION_SECRET =
  process.env.ARTHA_SESSION_SECRET ||
  'dev-only-secret-change-before-production-do-not-use';

const ADMIN_SECRET =
  process.env.ARTHA_ADMIN_SECRET || 'Artha#SecOps$2026!MasterAdmin';

if (process.env.NODE_ENV === 'production' && !process.env.ARTHA_SESSION_SECRET) {
  throw new Error('[FATAL] ARTHA_SESSION_SECRET environment variable is not defined in production. Application aborted.');
}

if (process.env.NODE_ENV === 'production' && !process.env.ARTHA_ADMIN_SECRET) {
  throw new Error('[FATAL] ARTHA_ADMIN_SECRET environment variable is not defined in production. Application aborted.');
}

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours for general sessions
const ADMIN_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days for admin session

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// ── Session Creation ───────────────────────────────────────────────────────────

export async function createBuyerSession(email: string, orgId?: string): Promise<string | null> {
  if (!email || !isBusinessEmail(email)) return null;

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const domain = email.split('@')[1]?.toLowerCase().replace(/\./g, '-') || 'org';
  const computedOrgId = orgId || `org-buyer-${domain}`;

  const payload = {
    role: 'buyer' as const,
    userId: `buyer-${sessionId}`,
    orgId: computedOrgId,
    email,
    expiresAt,
  };

  const token = createToken(payload);

  const session: StoredSession = {
    token,
    ...payload,
  };

  await saveSession(session);
  return token;
}

export async function createSupplierSession(
  phone: string,
  gstin?: string,
  orgId?: string
): Promise<{ token: string; supplierId: string; supplierSlug: string; companyName: string; orgId: string } | null> {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanGstin = gstin ? gstin.trim().toLowerCase() : '';

  // Look up verified supplier from database store, falling back to seed data if empty
  let supplierList: any[] = [];
  try {
    const storeSuppliers = await getSuppliers({ includeDemo: true });
    if (storeSuppliers && storeSuppliers.length > 0) {
      supplierList = storeSuppliers;
    } else {
      supplierList = defaultSeedSuppliers;
    }
  } catch {
    supplierList = defaultSeedSuppliers;
  }

  const matched = supplierList.find(
    (s: any) =>
      s.isVerified &&
      ((cleanPhone && s.phone && s.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))) ||
        (cleanGstin && s.verificationDetails?.gstin && s.verificationDetails.gstin.toLowerCase() === cleanGstin))
  );

  if (!matched) return null;

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const computedOrgId = orgId || `org-supplier-${matched.id}`;

  const payload = {
    role: 'supplier' as const,
    userId: `supplier-${matched.id}`,
    orgId: computedOrgId,
    supplierId: matched.id,
    supplierSlug: matched.slug,
    companyName: matched.companyName,
    expiresAt,
  };

  const token = createToken(payload);

  const session: StoredSession = {
    token,
    ...payload,
  };

  await saveSession(session);
  return {
    token,
    supplierId: matched.id,
    supplierSlug: matched.slug,
    companyName: matched.companyName,
    orgId: computedOrgId,
  };
}

export async function createAdminSession(secret: string): Promise<string | null> {
  const cleanSecret = (secret || '').trim();
  const validSecret = process.env.ARTHA_ADMIN_SECRET || 'Artha#SecOps$2026!MasterAdmin';

  if (!safeCompare(cleanSecret, validSecret)) return null;

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS).toISOString();

  const payload = {
    role: 'admin' as const,
    userId: 'admin-0',
    orgId: 'org-artha-ops',
    expiresAt,
  };

  const token = createToken(payload);

  const session: StoredSession = {
    token,
    ...payload,
  };

  await saveSession(session);
  return token;
}

// ── Session Verification ───────────────────────────────────────────────────────

export async function verifySession(token: string): Promise<StoredSession | null> {
  const payload = verifyToken(token);
  if (!payload) return null;
  return await getSession(token);
}

export async function destroySession(token: string): Promise<void> {
  await deleteSession(token);
}
