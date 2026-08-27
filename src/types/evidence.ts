/**
 * evidence.ts
 * Core Evidence Entity Model & Verification Provenance.
 * Connects every score and claim to an immutable, timestamped evidence record.
 */

export type EvidenceType =
  | 'physical_audit'
  | 'document'
  | 'registry_api'
  | 'transaction_history'
  | 'self_declared';

export type EvidenceStatus =
  | 'self_declared'
  | 'extracted'
  | 'validated'
  | 'verified'
  | 'expired'
  | 'suspended';

export interface Evidence {
  id: string;
  entityType: 'supplier' | 'factory_site' | 'capability' | 'certification' | 'order';
  entityId: string;
  claim: string;
  evidenceType: EvidenceType;
  source: string;
  documentId?: string;
  capturedAt: string; // ISO date
  expiresAt?: string; // ISO date
  verifiedAt?: string; // ISO date
  verifiedBy?: string; // auditor ID or 'system:gst_registry'
  confidence: number; // 0 - 100
  status: EvidenceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceSummary {
  totalClaims: number;
  verifiedClaims: number;
  expiredClaims: number;
  pendingClaims: number;
  evidenceFreshnessDays: number;
  criticalMissingEvidence: string[];
}
