'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PrivacyPolicyPage() {
  const { lang } = useTranslation();
  const isGu = lang === 'gu';

  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen pb-12">
      {/* Header */}
      <section className="bg-navy text-white py-10 px-4 border-b border-border-default/10">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 bg-gold/15 text-gold text-[9px] font-bold px-2.5 py-0.5 rounded border border-gold/10 uppercase tracking-wider">
            <Lock size={10} /> Secure Dossier Policy
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide">Privacy Policy</h1>
          <p className="text-gold text-xs font-semibold uppercase tracking-wider">
            {isGu ? 'ડેટા પ્રોટેક્શન અને સિક્યોરિટી નિયમો' : 'B2B Dossier Privacy & Data Encryption'}
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
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">1. Information Collection</h2>
            <p>
              We collect information to verify the identity and credentials of B2B traders. This includes:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Company name, business email domain, and registered address.</li>
              <li>GSTIN registration logs (for India-based manufacturers) and Import Export Code (IEC) status.</li>
              <li>Physical GPS coordinates captured by our site auditors during field visits.</li>
              <li>Consents and environmental licenses issued by GPCB (Gujarat Pollution Control Board).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">2. How We Use Your Data</h2>
            <p>
              Your data is exclusively processed to enable verified business matchmaking:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>To compute and compute the live Quality Score displayed on supplier directories.</li>
              <li>To verify purchasing authority limits for global buyers.</li>
              <li>To route relevant RFQs and quotations between matched parties.</li>
            </ul>
            <p className="mt-1">
              We never sell your contact details or directory rankings. We do not display ads or track your cross-site browsing behavior.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">3. Information Sharing</h2>
            <p>
              Dossier details (such as masked GSTIN, factory photos, and audit logs) are only visible to pre-verified buyers. Full certifications and audit reports are only shared upon direct authorization.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">4. Data Security</h2>
            <p>
              All data is encrypted in transit and at rest using industry-standard protocols. Verification files are stored securely inside our sandboxed environment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
