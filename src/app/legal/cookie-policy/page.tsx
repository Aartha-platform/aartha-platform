'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function CookiePolicyPage() {
  const { lang } = useTranslation();
  const isGu = lang === 'gu';

  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen pb-12">
      {/* Header */}
      <section className="bg-navy text-white py-10 px-4 border-b border-border-default/10">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 bg-gold/15 text-gold text-[9px] font-bold px-2.5 py-0.5 rounded border border-gold/10 uppercase tracking-wider">
            <Shield size={10} /> Cookies & Session Policy
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide">Cookie Policy</h1>
          <p className="text-gold text-xs font-semibold uppercase tracking-wider">
            {isGu ? 'કૂકીઝ અને ડેટા ઉપયોગ નીતિ' : 'Standard Session Tracking & Browser Storage Policy'}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-navy-light uppercase tracking-wider transition-colors no-underline">
            <ArrowLeft size={12} /> {isGu ? 'મુખ્ય પૃષ્ઠ' : 'Back to Home'}
          </Link>
        </div>

        <div className="bg-white border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs text-xs text-text-secondary leading-relaxed font-medium">
          <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Last Updated: July 17, 2026</p>
          
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">1. Use of Local Storage & Cookies</h2>
            <p>
              The Aartha platform uses cookies and local storage parameters strictly to maintain operational session data and user-authenticated states. We do not run third-party advertising cookies or cross-site tracking systems.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">2. Essential Cookies</h2>
            <p>
              These are required for basic platform functionality:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>Authorization Token:</strong> Secure HTTPS-only token that tracks your logged-in session.</li>
              <li><strong>Language preference:</strong> Remembers your chosen locale (English, Hindi, or Gujarati).</li>
              <li><strong>Workspace Preferences:</strong> Stores dashboard navigation states and active tab selections.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">3. Policy Controls</h2>
            <p>
              You can instruct your web browser to reject all cookies, or indicate when a cookie is being sent. However, disabling essential cookies will prevent successful login and dashboard access in the sourcing control center.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
