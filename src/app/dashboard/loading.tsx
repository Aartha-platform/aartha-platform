import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] bg-[var(--bg)] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-navy p-3 rounded-2xl text-gold shadow-md animate-pulse">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v6.5M12 15.5v6.5M2 12h6.5M15.5 12h6.5" />
          </svg>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-navy dark:text-gold">
          Loading Workspace...
        </span>
        <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-navy to-gold rounded-full animate-[loading_1.5s_ease-in-out_infinite]" 
               style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
