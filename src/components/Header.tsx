"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, LogOut, User, Sparkles, FileText } from 'lucide-react';
import { useSession, getDashboardPath, getDashboardLabel } from '@/hooks/useSession';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageToggle from '@/components/LanguageToggle';

const navLinks = [
  { label: 'For Buyers', to: '/for-buyers', key: 'nav_for_buyers' as const },
  { label: 'For Suppliers', to: '/for-suppliers', key: 'nav_for_suppliers' as const },
  { label: 'Suppliers Directory', to: '/suppliers', key: 'nav_directory' as const },
  { label: 'Industries', to: '/categories', key: 'nav_industries' as const },
  { label: 'Trust Center', to: '/verified', key: 'nav_trust_center' as const },
  { label: 'Document Intel', to: '/document-intelligence', key: 'nav_doc_intel' as const },
  { label: 'Blog', to: '/blog', key: 'nav_blog' as const },
  { label: 'Ask AI', to: '#', triggerAssistant: true, key: 'nav_ask_ai' as const },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useSession();
  const { t } = useTranslation();

  const isAuthenticated = !loading && user?.authenticated;
  const isActive = (to: string) => pathname === to;

  return (
    <header className="w-full bg-white/85 dark:bg-[var(--surface)]/85 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-black/5 dark:border-white/10 h-[56px] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        <div className="flex items-center justify-between gap-x-4 h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-1 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105 flex items-center justify-center overflow-hidden">
              <img
                src="/brand/aartha-logo.png"
                alt="Aartha Logo"
                className="w-full h-full object-contain dark:invert"
              />
            </div>
            <div>
              <div className="text-navy dark:text-white font-extrabold text-lg leading-none tracking-wider whitespace-nowrap mt-0.5">AARTHA</div>
              <div className="text-amber-500 dark:text-amber-400 text-[10px] sm:text-xs uppercase tracking-wider leading-none font-bold mt-1">Purpose · Wealth · Prosperity</div>
            </div>
          </Link>

          {/* Project 2 Desktop Nav Links */}
          <nav className="hidden xl:flex items-center xl:gap-x-1.5 2xl:gap-x-3">
            {navLinks.map((link) => 
              link.triggerAssistant ? (
                <button
                  key={link.label}
                  onClick={() => window.dispatchEvent(new CustomEvent('artha-toggle-ai-assistant'))}
                  className="inline-flex items-center gap-1 text-xs 2xl:text-sm uppercase tracking-wider font-bold transition-all px-2 py-1.5 rounded-lg text-text-secondary dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles size={13} className="text-amber-500 animate-pulse" />
                  {t(link.key)}
                </button>
              ) : (
                <Link
                  key={link.to}
                  href={link.to}
                  prefetch={false}
                  className={`text-xs 2xl:text-sm uppercase tracking-wider font-bold transition-all px-2 py-1.5 rounded-lg whitespace-nowrap ${
                    isActive(link.to)
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-extrabold'
                      : 'text-text-secondary dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {t(link.key)}
                </Link>
              )
            )}
          </nav>

          {/* User Actions + Highlighted Color-Graded RFQ Button */}
          <div className="hidden xl:flex items-center xl:gap-x-2 2xl:gap-x-3">
            {isAuthenticated ? (
              <div className="relative flex items-center min-w-0 w-[150px] xl:w-[170px] 2xl:w-[210px]">
                <Link 
                  href={getDashboardPath(user?.role)}
                  className={`text-xs font-bold flex items-center gap-1.5 w-full pl-2.5 pr-[68px] py-1.5 rounded-lg no-underline transition-all hover:scale-[1.01] overflow-hidden ${
                    user?.role === 'admin'
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400'
                      : 'bg-gold/10 hover:bg-gold/25 border border-gold/30 hover:border-gold/60 text-navy dark:text-slate-200'
                  }`}
                  title={user?.role === 'admin' ? 'Go to Admin Control Panel' : user?.role === 'supplier' ? 'Go to Supplier Desk' : 'Go to Sourcing Dashboard'}
                >
                  {user?.role === 'admin' ? (
                    <Shield size={12} className="flex-shrink-0 text-amber-500" />
                  ) : (
                    <User size={12} className="flex-shrink-0 text-gold" />
                  )}
                  <span className="truncate">{getDashboardLabel(user)}</span>
                </Link>
                <button
                  onClick={logout}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-text-secondary hover:text-red-600 transition-all duration-200 pl-1.5 pr-1.5 py-0.5 rounded-md bg-white dark:bg-navy shadow-3xs border border-black/5 dark:border-white/10"
                >
                  <LogOut size={10} />
                  {t('nav_signout')}
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                 className="text-xs uppercase tracking-wider font-bold text-navy dark:text-slate-200 px-3.5 py-2 rounded-xl border border-navy/15 dark:border-white/10 hover:border-navy/35 dark:hover:border-white/30 bg-black/2 dark:bg-white/2 hover:bg-black/5 dark:hover:bg-white/5 transition-all whitespace-nowrap hover:scale-[1.02] shadow-3xs"
              >
                {t('nav_signin')}
              </Link>
            )}

            {/* High-Impact Color-Graded Highlighted RFQ Button */}
            <Link
              href="/rfq"
              className="relative group overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-[0_2px_12px_rgba(217,119,6,0.4)] hover:shadow-[0_4px_20px_rgba(217,119,6,0.65)] border border-amber-300/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5 select-none whitespace-nowrap"
            >
              {/* Subtle shimmer sheen */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <FileText size={14} className="text-white drop-shadow-sm flex-shrink-0" />
              <span>{t('nav_post_rfq')}</span>
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="xl:hidden flex items-center gap-2">
            <button
              className="p-2 text-text-primary dark:text-white cursor-pointer rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-[56px] left-0 right-0 bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 shadow-xl z-45 animate-fadeIn">
          <div className="px-4 py-4 space-y-1.5">
            {navLinks.map((link) => 
              link.triggerAssistant ? (
                <button
                  key={link.label}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('artha-toggle-ai-assistant'));
                  }}
                  className="w-full text-left flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors text-amber-600 dark:text-amber-400 bg-amber-500/10 cursor-pointer"
                >
                  <Sparkles size={14} />
                  {t(link.key)}
                </button>
              ) : (
                <Link
                  key={link.to}
                  href={link.to}
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                    isActive(link.to) ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10' : 'text-text-secondary dark:text-slate-300 hover:text-navy hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {t(link.key)}
                </Link>
              )
            )}
            <div className="pt-3 flex flex-col gap-2 border-t border-black/5 dark:border-white/10 mt-2">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs font-semibold text-text-secondary dark:text-slate-400">Language:</span>
                <LanguageToggle className="bg-slate-800 text-white" />
              </div>
              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardPath(user?.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 text-center py-2.5 px-3 rounded-lg text-xs font-bold text-navy dark:text-white bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 w-full"
                  >
                    {user?.role === 'admin' ? <Shield size={14} className="text-amber-500" /> : <User size={14} />}
                    {getDashboardLabel(user)}
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-1.5 text-center py-2.5 px-3 rounded-lg text-xs font-bold text-red-600 border border-red-500/20 hover:bg-red-500/10 cursor-pointer w-full"
                  >
                    <LogOut size={14} />
                    {t('nav_signout')}
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 px-3 rounded-lg text-xs font-bold text-text-secondary dark:text-slate-300 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {t('nav_signin')}
                </Link>
              )}
              <Link
                href="/rfq"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md text-center flex items-center justify-center gap-1.5"
              >
                <FileText size={14} />
                {t('nav_post_rfq')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
