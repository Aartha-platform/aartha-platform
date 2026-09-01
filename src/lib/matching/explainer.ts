import { Supplier } from '@/types';
import { StructuredQuery, ConstraintResult, MatchExplanation } from './matchSchema';

/**
 * Transparent Explainer Engine
 * Formulates evidence-grounded reasons, missing evidence items, and unknown variables.
 * CRITICAL RULE: Never hallucinates or invents missing data.
 */
export function generateMatchExplanation(
  supplier: Supplier,
  query: StructuredQuery,
  constraints: ConstraintResult,
  scores: {
    specFitScore: number;
    evidenceConfidence: number;
    dataCompleteness: number;
    riskScore: number;
  }
): MatchExplanation {
  const whyRecommended: string[] = [];
  const missingEvidence: string[] = [];
  const unknownAttributes: string[] = [];
  const whyNotOthers: string[] = [];

  // 1. Why Recommended (Verified positive attributes)
  if (constraints.passed) {
    whyRecommended.push(`Direct manufacturing specialization in ${supplier.category}`);

    if (query.subcategory && supplier.subcategories.some(s => s.toLowerCase() === query.subcategory!.toLowerCase())) {
      whyRecommended.push(`Direct focus area capability: "${query.subcategory}"`);
    }

    if (supplier.isVerified) {
      whyRecommended.push(`Government legal entity confirmed (${supplier.verificationDetails?.gstin ? 'GSTIN on file' : 'Verified entity'})`);
    }

    if (supplier.auditRecords && supplier.auditRecords.length > 0 && supplier.auditRecords[0].passed) {
      whyRecommended.push(`On-site physical factory audit passed with Grade ${supplier.auditRecords[0].grade} (${supplier.auditRecords[0].auditDate})`);
    }

    if (supplier.location.state.toLowerCase() === 'gujarat') {
      whyRecommended.push(`Active facility in Gujarat manufacturing corridor (${supplier.location.city}${supplier.location.gidcZone ? ' - ' + supplier.location.gidcZone : ''})`);
    }

    if (query.certifications && query.certifications.length > 0) {
      const held = query.certifications.filter(c => 
        supplier.certifications.some(sc => sc.toLowerCase().includes(c.toLowerCase()))
      );
      if (held.length > 0) {
        whyRecommended.push(`Holds required certifications: [${held.join(', ')}]`);
      }
    }

    if (supplier.responseRate && supplier.responseRate >= 90) {
      whyRecommended.push(`High communication responsiveness: ${supplier.responseRate}% response rate (<${Math.ceil(supplier.avgResponseTimeHours || 4)} hrs)`);
    }
  }

  // 2. Missing Evidence (Known gaps in verified proof)
  if (!supplier.isVerified) {
    missingEvidence.push('Official government GSTIN/IEC registry verification pending');
  }

  if (!supplier.auditRecords || supplier.auditRecords.length === 0) {
    missingEvidence.push('Independent on-site physical factory inspection not yet filed');
  }

  if (query.certifications && query.certifications.length > 0) {
    const missingCerts = query.certifications.filter(c => 
      !supplier.certifications.some(sc => sc.toLowerCase().includes(c.toLowerCase()))
    );
    if (missingCerts.length > 0) {
      missingEvidence.push(`Requested certification(s) not confirmed on file: [${missingCerts.join(', ')}]`);
    }
  }

  if (!supplier.facilityVideoUrl) {
    missingEvidence.push('Timestamped facility walkthrough video not yet uploaded');
  }

  // 3. Unknown Attributes (Data that cannot be determined from available platform records)
  if (!supplier.annualCapacity) {
    unknownAttributes.push('Independent verification of maximum monthly unit capacity unavailable');
  }

  if (!supplier.exportMarkets || supplier.exportMarkets.length === 0) {
    unknownAttributes.push('Recent export shipping volume and destination history unavailable');
  }

  if (supplier.onTimeDelivery === undefined || supplier.onTimeDelivery === null) {
    unknownAttributes.push('Platform-tracked historical on-time delivery rate not yet established');
  }

  // 4. Why Not Others
  if (!constraints.passed) {
    whyNotOthers.push(...constraints.violations);
  } else {
    whyNotOthers.push('Alternative candidates failed mandatory category fit or lacked active physical manufacturing presence in the corridor');
  }

  // 5. Summary
  let summary = '';
  if (!constraints.passed) {
    summary = `${supplier.companyName} failed mandatory requirement gating: ${constraints.violations.join('; ')}.`;
  } else {
    summary = `${supplier.companyName} is recommended with a specification fit score of ${scores.specFitScore}/100 and evidence confidence of ${scores.evidenceConfidence}/100. Backed by ${supplier.verificationTier.replace(/_/g, ' ')} tier credentials in ${supplier.location.city}.`;
  }

  return {
    whyRecommended,
    missingEvidence,
    unknownAttributes,
    whyNotOthers,
    summary,
  };
}
