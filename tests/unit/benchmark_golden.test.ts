import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runBenchmarkComparison, GOLDEN_EVALUATION_DATASET } from '../../src/lib/matching/evaluation';
import { suppliers } from '../../src/data/suppliers';

describe('AI Matching Benchmark — Golden Dataset (Baseline vs Hybrid)', () => {
  it('Runs comparative evaluation across 20 industrial sourcing queries', async () => {
    assert.strictEqual(GOLDEN_EVALUATION_DATASET.length, 20);

    const report = await runBenchmarkComparison(suppliers);

    console.log('\n================================================================');
    console.log('       AARTHA AI MATCHING: 20-QUERY GOLDEN BENCHMARK RESULTS     ');
    console.log('================================================================');
    console.log(' METRIC                     | BASELINE (DETERMINISTIC) | NEW (HYBRID RETRIEVAL)');
    console.log('----------------------------|--------------------------|-----------------------');
    console.log(` Precision@5                | ${report.baselineMetrics.precisionAtK.toFixed(3).padEnd(24)} | ${report.hybridMetrics.precisionAtK.toFixed(3)} (+${report.improvement.precisionGainPercent}%)`);
    console.log(` Recall@5                   | ${report.baselineMetrics.recallAtK.toFixed(3).padEnd(24)} | ${report.hybridMetrics.recallAtK.toFixed(3)} (+${report.improvement.recallGainPercent}%)`);
    console.log(` NDCG@5                     | ${report.baselineMetrics.ndcgAtK.toFixed(3).padEnd(24)} | ${report.hybridMetrics.ndcgAtK.toFixed(3)} (+${report.improvement.ndcgGainPercent}%)`);
    console.log(` Mean Reciprocal Rank (MRR) | ${report.baselineMetrics.mrr.toFixed(3).padEnd(24)} | ${report.hybridMetrics.mrr.toFixed(3)} (+${report.improvement.mrrGainPercent}%)`);
    console.log(` Constraint Violation Rate  | ${report.baselineMetrics.constraintViolationRate.toFixed(3).padEnd(24)} | ${report.hybridMetrics.constraintViolationRate.toFixed(3)} (-${report.improvement.constraintViolationReductionPercent}%)`);
    console.log(` Average Latency            | ${report.baselineMetrics.averageLatencyMs}ms`.padEnd(30) + ` | ${report.hybridMetrics.averageLatencyMs}ms`);
    console.log('================================================================\n');

    // Asserts that the new Hybrid system outperforms the baseline deterministic scoring
    assert.ok(
      report.hybridMetrics.ndcgAtK >= report.baselineMetrics.ndcgAtK,
      `Hybrid NDCG@5 (${report.hybridMetrics.ndcgAtK}) must be >= Baseline NDCG@5 (${report.baselineMetrics.ndcgAtK})`
    );

    assert.ok(
      report.hybridMetrics.constraintViolationRate <= report.baselineMetrics.constraintViolationRate,
      `Hybrid constraint violation rate (${report.hybridMetrics.constraintViolationRate}) must be <= Baseline (${report.baselineMetrics.constraintViolationRate})`
    );

    assert.strictEqual(
      report.hybridMetrics.constraintViolationRate,
      0,
      'Hard constraint engine must produce 0% constraint violations'
    );
  });
});
