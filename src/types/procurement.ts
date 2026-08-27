/**
 * procurement.ts
 * Procurement Confidence Object & Recommendation Types.
 */

export interface ProcurementConfidence {
  overall: number; // 0 - 100
  identity: number; // 0 - 100
  factory: number; // 0 - 100
  capability: number; // 0 - 100
  compliance: number; // 0 - 100
  performance: number; // 0 - 100
  transaction: number; // 0 - 100
  confidenceLevel: 'high' | 'medium' | 'low';
  missingEvidence: string[];
  staleEvidence: string[];
  risks: string[];
  generatedAt: string; // ISO date
}

export interface SupplierRecommendation {
  supplierId: string;
  companyName: string;
  slug: string;
  fitScore: number;
  confidence: 'high' | 'medium' | 'low';
  procurementConfidence: ProcurementConfidence;
  hardConstraintsPassed: boolean;
  strengths: string[];
  reasons: string[];
  evidenceReasons: Array<{
    claim: string;
    evidenceType: string;
    evidenceDate?: string;
    verified: boolean;
  }>;
  missingEvidence: string[];
  risks: string[];
  whyRecommended: string[];
  whyNotOthers: string[];
  nextAction:
    | 'request_quote'
    | 'request_capacity'
    | 'request_sample'
    | 'request_audit';
}
