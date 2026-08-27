/**
 * rfqRequirement.ts
 * RFQ Requirement Data Model & State Machine Types.
 */

export type RFQStatus =
  | 'draft'
  | 'submitted'
  | 'needs_clarification'
  | 'qualified'
  | 'matching'
  | 'matched'
  | 'closed'
  | 'cancelled';

export type RequirementSource =
  | 'user_provided'
  | 'extracted'
  | 'confirmed'
  | 'uncertain';

export interface StructuredRequirementItem {
  key: string;
  value: string;
  source: RequirementSource;
  confidence: number; // 0 - 100
}

export interface RFQRequirement {
  id: string;
  buyerOrgId?: string;
  buyerUserId: string;
  status: RFQStatus;
  productName: string;
  category: string;
  freeTextRequirement: string;
  material?: string;
  dimensions?: string;
  tolerance?: string;
  quantity: string;
  annualVolume?: string;
  moq?: string;
  sampleQuantity?: string;
  requiredCertifications: string[];
  requiredProcess?: string;
  qualityStandard?: string;
  packaging?: string;
  destination: string;
  incoterm: string;
  targetDelivery?: string;
  targetPrice?: string;
  currency: string;
  drawings: string[];
  structuredRequirements: StructuredRequirementItem[];
  clarificationQuestions?: string[];
  clarificationAnswers?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface RFQQualificationResult {
  qualified: boolean;
  status: RFQStatus;
  clarificationQuestions: string[];
  extractedRequirements: StructuredRequirementItem[];
  missingMandatoryFields: string[];
}
