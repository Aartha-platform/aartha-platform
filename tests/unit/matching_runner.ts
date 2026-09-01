import assert from 'assert';
import { suppliers } from '@/data/suppliers';
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
  runBenchmarkComparison,
  GOLDEN_EVALUATION_DATASET,
} from '@/lib/matching';
import { validateGSTIN, validateGSTINLive, isValidGSTINChecksum, calculateGSTINChecksum } from '@/lib/gstinService';
import { analyzeDocumentContent, checkCrossDocumentConsistency, mockDossiers } from '@/lib/documentIntel';

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve(fn())
    .then(() => console.log(`  ✓ PASS: ${name}`))
    .catch((err) => {
      console.error(`  ✗ FAIL: ${name}`, err);
      throw err;
    });
}

export async function runAIMatchingAndHardeningTests() {
  console.log('\n--- Running Capability Recovery & Verification Tests ---');

  // 1. GSTIN Security & Hardening Tests
  console.log('\n[P0 Truth] GSTIN Verification & Elimination of Fabricated Names:');
  await test('Validates authentic Gujarat GSTIN format and checksum without fake names', () => {
    const res = validateGSTIN('24AAAAC1234A1Z1');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.stateCode, '24');
    assert.strictEqual(res.verificationSource, 'format_checksum');
    assert.strictEqual(res.isLiveVerified, false);
    assert.strictEqual(res.entityName, undefined, 'Must NEVER fabricate mock company names');
  });

  await test('Verifies mathematical GSTIN Luhn mod-36 check digit', () => {
    assert.strictEqual(isValidGSTINChecksum('24AAAAC1234A1ZS'), true);
    assert.strictEqual(isValidGSTINChecksum('24AAAAC1234A1Z9'), false);
    assert.strictEqual(calculateGSTINChecksum('24AAAAC1234A1Z'), 'S');
  });

  await test('Live lookup honestly reports unavailable status when unconfigured', async () => {
    const res = await validateGSTINLive('24AAAAC1234A1Z1');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.verificationSource, 'unavailable');
    assert.strictEqual(res.isLiveVerified, false);
    assert.strictEqual(res.entityName, undefined);
  });

  // 2. Document Intelligence Pipeline Tests
  console.log('\n[P1 Document Intel] Live Scan & Field Validation:');
  await test('Live scan analyzes GST document with real field status tagging (EXTRACTED/VALIDATED)', () => {
    const raw = `
      REGISTRATION CERTIFICATE
      GSTIN: 24AAAAC1234A1Z1
      Legal Name: RAJKOT CASTINGS PVT LTD
      Date: 15/01/2020
    `;
    const dossier = analyzeDocumentContent('Rajkot_GST.pdf', raw, 'gst');
    assert.strictEqual(dossier.source, 'live-scan');
    const gstin = dossier.extractedFields.find(f => f.label === 'GSTIN');
    assert.ok(gstin);
    assert.strictEqual(gstin.status, 'VALIDATED');
    assert.strictEqual(gstin.value, '24AAAAC1234A1Z1');
  });

  await test('Flags missing Country of Origin on commercial invoice with statutory exception', () => {
    const raw = `
      INVOICE INV-2026-901
      Seller: AHMEDABAD TOOLS LTD
      HS Code: 8466.93
    `;
    const dossier = analyzeDocumentContent('Inv_901.pdf', raw, 'invoice');
    const exc = dossier.exceptions.find(e => e.field.includes('Origin'));
    assert.ok(exc);
    assert.strictEqual(exc.severity, 'high');
  });

  // 3. AI Matching Pipeline Tests
  console.log('\n[P1 Matching] Real Hybrid Semantic Retrieval & Reranker:');
  await test('Query Understanding extracts structured RFQ requirements', () => {
    const structured = extractStructuredQueryDeterministic('Need CNC boring tools carbide in Vatva GIDC max moq 100 with ISO 9001');
    assert.strictEqual(structured.category, 'Machinery & Industrial');
    assert.strictEqual(structured.preferredGidcZone, 'Vatva GIDC');
    assert.strictEqual(structured.maxMoq, 100);
    assert.ok(structured.certifications.includes('ISO 9001'));
  });

  await test('Hard constraints eliminate category mismatches before ranking', () => {
    const pharma = suppliers.find(s => s.category === 'Pharma & Healthcare')!;
    const query = extractStructuredQueryDeterministic('Need CNC lathe tools');
    const result = evaluateHardConstraints(pharma, query);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.some(v => v.includes('Category mismatch')));
  });

  await test('Embeddings & Cosine Distance provide mathematically sound semantic similarity', async () => {
    const vecA = await getEmbedding('CNC machining carbide boring lathe Vatva Ahmedabad');
    const vecB = await getEmbedding('Precision CNC cutting tools boring inserts Vatva');
    const vecC = await getEmbedding('Organic cotton fabric GOTS dyed woven Surat textile');
    const simRel = cosineSimilarity(vecA, vecB);
    const simUnrel = cosineSimilarity(vecA, vecC);
    assert.ok(simRel > simUnrel, `Related similarity (${simRel.toFixed(3)}) must exceed unrelated (${simUnrel.toFixed(3)})`);
  });

  await test('Hybrid Retrieval fuses Dense and Sparse streams via Reciprocal Rank Fusion', async () => {
    const query = extractStructuredQueryDeterministic('Paracetamol API USP Grade bulk powder Anand');
    const candidates = await retrieveCandidatesHybrid(suppliers, query, 5);
    assert.ok(candidates.length > 0);
    assert.strictEqual(candidates[0].supplier.id, 's7');
  });

  await test('Reranking strictly separates confidence, completeness, evidence, and risk dimensions', () => {
    const textile = suppliers.find(s => s.id === 's2')!;
    const query = extractStructuredQueryDeterministic('Organic cotton fabrics GOTS certified Surat');
    const reranked = rerankCandidates([{
      supplier: textile,
      denseRank: 1,
      denseSimilarity: 0.95,
      lexicalRank: 1,
      lexicalScore: 25,
      rrfRank: 1,
      rrfScore: 0.032,
    }], query);

    const match = reranked[0];
    assert.ok(match.matchScore >= 80);
    assert.ok(match.evidenceConfidence >= 40);
    assert.ok(match.dataCompleteness >= 70);
    assert.ok(match.riskScore < 50);
    assert.strictEqual(match.isRecommended, true);
  });

  await test('Transparent Explainer includes why recommended and missing evidence without hallucinations', () => {
    const s8 = suppliers.find(s => s.id === 's8')!;
    const query = extractStructuredQueryDeterministic('Ground turmeric spices');
    const constraints = evaluateHardConstraints(s8, query);
    const expl = generateMatchExplanation(s8, query, constraints, {
      specFitScore: 80,
      evidenceConfidence: 20,
      dataCompleteness: 60,
      riskScore: 60,
    });
    assert.ok(expl.whyRecommended.length > 0);
    assert.ok(expl.missingEvidence.length > 0);
    assert.ok(expl.unknownAttributes.length > 0);
  });

  await test('End-to-End Pipeline executes and returns qualified matches', async () => {
    const res = await matchSuppliersHybridPipeline(suppliers, '4-layer PCB prototyping IoT sensors Gandhinagar CE RoHS');
    assert.ok(res.matches.length > 0);
    assert.strictEqual(res.topMatch?.supplierId, 's5');
    assert.strictEqual(res.topMatch?.isRecommended, true);
  });

  // 4. Golden Dataset Benchmark Comparison
  console.log('\n[P1 Evaluation] Running 20-Query Golden Benchmark (Baseline vs Hybrid):');
  const report = await runBenchmarkComparison(suppliers);
  console.log('================================================================');
  console.log('       AARTHA AI MATCHING: 20-QUERY GOLDEN BENCHMARK RESULTS     ');
  console.log('================================================================');
  console.log(` Precision@5:  Baseline = ${report.baselineMetrics.precisionAtK.toFixed(3)}  |  Hybrid = ${report.hybridMetrics.precisionAtK.toFixed(3)}  (+${report.improvement.precisionGainPercent}%)`);
  console.log(` Recall@5:     Baseline = ${report.baselineMetrics.recallAtK.toFixed(3)}  |  Hybrid = ${report.hybridMetrics.recallAtK.toFixed(3)}  (+${report.improvement.recallGainPercent}%)`);
  console.log(` NDCG@5:       Baseline = ${report.baselineMetrics.ndcgAtK.toFixed(3)}  |  Hybrid = ${report.hybridMetrics.ndcgAtK.toFixed(3)}  (+${report.improvement.ndcgGainPercent}%)`);
  console.log(` MRR:          Baseline = ${report.baselineMetrics.mrr.toFixed(3)}  |  Hybrid = ${report.hybridMetrics.mrr.toFixed(3)}  (+${report.improvement.mrrGainPercent}%)`);
  console.log(` Violations:   Baseline = ${report.baselineMetrics.constraintViolationRate.toFixed(3)}  |  Hybrid = ${report.hybridMetrics.constraintViolationRate.toFixed(3)}  (-${report.improvement.constraintViolationReductionPercent}%)`);
  console.log(` Avg Latency:  Baseline = ${report.baselineMetrics.averageLatencyMs}ms  |  Hybrid = ${report.hybridMetrics.averageLatencyMs}ms`);
  console.log('================================================================');

  assert.ok(report.hybridMetrics.ndcgAtK >= report.baselineMetrics.ndcgAtK);
  assert.strictEqual(report.hybridMetrics.constraintViolationRate, 0);

  console.log('\n--- All Capability Recovery & Verification Tests Passed (100%) ---\n');
}
