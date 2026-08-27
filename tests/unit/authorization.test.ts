/**
 * tests/unit/authorization.test.ts
 * Comprehensive Authorization, RBAC & IDOR Security Test Suite.
 * Verifies object-level tenant isolation, role boundaries, and defense against cross-tenant leaks.
 */

import { checkResourceAccess, requireRole } from '@/lib/authorization';
import assert from 'assert';

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`, err);
    throw err;
  }
}

export function runAuthorizationTests() {
  console.log('\n--- Running Authorization & IDOR Security Test Suite ---');

  const buyerOrgA = 'org-buyer-alpha';
  const buyerOrgB = 'org-buyer-beta';
  const supplierOrgA = 'org-supplier-gamma';
  const supplierOrgB = 'org-supplier-delta';

  const userBuyerA = 'usr-buyer-001';
  const userBuyerB = 'usr-buyer-002';
  const userSupplierA = 'usr-supp-001';

  test('Scenario 1: Buyer Org A cannot access Buyer Org B RFQ (Cross-Buyer IDOR Defense)', () => {
    const allowed = checkResourceAccess(
      { userId: userBuyerA, orgId: buyerOrgA, role: 'buyer' },
      'rfq',
      'read',
      { orgId: buyerOrgB }
    );
    assert.strictEqual(allowed, false, 'Buyer Org A must NOT access Buyer Org B RFQ');
  });

  test('Scenario 2: Buyer Org A can access their own RFQ', () => {
    const allowed = checkResourceAccess(
      { userId: userBuyerA, orgId: buyerOrgA, role: 'buyer' },
      'rfq',
      'read',
      { orgId: buyerOrgA }
    );
    assert.strictEqual(allowed, true, 'Buyer Org A must access own RFQ');
  });

  test('Scenario 3: Supplier Org A cannot access Supplier Org B Purchase Order', () => {
    const allowed = checkResourceAccess(
      { userId: userSupplierA, orgId: supplierOrgA, role: 'supplier', targetOwnerId: supplierOrgA },
      'order',
      'read',
      { allowedSupplierIds: [supplierOrgB] }
    );
    assert.strictEqual(allowed, false, 'Supplier Org A must NOT access Supplier Org B order');
  });

  test('Scenario 4: Matched Supplier Org A CAN access Deal Room/Order assigned to them', () => {
    const allowed = checkResourceAccess(
      { userId: userSupplierA, orgId: supplierOrgA, role: 'supplier', targetOwnerId: supplierOrgA },
      'order',
      'read',
      { allowedSupplierIds: [supplierOrgA], allowedBuyerOrgIds: [buyerOrgA] }
    );
    assert.strictEqual(allowed, true, 'Assigned supplier must access matched order');
  });

  test('Scenario 5: Audit logs are restricted strictly to platform admins (Non-admins blocked)', () => {
    const buyerAttempt = checkResourceAccess(
      { userId: userBuyerA, orgId: buyerOrgA, role: 'buyer' },
      'audit_log',
      'read'
    );
    assert.strictEqual(buyerAttempt, false, 'Buyer must NOT access audit logs');

    const supplierAttempt = checkResourceAccess(
      { userId: userSupplierA, orgId: supplierOrgA, role: 'supplier_admin' },
      'audit_log',
      'read'
    );
    assert.strictEqual(supplierAttempt, false, 'Supplier Admin must NOT access audit logs');

    const adminAttempt = checkResourceAccess(
      { userId: 'admin-001', orgId: 'artha-internal', role: 'artha_admin' },
      'audit_log',
      'read'
    );
    assert.strictEqual(adminAttempt, true, 'Platform Admin must have access to audit logs');
  });

  test('Scenario 6: Public supplier profiles are readable by any authenticated entity', () => {
    const allowed = checkResourceAccess(
      { userId: userBuyerA, orgId: buyerOrgA, role: 'buyer' },
      'supplier_profile',
      'read'
    );
    assert.strictEqual(allowed, true, 'Supplier profiles must be publicly readable');
  });

  test('Scenario 7: Private entity documents are blocked from unauthorized third parties', () => {
    const allowed = checkResourceAccess(
      { userId: userBuyerA, orgId: buyerOrgA, role: 'buyer' },
      'document',
      'read',
      { orgId: supplierOrgB }
    );
    assert.strictEqual(allowed, false, 'Private documents of third parties must be denied');
  });

  test('Scenario 8: Role enforcement prevents privilege escalation', () => {
    assert.strictEqual(requireRole('buyer_member', ['buyer_admin']), false, 'buyer_member must not execute buyer_admin actions');
    assert.strictEqual(requireRole('supplier_member', ['supplier_admin']), false, 'supplier_member must not execute supplier_admin actions');
    assert.strictEqual(requireRole('artha_admin', ['buyer_admin', 'supplier_admin']), true, 'artha_admin must bypass operational checks');
  });

  console.log('--- All Authorization & IDOR Security Tests Passed Successfully ---\n');
}

if (typeof require !== 'undefined' && require.main === module) {
  runAuthorizationTests();
}
