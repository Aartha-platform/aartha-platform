/**
 * tests/unit/tradeStateMachine.test.ts
 * Comprehensive Unit Test Suite for Artha Trade Assurance State Machine.
 */

import { validateTransition, isTerminalState, getHumanReadableState } from '@/lib/tradeStateMachine';
import assert from 'assert';

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res && typeof (res as any).then === 'function') {
      return (res as any).then(() => console.log(`  ✓ PASS: ${name}`));
    }
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`, err);
    throw err;
  }
}

export function runStateMachineTests() {
  console.log('\n--- Running Trade Assurance State Machine Tests ---');

  // Valid transitions
  test('Valid: awaiting_payment -> payment_confirmed', () => {
    const res = validateTransition('awaiting_payment', 'payment_confirmed', 'system');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: payment_confirmed -> in_production', () => {
    const res = validateTransition('payment_confirmed', 'in_production', 'supplier');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: in_production -> shipped', () => {
    const res = validateTransition('in_production', 'shipped', 'supplier');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: shipped -> delivered', () => {
    const res = validateTransition('shipped', 'delivered', 'buyer');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: delivered -> inspection_period', () => {
    const res = validateTransition('delivered', 'inspection_period', 'buyer');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: inspection_period -> release_authorized', () => {
    const res = validateTransition('inspection_period', 'release_authorized', 'buyer');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: release_authorized -> settlement_initiated', () => {
    const res = validateTransition('release_authorized', 'settlement_initiated', 'system');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: settlement_initiated -> settled', () => {
    const res = validateTransition('settlement_initiated', 'settled', 'system');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: payment_confirmed -> disputed (buyer dispute)', () => {
    const res = validateTransition('payment_confirmed', 'disputed', 'buyer');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: disputed -> refunded (buyer wins)', () => {
    const res = validateTransition('disputed', 'refunded', 'admin');
    assert.strictEqual(res.allowed, true);
  });

  test('Valid: disputed -> release_authorized (supplier wins)', () => {
    const res = validateTransition('disputed', 'release_authorized', 'admin');
    assert.strictEqual(res.allowed, true);
  });

  // Adversarial transitions
  test('REJECT: awaiting_payment -> settled (direct fund release before payment)', () => {
    const res = validateTransition('awaiting_payment', 'settled', 'buyer');
    assert.strictEqual(res.allowed, false);
    assert.ok(res.reason?.includes('Illegal state transition'));
  });

  test('REJECT: awaiting_payment -> shipped (shipping unpaid order)', () => {
    const res = validateTransition('awaiting_payment', 'shipped', 'supplier');
    assert.strictEqual(res.allowed, false);
  });

  test('REJECT: settled -> refunded (terminal state violation)', () => {
    const res = validateTransition('settled', 'refunded', 'buyer');
    assert.strictEqual(res.allowed, false);
  });

  test('REJECT: refunded -> settled (terminal state violation)', () => {
    const res = validateTransition('refunded', 'settled', 'supplier');
    assert.strictEqual(res.allowed, false);
  });

  test('REJECT: cancelled -> in_production (cancelled order revival)', () => {
    const res = validateTransition('cancelled', 'in_production', 'supplier');
    assert.strictEqual(res.allowed, false);
  });

  // Role guardrails
  test('Supplier cannot trigger release_authorized or settled', () => {
    const res = validateTransition('inspection_period', 'release_authorized', 'supplier');
    assert.strictEqual(res.allowed, false);
    assert.ok(res.reason?.includes('Suppliers are unauthorized'));
  });

  test('Supplier cannot trigger refunded', () => {
    const res = validateTransition('payment_confirmed', 'refunded', 'supplier');
    assert.strictEqual(res.allowed, false);
  });

  test('Buyer cannot mark order as shipped', () => {
    const res = validateTransition('in_production', 'shipped', 'buyer');
    assert.strictEqual(res.allowed, false);
  });

  // Terminal state and human-readable label checks
  test('Identifies terminal states accurately', () => {
    assert.strictEqual(isTerminalState('settled'), true);
    assert.strictEqual(isTerminalState('released'), true);
    assert.strictEqual(isTerminalState('refunded'), true);
    assert.strictEqual(isTerminalState('cancelled'), true);
    assert.strictEqual(isTerminalState('awaiting_payment'), false);
    assert.strictEqual(isTerminalState('payment_confirmed'), false);
  });

  test('Returns accurate human-readable labels without custody claims', () => {
    assert.strictEqual(getHumanReadableState('payment_confirmed'), 'Payment Confirmed · Aartha Protect Active');
    assert.strictEqual(getHumanReadableState('disputed'), 'Settlement Blocked Under Dispute');
    assert.strictEqual(getHumanReadableState('release_authorized'), 'Release Authorized · Settlement Queued');
  });
}
