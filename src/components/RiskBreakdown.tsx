"use client";

import { ShieldCheck, AlertTriangle, XCircle, Info } from 'lucide-react';
import { RiskAnalysis, RiskSignal } from '@/lib/fraudDetection';

interface RiskBreakdownProps {
  analysis: RiskAnalysis;
}

const statusIcons = {
  passed: <ShieldCheck size={16} className="text-trust-green" />,
  review: <AlertTriangle size={16} className="text-trust-amber" />,
  failed: <XCircle size={16} className="text-trust-red" />
};

const statusBorders = {
  passed: 'border-trust-green/20 bg-trust-green-bg/10',
  review: 'border-trust-amber/20 bg-trust-amber-bg/10',
  failed: 'border-trust-red/20 bg-trust-red-bg/10'
};

const statusText = {
  passed: 'Passed check',
  review: 'Flagged for audit review',
  failed: 'Failed check'
};

export default function RiskBreakdown({ analysis }: RiskBreakdownProps) {
  const renderSignalRow = (title: string, signal: RiskSignal) => (
    <div key={title} className={`border rounded-xl p-3 space-y-1.5 transition-colors border-border-default/80 ${statusBorders[signal.status]}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold uppercase tracking-wider text-[10px] text-text-primary">{title} Indicator</span>
        <div className="flex items-center gap-1 font-semibold">
          {statusIcons[signal.status]}
          <span className="text-[9px] uppercase tracking-wide">{statusText[signal.status]}</span>
        </div>
      </div>
      
      <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
        {signal.explanation}
      </p>
      
      <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border-default/20">
        <span>Anomaly weight:</span>
        <span className="font-bold font-mono text-navy">{signal.score} / 25 pts</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3.5 font-sans">
      {renderSignalRow('Identity', analysis.signals.identity)}
      {renderSignalRow('Behavioral', analysis.signals.behavior)}
      {renderSignalRow('Content', analysis.signals.content)}
      {renderSignalRow('Geographic', analysis.signals.geography)}
    </div>
  );
}
