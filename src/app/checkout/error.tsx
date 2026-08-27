'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, RefreshCw, ShoppingCart } from 'lucide-react';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Checkout Error Boundary Caught]:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] bg-[var(--bg)] flex items-center justify-center p-6 font-sans">
      <div className="bg-white dark:bg-[var(--surface)] border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-premium-lg text-center space-y-5">
        <div className="flex justify-center">
          <div className="bg-navy p-3 rounded-xl text-white">
            <ShieldCheck size={32} />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-black uppercase text-navy dark:text-white">Checkout System Exception</h2>
          <p className="text-xs text-text-muted dark:text-slate-400">
            An issue occurred while rendering the purchase order status. No funds have been altered.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-navy-light transition-all cursor-pointer shadow-md"
          >
            <RefreshCw size={13} />
            <span>Reload Order</span>
          </button>

          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-navy dark:text-white border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer no-underline"
          >
            <ShoppingCart size={13} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
