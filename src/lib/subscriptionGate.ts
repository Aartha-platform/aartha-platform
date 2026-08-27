import { WorkspaceUpgrade } from './workspaceUpgrade';

export type BuyerSubscriptionTier = 'free' | 'pro' | 'enterprise';

/**
 * Derives the active subscription tier based on the upgrade details.
 */
export function getSubscriptionTier(upgrade: WorkspaceUpgrade): BuyerSubscriptionTier {
  if (!upgrade.isPro) return 'free';
  const plan = (upgrade.planName || '').toLowerCase();
  if (plan.includes('enterprise')) {
    return 'enterprise';
  }
  return 'pro';
}

/**
 * Validates if the user can submit a new RFQ.
 * - Free: Limit of 3 submissions
 * - Pro/Enterprise: Unlimited submissions
 */
export function canSubmitRFQ(tier: BuyerSubscriptionTier, countThisMonth: number): boolean {
  if (tier === 'free') {
    return countThisMonth < 3;
  }
  return true;
}

/**
 * Validates how many suppliers the user can compare side-by-side.
 * - Free: Max 2 suppliers
 * - Pro: Max 5 suppliers
 * - Enterprise: Unlimited
 */
export function canCompareSuppliers(tier: BuyerSubscriptionTier, countRequested: number): boolean {
  if (tier === 'free') {
    return countRequested <= 2;
  }
  if (tier === 'pro') {
    return countRequested <= 5;
  }
  return true;
}

/**
 * Validates if the user can download full physical verification audit logs.
 * - Free: No
 * - Pro/Enterprise: Yes
 */
export function canDownloadAuditReport(tier: BuyerSubscriptionTier): boolean {
  return tier === 'pro' || tier === 'enterprise';
}

/**
 * Validates if the user can access dedicated sourcing desk support and mandi/port pricing indices.
 * - Enterprise: Yes
 * - Free/Pro: No
 */
export function canAccessPremiumSourcingDesk(tier: BuyerSubscriptionTier): boolean {
  return tier === 'enterprise';
}
