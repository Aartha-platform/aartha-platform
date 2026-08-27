"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, Share2, ArrowLeft, RefreshCw, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThankYouProps {
  referenceId: string;
  onReset: () => void;
}

export default function ThankYou({ referenceId, onReset }: ThankYouProps) {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/feedback/stats')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.totalCount === 'number') {
          setTotalCount(data.totalCount);
        }
      })
      .catch((err) => console.warn('Feedback stats notice:', err));
  }, []);

  const handleShare = () => {
    const feedbackUrl = `${window.location.origin}/feedback`;
    navigator.clipboard.writeText(feedbackUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Failed to copy link:', err));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel max-w-2xl mx-auto p-8 rounded-2xl border border-gold/25 dark:border-gold/20 text-center shadow-premium-lg mt-8"
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
          <CheckCircle size={36} />
        </div>
      </div>

      <h2 className="type-h2 text-navy dark:text-white font-extrabold tracking-tight mb-2">
        Thank You!
      </h2>
      
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-md mx-auto mb-6 font-medium">
        Your feedback has been successfully submitted and saved. Our product team reviews all problems to prioritize feature updates.
      </p>

      {/* Reference ID card */}
      <div className="bg-slate-50 dark:bg-[var(--surface-2)]/60 rounded-xl p-4 border border-slate-200/60 dark:border-white/5 max-w-sm mx-auto mb-6 flex flex-col items-center">
        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
          REFERENCE ID
        </span>
        <span className="text-sm font-extrabold text-gold tracking-wider mt-1 select-all">
          {referenceId}
        </span>
      </div>

      {/* Real-time stats card */}
      {totalCount !== null && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 max-w-md mx-auto mb-8 flex items-center justify-center gap-3">
          <BarChart2 className="text-amber-500" size={18} />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Your feedback joined <strong className="text-amber-500 text-sm font-bold">{totalCount}</strong> submissions being clustered by our AI engine.
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200/60 dark:border-white/10 pt-6">
        <button
          onClick={handleShare}
          className="btn-amber px-6 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto"
        >
          <Share2 size={14} />
          {copied ? 'Link Copied!' : 'Share Feedback Link'}
        </button>
        
        <button
          onClick={onReset}
          className="btn-outline px-6 py-2.5 text-xs uppercase tracking-wider text-slate-500 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw size={14} />
          Submit Another Problem
        </button>
      </div>

      <div className="mt-8">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-gold transition-colors duration-200"
        >
          <ArrowLeft size={12} />
          Back to Aartha Home
        </a>
      </div>
    </motion.div>
  );
}
