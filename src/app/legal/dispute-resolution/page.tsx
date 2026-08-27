'use client';

import Link from 'next/link';
import { ArrowLeft, Landmark } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function DisputeResolutionPage() {
  const { lang } = useTranslation();
  const isGu = lang === 'gu';

  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen pb-12">
      {/* Header */}
      <section className="bg-navy text-white py-10 px-4 border-b border-border-default/10">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 bg-gold/15 text-gold text-[9px] font-bold px-2.5 py-0.5 rounded border border-gold/10 uppercase tracking-wider">
            <Landmark size={10} /> Platform Mediation Rules
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide">Dispute Resolution Policy</h1>
          <p className="text-gold text-xs font-semibold uppercase tracking-wider">
            {isGu ? 'વિવાદ નિવારણ અને મધ્યસ્થતા નિયમો' : 'B2B Sourcing Trade Dispute & Mediation Guidelines'}
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
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">1. Sourcing Quality Discrepancies</h2>
            <p>
              Aartha operates a strict dispute desk to address trade contract issues, including cargo specification mismatches, dimensional deviations, and delivery delays.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">2. Dispute Initiation</h2>
            <p>
              Either the buyer or the GIDC manufacturer can raise a dispute directly from their dashboard logs. The case is logged in the public ledger and assigned to an independent platform mediator within 24 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">3. Mediation & Arbitration</h2>
            <p>
              The mediator reviews the physical inspection reports, shipping packing lists, and original contract specifications. The mediation process operates on a 14-day cycle. If unresolved, the case escalates to regional GIDC industrial arbitration councils.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">4. Governance Consequences</h2>
            <p>
              Suppliers found in breach of contract specs face immediate trust score drops, suspension of verified exporter status, and temporary badge revocations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
