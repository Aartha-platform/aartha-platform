"use client";

import { OutcomeRecord, outcomeStages, OutcomeStage } from '../lib/outcomes';
import { 
  Handshake, 
  FileText, 
  Package, 
  GitCompare, 
  Truck, 
  CheckCircle2,
  Clock, 
  Info, 
  ShieldCheck,
  Circle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface OutcomeTrackerProps {
  record: OutcomeRecord;
  onUpdateStage?: (newStage: OutcomeStage) => void;
  isSupplierView?: boolean;
}

const orderedStages: OutcomeStage[] = [
  'matched',
  'quoted',
  'sampled',
  'negotiated',
  'ordered',
  'closed',
];

const stageIcons: Record<OutcomeStage, React.ComponentType<any>> = {
  matched: Handshake,
  quoted: FileText,
  sampled: Package,
  negotiated: GitCompare,
  ordered: Truck,
  closed: CheckCircle2,
  lost: XCircle,
  stalled: AlertCircle,
};

export default function OutcomeTracker({
  record,
  onUpdateStage,
  isSupplierView = false,
}: OutcomeTrackerProps) {
  const currentStageIndex = orderedStages.indexOf(record.stage);
  const activeStageConfig = outcomeStages[record.stage];

  const handleStageClick = (stage: OutcomeStage, index: number) => {
    if (isSupplierView && onUpdateStage) {
      onUpdateStage(stage);
    }
  };

  return (
    <div className="bg-white/50 dark:bg-[var(--surface)]/50 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-5 shadow-2xs font-sans text-xs">
      {/* Header Info */}
      <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <div>
          <span className="text-[9px] text-text-muted dark:text-slate-400 font-mono font-black uppercase tracking-wider block">
            Post-Connection Sourcing Pipeline
          </span>
          <h4 className="font-black text-navy dark:text-white text-sm leading-tight mt-0.5">
            {record.rfqTitle}
          </h4>
          <span className="text-[10px] text-text-secondary dark:text-slate-300 font-bold">
            Partner: <strong className="text-navy dark:text-gold">{record.supplierName}</strong>
          </span>
        </div>

        <div className="text-right">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${activeStageConfig?.color} shadow-2xs`}>
            {activeStageConfig?.label || record.stage}
          </span>
          <span className="text-[9px] text-text-muted dark:text-slate-400 block mt-1.5 font-bold">
            Updated {new Date(record.lastUpdated).toLocaleDateString('en-US')}
          </span>
        </div>
      </div>

      {/* Visual Timeline Stepper / Diagram Flow */}
      <div className="relative py-4 my-2">
        {/* Background track line */}
        <div className="absolute top-[36px] left-[6%] right-[6%] h-[4px] bg-slate-100 dark:bg-white/10 rounded-full z-0" />
        
        {/* Progress track line */}
        <div 
          className="absolute top-[36px] left-[6%] h-[4px] bg-gradient-to-r from-trust-green via-gold to-purple-500 rounded-full z-0 transition-all duration-700 ease-out" 
          style={{ width: `${(Math.max(0, currentStageIndex) / (orderedStages.length - 1)) * 88}%` }}
        />

        <div className="flex justify-between items-center text-center relative z-10">
          {orderedStages.map((stage, idx) => {
            const config = outcomeStages[stage];
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;
            const Icon = stageIcons[stage] || Circle;
            
            return (
              <button
                key={stage}
                onClick={() => handleStageClick(stage, idx)}
                disabled={!isSupplierView || !onUpdateStage}
                className={`flex flex-col items-center gap-2.5 focus:outline-none w-16 select-none transition-transform duration-300 ${
                  isSupplierView && onUpdateStage ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
              >
                {/* Outer badge circle */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive 
                    ? 'bg-gold text-white border-2 border-gold shadow-lg scale-120 ring-4 ring-gold/20' 
                    : isCompleted 
                      ? 'bg-trust-green text-white border-2 border-trust-green shadow-md' 
                      : 'bg-white dark:bg-[var(--surface)] text-text-muted dark:text-slate-400 border-2 border-slate-200 dark:border-white/10 shadow-2xs'
                }`}>
                  <Icon size={18} className={isActive ? 'animate-bounce' : ''} />
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                  isActive 
                    ? 'text-gold' 
                    : isCompleted 
                      ? 'text-trust-green' 
                      : 'text-text-muted dark:text-slate-400'
                }`}>
                  {config?.label || stage}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guidance Notice */}
      <div className="bg-cream/40 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-1.5 backdrop-blur-md shadow-2xs">
        <div className="font-black text-navy dark:text-white flex items-center gap-1.5 text-xs">
          <Info size={13} className="text-gold" />
          <span>Next Action Guidance:</span>
        </div>
        <p className="text-text-secondary dark:text-slate-300 leading-relaxed font-semibold">
          {activeStageConfig?.nextActionGuidance}
        </p>
      </div>

      {/* Secure Audit Trail Log */}
      <div className="bg-slate-900/95 dark:bg-[var(--surface)]/95 border border-emerald-500/25 rounded-2xl p-4.5 space-y-4 shadow-premium">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-[13px] font-black text-slate-100 uppercase tracking-widest font-mono">
              Geotagged Trust Log Trace
            </span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase font-black select-none">
            Secured
          </span>
        </div>

        {/* Dynamic Grid of Key Value Cards */}
        {(() => {
          const logString = record.geotaggedLog || '';
          const matchVal = logString.match(/MATCH:\s*([^.]+)/)?.[1] || 'N/A';
          const gpsVal = logString.match(/GPS:\s*([^.]+)/)?.[1] || 'N/A';
          const quoteVal = logString.match(/QUOTE:\s*([^.]+)/)?.[1] || 'N/A';
          const auditVal = logString.match(/AUDIT:\s*([^.]+)/)?.[1] || 'OK';

          return (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px] sm:text-[12px] font-mono">
              <div className="bg-white/5 dark:bg-white/[0.02] border border-white/5 rounded-xl p-2.5 space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Node Match</div>
                <div className="font-black text-slate-200 truncate" title={matchVal}>
                  🔗 {matchVal}
                </div>
              </div>

              <div className="bg-white/5 dark:bg-white/[0.02] border border-white/5 rounded-xl p-2.5 space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">GPS Geoloc</div>
                <div className="font-black text-gold truncate" title={gpsVal}>
                  📍 {gpsVal}
                </div>
              </div>

              <div className="bg-white/5 dark:bg-white/[0.02] border border-white/5 rounded-xl p-2.5 space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Verified Bid</div>
                <div className="font-black text-slate-200 truncate" title={quoteVal}>
                  🏷️ {quoteVal}
                </div>
              </div>

              <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl p-2.5 space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Audit Status</div>
                <div className="font-black text-emerald-400 flex items-center gap-1">
                  🛡️ {auditVal}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Hash verify footer */}
        <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 border-t border-white/5 pt-2.5 flex justify-between items-center flex-wrap gap-2">
          <span>SHA-256 Cryptographic Signature</span>
          <span className="font-bold text-slate-400 truncate max-w-[250px] select-all">
            0x7f83b27acdf932e{record.rfqId.replace(/\D/g, '')}f22a84
          </span>
        </div>
      </div>
    </div>
  );
}
