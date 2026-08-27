'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function TermsOfServicePage() {
  const { lang } = useTranslation();
  const isGu = lang === 'gu';

  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen pb-12">
      {/* Header */}
      <section className="bg-navy text-white py-10 px-4 border-b border-border-default/10">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 bg-gold/15 text-gold text-[9px] font-bold px-2.5 py-0.5 rounded border border-gold/10 uppercase tracking-wider">
            <ShieldCheck size={10} /> Operating Agreement
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide">Terms of Service</h1>
          <p className="text-gold text-xs font-semibold uppercase tracking-wider">
            {isGu ? 'પ્લેટફોર્મ વપરાશકર્તા કરાર' : 'B2B Sourcing Operating Rules & Audit Terms'}
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
          <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Last Updated: July 14, 2026</p>
          
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">1. Platform Eligibility</h2>
            <p>
              Aartha is a strict business-to-business (B2B) trade platform. To register as a buyer or supplier:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>You must possess a valid, registered business entity.</li>
              <li>You must use a verified company email domain. Free email accounts (such as Gmail, Yahoo, etc.) are strictly blocked from listing or quoting.</li>
              <li>Suppliers must undergo physical site inspections by the Aartha Audit Commission to achieve listed status.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">2. Physical Inspection Audits</h2>
            <p>
              By applying for listing via the "Get Listed" gateway, manufacturers agree to schedule a physical audit visit led by our field auditors. The audit checks actual machinery, operational capacity, and GPS geotags. Fake factory listings or spoofed coordinates will result in immediate suspension.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">3. Zero-Spam Policy</h2>
            <p>
              Buyers may only submit genuine RFQs with verified sourcing limits. Suppliers may only quote specifications they are certified to manufacture. System usage is monitored; users who spam multiple unaligned matches will have their trust scores reduced or access suspended.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">4. Limitation of Liability</h2>
            <p>
              While Aartha conducts physical checks and validates GSTIN records, the final negotiation, sample evaluation, and contract completion are the sole responsibility of the trading parties.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
