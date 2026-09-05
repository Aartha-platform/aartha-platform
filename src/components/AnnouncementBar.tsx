"use client";

import Link from 'next/link';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

export default function AnnouncementBar() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#0a1020] text-white text-[11px] h-[36px] flex items-center border-b border-white/10 relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 xl:px-8 w-full flex items-center justify-between">
        {/* Left Side Trust Banner */}
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck size={14} className="text-amber-400 flex-shrink-0" />
          <span className="whitespace-nowrap text-slate-200 text-[11px] sm:text-xs">
            {t('announcement_trust_banner')}
          </span>
        </div>

        {/* Right Side Utility Links & Language Switcher */}
        <div className="hidden md:flex items-center gap-4 text-slate-300 text-[11px]">
          <Link 
            href="/about" 
            className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            <HelpCircle size={12} className="text-amber-400/80" />
            {t('nav_help_center')}
          </Link>

          <span className="text-white/20">|</span>

          <Link 
            href="/blog" 
            className="hover:text-white transition-colors font-semibold"
          >
            {t('nav_resources')}
          </Link>
        </div>
      </div>
    </div>
  );
}
