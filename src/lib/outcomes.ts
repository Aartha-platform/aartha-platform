import { TransactionOutcome, TransactionStage } from '../types';

export type OutcomeStage =
  | 'matched'
  | 'quoted'
  | 'sampled'
  | 'negotiated'
  | 'ordered'
  | 'closed'
  | 'lost'
  | 'stalled';

export interface OutcomeStageConfig {
  label: string;
  color: string;
  nextActionGuidance: string;
}

export const outcomeStages: Record<OutcomeStage, OutcomeStageConfig> = {
  matched: {
    label: 'Matched',
    color: 'bg-trust-blue-bg text-trust-blue border-trust-blue/20',
    nextActionGuidance: 'Awaiting supplier response/quote proposal.',
  },
  quoted: {
    label: 'Quoted',
    color: 'bg-trust-amber-bg text-trust-amber border-trust-amber/20',
    nextActionGuidance: 'Review unit price and request physical material sample.',
  },
  sampled: {
    label: 'Sampled',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    nextActionGuidance: 'Verify quality check of GIDC sample and begin negotiations.',
  },
  negotiated: {
    label: 'Negotiated',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    nextActionGuidance: 'Finalize draft agreement and upload signed Purchase Order (PO).',
  },
  ordered: {
    label: 'Ordered',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    nextActionGuidance: 'Geotagged transit in progress. Check shipping documents.',
  },
  closed: {
    label: 'Closed',
    color: 'bg-trust-green-bg text-trust-green border-trust-green/20',
    nextActionGuidance: 'Deal completed. Leave review to improve partner quality score.',
  },
  lost: {
    label: 'Lost',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    nextActionGuidance: 'Sourcing closed. Re-run matching query for active alternatives.',
  },
  stalled: {
    label: 'Stalled',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    nextActionGuidance: 'High latency detected. Contact Artha support desk.',
  },
};

export interface OutcomeRecord {
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  supplierName: string;
  stage: OutcomeStage;
  lastUpdated: string;
  geotaggedLog?: string; // audit trace
}

/**
 * Initial outcome store starts empty in production to avoid fabricated metrics.
 * Real outcome records accumulate as RFQs, quotes, and orders progress.
 */
export const initialOutcomeRecords: OutcomeRecord[] = [];

/**
 * Funnel calculation for the North Star Metric: Successful Sourcing Rate
 * Evaluates the conversion rate from Qualified Match -> Quoted -> Ordered -> Closed.
 */
export function calculateFunnelMetrics(outcomes: (OutcomeRecord | TransactionOutcome)[]) {
  const total = outcomes.length;
  if (total === 0) {
    return {
      totalTracked: 0,
      matched: 0,
      quoted: 0,
      sampled: 0,
      negotiated: 0,
      ordered: 0,
      closed: 0,
      successfulSourcingRate: 0,
    };
  }

  let matched = 0;
  let quoted = 0;
  let sampled = 0;
  let negotiated = 0;
  let ordered = 0;
  let closed = 0;

  for (const o of outcomes) {
    const stage = o.stage;
    if (stage === 'matched') matched++;
    else if (stage === 'quoted') { matched++; quoted++; }
    else if (stage === 'sampled' || stage === 'sample_requested' || stage === 'sample_accepted') { matched++; quoted++; sampled++; }
    else if (stage === 'negotiated') { matched++; quoted++; sampled++; negotiated++; }
    else if (stage === 'ordered' || stage === 'order_placed' || stage === 'delivered') { matched++; quoted++; sampled++; negotiated++; ordered++; }
    else if (stage === 'closed' || stage === 'repeat_order') { matched++; quoted++; sampled++; negotiated++; ordered++; closed++; }
  }

  const successfulSourcingRate = matched > 0 ? Math.round((closed / matched) * 100) : 0;

  return {
    totalTracked: total,
    matched,
    quoted,
    sampled,
    negotiated,
    ordered,
    closed,
    successfulSourcingRate,
  };
}

