import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { RiskAnalysis } from '@/lib/fraudDetection';
import RiskBreakdown from './RiskBreakdown';

interface FraudRiskPanelProps {
  analysis: RiskAnalysis;
  showBreakdown?: boolean;
  type?: 'buyer' | 'supplier';
}

const ratingColors = {
  Normal: 'bg-trust-green-bg text-trust-green border-trust-green/20',
  Monitor: 'bg-trust-blue-bg text-trust-blue border-trust-blue/20',
  Restricted: 'bg-trust-amber-bg text-trust-amber border-trust-amber/20',
  Review: 'bg-trust-amber-bg text-trust-amber border-trust-amber/20',
  Blocked: 'bg-trust-red-bg text-trust-red border-trust-red/20'
};

export default function FraudRiskPanel({ analysis, showBreakdown = true, type = 'buyer' }: FraudRiskPanelProps) {
  const isHighRisk = analysis.totalScore > 40;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-border-default rounded-xl p-5 shadow-2xs space-y-4 font-sans text-text-primary transition-all duration-300">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4 pb-3 border-b border-border-default/50">
        <div className="space-y-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            {isHighRisk ? <ShieldAlert size={14} className="text-trust-red" /> : <ShieldCheck size={14} className="text-trust-green" />}
            <span>Account Security Scan</span>
          </h4>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Real-time verification checks across corporate identity patterns and georouting coordinates.
          </p>
        </div>

        <div className="text-right">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ratingColors[analysis.rating]}`}>
            {analysis.rating} Risk
          </span>
          <div className="text-xs font-bold font-mono text-navy mt-1.5">{analysis.totalScore} / 100</div>
        </div>
      </div>

      {/* Progress Score Bar */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-baseline text-[10px] text-text-secondary font-semibold">
          <span>Composite Risk Factor</span>
          <span>{analysis.totalScore}% Index</span>
        </div>
        <div className="w-full bg-cream-secondary h-2 rounded-full overflow-hidden border border-border-default/45">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              analysis.totalScore >= 60 ? 'bg-trust-red' : analysis.totalScore >= 30 ? 'bg-trust-amber' : 'bg-trust-green'
            }`}
            style={{ width: `${analysis.totalScore}%` }}
          />
        </div>
      </div>

      {/* Toggle Button for Breakdown */}
      {showBreakdown && (
        <div className="pt-1">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] font-bold text-navy hover:text-gold transition-colors cursor-pointer select-none"
          >
            {expanded ? (
              <>
                <span>Hide Verification Diagnostics</span>
                <ChevronUp size={12} />
              </>
            ) : (
              <>
                <span>View Verification Diagnostics ({Object.keys(analysis.signals).length} checks)</span>
                <ChevronDown size={12} />
              </>
            )}
          </button>
          
          {expanded && (
            <div className="pt-3 border-t border-border-default/30 mt-3 animate-fade-in">
              <RiskBreakdown analysis={analysis} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
