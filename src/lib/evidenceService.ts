/**
 * evidenceService.ts
 * Evidence Management, Verification Provenance & Field-Specific Freshness Engine.
 */

import { Evidence, EvidenceType, EvidenceStatus, EvidenceSummary } from '@/types/evidence';

// Field-specific freshness validity windows in days
const FRESHNESS_WINDOWS_DAYS: Record<string, number> = {
  gst_registry: 30, // GST registry should be refreshed monthly
  bank_kyc: 180, // Bank penny drop valid for 6 months
  physical_audit: 365, // On-site factory audit cycle 1 year
  certification: 365, // Rely on actual certificate expiry
  machinery_capacity: 90, // Capacity verification valid for 90 days
  transaction_outcome: 730, // Transaction outcomes valid for 2 years
};

export function calculateEvidenceFreshness(evidence: Evidence): {
  daysElapsed: number;
  isStale: boolean;
  freshnessMultiplier: number;
} {
  const now = Date.now();
  const capturedTimestamp = new Date(evidence.capturedAt).getTime();
  const daysElapsed = Math.max(0, Math.round((now - capturedTimestamp) / (1000 * 60 * 60 * 24)));

  const maxValidDays = FRESHNESS_WINDOWS_DAYS[evidence.source] || 180;
  const isStale = daysElapsed > maxValidDays;

  let freshnessMultiplier = 1.0;
  if (daysElapsed > maxValidDays * 1.5) {
    freshnessMultiplier = 0.65; // Severe decay
  } else if (daysElapsed > maxValidDays) {
    freshnessMultiplier = 0.85; // Moderate decay
  } else if (daysElapsed > maxValidDays * 0.5) {
    freshnessMultiplier = 0.95; // Slight decay
  }

  return {
    daysElapsed,
    isStale,
    freshnessMultiplier,
  };
}

export function compileEvidenceSummary(evidenceList: Evidence[]): EvidenceSummary {
  let verifiedClaims = 0;
  let expiredClaims = 0;
  let pendingClaims = 0;
  let totalDays = 0;
  const criticalMissing: string[] = [];

  for (const ev of evidenceList) {
    if (ev.status === 'verified') verifiedClaims++;
    else if (ev.status === 'expired') expiredClaims++;
    else pendingClaims++;

    const { daysElapsed } = calculateEvidenceFreshness(ev);
    totalDays += daysElapsed;
  }

  const avgFreshnessDays = evidenceList.length > 0 ? Math.round(totalDays / evidenceList.length) : 0;

  // Check critical requirements
  const hasGstin = evidenceList.some((e) => e.claim.toLowerCase().includes('gst') && e.status === 'verified');
  if (!hasGstin) criticalMissing.push('Verified Government GSTIN Registration');

  const hasPhysical = evidenceList.some((e) => e.evidenceType === 'physical_audit' && e.status === 'verified');
  if (!hasPhysical) criticalMissing.push('Independent Physical Factory On-Site Audit');

  return {
    totalClaims: evidenceList.length,
    verifiedClaims,
    expiredClaims,
    pendingClaims,
    evidenceFreshnessDays: avgFreshnessDays,
    criticalMissingEvidence: criticalMissing,
  };
}
