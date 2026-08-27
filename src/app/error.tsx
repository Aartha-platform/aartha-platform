'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Shield, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Aartha Global System Boundary Caught Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 font-sans text-text-primary">
      <div className="bg-white dark:bg-[var(--surface)] border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-premium-lg text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-navy p-4 rounded-2xl text-gold">
            <Shield size={36} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase text-navy dark:text-white tracking-tight">System Exception Intercepted</h1>
          <p className="text-xs text-text-muted dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
            An unexpected error occurred during processing. The system state has been preserved safely under Aartha resilience protection.
          </p>
          {error?.message && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-[10px] font-mono p-2.5 rounded-lg border border-red-100 dark:border-red-900/30 mt-3 text-left overflow-x-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-navy-light transition-all cursor-pointer shadow-md"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-navy dark:text-white border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer no-underline"
          >
            <Home size={13} />
            <span>Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
