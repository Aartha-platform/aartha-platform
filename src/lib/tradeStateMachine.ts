/**
 * tradeStateMachine.ts
 * Deterministic Financial State Machine for Aartha Protect.
 * 
 * CORE PRINCIPLE:
 * No financial state transition may occur ad-hoc or implicitly.
 * Every state change MUST pass through validateTransition().
 * 
 * Key Distinctions:
 * 1. "payment_confirmed" (Provider captured funds) != "Aartha holds funds"
 * 2. "release_authorized" (Inspection window satisfied) != "settled" (Funds transferred to supplier)
 */

export type TradeState =
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'funds_secured'        // Backwards-compatible alias for payment_confirmed
  | 'payment_failed'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'inspection_period'
  | 'release_authorized'
  | 'settlement_initiated'
  | 'settled'
  | 'released'             // Backwards-compatible alias for settled
  | 'settlement_failed'
  | 'disputed'
  | 'partial_release'
  | 'refunded'
  | 'cancelled';

/**
 * Transition Table: Maps current state to all valid target states.
 * Any transition not explicitly listed is strictly rejected.
 */
const VALID_TRANSITIONS: Record<TradeState, TradeState[]> = {
  awaiting_payment: [
    'payment_confirmed',
    'funds_secured',
    'payment_failed',
    'cancelled',
  ],

  payment_confirmed: [
    'in_production',
    'shipped',
    'disputed',
    'refunded',
    'cancelled',
  ],

  funds_secured: [
    'in_production',
    'shipped',
    'disputed',
    'refunded',
    'cancelled',
  ],

  payment_failed: [
    'awaiting_payment',
    'cancelled',
  ],

  in_production: [
    'shipped',
    'disputed',
    'cancelled',
  ],

  shipped: [
    'delivered',
    'disputed',
  ],

  delivered: [
    'inspection_period',
    'disputed',
  ],

  inspection_period: [
    'release_authorized',
    'released',
    'settled',
    'disputed',
  ],

  release_authorized: [
    'settlement_initiated',
    'settled',
    'released',
    'disputed',
  ],

  settlement_initiated: [
    'settled',
    'released',
    'settlement_failed',
  ],

  settlement_failed: [
    'settlement_initiated',
    'release_authorized',
    'disputed',
  ],

  disputed: [
    'release_authorized',
    'settled',
    'released',
    'refunded',
    'partial_release',
  ],

  // Terminal states (no transitions allowed out)
  settled: [],
  released: [],
  partial_release: [],
  refunded: [],
  cancelled: [],
};

export interface TransitionValidationResult {
  allowed: boolean;
  reason?: string;
  normalizedState?: TradeState;
}

/**
 * Validates if moving from currentState to targetState is contractually and financially legal.
 */
export function validateTransition(
  currentState: TradeState | string,
  targetState: TradeState | string,
  actorRole?: string
): TransitionValidationResult {
  const current = currentState as TradeState;
  const target = targetState as TradeState;

  if (!VALID_TRANSITIONS[current]) {
    return {
      allowed: false,
      reason: `Unknown or unmanaged initial state: "${currentState}"`,
    };
  }

  const validTargets = VALID_TRANSITIONS[current];
  if (!validTargets.includes(target)) {
    return {
      allowed: false,
      reason: `Illegal state transition: Cannot move from "${currentState}" to "${targetState}". Allowed next states: [${validTargets.join(', ')}]`,
    };
  }

  // Role-based transition guardrails
  if (actorRole === 'supplier') {
    const supplierForbiddenTargets: TradeState[] = [
      'refunded',
      'release_authorized',
      'settled',
      'released',
      'cancelled',
    ];
    if (supplierForbiddenTargets.includes(target)) {
      return {
        allowed: false,
        reason: `Suppliers are unauthorized to trigger "${targetState}".`,
      };
    }
  }

  if (actorRole === 'buyer') {
    const buyerForbiddenTargets: TradeState[] = [
      'in_production',
      'shipped',
      'settlement_initiated',
      'settled',
    ];
    if (buyerForbiddenTargets.includes(target)) {
      return {
        allowed: false,
        reason: `Buyers are unauthorized to trigger "${targetState}".`,
      };
    }
  }

  return {
    allowed: true,
    normalizedState: target,
  };
}

/**
 * Returns true if the state is terminal (no further transitions permitted).
 */
export function isTerminalState(state: TradeState | string): boolean {
  const s = state as TradeState;
  return Array.isArray(VALID_TRANSITIONS[s]) && VALID_TRANSITIONS[s].length === 0;
}

/**
 * Returns user-facing label for each internal state to prevent misleading custody perceptions.
 */
export function getHumanReadableState(state: TradeState | string): string {
  switch (state) {
    case 'awaiting_payment':
      return 'Awaiting Buyer Payment';
    case 'payment_confirmed':
    case 'funds_secured':
      return 'Payment Confirmed · Aartha Protect Active';
    case 'payment_failed':
      return 'Payment Failed';
    case 'in_production':
      return 'In Production';
    case 'shipped':
      return 'Dispatched / In Transit';
    case 'delivered':
      return 'Delivered';
    case 'inspection_period':
      return 'Quality Inspection Window Active';
    case 'release_authorized':
      return 'Release Authorized · Settlement Queued';
    case 'settlement_initiated':
      return 'Settlement in Progress';
    case 'settled':
    case 'released':
      return 'Trade Completed · Supplier Settled';
    case 'settlement_failed':
      return 'Settlement Issue · Under Review';
    case 'disputed':
      return 'Settlement Blocked Under Dispute';
    case 'partial_release':
      return 'Resolved (Split Settlement)';
    case 'refunded':
      return 'Payment Refunded';
    case 'cancelled':
      return 'Order Cancelled';
    default:
      return String(state).replace(/_/g, ' ').toUpperCase();
  }
}
