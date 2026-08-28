"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, CheckCircle2, Percent, Lock, Send, 
  Phone, Mail, ArrowUpRight
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageToggle from '@/components/LanguageToggle';

// Minimal Vector Social Icons
const LinkedInSVG = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
  </svg>
);
const TwitterXSVG = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const YouTubeSVG = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const FacebookSVG = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const regionalHubs = [
    { name: t('footer_hub_ahmedabad'), query: 'Ahmedabad' },
    { name: t('footer_hub_surat'), query: 'Surat' },
    { name: t('footer_hub_ankleshwar'), query: 'Ankleshwar' },
    { name: t('footer_hub_morbi'), query: 'Morbi' },
    { name: t('footer_hub_rajkot'), query: 'Rajkot' },
    { name: t('footer_hub_vadodara'), query: 'Vadodara' },
    { name: t('footer_hub_vapi'), query: 'Vapi' },
  ];

  return (
    <footer className="bg-[#070c14] text-slate-400 font-sans border-t border-white/[0.08] relative selection:bg-amber-500/20 selection:text-amber-400">
      
      {/* ── Minimal Trust Pill Strip ───────────────────────────────────────── */}
      <div className="border-b border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block text-xs">{t('footer_assurance_audit_title')}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">{t('footer_assurance_audit_desc')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block text-xs">{t('footer_assurance_gstin_title')}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">{t('footer_assurance_gstin_desc')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Percent size={16} className="text-sky-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block text-xs">{t('footer_assurance_fee_title')}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">{t('footer_assurance_fee_desc')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock size={16} className="text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block text-xs">{t('footer_assurance_trade_title')}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">{t('footer_assurance_trade_desc')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Clean Directory Grid ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          
          {/* Brand & Mission (Span 2) */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 p-1 flex items-center justify-center overflow-hidden">
                <img
                  src="/brand/aartha-logo.png"
                  alt="Aartha Logo"
                  className="w-full h-full object-contain invert"
                />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-white">AARTHA</span>
                <span className="text-[10px] block text-amber-400/90 uppercase tracking-widest font-semibold">Purpose · Wealth · Prosperity</span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer_tagline')}
            </p>

            {/* Live Status & Contact Row */}
            <div className="space-y-2 pt-1">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>{t('footer_status_operational')}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                <a href="tel:+917208432138" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Phone size={12} className="text-amber-400/80" />
                  <span>+91 72084 32138</span>
                </a>
                <a href="mailto:support@aartha.site" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Mail size={12} className="text-amber-400/80" />
                  <span>support@aartha.site</span>
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { label: 'LinkedIn', icon: LinkedInSVG, href: '#' },
                { label: 'X', icon: TwitterXSVG, href: '#' },
                { label: 'YouTube', icon: YouTubeSVG, href: '#' },
                { label: 'Facebook', icon: FacebookSVG, href: '#' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    className="w-7 h-7 rounded-md bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/40 hover:text-amber-400 text-slate-400 flex items-center justify-center transition-all"
                    title={s.label}
                    aria-label={s.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {t('footer_col_platform')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/suppliers" className="hover:text-white transition-colors">{t('footer_link_find_suppliers')}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{t('footer_link_pricing')}</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">{t('footer_link_categories')}</Link></li>
              <li><Link href="/rfq" className="hover:text-white transition-colors">{t('footer_link_rfq')}</Link></li>
              <li><Link href="/get-listed" className="hover:text-white transition-colors">{t('footer_link_get_listed')}</Link></li>
              <li><Link href="/verified" className="hover:text-white transition-colors">{t('footer_link_verified_standard')}</Link></li>
            </ul>
          </div>

          {/* Clusters */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {t('footer_col_clusters')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/suppliers?category=pharma-healthcare" className="hover:text-white transition-colors">{t('cluster_pharma')}</Link></li>
              <li><Link href="/suppliers?category=chemicals-materials" className="hover:text-white transition-colors">{t('cluster_chemicals')}</Link></li>
              <li><Link href="/suppliers?category=home-consumer" className="hover:text-white transition-colors">{t('cluster_ceramics')}</Link></li>
              <li><Link href="/suppliers?category=textiles-apparel" className="hover:text-white transition-colors">{t('cluster_textiles')}</Link></li>
              <li><Link href="/suppliers?category=machinery-industrial" className="hover:text-white transition-colors">{t('cluster_machinery')}</Link></li>
              <li><Link href="/suppliers?category=food-agro" className="hover:text-white transition-colors">{t('cluster_food')}</Link></li>
            </ul>
          </div>

          {/* Solutions & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {t('footer_col_solutions')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/solutions" className="hover:text-white transition-colors">{t('footer_link_sourcing_solutions')}</Link></li>
              <li><Link href="/solutions" className="hover:text-white transition-colors">{t('footer_link_custom_sourcing')}</Link></li>
              <li><Link href="/verified" className="hover:text-white transition-colors">{t('footer_link_trade_assurance')}</Link></li>
              <li><Link href="/document-intelligence" className="hover:text-white transition-colors">{t('footer_link_doc_intel')}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">{t('footer_link_about')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t('footer_link_contact')}</Link></li>
            </ul>
          </div>

          {/* Newsletter / Updates (Span 1) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {t('footer_newsletter_title')}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer_newsletter_desc')}
            </p>

            {subscribed ? (
              <div className="text-xs text-emerald-400 font-medium py-1">
                {t('footer_newsletter_subscribed')}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-1.5 pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer_newsletter_placeholder')}
                  required
                  className="w-full min-w-0 bg-white/[0.04] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-2.5 py-1.5 rounded-md transition-colors font-bold text-xs flex-shrink-0 cursor-pointer"
                  title={t('footer_newsletter_btn')}
                >
                  <Send size={12} />
                </button>
              </form>
            )}

            <div className="pt-2 text-xs space-y-1.5">
              <div><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">{t('footer_link_blog')}</Link></div>
              <div><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">{t('footer_link_help_center')}</Link></div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Minimal Compliance & Trust Seals Row ───────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-white/[0.01] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium">
          <span>{t('footer_seal_iso')}</span>
          <span className="text-white/20">·</span>
          <span>{t('footer_seal_gstin')}</span>
          <span className="text-white/20">·</span>
          <span>{t('footer_seal_iec')}</span>
          <span className="text-white/20">·</span>
          <span>{t('footer_seal_ssl')}</span>
        </div>
      </div>

      {/* ── Sleek Bottom Bar ────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-[#05080e] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          
          <div className="text-[11px] text-slate-400">
            {t('footer_copyright')}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <Link href="/legal/privacy-policy" className="hover:text-slate-200 transition-colors">{t('footer_link_privacy')}</Link>
            <Link href="/legal/terms-of-service" className="hover:text-slate-200 transition-colors">{t('footer_link_terms')}</Link>
            <Link href="/legal/cookie-policy" className="hover:text-slate-200 transition-colors">{t('footer_link_cookies')}</Link>
            <Link href="/legal/dispute-resolution" className="hover:text-slate-200 transition-colors">{t('footer_link_dispute')}</Link>
            <Link href="/sitemap.xml" className="hover:text-slate-200 transition-colors">{t('footer_link_sitemap')}</Link>
          </div>

        </div>
      </div>

    </footer>
  );
}
