import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center font-sans text-text-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-navy p-3 rounded-2xl text-gold shadow-md">
          <ShieldCheck size={28} />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy dark:text-gold">
          <RefreshCw className="animate-spin text-amber-600 dark:text-amber-400" size={15} />
          <span>Synchronizing Sourcing Corridor...</span>
        </div>
      </div>
    </div>
  );
}
