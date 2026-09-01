import { Supplier } from '@/types';
import { StructuredQuery, HybridMatchResult } from './matchSchema';
import { understandBuyerQuery } from './queryUnderstanding';
import { retrieveCandidatesHybrid } from './hybridRetrieval';
import { rerankCandidates } from './reranker';
import { recordMatchFeedback } from './feedbackLoop';

export * from './matchSchema';
export * from './queryUnderstanding';
export * from './constraintEngine';
export * from './embeddingService';
export * from './hybridRetrieval';
export * from './reranker';
export * from './explainer';
export * from './feedbackLoop';
export * from './evaluation';

export interface MatchingPipelineResponse {
  query: StructuredQuery;
  matches: HybridMatchResult[];
  totalConsidered: number;
  qualifiedCount: number;
  topMatch: HybridMatchResult | null;
  timingMs: number;
}

/**
 * End-to-End Hybrid Semantic Matching Pipeline for Aartha
 * 
 * Pipeline stages:
 * 1. Intent Extraction & Structured RFQ parsing (LLM + Multilingual NLP taxonomy)
 * 2. Dense Semantic (pgvector / text-embedding-3-small) + Sparse Lexical retrieval
 * 3. Reciprocal Rank Fusion (RRF) candidate pooling
 * 4. Multi-feature Reranking with strict anti-gaming rules
 * 5. Transparent explainability (Why Recommended, Missing Evidence, Unknowns)
 * 6. Interaction feedback capture
 */
export async function matchSuppliersHybridPipeline(
  supplierPool: Supplier[],
  rawInput: string | Partial<StructuredQuery>,
  options?: {
    topK?: number;
    sessionId?: string;
    buyerId?: string;
    buyerEmail?: string;
  }
): Promise<MatchingPipelineResponse> {
  const start = Date.now();

  // 1. Understand buyer requirement
  const query = await understandBuyerQuery(rawInput);

  // 2. Filter pool: Exclude demo suppliers if real verified suppliers exist
  const hasRealSuppliers = supplierPool.some(s => !s.isDemo);
  const eligiblePool = hasRealSuppliers 
    ? supplierPool.filter(s => !s.isDemo)
    : supplierPool;

  // 3. Hybrid Candidate Retrieval (Dense + Sparse + RRF)
  const candidatePool = await retrieveCandidatesHybrid(eligiblePool, query, 50);

  // 4. Multi-Feature Reranking & Constraint Gating
  const rankedResults = rerankCandidates(candidatePool, query);

  // 5. Select top results
  const topK = options?.topK || 10;
  const matches = rankedResults.slice(0, topK);
  const qualified = matches.filter(m => m.isRecommended);

  const timingMs = Date.now() - start;

  // 6. Record search impression signal in feedback loop
  if (matches.length > 0) {
    const topSupplier = matches[0];
    recordMatchFeedback({
      buyerId: options?.buyerId,
      buyerEmail: options?.buyerEmail,
      queryText: query.rawQuery,
      queryStructured: query,
      supplierId: topSupplier.supplierId,
      signalType: 'search_impression',
      matchScore: topSupplier.matchScore,
      positionInResults: 1,
      sessionId: options?.sessionId,
    }).catch(err => console.warn('[Pipeline] Feedback log error:', err));
  }

  return {
    query,
    matches,
    totalConsidered: eligiblePool.length,
    qualifiedCount: qualified.length,
    topMatch: qualified[0] || matches[0] || null,
    timingMs,
  };
}
