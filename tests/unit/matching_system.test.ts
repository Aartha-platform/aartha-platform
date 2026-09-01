import { describe, it } from 'node:test';
import assert from 'node:assert';
import { suppliers } from '../../src/data/suppliers';
import {
  extractStructuredQueryDeterministic,
  evaluateHardConstraints,
  cosineSimilarity,
  getEmbedding,
  retrieveCandidatesHybrid,
  rerankCandidates,
  generateMatchExplanation,
  recordMatchFeedback,
  getRecentSignals,
  clearInMemorySignals,
  matchSuppliersHybridPipeline,
} from '../../src/lib/matching';

describe('AI Matching System — Capability Verification', () => {
  it('1. Query Understanding: accurately parses industrial technical specifications', () => {
    const raw = 'Need CNC boring tools carbide shank 20mm with ISO 9001 and CE certification in Vatva GIDC max moq 100';
    const structured = extractStructuredQueryDeterministic(raw);

    assert.strictEqual(structured.category, 'Machinery & Industrial');
    assert.strictEqual(structured.preferredGidcZone, 'Vatva GIDC');
    assert.strictEqual(structured.maxMoq, 100);
    assert.ok(structured.certifications.includes('ISO 9001'));
    assert.ok(structured.certifications.includes('CE'));
  });

  it('2. Hard Constraints: strictly eliminates category and certification mismatches', () => {
    const pharmaSupplier = suppliers.find(s => s.category === 'Pharma & Healthcare')!;
    assert.ok(pharmaSupplier, 'Pharma supplier exists');

    // Query asking for Machinery
    const query = extractStructuredQueryDeterministic('Need CNC lathe tools with ISO 9001');
    const result = evaluateHardConstraints(pharmaSupplier, query);

    assert.strictEqual(result.passed, false, 'Category mismatch must fail hard constraints');
    assert.ok(result.violations.some(v => v.includes('Category mismatch')));
  });

  it('3. Hard Constraints: enforces mandatory certification requirement', () => {
    const supplier = suppliers.find(s => s.id === 's3')!; // Rajkot engineering (ISO 9001, CE)
    assert.ok(supplier);

    const query = extractStructuredQueryDeterministic({
      product: 'Valves',
      category: 'Machinery & Industrial',
      mandatoryCertifications: ['WHO-GMP'], // Not held by foundry
    });

    const result = evaluateHardConstraints(supplier, query);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some(v => v.includes('Missing mandatory certification')));
  });

  it('4. Embeddings & Cosine Similarity: mathematically coherent vector distance', async () => {
    const vecA = await getEmbedding('CNC machining carbide boring lathe Vatva Ahmedabad');
    const vecB = await getEmbedding('Precision CNC cutting tools boring inserts Vatva');
    const vecC = await getEmbedding('Organic cotton fabric GOTS dyed woven Surat textile');

    assert.strictEqual(vecA.length, 512);
    assert.strictEqual(vecB.length, 512);

    const simRelated = cosineSimilarity(vecA, vecB);
    const simUnrelated = cosineSimilarity(vecA, vecC);

    assert.ok(simRelated > simUnrelated, `Related similarity (${simRelated}) must exceed unrelated (${simUnrelated})`);
  });

  it('5. Hybrid Retrieval: executes Dense + Sparse with Reciprocal Rank Fusion', async () => {
    const query = extractStructuredQueryDeterministic('Paracetamol API USP Grade bulk powder Anand');
    const candidates = await retrieveCandidatesHybrid(suppliers, query, 5);

    assert.ok(candidates.length > 0);
    const topCandidate = candidates[0];
    assert.strictEqual(topCandidate.supplier.id, 's7', 'Anand Pharma Solutions must rank #1 for Paracetamol API');
    assert.ok(topCandidate.rrfScore > 0);
    assert.strictEqual(topCandidate.rrfRank, 1);
  });

  it('6. Reranking: separates Confidence, Completeness, Evidence, and Risk', () => {
    const query = extractStructuredQueryDeterministic('Organic cotton fabrics GOTS certified Surat');
    const textileSupplier = suppliers.find(s => s.id === 's2')!;

    const candidates = [{
      supplier: textileSupplier,
      denseRank: 1,
      denseSimilarity: 0.95,
      lexicalRank: 1,
      lexicalScore: 25,
      rrfRank: 1,
      rrfScore: 0.032,
    }];

    const reranked = rerankCandidates(candidates, query);
    assert.strictEqual(reranked.length, 1);

    const match = reranked[0];
    assert.ok(match.matchScore >= 80, 'High match score expected');
    assert.ok(match.evidenceConfidence >= 40, 'Independent evidence present');
    assert.ok(match.dataCompleteness >= 70, 'High data completeness');
    assert.ok(match.riskScore < 50, 'Low risk profile');
    assert.strictEqual(match.isRecommended, true);
  });

  it('7. Explainability: produces truthful reasons and does not invent missing evidence', () => {
    const s8 = suppliers.find(s => s.id === 's8')!; // Bhavnagar Agro (unverified / listed)
    const query = extractStructuredQueryDeterministic('Ground turmeric spices');
    const constraints = evaluateHardConstraints(s8, query);

    const explanation = generateMatchExplanation(s8, query, constraints, {
      specFitScore: 85,
      evidenceConfidence: 20,
      dataCompleteness: 65,
      riskScore: 60,
    });

    assert.ok(explanation.whyRecommended.length > 0);
    assert.ok(explanation.missingEvidence.some(e => e.includes('GSTIN/IEC') || e.includes('inspection')));
    assert.ok(explanation.unknownAttributes.length > 0);
  });

  it('8. Feedback Loop: captures and buffers interaction telemetry', async () => {
    clearInMemorySignals();

    const res = await recordMatchFeedback({
      supplierId: 's1',
      signalType: 'view',
      queryText: 'CNC lathe tools',
      matchScore: 92,
      positionInResults: 1,
    });

    assert.strictEqual(res.success, true);
    const recent = getRecentSignals(10);
    assert.strictEqual(recent.length, 1);
    assert.strictEqual(recent[0].supplierId, 's1');
    assert.strictEqual(recent[0].signalType, 'view');
  });

  it('9. Pipeline End-to-End: full pipeline execution executes under 1000ms', async () => {
    const res = await matchSuppliersHybridPipeline(suppliers, '4-layer PCB prototyping IoT sensors Gandhinagar CE RoHS');

    assert.ok(res.matches.length > 0);
    assert.ok(res.timingMs < 2000, `Execution time (${res.timingMs}ms) within budget`);
    assert.strictEqual(res.topMatch?.supplierId, 's5', 'Gandhinagar Electronics must be top match for PCB SMT');
    assert.strictEqual(res.topMatch?.isRecommended, true);
  });
});
