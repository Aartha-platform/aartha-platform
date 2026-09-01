import { Supplier } from '@/types';
import { GoldenRelevanceExample, EvaluationMetrics } from './matchSchema';
import { calculateSupplierMatch } from '../aiMatching';
import { retrieveCandidatesHybrid } from './hybridRetrieval';
import { rerankCandidates } from './reranker';
import { understandBuyerQuery } from './queryUnderstanding';

/**
 * 20 Labeled Golden Query Benchmark Dataset
 * Spans CNC, Machinery, Organic Textiles, Specialty Pigments, IoT Sensors, Vitrified Tiles, API Pharma, Spices.
 * Relevances:
 * 0 = Irrelevant
 * 1 = Weak / Peripheral
 * 2 = Acceptable fit
 * 3 = Strong match
 * 4 = Ideal / Exact match
 */
export const GOLDEN_EVALUATION_DATASET: GoldenRelevanceExample[] = [
  {
    queryId: 'q01-cnc-carbide',
    query: 'Need CNC lathe carbide boring tools Shank 20mm with ISO 9001 and CE certification in Vatva Ahmedabad GIDC',
    category: 'Machinery & Industrial',
    expectedSupplierIds: { 's1': 4, 's3': 2, 's2': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Machinery & Industrial', mandatoryCertifications: ['ISO 9001'] },
  },
  {
    queryId: 'q02-valve-castings',
    query: 'Machined cast iron valve bodies and pump castings from Rajkot Aji GIDC foundry cluster',
    category: 'Machinery & Industrial',
    expectedSupplierIds: { 's3': 4, 's1': 2, 's2': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Machinery & Industrial' },
  },
  {
    queryId: 'q03-organic-cotton',
    query: 'GOTS certified organic cotton woven fabric rolls with OEKO-TEX certificate from Surat textile mill',
    category: 'Textiles & Apparel',
    expectedSupplierIds: { 's2': 4, 's1': 0, 's3': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Textiles & Apparel', mandatoryCertifications: ['GOTS'] },
  },
  {
    queryId: 'q04-rayon-fabrics',
    query: 'Rayon fabric manufacturer in Pandesara GIDC Surat with low MOQ',
    category: 'Textiles & Apparel',
    expectedSupplierIds: { 's2': 4, 's1': 0, 's3': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Textiles & Apparel', maxMoq: 500 },
  },
  {
    queryId: 'q05-green-pigment',
    query: 'Phthalocyanine Green Pigment G7 REACH certified for export to Germany from Nandesari Vadodara chemical park',
    category: 'Chemicals & Materials',
    expectedSupplierIds: { 's4': 4, 's1': 0, 's2': 0, 's3': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Chemicals & Materials', mandatoryCertifications: ['REACH'] },
  },
  {
    queryId: 'q06-sulfur-dyes',
    query: 'Industrial solvent blend and sulfur dyes with ISO 14001 environmental consent',
    category: 'Chemicals & Materials',
    expectedSupplierIds: { 's4': 4, 's1': 0, 's2': 0, 's3': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Chemicals & Materials' },
  },
  {
    queryId: 'q07-pcb-smt',
    query: '4-layer PCB prototyping and SMT assembly facility in Gandhinagar Electronics Zone with CE and RoHS',
    category: 'Electronics & Electrical',
    expectedSupplierIds: { 's5': 4, 's1': 1, 's2': 0, 's3': 0, 's4': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Electronics & Electrical', mandatoryCertifications: ['RoHS'] },
  },
  {
    queryId: 'q08-iot-sensors',
    query: 'Industrial IoT wireless temperature transmitters with RS-485 Modbus RTU interface',
    category: 'Electronics & Electrical',
    expectedSupplierIds: { 's5': 4, 's1': 0, 's2': 0, 's3': 0, 's4': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Electronics & Electrical' },
  },
  {
    queryId: 'q09-vitrified-tiles',
    query: 'Polished vitrified floor tiles 600x600 mm double charged with water absorption under 0.05% Morbi Gujarat',
    category: 'Home & Consumer',
    expectedSupplierIds: { 's6': 4, 's1': 0, 's2': 0, 's3': 0, 's4': 0, 's5': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Home & Consumer' },
  },
  {
    queryId: 'q10-sanitaryware-morbi',
    query: 'Glazed ceramic wall tiles and sanitary porcelain from Lakhdhirpur GIDC Morbi',
    category: 'Home & Consumer',
    expectedSupplierIds: { 's6': 4, 's1': 0, 's2': 0, 's3': 0, 's4': 0, 's5': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Home & Consumer' },
  },
  {
    queryId: 'q11-paracetamol-api',
    query: 'Paracetamol API USP Grade bulk powder with WHO-GMP and US FDA registration Anand Gujarat',
    category: 'Pharma & Healthcare',
    expectedSupplierIds: { 's7': 4, 's4': 1, 's1': 0, 's2': 0, 's3': 0, 's5': 0, 's6': 0, 's8': 0 },
    hardConstraints: { category: 'Pharma & Healthcare', mandatoryCertifications: ['WHO-GMP'] },
  },
  {
    queryId: 'q12-generic-pharma',
    query: 'Generic pharmaceutical formulation batches and active pharmaceutical intermediates',
    category: 'Pharma & Healthcare',
    expectedSupplierIds: { 's7': 4, 's4': 1, 's1': 0, 's2': 0, 's3': 0, 's5': 0, 's6': 0, 's8': 0 },
    hardConstraints: { category: 'Pharma & Healthcare' },
  },
  {
    queryId: 'q13-turmeric-powder',
    query: 'Ground turmeric powder with curcumin content over 3% with FSSAI and HACCP in Bhavnagar Chitra GIDC',
    category: 'Food & Agro',
    expectedSupplierIds: { 's8': 4, 's1': 0, 's2': 0, 's3': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0 },
    hardConstraints: { category: 'Food & Agro', mandatoryCertifications: ['FSSAI'] },
  },
  {
    queryId: 'q14-dehydrated-onion',
    query: 'Dehydrated red onion flakes and agricultural agro commodities spices',
    category: 'Food & Agro',
    expectedSupplierIds: { 's8': 4, 's1': 0, 's2': 0, 's3': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0 },
    hardConstraints: { category: 'Food & Agro' },
  },
  {
    queryId: 'q15-precision-drills',
    query: 'Precision industrial drill bits and carbide cutting tools for high-speed machining',
    category: 'Machinery & Industrial',
    expectedSupplierIds: { 's1': 4, 's3': 3, 's2': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Machinery & Industrial' },
  },
  {
    queryId: 'q16-gear-blanks',
    query: 'Automotive gear blanks and machined pump castings cast iron with CE',
    category: 'Machinery & Industrial',
    expectedSupplierIds: { 's3': 4, 's1': 2, 's2': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Machinery & Industrial' },
  },
  {
    queryId: 'q17-oeko-tex-yarn',
    query: 'Polyester blended yarn and cotton weave rolls certified OEKO-TEX Standard 100',
    category: 'Textiles & Apparel',
    expectedSupplierIds: { 's2': 4, 's1': 0, 's3': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Textiles & Apparel' },
  },
  {
    queryId: 'q18-organic-pigments',
    query: 'Organic pigments for plastics and coatings chemical manufacturing Gujarat corridor',
    category: 'Chemicals & Materials',
    expectedSupplierIds: { 's4': 4, 's1': 0, 's2': 0, 's3': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Chemicals & Materials' },
  },
  {
    queryId: 'q19-modbus-sensors',
    query: 'Sensors IoT hardware development temperature monitors with Modbus',
    category: 'Electronics & Electrical',
    expectedSupplierIds: { 's5': 4, 's1': 0, 's2': 0, 's3': 0, 's4': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Electronics & Electrical' },
  },
  {
    queryId: 'q20-hindi-industrial',
    query: 'सीएनसी टर्निंग टूल्स और बोरिंग टूल अहमदाबाद वटवा जीआईडीसी',
    category: 'Machinery & Industrial',
    expectedSupplierIds: { 's1': 4, 's3': 2, 's2': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0 },
    hardConstraints: { category: 'Machinery & Industrial' },
  },
];

/**
 * Computes Discounted Cumulative Gain at rank K
 */
function dcgAtK(relevanceScores: number[], k: number): number {
  let dcg = 0;
  for (let i = 0; i < Math.min(k, relevanceScores.length); i++) {
    const rel = relevanceScores[i];
    dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
  }
  return dcg;
}

/**
 * Computes Normalized Discounted Cumulative Gain (NDCG@K)
 */
export function calculateNDCGAtK(rankedSupplierIds: string[], expectedScores: Record<string, number>, k = 5): number {
  const actualRelevances = rankedSupplierIds.slice(0, k).map(id => expectedScores[id] || 0);
  const actualDcg = dcgAtK(actualRelevances, k);

  const idealRelevances = Object.values(expectedScores).sort((a, b) => b - a).slice(0, k);
  const idealDcg = dcgAtK(idealRelevances, k);

  if (idealDcg === 0) return 1.0;
  return actualDcg / idealDcg;
}

/**
 * Computes Precision@K (Fraction of top K results that are relevant >= threshold)
 */
export function calculatePrecisionAtK(rankedSupplierIds: string[], expectedScores: Record<string, number>, k = 5, threshold = 2): number {
  const topK = rankedSupplierIds.slice(0, k);
  if (topK.length === 0) return 0;
  const relevantCount = topK.filter(id => (expectedScores[id] || 0) >= threshold).length;
  return relevantCount / topK.length;
}

/**
 * Computes Recall@K (Fraction of all relevant items found in top K)
 */
export function calculateRecallAtK(rankedSupplierIds: string[], expectedScores: Record<string, number>, k = 5, threshold = 2): number {
  const topK = rankedSupplierIds.slice(0, k);
  const totalRelevant = Object.values(expectedScores).filter(s => s >= threshold).length;
  if (totalRelevant === 0) return 1.0;
  const foundRelevant = topK.filter(id => (expectedScores[id] || 0) >= threshold).length;
  return foundRelevant / totalRelevant;
}

/**
 * Computes Mean Reciprocal Rank (MRR)
 */
export function calculateMRR(rankedSupplierIds: string[], expectedScores: Record<string, number>, threshold = 3): number {
  for (let i = 0; i < rankedSupplierIds.length; i++) {
    if ((expectedScores[rankedSupplierIds[i]] || 0) >= threshold) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

/**
 * Runs Evaluation against Golden Dataset for both Baseline and New System
 */
export async function runBenchmarkComparison(
  supplierPool: Supplier[]
): Promise<{
  baselineMetrics: EvaluationMetrics;
  hybridMetrics: EvaluationMetrics;
  improvement: {
    precisionGainPercent: number;
    recallGainPercent: number;
    ndcgGainPercent: number;
    mrrGainPercent: number;
    constraintViolationReductionPercent: number;
  };
}> {
  let baselineP5 = 0;
  let baselineR5 = 0;
  let baselineNdcg5 = 0;
  let baselineMrr = 0;
  let baselineViolations = 0;

  let hybridP5 = 0;
  let hybridR5 = 0;
  let hybridNdcg5 = 0;
  let hybridMrr = 0;
  let hybridViolations = 0;

  const startBaseline = Date.now();

  // 1. Evaluate Baseline (Legacy Deterministic Scoring)
  for (const example of GOLDEN_EVALUATION_DATASET) {
    const results = supplierPool
      .map(s => calculateSupplierMatch(s, {
        category: example.category,
        mandatoryCertifications: example.hardConstraints.mandatoryCertifications,
        maxMoq: example.hardConstraints.maxMoq,
      }))
      .filter(r => r.isMatch)
      .sort((a, b) => b.score - a.score);

    const rankedIds = results.map(r => r.supplierId);

    baselineP5 += calculatePrecisionAtK(rankedIds, example.expectedSupplierIds, 5);
    baselineR5 += calculateRecallAtK(rankedIds, example.expectedSupplierIds, 5);
    baselineNdcg5 += calculateNDCGAtK(rankedIds, example.expectedSupplierIds, 5);
    baselineMrr += calculateMRR(rankedIds, example.expectedSupplierIds);

    // Check constraint violations (e.g. category mismatch)
    const violated = results.filter(r => {
      const sup = supplierPool.find(s => s.id === r.supplierId);
      return sup && sup.category.toLowerCase() !== example.hardConstraints.category.toLowerCase();
    }).length;
    baselineViolations += violated;
  }

  const baselineDuration = Date.now() - startBaseline;

  // 2. Evaluate New Hybrid Retrieval & Reranker System
  const startHybrid = Date.now();

  for (const example of GOLDEN_EVALUATION_DATASET) {
    const structuredQuery = await understandBuyerQuery(example.query);
    const candidates = await retrieveCandidatesHybrid(supplierPool, structuredQuery, 10);
    const reranked = rerankCandidates(candidates, structuredQuery);

    const rankedIds = reranked.map(r => r.supplierId);

    hybridP5 += calculatePrecisionAtK(rankedIds, example.expectedSupplierIds, 5);
    hybridR5 += calculateRecallAtK(rankedIds, example.expectedSupplierIds, 5);
    hybridNdcg5 += calculateNDCGAtK(rankedIds, example.expectedSupplierIds, 5);
    hybridMrr += calculateMRR(rankedIds, example.expectedSupplierIds);

    const violated = reranked.filter(r => r.isRecommended && !r.constraints.passed).length;
    hybridViolations += violated;
  }

  const hybridDuration = Date.now() - startHybrid;

  const total = GOLDEN_EVALUATION_DATASET.length;

  const baselineMetrics: EvaluationMetrics = {
    precisionAtK: Math.round((baselineP5 / total) * 1000) / 1000,
    recallAtK: Math.round((baselineR5 / total) * 1000) / 1000,
    ndcgAtK: Math.round((baselineNdcg5 / total) * 1000) / 1000,
    mrr: Math.round((baselineMrr / total) * 1000) / 1000,
    constraintViolationRate: Math.round((baselineViolations / total) * 1000) / 1000,
    averageLatencyMs: Math.round(baselineDuration / total),
    totalQueriesEvaluated: total,
    costPerQueryUsd: 0.0,
  };

  const hybridMetrics: EvaluationMetrics = {
    precisionAtK: Math.round((hybridP5 / total) * 1000) / 1000,
    recallAtK: Math.round((hybridR5 / total) * 1000) / 1000,
    ndcgAtK: Math.round((hybridNdcg5 / total) * 1000) / 1000,
    mrr: Math.round((hybridMrr / total) * 1000) / 1000,
    constraintViolationRate: Math.round((hybridViolations / total) * 1000) / 1000,
    averageLatencyMs: Math.round(hybridDuration / total),
    totalQueriesEvaluated: total,
    costPerQueryUsd: 0.00002, // ~$0.02 / 1000 queries
  };

  const calcGain = (cur: number, base: number) => base > 0 ? Math.round(((cur - base) / base) * 100) : (cur > 0 ? 100 : 0);

  return {
    baselineMetrics,
    hybridMetrics,
    improvement: {
      precisionGainPercent: calcGain(hybridMetrics.precisionAtK, baselineMetrics.precisionAtK),
      recallGainPercent: calcGain(hybridMetrics.recallAtK, baselineMetrics.recallAtK),
      ndcgGainPercent: calcGain(hybridMetrics.ndcgAtK, baselineMetrics.ndcgAtK),
      mrrGainPercent: calcGain(hybridMetrics.mrr, baselineMetrics.mrr),
      constraintViolationReductionPercent: baselineMetrics.constraintViolationRate > 0 
        ? Math.round(((baselineMetrics.constraintViolationRate - hybridMetrics.constraintViolationRate) / baselineMetrics.constraintViolationRate) * 100)
        : 100,
    },
  };
}
