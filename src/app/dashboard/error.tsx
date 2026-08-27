'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary Caught]:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-[var(--bg)] flex items-center justify-center p-6 font-sans">
      <div className="bg-white dark:bg-[var(--surface)] border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-premium-lg text-center space-y-5">
        <div className="flex justify-center">
          <div className="bg-navy p-3 rounded-xl text-white">
            <ShieldCheck size={32} />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-black uppercase text-navy dark:text-white">Dashboard Error</h2>
          <p className="text-xs text-text-muted dark:text-slate-400">
            Unable to render dashboard workspace module. Your session and data are secure.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-navy-light transition-all cursor-pointer shadow-md"
          >
            <RefreshCw size={13} />
            <span>Reload Desk</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-navy dark:text-white border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer no-underline"
          >
            <LayoutDashboard size={13} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
