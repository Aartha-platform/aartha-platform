import { Supplier } from '@/types';
import { StructuredQuery } from './matchSchema';
import { buildQueryCanonicalText, buildSupplierCanonicalText, cosineSimilarity, getEmbedding } from './embeddingService';

export interface RetrievedCandidate {
  supplier: Supplier;
  denseRank: number;
  denseSimilarity: number;
  lexicalRank: number;
  lexicalScore: number;
  rrfRank: number;
  rrfScore: number;
}

/**
 * Reciprocal Rank Fusion constant (Industry standard k = 60)
 */
const RRF_K = 60;

/**
 * Calculates Lexical BM25-like Term Matching Score
 */
export function calculateLexicalScore(supplier: Supplier, query: StructuredQuery): number {
  const queryTokens = [
    query.product,
    query.category,
    query.subcategory || '',
    ...(query.materials || []),
    ...(query.certifications || []),
    query.preferredGidcZone || '',
    query.rawQuery || '',
  ]
    .join(' ')
    .toLowerCase()
    .split(/[\s,/-]+/)
    .filter(t => t.length > 2);

  let score = 0;

  // Search targets with weights
  const nameText = supplier.companyName.toLowerCase();
  const catText = supplier.category.toLowerCase();
  const subcatText = (supplier.subcategories || []).join(' ').toLowerCase();
  const prodText = (supplier.products || []).join(' ').toLowerCase();
  const certText = (supplier.certifications || []).join(' ').toLowerCase();
  const locText = `${supplier.location.city} ${supplier.location.gidcZone || ''}`.toLowerCase();
  const aboutText = (supplier.about || '').toLowerCase();

  for (const token of queryTokens) {
    if (nameText.includes(token)) score += 5.0;
    if (catText.includes(token)) score += 4.0;
    if (subcatText.includes(token)) score += 3.0;
    if (prodText.includes(token)) score += 3.5;
    if (certText.includes(token)) score += 2.5;
    if (locText.includes(token)) score += 2.0;
    if (aboutText.includes(token)) score += 1.0;
  }

  return score;
}

/**
 * Hybrid Candidate Retrieval Engine
 * Executes parallel Dense (Embedding) and Sparse (Lexical) retrieval,
 * fusing them via Reciprocal Rank Fusion (RRF).
 */
export async function retrieveCandidatesHybrid(
  pool: Supplier[],
  query: StructuredQuery,
  topK = 50
): Promise<RetrievedCandidate[]> {
  if (pool.length === 0) return [];

  // 1. Generate query embedding
  const queryText = buildQueryCanonicalText(query);
  const queryVec = await getEmbedding(queryText);

  // 2. Generate supplier embeddings in parallel (or retrieve from memory)
  const supplierVectors = await Promise.all(
    pool.map(async (supplier) => {
      const text = buildSupplierCanonicalText(supplier);
      const vec = await getEmbedding(text);
      return { supplier, vec };
    })
  );

  // 3. Dense Retrieval: Calculate cosine similarities and rank
  const denseScored = supplierVectors.map(({ supplier, vec }) => {
    const sim = cosineSimilarity(queryVec, vec);
    return { supplier, sim };
  });
  denseScored.sort((a, b) => b.sim - a.sim);

  const denseRankMap = new Map<string, { rank: number; sim: number }>();
  denseScored.forEach((item, idx) => {
    denseRankMap.set(item.supplier.id, { rank: idx + 1, sim: item.sim });
  });

  // 4. Sparse/Lexical Retrieval: Calculate lexical scores and rank
  const lexicalScored = pool.map(supplier => {
    const score = calculateLexicalScore(supplier, query);
    return { supplier, score };
  });
  lexicalScored.sort((a, b) => b.score - a.score);

  const lexicalRankMap = new Map<string, { rank: number; score: number }>();
  lexicalScored.forEach((item, idx) => {
    lexicalRankMap.set(item.supplier.id, { rank: idx + 1, score: item.score });
  });

  // 5. Fusion: Reciprocal Rank Fusion (RRF)
  const rrfList: RetrievedCandidate[] = pool.map(supplier => {
    const denseInfo = denseRankMap.get(supplier.id) || { rank: pool.length, sim: 0 };
    const lexicalInfo = lexicalRankMap.get(supplier.id) || { rank: pool.length, score: 0 };

    const rrfDense = 1.0 / (RRF_K + denseInfo.rank);
    const rrfLexical = 1.0 / (RRF_K + lexicalInfo.rank);
    const rrfScore = rrfDense + rrfLexical;

    return {
      supplier,
      denseRank: denseInfo.rank,
      denseSimilarity: denseInfo.sim,
      lexicalRank: lexicalInfo.rank,
      lexicalScore: lexicalInfo.score,
      rrfRank: 0, // Assigned after sort
      rrfScore,
    };
  });

  // Sort by RRF score descending
  rrfList.sort((a, b) => b.rrfScore - a.rrfScore);
  rrfList.forEach((c, idx) => {
    c.rrfRank = idx + 1;
  });

  return rrfList.slice(0, topK);
}
