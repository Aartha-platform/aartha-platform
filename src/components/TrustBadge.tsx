"use client";

import { useState, useEffect } from 'react';

import { VerificationTier } from '../types';

export interface TrustBadgeProps {
  tier: VerificationTier;
  verifiedDate?: string;
  auditorName: string;
  gpsCoordinates: string;
  documentsVerified: string[];
  expiryDate: string;
  state: 'active' | 'expiring' | 'pending' | 'expired' | 'suspended';
}

export default function TrustBadge({
  tier,
  verifiedDate,
  auditorName,
  gpsCoordinates,
  documentsVerified,
  expiryDate,
  state
}: TrustBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stateStyles = {
    active: {
      bg: 'bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-md shadow-md',
      text: 'text-emerald-800 dark:text-emerald-300 font-extrabold',
      border: 'border-emerald-500/50',
      checkColor: 'text-emerald-600 dark:text-emerald-400 font-black',
      label: 'Verified',
    },
    expiring: {
      bg: 'bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-md shadow-md',
      text: 'text-amber-800 dark:text-amber-300 font-extrabold',
      border: 'border-amber-500/50',
      checkColor: 'text-amber-600 dark:text-amber-400 font-black',
      label: 'Expiring Soon',
    },
    pending: {
      bg: 'bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-md shadow-md',
      text: 'text-blue-800 dark:text-blue-300 font-extrabold',
      border: 'border-blue-500/50',
      checkColor: 'text-blue-600 dark:text-blue-400 font-black',
      label: 'Pending Review',
    },
    expired: {
      bg: 'bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-md shadow-md',
      text: 'text-red-800 dark:text-red-300 font-extrabold',
      border: 'border-red-500/50',
      checkColor: 'text-red-600 dark:text-red-400 font-black',
      label: 'Expired',
    },
    suspended: {
      bg: 'bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-md shadow-md',
      text: 'text-slate-700 dark:text-slate-300 font-extrabold',
      border: 'border-slate-300 dark:border-slate-700',
      checkColor: 'text-slate-500 font-black',
      label: 'Suspended',
    },
  };

  const style = stateStyles[state] || stateStyles.active;

  let formattedTier = 'Listed';
  if (tier === 'business_verified') formattedTier = 'Business Verified';
  else if (tier === 'verified_supplier') formattedTier = 'Verified Supplier';
  else if (tier === 'premium_audited') formattedTier = 'Premium Audited';

  const formattedDate = verifiedDate
    ? new Date(verifiedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : '';

  const renderTooltipContent = (onClose?: () => void) => (
    <div className="space-y-2.5 relative text-text-primary dark:text-white">
      <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
        <span className="font-bold text-navy dark:text-amber-400 uppercase tracking-wider text-xs">Verification Evidence</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}>
          {state}
        </span>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-1 -right-1 text-slate-400 hover:text-red-500 text-sm font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      )}

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Audited By:</span>
          <span className="font-bold text-right text-text-primary dark:text-white">{auditorName}</span>
        </div>

        {verifiedDate && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Audit Date:</span>
            <span className="font-bold text-right text-text-primary dark:text-white">{verifiedDate}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Verified Until:</span>
          <span className="font-bold text-right text-text-primary dark:text-white">{expiryDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400 font-medium">GPS Coordinates:</span>
          <span className="type-data text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-navy dark:text-amber-400 font-bold border border-black/5 dark:border-white/10">{gpsCoordinates}</span>
        </div>
      </div>

      <div className="border-t border-black/10 dark:border-white/10 pt-2 space-y-1">
        <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Documents Verified:</span>
        <div className="flex flex-wrap gap-1">
          {documentsVerified.map((doc, idx) => (
            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-300 px-2 py-0.5 rounded text-xs font-semibold border border-black/5 dark:border-white/10">
              {doc}
            </span>
          ))}
        </div>
      </div>

      <div className="text-xs font-bold text-slate-400 text-center pt-1.5 border-t border-black/5 dark:border-white/10 uppercase tracking-wider">
        Aartha Geotagged Factory Visit Audited
      </div>
    </div>
  );

  return (
    <div className="relative inline-block select-none">
      {/* High-Contrast Crisp Solid Badge Pill */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-extrabold cursor-pointer select-none transition-all hover:scale-105 ${style.bg} ${style.text} ${style.border}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onMouseEnter={() => !isMobile && setShowTooltip(true)}
        onMouseLeave={() => !isMobile && setShowTooltip(false)}
      >
        <span className={style.checkColor}>✓</span>
        <span>{style.label} · {formattedTier} {formattedDate && `· ${formattedDate}`}</span>
      </div>

      {/* Trust Details Popover */}
      {showTooltip && (
        isMobile ? (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-text-primary"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
          >
            <div 
              className="bg-white dark:bg-[var(--surface)] rounded-2xl shadow-2xl border border-black/10 dark:border-white/15 p-5 w-full max-w-xs text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {renderTooltipContent(() => setShowTooltip(false))}
            </div>
          </div>
        ) : (
          <div className="absolute z-[100] left-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-[var(--surface)] text-text-primary dark:text-white rounded-xl shadow-2xl border border-black/10 dark:border-white/15 p-4 text-xs font-sans animate-fadeIn pointer-events-auto">
            {/* Popover Arrow */}
            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white dark:bg-[var(--surface)] border-t border-l border-black/10 dark:border-white/15 rotate-45"></div>
            {renderTooltipContent()}
          </div>
        )
      )}
    </div>
  );
}
