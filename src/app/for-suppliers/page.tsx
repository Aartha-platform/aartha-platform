"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, CheckCircle2, Clock, MapPin, Award, ArrowRight, 
  ExternalLink, HelpCircle, Phone, FileText, Check, ChevronDown, Sparkles, Building2
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useTranslation } from '@/hooks/useTranslation';

const steps = [
  { num: 1, title: 'Submit Application', sub: 'आवेदन सबमिट करें', desc: 'Enter GSTIN, IEC export code & plant address.', icon: FileText, badge: 'Step 01' },
  { num: 2, title: 'Document Check', sub: 'दस्तावेज़ सत्यापन', desc: 'Compliance team verifies active GSTIN & IEC status.', icon: ShieldCheck, badge: 'Step 02' },
  { num: 3, title: 'Schedule Visit', sub: 'साइट विज़िट शेड्यूल करें', desc: 'Pick inspection date & time for factory audit.', icon: Clock, badge: 'Step 03' },
  { num: 4, title: 'On-Site GPS Audit', sub: 'भौतिक ऑडिट', desc: 'Auditor inspects plant, machinery & captures GPS logs.', icon: MapPin, badge: 'Step 04' },
  { num: 5, title: 'Verified Publication', sub: 'प्रमाणित लिस्टिंग', desc: 'Badge issued & profile goes live to global buyers.', icon: CheckCircle2, badge: 'Step 05' },
];

const supplierTestimonials: Array<{ quote: string; author: string; location: string }> = [];

const supplierFAQs = [
  { 
    q: 'Is listing on Aartha free?', 
    a: 'Basic directory listings are free after compliance verification. Verified, Export Pro, and Strategic plans represent physical audit, compliance certifications, and premium matchmaking options.',
  },
  { 
    q: 'How long does the verification visit take?', 
    a: 'Audit visits take between 3-5 hours on-site, during which auditors document machinery, GIDC licenses, GST status, and geocode locations.',
  },
  { 
    q: 'Can I pay to rank higher in search results?', 
    a: 'No. Aartha strictly bans paid ranking. Search results are sorted exclusively by dynamic Quality Scores, verified status, and response efficiency.',
  }
];


