/**
 * scripts/run_all_tests.ts
 * Unified test runner executing all Unit, Authorization, State Machine,
 * PaymentRail, Release Conditions, Reconciliation, and E2E procurement tests.
 */

import { runUnitTests } from '../tests/unit/scoring.test';
import { runAuthorizationTests } from '../tests/unit/authorization.test';
import { runStateMachineTests } from '../tests/unit/tradeStateMachine.test';
import { runPaymentRailTests } from '../tests/unit/paymentRail.test';
import { runReleaseConditionTests } from '../tests/unit/releaseConditions.test';
import { runReconciliationTests } from '../tests/unit/reconciliation.test';
import { runE2ETests } from '../tests/e2e/full_transaction.test';

async function main() {
  console.log('===============================================================');
  console.log('  ARTHA CORRIDOR — TRADE ASSURANCE & PAYMENT P0 TEST SUITE');
  console.log('===============================================================');

  try {
    runUnitTests();
    runAuthorizationTests();
    runStateMachineTests();
    await runPaymentRailTests();
    runReleaseConditionTests();
    await runReconciliationTests();
    runE2ETests();

    console.log('\n===============================================================');
    console.log('  ALL P0 FINANCIAL ORCHESTRATION & E2E TESTS PASSED (100%)');
    console.log('===============================================================');
  } catch (error) {
    console.error('\nTest execution failed:', error);
    process.exit(1);
  }
}

main();
