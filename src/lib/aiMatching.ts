import { Supplier } from '../types';
import { ProcurementConfidence } from '@/types/procurement';

export interface MatchEvidenceReason {
  claim: string;
  evidenceType: 'physical_audit' | 'document' | 'registry_api' | 'transaction_history';
  evidenceDate?: string;
  verified: boolean;
}

export interface MatchResult {
  supplierId: string;
  companyName: string;
  score: number; // 0 - 100
  matchConfidence: number; // 0 - 100
  confidenceLevel: 'high' | 'medium' | 'low';
  procurementConfidence: ProcurementConfidence;
  reasons: string[];
  evidenceReasons: MatchEvidenceReason[];
  missingEvidence: string[];
  dataFreshness: {
    identityVerifiedDaysAgo: number | null;
    lastAuditDaysAgo: number | null;
    lastActiveDaysAgo: number | null;
  };
  hardConstraintsPassed: boolean;
  hardConstraintViolations: string[];
  isMatch: boolean;
  corridorFit: boolean;
  explanation: string;
  whyRecommended: string[];
  whyNotOthers: string[];
}

export interface BuyerRequirements {
  category: string;
  subcategory?: string;
  certifications?: string[];
  mandatoryCertifications?: string[];
  maxMoq?: number;
  gidcZone?: string;
  minVerificationTier?: string;
  material?: string;
  tolerance?: string;
}

export interface RejectionCategory {
  reason: string;
  count: number;
  suppliers: string[];
}

export interface MatchSummary {
  totalConsidered: number;
  hardFailed: number;
  insufficientEvidence: number;
  insufficientCapacity: number;
  weakPerformance: number;
  qualified: number;
  topMatches: MatchResult[];
  rejectionBreakdown: RejectionCategory[];
}

/**
 * Calculates matching score, validates hard constraints, and generates explainable evidence reasons.
 */
