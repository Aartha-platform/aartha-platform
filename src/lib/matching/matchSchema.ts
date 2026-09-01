import { z } from 'zod';

/**
 * Structured Query Schema for Buyer Requirements
 * Schema-validated representation of a buyer sourcing query.
 */
export const StructuredQuerySchema = z.object({
  rawQuery: z.string().optional(),
  product: z.string().min(1, 'Product requirement is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  materials: z.array(z.string()).default([]),
  technicalSpecs: z.record(z.string()).default({}),
  quantity: z.number().positive().optional(),
  quantityUnit: z.string().default('units'),
  targetPrice: z.number().positive().optional(),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  maxMoq: z.number().positive().optional(),
  certifications: z.array(z.string()).default([]),
  mandatoryCertifications: z.array(z.string()).default([]),
  tolerance: z.string().optional(),
  manufacturingProcess: z.string().optional(),
  destinationCountry: z.string().default('India'),
  preferredGidcZone: z.string().optional(),
  preferredState: z.string().default('Gujarat'),
  minVerificationTier: z.enum(['listed', 'business_verified', 'verified_supplier', 'premium_audited']).optional(),
  directManufacturerOnly: z.boolean().default(true),
  incoterm: z.enum(['EXW', 'FOB', 'CIF', 'DDP', 'CFR']).optional(),
});

export type StructuredQuery = z.infer<typeof StructuredQuerySchema>;

/**
 * Hard Constraint Evaluation Result
 */
export const ConstraintResultSchema = z.object({
  passed: z.boolean(),
  violations: z.array(z.string()),
  passedConstraints: z.array(z.string()),
  rejectionReason: z.string().optional(),
});

export type ConstraintResult = z.infer<typeof ConstraintResultSchema>;

/**
 * Match Explanation Schema (Evidence-grounded)
 */
export const MatchExplanationSchema = z.object({
  whyRecommended: z.array(z.string()),
  missingEvidence: z.array(z.string()),
  unknownAttributes: z.array(z.string()),
  whyNotOthers: z.array(z.string()),
  summary: z.string(),
});

export type MatchExplanation = z.infer<typeof MatchExplanationSchema>;

/**
 * Canonical Candidate Match Result
 */
export const HybridMatchResultSchema = z.object({
  supplierId: z.string(),
  companyName: z.string(),
  slug: z.string(),
  category: z.string(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    gidcZone: z.string().optional(),
  }),
  isVerified: z.boolean(),
  verificationTier: z.string(),
  sellerType: z.string(),
  qualityScore: z.number(),

  // Four Distinct Confidence Dimensions (Never collapsed into one misleading number)
  matchScore: z.number().min(0).max(100),         // Semantic & specification fit
  evidenceConfidence: z.number().min(0).max(100), // Independent audit & registry proof
  dataCompleteness: z.number().min(0).max(100),   // Completeness of profile & docs
  riskScore: z.number().min(0).max(100),          // Fraud & operational risk

  // Retrieval telemetry
  denseSimilarity: z.number().min(0).max(1),
  lexicalScore: z.number().min(0),
  rrfRank: z.number().int().positive(),

  // Constraint validation
  constraints: ConstraintResultSchema,

  // Transparent explanation
  explanation: MatchExplanationSchema,
  
  isRecommended: z.boolean(),
});

export type HybridMatchResult = z.infer<typeof HybridMatchResultSchema>;

/**
 * Match Feedback Signal Types
 */
export const FeedbackSignalTypeSchema = z.enum([
  'search_impression',
  'view',
  'shortlist',
  'contact',
  'rfq_sent',
  'supplier_responded',
  'quote_received',
  'sample_requested',
  'order_placed',
  'repeat_order',
  'rejection',
  'no_response',
]);

export type FeedbackSignalType = z.infer<typeof FeedbackSignalTypeSchema>;

/**
 * Golden Dataset Item for Offline & Online Evaluation
 */
export interface GoldenRelevanceExample {
  queryId: string;
  query: string;
  category: string;
  expectedSupplierIds: Record<string, number>; // supplierId -> relevance label (0 = irrelevant, 1 = weak, 2 = acceptable, 3 = strong, 4 = ideal)
  hardConstraints: {
    category: string;
    mandatoryCertifications?: string[];
    maxMoq?: number;
    mustBeManufacturer?: boolean;
  };
}

/**
 * Comprehensive Evaluation Metrics
 */
export interface EvaluationMetrics {
  precisionAtK: number;
  recallAtK: number;
  ndcgAtK: number;
  mrr: number;
  constraintViolationRate: number;
  averageLatencyMs: number;
  totalQueriesEvaluated: number;
  costPerQueryUsd: number;
}
