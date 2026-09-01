import { Supplier } from '@/types';
import { StructuredQuery, ConstraintResult } from './matchSchema';

/**
 * Hard Constraint Engine
 * Non-negotiable gating mechanism that executes BEFORE semantic ranking.
 * Strict Rule: High semantic similarity can NEVER override a hard constraint violation.
 */
export function evaluateHardConstraints(
  supplier: Supplier,
  query: StructuredQuery
): ConstraintResult {
  const violations: string[] = [];
  const passedConstraints: string[] = [];

  // 1. Mandatory Category Match
  const supplierCat = (supplier.category || '').toLowerCase().trim();
  const queryCat = (query.category || '').toLowerCase().trim();
  if (supplierCat !== queryCat) {
    violations.push(`Category mismatch: Supplier operates in "${supplier.category}", required "${query.category}"`);
  } else {
    passedConstraints.push(`Matches primary category "${supplier.category}"`);
  }

  // 2. Direct Manufacturer Requirement
  if (query.directManufacturerOnly) {
    const isDirect = supplier.sellerType === 'direct_manufacturer' || supplier.sellerType === 'contract_manufacturer';
    if (!isDirect) {
      violations.push(`Seller type rejection: Sourcing requires direct/contract manufacturer, supplier is "${supplier.sellerType || 'trader'}"`);
    } else {
      passedConstraints.push(`Confirmed direct manufacturer (${supplier.sellerType})`);
    }
  }

  // 3. Mandatory Certifications (Non-negotiable)
  if (query.mandatoryCertifications && query.mandatoryCertifications.length > 0) {
    const supplierCerts = (supplier.certifications || []).map(c => c.toLowerCase().trim());
    const missing = query.mandatoryCertifications.filter(
      reqCert => !supplierCerts.some(sc => sc.includes(reqCert.toLowerCase().trim()))
    );

    if (missing.length > 0) {
      violations.push(`Missing mandatory certification(s): ${missing.join(', ')}`);
    } else {
      passedConstraints.push(`Holds all mandatory certifications (${query.mandatoryCertifications.join(', ')})`);
    }
  }

  // 4. Maximum MOQ Barrier
  if (query.maxMoq && query.maxMoq > 0) {
    // Parse supplier MOQ string or number
    let supplierMoqNumber = 0;
    if (typeof supplier.moq === 'string') {
      const match = supplier.moq.match(/(\d[\d,]*)/);
      if (match) {
        supplierMoqNumber = parseInt(match[1].replace(/,/g, ''), 10);
      }
    }
    
    // Check structured products MOQ as well
    if (!supplierMoqNumber && supplier.structuredProducts && supplier.structuredProducts.length > 0) {
      supplierMoqNumber = supplier.structuredProducts[0].moq;
    }

    if (supplierMoqNumber > 0 && supplierMoqNumber > query.maxMoq) {
      violations.push(`MOQ incompatible: Supplier minimum order quantity is ${supplierMoqNumber}, exceeding buyer limit of ${query.maxMoq}`);
    } else if (supplierMoqNumber > 0) {
      passedConstraints.push(`MOQ compatible (${supplierMoqNumber} <= ${query.maxMoq})`);
    }
  }

  // 5. Verification Status Gate
  if (query.minVerificationTier) {
    const tierHierarchy = ['listed', 'business_verified', 'verified_supplier', 'premium_audited'];
    const requiredIdx = tierHierarchy.indexOf(query.minVerificationTier);
    const supplierIdx = tierHierarchy.indexOf(supplier.verificationTier);

    if (supplierIdx < requiredIdx) {
      violations.push(`Verification tier insufficient: Supplier is "${supplier.verificationTier}", minimum required is "${query.minVerificationTier}"`);
    } else {
      passedConstraints.push(`Meets verification tier requirement (${supplier.verificationTier} >= ${query.minVerificationTier})`);
    }
  }

  // 6. Geographic / Corridor Constraint
  if (query.preferredState && query.preferredState.toLowerCase() === 'gujarat') {
    const isGujarat = (supplier.location.state || '').toLowerCase() === 'gujarat';
    if (!isGujarat) {
      violations.push(`Corridor constraint: Located in ${supplier.location.state || 'outside corridor'}, outside priority Gujarat manufacturing corridor`);
    } else {
      passedConstraints.push(`Active facility in Gujarat manufacturing corridor (${supplier.location.city})`);
    }
  }

  const passed = violations.length === 0;

  return {
    passed,
    violations,
    passedConstraints,
    rejectionReason: passed ? undefined : violations[0],
  };
}
