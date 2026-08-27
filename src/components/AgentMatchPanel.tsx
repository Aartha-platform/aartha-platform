"use client";

import { MatchResult } from '../lib/aiMatching';
import { Supplier } from '../types';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AgentMatchPanelProps {
  match: MatchResult;
  supplier: Supplier;
}

export default function AgentMatchPanel({ match, supplier }: AgentMatchPanelProps) {
  return (
    <div className="bg-white border border-border-default rounded-xl p-5 space-y-4 shadow-2xs font-sans text-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-gold" />
          <h4 className="font-bold text-text-primary text-sm leading-tight uppercase tracking-wide">
            AI Match Insights
          </h4>
        </div>
        <span className="text-[10px] text-navy font-bold bg-cream px-2 py-0.5 rounded border border-border-default/40">
          Match Score: {match.score}/100
        </span>
      </div>

      {/* Narrative Explanation */}
      <p className="text-text-secondary leading-relaxed font-semibold">
        {match.explanation}
      </p>

      {/* Match Evidence Bullets */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">
          Match Evidence Details:
        </span>
        <div className="space-y-1">
          {match.reasons.map((r, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px] text-text-secondary leading-snug">
              <span className="text-trust-green mt-0.5 flex-shrink-0">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Geotrack Verification Status */}
      <div className="bg-cream-secondary p-3 rounded-lg border border-border-default/40 flex items-start gap-2">
        <ShieldCheck size={14} className="text-trust-green flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-normal">
          <div className="font-bold text-navy">GIDC Corridor Routing Authenticated</div>
          <div className="text-text-secondary font-medium">
            Supplier located in Vatva/Morbi GIDC corridors has physical audit grades geolinked.
          </div>
        </div>
      </div>
    </div>
  );
}
