"use client";

import { useState } from 'react';
import { QualityScore as QualityScoreType } from '../types';

interface QualityScoreProps {
  score: number;
  breakdown: QualityScoreType;
  showBar?: boolean;
  showTooltip?: boolean;
  state?: 'sufficient' | 'insufficient';
}

export default function QualityScore({
  score,
  breakdown,
  showBar = true,
  showTooltip = true,
  state = 'sufficient'
}: QualityScoreProps) {
  const [activeTooltip, setActiveTooltip] = useState(false);

  if (state === 'insufficient') {
    return (
      <div className="flex flex-col gap-1 select-none">
        <span className="text-xs font-semibold text-text-muted">Trust Score</span>
        <span className="text-xs font-medium text-text-muted bg-cream-secondary border border-border-default/40 rounded px-2 py-0.5 w-max">
          Insufficient data
        </span>
      </div>
    );
  }

  // Color mapping based on score ranges
  const getColorClass = (val: number) => {
    if (val >= 90) return 'bg-trust-green';
    if (val >= 80) return 'bg-gold';
    if (val >= 60) return 'bg-trust-amber';
    return 'bg-trust-red';
  };

  const getTextColorClass = (val: number) => {
    if (val >= 90) return 'text-trust-green';
    if (val >= 80) return 'text-gold';
    if (val >= 60) return 'text-trust-amber';
    return 'text-trust-red';
  };

  return (
    <div className="relative inline-block select-none w-full max-w-xs">
      <div
        className="flex items-center justify-between gap-4 cursor-pointer"
        onClick={() => showTooltip && setActiveTooltip(!activeTooltip)}
        onMouseEnter={() => showTooltip && setActiveTooltip(true)}
        onMouseLeave={() => showTooltip && setActiveTooltip(false)}
      >
        <div className="flex flex-col w-full gap-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-text-secondary">Trust Score</span>
            <span className={`font-bold ${getTextColorClass(score)}`}>{score}/100</span>
          </div>
          {showBar && (
            <div className="w-full h-2 bg-cream-secondary rounded-full overflow-hidden border border-border-default/20">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getColorClass(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Tooltip */}
      {showTooltip && activeTooltip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-64 bg-white text-text-primary rounded-lg shadow-lg border border-border-default p-4 text-xs font-sans animate-fade-in pointer-events-auto">
          {/* Tooltip Arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-border-default rotate-45"></div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center border-b border-border-default pb-1.5">
              <span className="font-bold text-navy uppercase tracking-wider text-[10px]">Trust Score Breakdown</span>
              <span className={`font-bold ${getTextColorClass(score)}`}>{score}/100</span>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Identity & Legal', value: breakdown.verificationScore, max: 25 },
                { label: 'Business Reputation', value: breakdown.activityScore, max: 20 },
                { label: 'Certification & Authenticity', value: breakdown.certificationScore, max: 25 },
                { label: 'Transaction Behavior', value: breakdown.responseScore, max: 20 },
                { label: 'Third-Party Audit Bonus', value: breakdown.auditQualityScore, max: 10 },
              ].map((item, idx) => {
                const percent = (item.value / item.max) * 100;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-medium text-navy">{item.value}/{item.max}</span>
                    </div>
                    <div className="w-full h-1 bg-cream-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[9px] text-text-muted text-center pt-1 border-t border-border-default/50">
              Audit calculated dynamically from verification data.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
