/**
 * rfqQualification.ts
 * RFQ Qualification Engine & State Transition Machine.
 * Validates requirements, checks clarity, and extracts structured procurement facts.
 */

import { RFQRequirement, RFQQualificationResult, StructuredRequirementItem, RFQStatus } from '@/types/rfqRequirement';

export function qualifyRFQ(rfq: Partial<RFQRequirement>): RFQQualificationResult {
  const clarificationQuestions: string[] = [];
  const missingMandatoryFields: string[] = [];
  const extractedRequirements: StructuredRequirementItem[] = [];

  // 1. Mandatory Baseline Validations
  if (!rfq.productName || rfq.productName.trim().length < 2) {
    missingMandatoryFields.push('Product Name');
  } else {
    extractedRequirements.push({
      key: 'product_name',
      value: rfq.productName.trim(),
      source: 'user_provided',
      confidence: 100,
    });
  }

  if (!rfq.category || rfq.category.trim().length < 2) {
    missingMandatoryFields.push('Category');
  }

  if (!rfq.quantity || rfq.quantity.trim().length === 0) {
    missingMandatoryFields.push('Order Quantity');
  } else {
    extractedRequirements.push({
      key: 'quantity',
      value: rfq.quantity.trim(),
      source: 'user_provided',
      confidence: 100,
    });
  }

  if (!rfq.destination || rfq.destination.trim().length < 2) {
    missingMandatoryFields.push('Destination Country / Port');
  }

  // 2. Precision & Manufacturing Clarification Checks
  const category = (rfq.category || '').toLowerCase();
  const rawText = (rfq.freeTextRequirement || '').toLowerCase();

  // Engineering / CNC / Machining specifics
  if (category.includes('machin') || category.includes('engineer') || category.includes('metal')) {
    if (!rfq.material && !rawText.includes('steel') && !rawText.includes('aluminum') && !rawText.includes('brass')) {
      clarificationQuestions.push('What specific material grade or alloy is required (e.g. SS316L, AL6061, Brass IS 319)?');
    }
    if (!rfq.tolerance && !rawText.includes('tolerance') && !rawText.includes('±') && !rawText.includes('mm')) {
      clarificationQuestions.push('Are tight dimensional tolerances required (e.g. ±0.02mm) across all features or only critical datums?');
    }
  }

  // Pharma / Chemical specifics
  if (category.includes('pharma') || category.includes('chemical')) {
    if (!rfq.requiredCertifications || rfq.requiredCertifications.length === 0) {
      clarificationQuestions.push('Is WHO-GMP, US FDA, or REACH compliance mandatory for this batch?');
    }
  }

  // Textile specifics
  if (category.includes('textile') || category.includes('apparel')) {
    if (!rfq.requiredCertifications || rfq.requiredCertifications.length === 0) {
      clarificationQuestions.push('Is GOTS (organic) or OEKO-TEX standard 100 certification required?');
    }
  }

  const isQualified = missingMandatoryFields.length === 0 && clarificationQuestions.length === 0;
  const status: RFQStatus = missingMandatoryFields.length > 0
    ? 'submitted'
    : clarificationQuestions.length > 0
    ? 'needs_clarification'
    : 'qualified';

  return {
    qualified: isQualified,
    status,
    clarificationQuestions,
    extractedRequirements,
    missingMandatoryFields,
  };
}