export default function SuppliersLandingPage() {
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [billingInterval, setBillingInterval] = useState<'yearly' | 'quarterly'>('yearly');

  const pricingPlans = [
    { 
      name: 'Basic Free', 
      price: '₹0', 
      period: 'Forever',
      desc: 'Basic directory listing with standard response tracking.', 
      popular: false,
      features: [
        'GSTIN & IEC verification check',
        'GIDC zone mapping & classification',
        'Basic directory profile page',
        'Standard response tracking',
        'Access 3 incoming RFQs / month'
      ] 
    },
    { 
      name: 'Enhanced Profile', 
      price: billingInterval === 'yearly' ? '₹999' : '₹299', 
      period: billingInterval === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Active GSTIN & bank validation check + self-recorded video walkthrough.', 
      popular: false,
      features: [
        'Active GSTIN & IEC API validation (Tier 1)',
        'Bank account penny drop verification',
        'Self-recorded video walkthrough with AI validation',
        'Enhanced verification badge showing trust status',
        'Access 6 incoming RFQs / month + reply to 4'
      ] 
    },
    { 
      name: 'Verified Supplier', 
      price: billingInterval === 'yearly' ? '₹9,999' : '₹2,999', 
      period: billingInterval === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Document verification and live video walkthrough audit for global buyers.', 
      popular: true,
      features: [
        'Full document verification (Udyam, Trademarks, Licenses)',
        'Scheduled live video walkthrough audit with regional staff',
        'Verification of directors & active GST/IEC licenses',
        'Direct verified supplier badge (Verified Manufacturer/Distributor)',
        'Access 15 RFQs / month + reply to 10'
      ] 
    },
    { 
      name: 'Export Pro', 
      price: billingInterval === 'yearly' ? '₹29,999' : '₹8,999', 
      period: billingInterval === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Unlock export markets with on-site physical GPS audit and active buyer matching.', 
      popular: false,
      features: [
        'On-site physical plant inspection & GPS audit (Gujarat clusters)',
        'AI-driven global buyer match routing',
        'WHO-GMP / ISO standard certificate audits',
        'Auto-translate profile (English, German, French, Arabic)',
        'Access all RFQs with unlimited direct responses'
      ] 
    },
    { 
      name: 'Strategic Partner', 
      price: billingInterval === 'yearly' ? '₹59,999' : '₹17,999', 
      period: billingInterval === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Full white-glove co-marketing and dedicated matching support.', 
      popular: false,
      features: [
        'Dedicated human Account Manager & Trade Desk',
        'Co-marketing & representation at global trade fairs',
        'Direct video introduction calls with targeted buyers',
        'Custom API integration with factory ERP systems',
        'Priority dispute resolution & payment protection'
      ] 
    },
  ];

  return (
    <div className="bg-transparent font-sans min-h-screen text-text-primary pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white py-16 px-4 relative overflow-hidden border-b border-white/10 shadow-premium-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
              <ShieldCheck size={16} />
              <span>For Verified Gujarat Manufacturers</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="type-hero uppercase">
                {t('sup_hero_title')}
              </h1>
              <p className="text-amber-400 text-sm sm:text-base font-bold italic tracking-wide">
                {t('sup_hero_subtitle_in')}
              </p>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {t('sup_hero_desc')}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/get-listed"
                className="btn-amber text-xs font-extrabold uppercase tracking-wider px-8 py-3.5 shadow-lg rounded-xl"
              >
                {t('sup_btn_apply')}
              </Link>
              <WhatsAppButton
                phoneNumber="+91 72084 32138"
                message="Hi! I want to verify and list my factory on Aartha."
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Phone size={14} className="text-amber-400" />
              <span className="font-semibold">{t('sup_vendor_support')}</span>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Manufacturer Onboarding Guarantee</div>
            <ul className="space-y-2 text-xs text-slate-300 pb-3 border-b border-white/10">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <span>Zero middleman commission fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <span>Direct RFQ routing to your director inbox</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <span>Onsite GPS geotagged verification badge</span>
              </li>
            </ul>
            <div className="pt-1 flex flex-col gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span>DPIIT Recognized B2B Marketplace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span>FIEO Member Database Registry Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual 5-Step Onboarding Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Simple 5-Step Process
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
            How Verification Works for Manufacturers
          </h2>
          <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
            From application to verified publication in 5 scannable steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">{s.badge}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wide">{s.title}</h3>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">{s.sub}</span>
                </div>
                <p className="text-[11px] text-text-secondary dark:text-slate-300 leading-normal">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Pricing Cards */}
      <section className="bg-slate-50 dark:bg-[var(--surface)] border-y border-black/5 dark:border-white/10 py-14 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
              Manufacturer Sourcing Tiers
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
              Select a tier matching your business goals. Upgrade or downgrade at any time.
            </p>

            {/* Yearly / Quarterly Toggle */}
            <div className="inline-flex items-center justify-center bg-white dark:bg-navy-dark border border-black/10 dark:border-white/10 p-1.5 rounded-2xl shadow-premium-sm gap-1 mx-auto mt-4">
              <button
                type="button"
                onClick={() => setBillingInterval('yearly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer select-none ${
                  billingInterval === 'yearly'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary dark:text-slate-300'
                }`}
              >
                Yearly Billing
                <span className="ml-1 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md font-extrabold uppercase">Save ~15%</span>
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('quarterly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer select-none ${
                  billingInterval === 'quarterly'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary dark:text-slate-300'
                }`}
              >
                Quarterly Billing
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`bg-white dark:bg-navy-light border rounded-2xl p-5 space-y-5 relative flex flex-col justify-between transition-all duration-200 ${
                  plan.popular 
                    ? 'border-amber-500 shadow-xl ring-1 ring-amber-500/50 scale-[1.02]' 
                    : 'border-black/10 dark:border-white/10 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-500">{plan.price}</span>
                    <span className="text-[10px] text-text-muted dark:text-slate-400 font-semibold">{plan.period}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary dark:text-slate-300 leading-normal">{plan.desc}</p>

                  <ul className="space-y-2 pt-3 border-t border-black/5 dark:border-white/10 text-[11px] leading-snug">
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-text-secondary dark:text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Link
                    href="/get-listed"
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-center block transition-all ${
                      plan.popular
                        ? 'btn-amber shadow-md'
                        : 'border border-black/10 dark:border-white/20 text-navy dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    Select Plan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturer Success Proof Cards */}
      {supplierTestimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
              Gujarat Manufacturer Success Stories
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400">Real verified factory owners from Rajkot, Surat & Vadodara.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supplierTestimonials.map((st, idx) => (
              <div key={idx} className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <p className="text-xs text-text-secondary dark:text-slate-300 italic leading-relaxed">
                  "{st.quote}"
                </p>
                <div className="pt-2 border-t border-black/5 dark:border-white/10">
                  <div className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">{st.author}</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">{st.location}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-text-primary dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-text-muted dark:text-slate-400">Everything manufacturers need to know about physical audits.</p>
        </div>

        <div className="space-y-3">
          {supplierFAQs.map((faq, idx) => (
            <div 
              key={idx}
              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-xl p-4 cursor-pointer space-y-2 transition-all"
            >
              <div className="flex justify-between items-center font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wide">
                <span>{faq.q}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 text-amber-500 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
              </div>
              {openFaqIndex === idx && (
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed pt-2 border-t border-black/5 dark:border-white/10 animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": supplierFAQs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
    </div>
  );
}
