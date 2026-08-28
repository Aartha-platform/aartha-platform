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
  { num: 3, title: 'Schedule Review', sub: 'सत्यापन समीक्षा', desc: 'Authentication of manufacturing capacity & licenses.', icon: Clock, badge: 'Step 03' },
  { num: 4, title: 'Quality Scoring', sub: 'गुणवत्ता स्कोर', desc: 'Evaluation of product verticals & export standards.', icon: Award, badge: 'Step 04' },
  { num: 5, title: 'Verified Listing', sub: 'प्रमाणित लिस्टिंग', desc: 'Badge issued & profile goes live to global buyers.', icon: CheckCircle2, badge: 'Step 05' },
];

const supplierFAQs = [
  { 
    q: 'Is listing on Aartha free for manufacturers?', 
    a: 'Yes. Listing your factory and submitting your business documents for verification onboarding is completely free during our launch phase.',
  },
  { 
    q: 'How does Aartha verify my manufacturing company?', 
    a: 'Our compliance team validates your GSTIN, Import Export Code (IEC), and manufacturing credentials against official government databases.',
  },
  { 
    q: 'Can I pay to rank higher in search results?', 
    a: 'No. Aartha strictly bans paid ranking. Search results and RFQ matching are governed exclusively by verified status, capacity relevance, and response speed.',
  }
];

export default function SuppliersLandingPage() {
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const pricingPlans = [
    { 
      name: 'Join Aartha', 
      price: '₹0', 
      period: 'Forever',
      desc: 'Create your factory profile, upload business documentation, and begin onboarding.', 
      popular: false,
      isWaitlist: false,
      buttonText: 'Start Free Listing',
      buttonHref: '/get-listed',
      features: [
        'Factory profile & industry classification',
        'GSTIN & IEC document submission',
        'Basic supplier dashboard access',
        'Application status tracking',
        'Standard email support'
      ] 
    },
    { 
      name: 'Verified Supplier', 
      price: 'Free Review', 
      period: 'For Early Factories',
      desc: 'Get discovered by international & domestic buyers with an official Aartha Verified Badge.', 
      popular: true,
      isWaitlist: false,
      buttonText: 'Apply for Verification',
      buttonHref: '/get-listed',
      features: [
        'Earned Aartha Verified Supplier Badge',
        'Public directory active listing',
        'Direct buyer enquiry routing',
        'RFQ matching algorithm eligibility',
        'Direct buyer contact desk access'
      ] 
    },
    { 
      name: 'Priority Growth', 
      price: 'Coming Soon', 
      period: 'Marketplace Phase',
      desc: 'Advanced visibility, priority RFQ routing, and dedicated trade desk representation.', 
      popular: false,
      isWaitlist: true,
      buttonText: 'Join Waitlist',
      buttonHref: '/contact?subject=Priority+Supplier+Waitlist',
      features: [
        'Top-tier corridor search visibility',
        'Priority RFQ matching distribution',
        'Dedicated Trade Desk coordinator',
        'Multi-category product showcases',
        'Early access to export initiatives'
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
              <span>For Verified Indian Manufacturers</span>
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
                <span>GSTIN & IEC verified business trust badge</span>
              </li>
            </ul>
            <div className="pt-1 flex flex-col gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span>DPIIT Recognized B2B Marketplace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span>Direct Verified Matchmaking Engine</span>
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
              Manufacturer Sourcing Tiers
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
              Transparent, grounded manufacturer listing options. Built for real trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`bg-white dark:bg-navy-light border rounded-2xl p-6 space-y-6 relative flex flex-col justify-between transition-all duration-200 ${
                  plan.popular 
                    ? 'border-amber-500 shadow-xl ring-2 ring-amber-500/25 scale-[1.02]' 
                    : 'border-black/10 dark:border-white/10 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-text-primary dark:text-white uppercase tracking-wider">{plan.name}</h3>
                      {plan.isWaitlist && (
                        <span className="text-[9px] font-bold uppercase bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                          Waitlist
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary dark:text-slate-300 leading-normal min-h-[32px]">{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5 py-2 border-y border-black/5 dark:border-white/10">
                    <span className="text-2xl sm:text-3xl font-black text-amber-500">{plan.price}</span>
                    <span className="text-[11px] text-text-muted dark:text-slate-400 font-bold uppercase tracking-wider">/ {plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 pt-2 text-xs leading-snug">
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-text-secondary dark:text-slate-300">
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Link
                    href={plan.buttonHref}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center block transition-all ${
                      plan.popular
                        ? 'btn-amber shadow-md'
                        : 'border border-black/15 dark:border-white/20 text-navy dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-text-primary dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-text-muted dark:text-slate-400">Everything manufacturers need to know about listing and verification.</p>
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
    </div>
  );
}