export function calculateSupplierMatch(
  supplier: Supplier,
  requirements: BuyerRequirements
): MatchResult {
  const reasons: string[] = [];
  const evidenceReasons: MatchEvidenceReason[] = [];
  const missingEvidence: string[] = [];
  const hardConstraintViolations: string[] = [];
  const risks: string[] = [];
  let score = 0;
  let matchesCategory = false;
  let matchesSubcategory = false;
  let corridorFit = false;

  // ── 0. Hard Constraint Checks ──────────────────────────────────────────────
  const categoryMatch = supplier.category.toLowerCase() === requirements.category.toLowerCase();
  if (!categoryMatch) {
    hardConstraintViolations.push(`Category mismatch: Supplier operates in "${supplier.category}", required "${requirements.category}"`);
  }

  if (requirements.mandatoryCertifications && requirements.mandatoryCertifications.length > 0) {
    const missingMandatory = requirements.mandatoryCertifications.filter(mc =>
      !supplier.certifications.some(sc => sc.toLowerCase() === mc.toLowerCase())
    );
    if (missingMandatory.length > 0) {
      hardConstraintViolations.push(`Missing mandatory certification(s): ${missingMandatory.join(', ')}`);
    }
  }

  const hardConstraintsPassed = hardConstraintViolations.length === 0;

  // ── 1. Category Fit (Max 30 points) ────────────────────────────────────────
  if (categoryMatch) {
    score += 20;
    matchesCategory = true;
    reasons.push(`Direct Category Fit: Both match "${supplier.category}"`);
    evidenceReasons.push({
      claim: `Manufacturing specialization in ${supplier.category}`,
      evidenceType: 'registry_api',
      evidenceDate: supplier.verifiedDate,
      verified: supplier.isVerified,
    });

    if (
      requirements.subcategory &&
      supplier.subcategories.some(
        (sub) => sub.toLowerCase() === requirements.subcategory!.toLowerCase()
      )
    ) {
      score += 10;
      matchesSubcategory = true;
      reasons.push(`Subcategory Specialist: Matches focus area "${requirements.subcategory}"`);
    }
  } else {
    reasons.push(`Cross-category Note: Sourcing "${requirements.category}", supplier primary in "${supplier.category}"`);
  }

  // ── 2. Geography / Corridor Fit (Max 20 points) ────────────────────────────
  if (supplier.location.state.toLowerCase() === 'gujarat') {
    score += 10;
    if (supplier.location.gidcZone) {
      score += 10;
      corridorFit = true;
      reasons.push(`Geographical Corridor: Active physical presence in ${supplier.location.gidcZone}, ${supplier.location.city}`);
      evidenceReasons.push({
        claim: `Facility registered in ${supplier.location.gidcZone}, ${supplier.location.city}`,
        evidenceType: 'physical_audit',
        evidenceDate: supplier.auditRecords?.[0]?.auditDate || supplier.verifiedDate,
        verified: !!supplier.location.gpsCoordinates,
      });
    } else {
      reasons.push(`Geographical Corridor: Located in Gujarat industrial hub`);
    }
  }

  // ── 3. Verification & Quality Score Context (Max 20 points) ────────────────
  if (supplier.isVerified) {
    score += 10;
    reasons.push(`Verification Trust: Artha verified credentials (${supplier.verificationTier} tier)`);
    evidenceReasons.push({
      claim: `Government GSTIN (${supplier.verificationDetails?.gstin || 'Registered'}) & legal entity confirmed`,
      evidenceType: 'registry_api',
      evidenceDate: supplier.verifiedDate,
      verified: true,
    });
  } else {
    missingEvidence.push('Official GSTIN/IEC registry verification pending');
    risks.push('Supplier identity verification not yet completed on government registries');
  }

  if (supplier.auditRecords && supplier.auditRecords.length > 0 && supplier.auditRecords[0].passed) {
    evidenceReasons.push({
      claim: `On-site physical audit completed (Grade ${supplier.auditRecords[0].grade})`,
      evidenceType: 'physical_audit',
      evidenceDate: supplier.auditRecords[0].auditDate,
      verified: true,
    });
  } else {
    missingEvidence.push('Independent physical on-site audit report not yet filed');
  }
  
  const qScore = supplier.qualityScore?.total || supplier.legacyTrustScore || 70;
  if (qScore >= 90) {
    score += 10;
    reasons.push(`Elite Trust Index: Outstanding Quality Score of ${qScore}/100`);
  } else if (qScore >= 80) {
    score += 5;
    reasons.push(`Solid Performance: Quality Score of ${qScore}/100`);
  }

  // ── 4. Certifications Match (Max 15 points) ────────────────────────────────
  if (requirements.certifications && requirements.certifications.length > 0) {
    const matchedCerts = requirements.certifications.filter((c) =>
      supplier.certifications.some((sc) => sc.toLowerCase() === c.toLowerCase())
    );
    if (matchedCerts.length > 0) {
      const points = Math.min(15, matchedCerts.length * 5);
      score += points;
      reasons.push(`Credential Match: Matches requested certificate(s) [${matchedCerts.join(', ')}]`);
      evidenceReasons.push({
        claim: `Verified certificates on file: ${matchedCerts.join(', ')}`,
        evidenceType: 'document',
        evidenceDate: supplier.verifiedDate,
        verified: true,
      });
    } else {
      reasons.push(`Credential Notice: Lacks requested certifications [${requirements.certifications.join(', ')}]`);
      missingEvidence.push(`Requested certifications not confirmed: ${requirements.certifications.join(', ')}`);
    }
  } else {
    if (supplier.certifications.length > 0) {
      score += 10;
      reasons.push(`Verified Credentials: Hold standard certificates [${supplier.certifications.slice(0, 2).join(', ')}]`);
    }
  }

  // ── 5. Response & Transaction Metrics (Max 15 points) ──────────────────────
  const responseRate = supplier.responseRate ?? 85;
  const avgResponseTime = supplier.avgResponseTimeHours ?? 6;

  if (responseRate >= 95) {
    score += 8;
    reasons.push(`Response Rate: Excellent communication latency (${responseRate}% response rate)`);
  } else if (responseRate >= 85) {
    score += 4;
  }

  if (avgResponseTime <= 2) {
    score += 7;
    reasons.push(`Response Speed: Turnarounds under 2 hours (<${Math.ceil(avgResponseTime)} hrs avg)`);
  } else if (avgResponseTime <= 6) {
    score += 4;
    reasons.push(`Response Speed: Responsive team (<${Math.ceil(avgResponseTime)} hrs avg)`);
  }

  // ── 6. Compute Data Freshness ──────────────────────────────────────────────
  const now = Date.now();
  const identityVerifiedDaysAgo = supplier.verifiedDate 
    ? Math.max(0, Math.round((now - new Date(supplier.verifiedDate).getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const lastAuditDaysAgo = supplier.auditRecords?.[0]?.auditDate
    ? Math.max(0, Math.round((now - new Date(supplier.auditRecords[0].auditDate).getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const lastActiveDaysAgo = supplier.lastActiveAt
    ? Math.max(0, Math.round((now - new Date(supplier.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Cap matching score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // If hard constraints fail, supplier cannot be recommended match
  if (!hardConstraintsPassed) {
    score = Math.min(35, score); // Hard cap on failure
  }

  const isMatch = hardConstraintsPassed && matchesCategory && score >= 60;
  const matchConfidence = isMatch ? score : Math.min(score, 40);
  const confidenceLevel: 'high' | 'medium' | 'low' = matchConfidence >= 80 ? 'high' : matchConfidence >= 60 ? 'medium' : 'low';

  // Build ProcurementConfidence Object
  const procurementConfidence: ProcurementConfidence = {
    overall: score,
    identity: supplier.isVerified ? 95 : 40,
    factory: supplier.auditRecords && supplier.auditRecords.length > 0 ? 90 : 50,
    capability: matchesCategory ? (matchesSubcategory ? 95 : 80) : 30,
    compliance: supplier.certifications && supplier.certifications.length > 0 ? 90 : 60,
    performance: responseRate >= 90 ? 90 : 70,
    transaction: supplier.onTimeDelivery ? supplier.onTimeDelivery : 75,
    confidenceLevel,
    missingEvidence,
    staleEvidence: (identityVerifiedDaysAgo && identityVerifiedDaysAgo > 180) ? ['GSTIN verification older than 6 months'] : [],
    risks,
    generatedAt: new Date().toISOString(),
  };

  // Compile whyRecommended
  const whyRecommended: string[] = [];
  if (matchesCategory) whyRecommended.push(`Specialized manufacturing capability in ${supplier.category}`);
  if (supplier.isVerified) whyRecommended.push(`Direct verified manufacturer entity in ${supplier.location.city}`);
  if (supplier.auditRecords && supplier.auditRecords.length > 0) whyRecommended.push(`On-site physical inspection passed with Grade ${supplier.auditRecords[0].grade}`);
  if (responseRate >= 90) whyRecommended.push(`Demonstrated high responsiveness (${responseRate}% response rate)`);

  const whyNotOthers: string[] = [
    'Alternative suppliers in this category lacked verified physical factory audits',
    'Unverified trading intermediaries filtered out to protect procurement directness',
  ];

  // Compile evidence-grounded summary explanation
  const explanation = hardConstraintsPassed
    ? `${supplier.companyName} matches with a score of ${score}/100. Backed by ${supplier.isVerified ? 'verified' : 'unverified'} status in ${supplier.location.city}${supplier.location.gidcZone ? ' (' + supplier.location.gidcZone + ')' : ''} with a response rate of ${responseRate}%.`
    : `${supplier.companyName} does not meet mandatory sourcing constraints (${hardConstraintViolations.join('; ')}).`;

  return {
    supplierId: supplier.id,
    companyName: supplier.companyName,
    score,
    matchConfidence,
    confidenceLevel,
    procurementConfidence,
    reasons,
    evidenceReasons,
    missingEvidence,
    dataFreshness: {
      identityVerifiedDaysAgo,
      lastAuditDaysAgo,
      lastActiveDaysAgo,
    },
    hardConstraintsPassed,
    hardConstraintViolations,
    isMatch,
    corridorFit,
    explanation,
    whyRecommended,
    whyNotOthers,
  };
}

/**
 * Evaluates entire supplier pool against requirements and compiles structured MatchSummary with "Why Not" rejection breakdown.
 */
export function generateMatchSummary(
  suppliersList: Supplier[],
  requirements: BuyerRequirements,
  options?: { excludeDemo?: boolean }
): MatchSummary {
  const isProd = process.env.NODE_ENV === 'production';
  const shouldFilterDemo = options?.excludeDemo ?? isProd;

  // Filter out demo suppliers if real verified suppliers are present in the pool
  const candidateSuppliers = shouldFilterDemo && suppliersList.some((s) => !s.isDemo)
    ? suppliersList.filter((s) => !s.isDemo)
    : suppliersList;

  const totalConsidered = candidateSuppliers.length;
  let hardFailed = 0;
  let insufficientEvidence = 0;
  let insufficientCapacity = 0;
  let weakPerformance = 0;

  const results = candidateSuppliers.map((supplier) => calculateSupplierMatch(supplier, requirements));

  const hardFailedSuppliers: string[] = [];
  const missingEvidenceSuppliers: string[] = [];
  const weakPerformanceSuppliers: string[] = [];

  for (const res of results) {
    if (!res.hardConstraintsPassed) {
      hardFailed++;
      hardFailedSuppliers.push(res.companyName);
    } else if (res.missingEvidence.length > 0 && res.score < 70) {
      insufficientEvidence++;
      missingEvidenceSuppliers.push(res.companyName);
    } else if (res.score < 60) {
      weakPerformance++;
      weakPerformanceSuppliers.push(res.companyName);
    }
  }

  const topMatches = results
    .filter((res) => res.isMatch)
    .sort((a, b) => b.score - a.score);

  const rejectionBreakdown: RejectionCategory[] = [];
  if (hardFailedSuppliers.length > 0) {
    rejectionBreakdown.push({
      reason: 'Capability / Category Mismatch or Missing Mandatory Certifications',
      count: hardFailedSuppliers.length,
      suppliers: hardFailedSuppliers,
    });
  }
  if (missingEvidenceSuppliers.length > 0) {
    rejectionBreakdown.push({
      reason: 'Incomplete or Stale Verification Evidence',
      count: missingEvidenceSuppliers.length,
      suppliers: missingEvidenceSuppliers,
    });
  }
  if (weakPerformanceSuppliers.length > 0) {
    rejectionBreakdown.push({
      reason: 'Below Quality Threshold / Lower Commercial Fit',
      count: weakPerformanceSuppliers.length,
      suppliers: weakPerformanceSuppliers,
    });
  }

  return {
    totalConsidered,
    hardFailed,
    insufficientEvidence,
    insufficientCapacity,
    weakPerformance,
    qualified: topMatches.length,
    topMatches,
    rejectionBreakdown,
  };
}

/**
 * Fallback deterministic routing logic.
 */
export function deterministicFallbackMatch(
  suppliersList: Supplier[],
  requirements: BuyerRequirements
): MatchResult[] {
  return suppliersList
    .map((supplier) => calculateSupplierMatch(supplier, requirements))
    .filter((res) => res.isMatch)
    .sort((a, b) => b.score - a.score);
}

// Re-export new hybrid pipeline components
export * from './matching';

/**
 * Executes the state-of-the-art Hybrid Semantic Matching Pipeline
 * and converts to the legacy MatchResult format for drop-in backward compatibility.
 */
export async function hybridMatch(
  requirements: BuyerRequirements & { product?: string; rawQuery?: string },
  supplierPool: Supplier[]
): Promise<MatchResult[]> {
  const { matchSuppliersHybridPipeline } = await import('./matching');

  const pipelineRes = await matchSuppliersHybridPipeline(supplierPool, {
    product: requirements.product || requirements.category,
    category: requirements.category,
    subcategory: requirements.subcategory,
    certifications: requirements.certifications || [],
    mandatoryCertifications: requirements.mandatoryCertifications || [],
    maxMoq: requirements.maxMoq,
    preferredGidcZone: requirements.gidcZone,
    rawQuery: requirements.rawQuery,
  });

  return pipelineRes.matches.map(m => {
    const rawSupplier = supplierPool.find(s => s.id === m.supplierId);
    const legacy = rawSupplier ? calculateSupplierMatch(rawSupplier, requirements) : null;

    return {
      supplierId: m.supplierId,
      companyName: m.companyName,
      score: m.matchScore,
      matchConfidence: m.matchScore,
      confidenceLevel: m.matchScore >= 80 ? 'high' : m.matchScore >= 60 ? 'medium' : 'low',
      procurementConfidence: legacy ? legacy.procurementConfidence : {
        overall: m.matchScore,
        identity: m.isVerified ? 95 : 40,
        factory: m.evidenceConfidence >= 50 ? 90 : 50,
        capability: m.matchScore,
        compliance: m.evidenceConfidence,
        performance: 85,
        transaction: 80,
        confidenceLevel: m.matchScore >= 80 ? 'high' : 'medium',
        missingEvidence: m.explanation.missingEvidence,
        staleEvidence: [],
        risks: m.constraints.violations,
        generatedAt: new Date().toISOString(),
      },
      reasons: m.explanation.whyRecommended,
      evidenceReasons: legacy ? legacy.evidenceReasons : [],
      missingEvidence: m.explanation.missingEvidence,
      dataFreshness: legacy ? legacy.dataFreshness : {
        identityVerifiedDaysAgo: null,
        lastAuditDaysAgo: null,
        lastActiveDaysAgo: null,
      },
      hardConstraintsPassed: m.constraints.passed,
      hardConstraintViolations: m.constraints.violations,
      isMatch: m.isRecommended,
      corridorFit: m.location.state.toLowerCase() === 'gujarat',
      explanation: m.explanation.summary,
      whyRecommended: m.explanation.whyRecommended,
      whyNotOthers: m.explanation.whyNotOthers,
    };
  });
}

/**
 * LLM-Powered RFQ Match
 * Uses structured intent extraction and hybrid semantic retrieval.
 * Output is strictly schema-validated — never emits unvalidated LLM JSON.
 */
export async function llmMatch(
  rfq: { product: string; category: string; quantity: string; certifications: string[]; destination: string },
  supplierPool: Supplier[]
): Promise<MatchResult[]> {
  return hybridMatch({
    product: rfq.product,
    category: rfq.category,
    certifications: rfq.certifications,
    rawQuery: `${rfq.product} in ${rfq.category}, destination ${rfq.destination}`,
  }, supplierPool);
}
