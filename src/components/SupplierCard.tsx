"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Star, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Supplier } from '../types';
import TrustBadge from './TrustBadge';
import QualityScore from './QualityScore';
import Checkbox from './ui/Checkbox';
import { useTranslation } from '@/hooks/useTranslation';

interface SupplierCardProps {
  supplier: Supplier;
  variant?: 'grid' | 'list' | 'featured' | 'compare';
  showCheckbox?: boolean;
  isCompareSelected?: boolean;
  onCompareToggle?: (supplierId: string) => void;
  onEnquireClick?: (supplier: Supplier) => void;
}

export default function SupplierCard({
  supplier,
  variant = 'grid',
  showCheckbox = false,
  isCompareSelected = false,
  onCompareToggle,
  onEnquireClick
}: SupplierCardProps) {
  const { t } = useTranslation();
  const initials = supplier.companyName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const exportMarketsLimited = supplier.exportMarkets?.slice(0, 3) || [];
  const remainingExports = (supplier.exportMarkets?.length || 0) - exportMarketsLimited.length;

  const renderFactoryPhoto = () => {
    const hasBgImage = (supplier.galleryUrls && supplier.galleryUrls.length > 0) || (supplier.factoryPhotos && supplier.factoryPhotos.length > 0);
    let bgImageUrl = supplier.galleryUrls?.[0] || (supplier.factoryPhotos && supplier.factoryPhotos[0]);

    if (bgImageUrl && !bgImageUrl.startsWith('http') && !bgImageUrl.startsWith('/')) {
      const num = parseInt(bgImageUrl.replace(/\D/g, '')) || 0;
      const images = [
        'https://images.unsplash.com/photo-1565034946487-077786996e27?w=600&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
        'https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=600&q=80'
      ];
      bgImageUrl = images[num % images.length];
    }

    return (
      <div className="relative w-full h-full overflow-hidden img-zoom-container bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {hasBgImage ? (
          <>
            <img
              src={bgImageUrl}
              alt={supplier.companyName}
              className="w-full h-full object-cover img-zoom absolute inset-0"
            />
            <div className="absolute inset-0 bg-navy/20 dark:bg-black/40"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F1F35] to-[#162C4B] opacity-95">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent opacity-70"></div>
          </div>
        )}

        {/* Center avatar/logo */}
        <div className="w-11 h-11 bg-white dark:bg-[var(--surface)] rounded-xl flex items-center justify-center font-bold text-sm border border-black/10 dark:border-white/15 shadow-md relative z-10 overflow-hidden">
          {supplier.logoUrl ? (
            <img src={supplier.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-navy dark:text-white font-extrabold">{initials}</span>
          )}
        </div>

        {supplier.isVerified && (
          <div className="absolute bottom-2 right-2 text-white/90 text-[10px] font-mono tracking-wider font-bold uppercase bg-navy/60 backdrop-blur-md px-1.5 py-0.5 rounded-full select-none z-10 flex items-center gap-1 border border-emerald-500/30">
            <CheckCircle2 size={9} className="text-emerald-400" />
            {t('trust_verified_badge')}
          </div>
        )}
      </div>
    );
  };

  // ── Grid Variant (Minimised & Compact) ──────────────────────────────────────
  if (variant === 'grid') {
    return (
      <div className="border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[var(--surface)] shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full font-sans group relative z-10 hover:z-50">
        {/* Top Emerald Verification Strip */}
        {supplier.isVerified && (
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 w-full rounded-t-2xl" />
        )}

        <div className="h-36 relative bg-slate-100 dark:bg-slate-800 border-b border-black/5 dark:border-white/10 rounded-t-2xl">
          {renderFactoryPhoto()}

          {supplier.isVerified && (
            <div className="absolute top-2.5 left-2.5 z-20 scale-95 origin-top-left">
              <TrustBadge
                tier={supplier.verificationTier}
                verifiedDate={supplier.verifiedDate}
                expiryDate={supplier.verificationExpiryDate || ''}
                auditorName={supplier.verificationDetails?.auditorId || 'Aartha Auditor'}
                gpsCoordinates={supplier.location.gpsCoordinates || '22.0000° N, 72.0000° E'}
                documentsVerified={supplier.certifications}
                state={['verified_supplier', 'premium_audited', 'business_verified'].includes(supplier.verificationGateState) ? 'active' : 'suspended'}
              />
            </div>
          )}

          {showCheckbox && onCompareToggle && (
            <div className="absolute top-2.5 right-2.5 z-20 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 shadow-sm z-20">
              <Checkbox
                checked={isCompareSelected}
                onChange={() => onCompareToggle(supplier.id)}
                id={`compare-${supplier.id}`}
                label={t('common_compare')}
              />
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="space-y-0.5">
              <h3 className="font-bold text-text-primary dark:text-white text-sm leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                {supplier.companyName}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap text-text-muted dark:text-slate-400 text-xs">
                <MapPin size={12} className="text-amber-500 flex-shrink-0" />
                <span className="truncate">{supplier.location.city}, {supplier.location.state}</span>
                {supplier.location.gidcZone && (
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold border border-black/5 dark:border-white/10 flex-shrink-0">
                    {supplier.location.gidcZone}
                  </span>
                )}
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-extrabold uppercase border border-amber-500/25 flex-shrink-0">
                  {supplier.sellerType ? supplier.sellerType.replace(/_/g, ' ') : 'Supplier'}
                </span>
              </div>
            </div>

            <div className="py-0.5">
              <QualityScore
                score={supplier.qualityScore.total}
                breakdown={supplier.qualityScore}
                showTooltip={true}
                showBar={true}
                state={supplier.reviewCount >= 3 ? 'sufficient' : 'insufficient'}
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {supplier.certifications.slice(0, 3).map(cert => (
                <span key={cert} className="badge-verified text-xs uppercase tracking-wider font-semibold py-0.5 px-1.5">
                  {cert}
                </span>
              ))}
            </div>

            <p className="text-xs text-text-secondary dark:text-slate-300 line-clamp-2 leading-relaxed">
              {supplier.about}
            </p>
          </div>

          <div className="space-y-2.5 pt-2.5 border-t border-black/5 dark:border-white/10">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col">
                <span className="text-text-muted dark:text-slate-400 text-xs uppercase tracking-wider font-bold">{t('common_moq')}</span>
                <span className="font-bold text-text-primary dark:text-white truncate">{supplier.moq || '1000 units'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted dark:text-slate-400 text-xs uppercase tracking-wider font-bold">{t('common_response')}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                  <Clock size={10} />
                  {supplier.avgResponseTimeHours ? `<${Math.ceil(supplier.avgResponseTimeHours)} hrs` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-0.5">
              <Link
                href={`/suppliers/${supplier.slug}`}
                prefetch={false}
                className="flex-1 btn-outline text-[11px] py-1.5 font-bold text-center no-underline rounded-lg"
              >
                {t('common_profile')}
              </Link>
              <button
                onClick={() => onEnquireClick?.(supplier)}
                className="flex-1 btn-amber text-[11px] py-1.5 font-bold text-center cursor-pointer shadow-sm hover:shadow-md rounded-lg"
              >
                {t('common_enquire')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List Variant ───────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <div className="border border-black/10 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-[var(--surface)] shadow-premium hover:shadow-premium-lg transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between font-sans group">
        <div className="flex gap-3.5 items-center w-full md:w-auto">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-black/10 dark:border-white/10 shadow-sm">
            {renderFactoryPhoto()}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-text-primary dark:text-white text-sm leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {supplier.companyName}
              </h3>
              {supplier.isVerified && (
                <TrustBadge
                  tier={supplier.verificationTier}
                  verifiedDate={supplier.verifiedDate}
                  expiryDate={supplier.verificationExpiryDate || ''}
                  auditorName={supplier.verificationDetails?.auditorId || 'Aartha Auditor'}
                  gpsCoordinates={supplier.location.gpsCoordinates || '22.0000° N, 72.0000° E'}
                  documentsVerified={supplier.certifications}
                  state={['verified_supplier', 'premium_audited', 'business_verified'].includes(supplier.verificationGateState) ? 'active' : 'suspended'}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-text-secondary dark:text-slate-300">
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-amber-500" />
                <span>{supplier.location.city}, {supplier.location.state}</span>
              </div>
              <span className="text-text-muted">•</span>
              <span>{t('common_moq')}: <strong className="text-text-primary dark:text-white">{supplier.moq || '1000 units'}</strong></span>
              <span className="text-text-muted">•</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-extrabold uppercase border border-amber-500/25">
                {supplier.sellerType ? supplier.sellerType.replace(/_/g, ' ') : 'Supplier'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 pt-0.5">
              {supplier.certifications.slice(0, 4).map(cert => (
                <span key={cert} className="badge-verified text-xs uppercase tracking-wider font-semibold py-0.5 px-1.5">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-black/5 dark:border-white/10 pt-2.5 md:pt-0">
          <div className="w-full md:w-36">
            <QualityScore
              score={supplier.qualityScore.total}
              breakdown={supplier.qualityScore}
              showTooltip={true}
              showBar={true}
              state={supplier.reviewCount >= 3 ? 'sufficient' : 'insufficient'}
            />
          </div>

          <div className="flex gap-2">
            <Link
              href={`/suppliers/${supplier.slug}`}
              className="btn-outline text-xs px-3.5 py-1.5 font-bold no-underline rounded-lg"
            >
              {t('common_profile')}
            </Link>
            <button
              onClick={() => onEnquireClick?.(supplier)}
              className="btn-amber text-xs px-3.5 py-1.5 font-bold whitespace-nowrap cursor-pointer shadow-sm rounded-lg"
            >
              {t('common_enquire')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Featured Variant ───────────────────────────────────────────────────────
  if (variant === 'featured') {
    return (
      <div className="border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[var(--surface)] shadow-premium hover:shadow-premium-lg transition-all overflow-hidden flex flex-col md:flex-row h-full font-sans group">
        <div className="w-full md:w-72 h-48 md:h-auto relative bg-slate-100 dark:bg-slate-800 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
          {renderFactoryPhoto()}

          {supplier.isVerified && (
            <div className="absolute top-2.5 left-2.5 z-20 scale-95 origin-top-left">
              <TrustBadge
                tier={supplier.verificationTier}
                verifiedDate={supplier.verifiedDate}
                expiryDate={supplier.verificationExpiryDate || ''}
                auditorName={supplier.verificationDetails?.auditorId || 'Aartha Auditor'}
                gpsCoordinates={supplier.location.gpsCoordinates || '22.0000° N, 72.0000° E'}
                documentsVerified={supplier.certifications}
                state={['verified_supplier', 'premium_audited', 'business_verified'].includes(supplier.verificationGateState) ? 'active' : 'suspended'}
              />
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="space-y-0.5">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block animate-ping"></span>
                  {t('trust_verified_badge')} · {supplier.sellerType ? supplier.sellerType.replace(/_/g, ' ') : 'Supplier'}
                </div>
                <h3 className="font-bold text-text-primary dark:text-white text-lg leading-tight group-hover:text-amber-600 transition-colors">
                  {supplier.companyName}
                </h3>
              </div>
              <div className="w-36 flex-shrink-0">
                <QualityScore
                  score={supplier.qualityScore.total}
                  breakdown={supplier.qualityScore}
                  showTooltip={true}
                  showBar={true}
                  state={supplier.reviewCount >= 3 ? 'sufficient' : 'insufficient'}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-text-secondary dark:text-slate-300">
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-amber-500" />
                <span>{supplier.location.city}, {supplier.location.state}</span>
              </div>
              <span className="text-text-muted">•</span>
              <span>{t('common_moq')}: <strong>{supplier.moq || '1000 units'}</strong></span>
            </div>

            <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed line-clamp-2">
              {supplier.about}
            </p>

            <div className="flex flex-wrap gap-1 pt-0.5">
              {supplier.certifications.map(cert => (
                <span key={cert} className="badge-verified text-xs uppercase tracking-wider font-bold py-0.5 px-1.5">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-black/5 dark:border-white/10 w-full">
            <div className="flex items-center gap-4 text-xs text-text-secondary dark:text-slate-300">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs uppercase tracking-wider font-bold">{t('common_response')}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs mt-0.5">
                  <Clock size={11} /> {supplier.avgResponseTimeHours ? `<${Math.ceil(supplier.avgResponseTimeHours)} hrs` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href={`/suppliers/${supplier.slug}`}
                className="flex-1 sm:flex-none btn-outline text-xs px-4 py-2 font-bold text-center no-underline rounded-lg"
              >
                {t('common_view_profile')}
              </Link>
              <button
                onClick={() => onEnquireClick?.(supplier)}
                className="flex-1 sm:flex-none btn-amber text-xs px-4 py-2 font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md rounded-lg"
              >
                {t('common_enquire')} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Compare Variant ────────────────────────────────────────────────────────
  if (variant === 'compare') {
    return (
      <div className="border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[var(--surface)] p-3.5 flex flex-col gap-2.5 font-sans h-full shadow-sm">
        <div className="relative h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
          {renderFactoryPhoto()}
        </div>

        <div className="space-y-0.5">
          <h4 className="font-bold text-text-primary dark:text-white text-xs leading-snug line-clamp-1">{supplier.companyName}</h4>
          <span className="text-xs text-text-muted dark:text-slate-400 block">{supplier.location.city}, {supplier.location.state}</span>
          <span className="inline-block text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase border border-amber-500/20">
            {supplier.sellerType ? supplier.sellerType.replace(/_/g, ' ') : 'Supplier'}
          </span>
        </div>

        <div className="py-0.5">
          <QualityScore
            score={supplier.qualityScore.total}
            breakdown={supplier.qualityScore}
            showTooltip={false}
            showBar={true}
            state={supplier.reviewCount >= 3 ? 'sufficient' : 'insufficient'}
          />
        </div>

        <div className="flex gap-1.5 pt-2 mt-auto">
          <Link
            href={`/suppliers/${supplier.slug}`}
            className="flex-1 btn-outline text-xs py-1 font-bold text-center no-underline rounded-md"
          >
            {t('common_profile')}
          </Link>
          <button
            onClick={() => onEnquireClick?.(supplier)}
            className="flex-1 btn-amber text-xs py-1 font-bold text-center cursor-pointer shadow-sm rounded-md"
          >
            {t('common_enquire')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
