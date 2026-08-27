/**
 * deal.ts
 * Deal Room Data Model & Snapshot Types.
 * Preserves evidence, requirement, and commercial terms frozen at transaction milestones.
 */

export type DealStatus =
  | 'qualification'
  | 'matching'
  | 'supplier_contacted'
  | 'sample'
  | 'negotiation'
  | 'ordered'
  | 'production'
  | 'inspection'
  | 'shipping'
  | 'delivered'
  | 'disputed'
  | 'closed'
  | 'lost';

export interface DealRequirementSnapshot {
  productName: string;
  category: string;
  specification?: string;
  quantity: string;
  targetPrice?: string;
  currency: string;
  destination: string;
  incoterm?: string;
  requiredCertifications?: string[];
  drawings?: string[];
}

export interface DealEvidenceSnapshot {
  supplierQualityScore: number;
  verificationTier: string;
  gstinVerified: boolean;
  physicalAuditPassed: boolean;
  auditGrade?: string;
  certificationsVerified: string[];
  evidenceTimestamp: string;
}

export interface DealCommercialSnapshot {
  quotePrice?: number;
  currency?: string;
  moq?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
  platformFeePercent?: number;
}

export interface Deal {
  id: string;
  buyerOrgId: string;
  buyerEmail: string;
  buyerCompanyName?: string;
  supplierId: string;
  supplierSlug: string;
  supplierCompanyName: string;
  rfqId: string;
  quoteId?: string;
  orderId?: string;
  status: DealStatus;
  requirementsSnapshot: DealRequirementSnapshot;
  evidenceSnapshot: DealEvidenceSnapshot;
  commercialSnapshot: DealCommercialSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface DealEvent {
  id: string;
  dealId: string;
  eventType: string;
  actor: string;
  actorRole: string;
  previousState?: DealStatus;
  newState?: DealStatus;
  message?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
