"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, MapPin, Search, ArrowRight, Star, Clock, AlertTriangle, 
  FileText, CheckCircle2, Lock, ExternalLink, Settings, Zap, FlaskConical, 
  Shirt, Package, Wheat, Pill, Home as HomeIcon, ChevronRight, Sparkles,
  Layers, Building2 
} from 'lucide-react';
import { suppliers } from '@/data/suppliers';
import { Supplier } from '@/types';
import SupplierCard from '@/components/SupplierCard';
import SearchBar from '@/components/SearchBar';
import GlobalBuyerMap from '@/components/GlobalBuyerMap';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useTranslation } from '@/hooks/useTranslation';

const homeTestimonials: Array<{ quote: string; author: string; role: string }> = [];

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [supplierList, setSupplierList] = useState<Supplier[]>(suppliers);

  useEffect(() => {
    fetch('/api/suppliers')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.suppliers && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
          setSupplierList(data.suppliers);
        }
      })
      .catch(() => {});
  }, []);

  const verifiedSuppliers = supplierList.filter((s) => s.isVerified).slice(0, 3);

  const trustStats = [
    { label: t('home_stat_model_label'), value: t('home_stat_model_val') },
    { label: t('home_stat_hubs_label'), value: t('home_stat_hubs_val') },
    { label: t('home_stat_time_label'), value: t('home_stat_time_val') },
    { label: t('home_stat_broker_label'), value: t('home_stat_broker_val') },
  ];

  const visualSourcingSteps = [
    {
      step: '01',
      title: t('home_step1_title'),
      subtitle: t('home_step1_subtitle'),
      badge: t('home_step1_badge'),
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: FileText,
      iconBg: 'bg-amber-500/15 text-amber-500',
      points: [t('home_step1_pt1'), t('home_step1_pt2')],
      actionLabel: t('home_step1_btn'),
      actionHref: '/rfq',
    },
    {
      step: '02',
      title: t('home_step2_title'),
      subtitle: t('home_step2_subtitle'),
      badge: t('home_step2_badge'),
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/15 text-emerald-500',
      points: [t('home_step2_pt1'), t('home_step2_pt2')],
      actionLabel: t('home_step2_btn'),
      actionHref: '/verified',
    },
    {
      step: '03',
      title: t('home_step3_title'),
      subtitle: t('home_step3_subtitle'),
      badge: t('home_step3_badge'),
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: Layers,
      iconBg: 'bg-blue-500/15 text-blue-500',
      points: [t('home_step3_pt1'), t('home_step3_pt2')],
      actionLabel: t('home_step3_btn'),
      actionHref: '/suppliers',
    },
    {
      step: '04',
      title: t('home_step4_title'),
      subtitle: t('home_step4_subtitle'),
      badge: t('home_step4_badge'),
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      icon: Building2,
      iconBg: 'bg-yellow-500/15 text-yellow-500',
      points: [t('home_step4_pt1'), t('home_step4_pt2')],
      actionLabel: t('home_step4_btn'),
      actionHref: '/get-listed',
    },
  ];

  const homeClusters = [
    { id: 'pharma-healthcare', name: t('cluster_pharma'), icon: Pill, count: undefined as number | undefined, cities: 'Ahmedabad · Vadodara', badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    { id: 'chemicals-materials', name: t('cluster_chemicals'), icon: FlaskConical, count: undefined as number | undefined, cities: 'Ankleshwar · Vatva', badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { id: 'machinery-industrial', name: t('cluster_machinery'), icon: Settings, count: undefined as number | undefined, cities: 'Rajkot · Vadodara', badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    { id: 'textiles-apparel', name: t('cluster_textiles'), icon: Shirt, count: undefined as number | undefined, cities: 'Surat · Ahmedabad', badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { id: 'home-consumer', name: t('cluster_ceramics'), icon: HomeIcon, count: undefined as number | undefined, cities: 'Morbi · Rajkot', badgeColor: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    { id: 'food-agro', name: t('cluster_food'), icon: Wheat, count: undefined as number | undefined, cities: 'Bhavnagar · Anand', badgeColor: 'bg-lime-500/10 text-lime-600 border-lime-500/20' },
  ];

  return (
    <div className="bg-transparent font-sans min-h-screen text-text-primary pb-16 md:pb-0 overflow-x-hidden">
      {/* High-Performance Fast Hero Section */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white py-8 px-4 md:py-10 relative overflow-hidden border-b border-white/10 shadow-premium-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center items-start gap-8 relative z-10">
          <div className="flex-1 space-y-3 text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-amber-400 shadow-sm animate-fade-in-up">
              <ShieldCheck size={13} className="text-amber-400" />
              <span>{t('home_subtitle')}</span>
            </div>

            <h1 className="type-hero-compact animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              {t('home_title_1')}<br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">{t('home_title_2')}</span>
            </h1>

            <p className="text-amber-400/80 text-[11px] sm:text-xs font-medium animate-fade-in-up" style={{ animationDelay: '130ms' }}>
              {t('home_tagline_secondary')}
            </p>

            <p className="text-slate-300/90 text-xs sm:text-sm leading-relaxed max-w-lg animate-fade-in-up" style={{ animationDelay: '180ms' }}>
              {t('home_desc')}
            </p>
            
            {/* Search Bar Container */}
            <div className="max-w-xl animate-fade-in-up" style={{ animationDelay: '230ms' }}>
              <SearchBar
                placeholder={t('home_search_placeholder')}
                onSearch={(query, categoryId) => {
                  const params = new URLSearchParams();
                  if (query) params.set('search', query);
                  if (categoryId) params.set('category', categoryId);
                  router.push(`/suppliers?${params.toString()}`);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] text-slate-300/80 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
              <span className="font-bold uppercase tracking-wider text-amber-400/90 text-[10px]">{t('home_hotline')}</span>
              <a href="tel:+917208432138" className="hover:text-white font-bold transition-colors">+91 72084 32138</a>
              <span className="text-white/15">|</span>
              <a href="https://wa.me/917208432138" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                {t('home_chat')}
              </a>
              <span className="text-white/15">|</span>
              <Link href="/ai-assistant" className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors">
                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                {t('home_ask_ai')}
              </Link>
            </div>
          </div>

          {/* Right Column: Map & Quick Stats */}
          <div className="w-full lg:w-[420px] flex-shrink-0 space-y-3 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            <div className="hidden lg:block">
              <GlobalBuyerMap />
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              {trustStats.map((stat) => (
                <div key={stat.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 space-y-0.5 text-left hover:border-amber-500/25 transition-all">
                  <div className="text-amber-400 type-data font-bold text-lg lg:text-xl tracking-tight">{stat.value}</div>
                  <div className="text-slate-400 text-[10px] lg:text-[11px] uppercase font-bold tracking-wider leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Trust Strip */}
      <div className="bg-white dark:bg-[var(--surface)] border-b border-black/5 dark:border-white/10 py-3.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-text-secondary dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span>{t('home_trust_strip_title')}</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-wider">
              {t('home_trust_strip_hubs')}
            </span>
            <span className="text-black/10 dark:text-white/10">|</span>
            <span>{t('home_trust_strip_tiers')}</span>
            <span className="text-black/10 dark:text-white/10">|</span>
            <span>{t('home_trust_strip_freshness')}</span>
          </div>
        </div>
      </div>

      {/* Minimised Sleek Industry Clusters Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="flex justify-between items-end flex-wrap gap-3 border-b border-black/5 dark:border-white/10 pb-3">
          <div className="space-y-0.5">
            <h2 className="type-h2 text-text-primary dark:text-white">{t('home_clusters_title')}</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">{t('home_clusters_subtitle')}</p>
          </div>
          <Link href="/categories" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 uppercase tracking-wider">
            {t('home_clusters_all')} <ChevronRight size={14} />
          </Link>
        </div>

        {/* Sleek 6-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {homeClusters.map((cluster) => {
            const Icon = cluster.icon;
            return (
              <div 
                key={cluster.id}
                onClick={() => router.push(`/suppliers?category=${cluster.id}`)}
                className="bg-white dark:bg-[var(--surface)] rounded-xl p-3.5 cursor-pointer flex flex-col justify-between group border border-black/10 dark:border-white/10 hover:border-amber-500/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden"
              >
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="bg-amber-500/10 p-2 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200">
                      <Icon size={18} />
                    </div>
                    {cluster.count !== undefined && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${cluster.badgeColor}`}>
                        {cluster.count}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-text-primary dark:text-white uppercase tracking-wide group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {cluster.name}
                    </h3>
                    <p className="text-xs text-text-muted dark:text-slate-400 mt-0.5 font-medium truncate">
                      {cluster.cities}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 mt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between relative z-10">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    {t('home_clusters_explore')} <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verified Previews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="flex justify-between items-end flex-wrap gap-4 border-b border-black/5 dark:border-white/10 pb-3">
          <div className="space-y-0.5">
            <h2 className="type-h2 text-text-primary dark:text-white">{t('home_profiles_title')}</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">{t('home_profiles_subtitle')}</p>
          </div>
          <Link href="/suppliers" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 uppercase tracking-wider">
            {t('home_profiles_browse')} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {verifiedSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              variant="grid"
              onEnquireClick={() => router.push('/rfq')}
            />
          ))}
        </div>
      </section>

      {/* Visual 4-Step Sourcing Corridor Journey */}
      <section className="bg-slate-50/80 dark:bg-[var(--surface)]/80 border-y border-black/5 dark:border-white/10 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {t('home_steps_badge')}
            </span>
            <h2 className="type-h2 text-text-primary dark:text-white">
              {t('home_steps_title')}
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {t('home_steps_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {visualSourcingSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="bg-white dark:bg-navy-light border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-4 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${step.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon size={22} />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${step.badgeColor}`}>
                        {step.badge}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        STEP {step.step}
                      </div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {step.subtitle}
                      </p>
                    </div>

                    {/* Scannable Checkmark Points */}
                    <ul className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                      {step.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 text-xs text-text-secondary dark:text-slate-300 leading-normal">
                          <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action CTA Link */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/10">
                    <Link
                      href={step.actionHref}
                      className="text-xs font-extrabold text-navy dark:text-white hover:text-amber-500 flex items-center justify-between group/btn cursor-pointer"
                    >
                      <span>{step.actionLabel}</span>
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-amber-500" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {homeTestimonials.length > 0 && (
        <section className="py-16 px-4 border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-1.5">
              <h2 className="type-h2 text-text-primary dark:text-white">What Procurement Leaders Say</h2>
              <p className="text-xs text-text-muted dark:text-slate-400">Enterprise buyers from Germany, USA, and UAE who source via the corridor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {homeTestimonials.map((tItem, idx) => (
                <div 
                  key={idx}
                  className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between rounded-xl"
                >
                  <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed italic">
                    "{tItem.quote}"
                  </p>
                  <div className="pt-2 border-t border-black/5 dark:border-white/10">
                    <div className="font-bold text-xs text-text-primary dark:text-white uppercase tracking-wider">{tItem.author}</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">{tItem.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dual CTA */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark py-16 px-4 text-white border-t border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <h2 className="type-h2 text-amber-400">{t('home_cta_title')}</h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            {t('home_cta_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-1">
            <Link
              href="/rfq"
              className="btn-amber text-xs font-bold uppercase tracking-wider px-7 py-3 shadow-lg rounded-xl"
            >
              {t('home_cta_btn_rfq')}
            </Link>
            <Link
              href="/get-listed"
              className="border-[1.5px] border-white/40 text-white hover:bg-white hover:text-navy hover:border-white text-xs font-bold uppercase tracking-wider px-7 py-3 rounded-xl transition-all duration-200 shadow-sm"
            >
              {t('home_cta_btn_supplier')}
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Mobile RFQ Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-xl border-t border-black/10 dark:border-white/10 shadow-2xl p-3 md:hidden flex justify-between items-center gap-2">
        <div className="flex flex-col text-left">
          <span className="text-xs text-text-muted dark:text-slate-400 uppercase font-bold tracking-wider">{t('home_mobile_fast_sourcing')}</span>
          <span className="text-xs font-bold text-navy dark:text-white">{t('home_mobile_get_quotes')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <WhatsAppButton
            phoneNumber="+91 72084 32138"
            message="Hi Aartha, I want to source materials."
            label={t('home_mobile_chat')}
            className="h-9"
          />
          <Link
            href="/rfq"
            className="btn-amber text-xs font-bold uppercase tracking-wider px-4 py-2 shadow-md rounded-lg"
          >
            {t('home_mobile_submit_rfq')}
          </Link>
        </div>
      </div>
    </div>
  );
}
