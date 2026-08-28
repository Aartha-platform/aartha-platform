"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Sparkles, Building2, Globe, HelpCircle, ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PricingPage() {
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<'buyer' | 'supplier'>('supplier');

  // Honest Supplier Tiers (3)
  const supplierTiers = [
    {
      name: 'Join Aartha',
      price: '₹0',
      period: 'Forever',
      desc: 'Create your factory profile, upload business documentation, and begin onboarding.',
      buttonText: 'Start Free Listing',
      buttonHref: '/get-listed',
      popular: false,
      isWaitlist: false,
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
      buttonText: 'Apply for Verification',
      buttonHref: '/get-listed',
      popular: true,
      isWaitlist: false,
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
      buttonText: 'Join Waitlist',
      buttonHref: '/contact?subject=Priority+Supplier+Waitlist',
      popular: false,
      isWaitlist: true,
      features: [
        'Top-tier corridor search visibility',
        'Priority RFQ matching distribution',
        'Dedicated Trade Desk coordinator',
        'Multi-category product showcases',
        'Early access to export initiatives'
      ]
    }
  ];

  // Honest Buyer Tiers (2)
  const buyerTiers = [
    {
      name: 'Free Sourcing',
      price: '$0',
      period: 'Forever',
      desc: 'Search verified factories, inspect compliance credentials, and submit manufacturing RFQs.',
      buttonText: 'Start Sourcing Free',
      buttonHref: '/rfq',
      popular: true,
      isWaitlist: false,
      features: [
        'Full access to verified supplier directory',
        'Submit manufacturing & sourcing RFQs',
        'Direct communication with verified suppliers',
        'Document dossier & certificate inspection',
        'Standard response turnaround'
      ]
    },
    {
      name: 'Enterprise Sourcing',
      price: 'Custom',
      period: 'Tailored',
      desc: 'Dedicated sourcing coordination, custom audit requests, and high-volume RFQ management.',
      buttonText: 'Talk to Trade Desk',
      buttonHref: '/contact?subject=Enterprise+Sourcing',
      popular: false,
      isWaitlist: false,
      features: [
        'Dedicated human sourcing coordinator',
        'Custom factory inspection coordination',
        'High-volume multi-category RFQ routing',
        'Supplier background compliance validation',
        'Priority trade support desk'
      ]
    }
  ];

  // FAQs by Role
  const buyerFAQs = [
    { q: 'Is it completely free to search and contact suppliers?', a: 'Yes. Global buyers can search the entire verified manufacturer database, inspect compliance credentials, and submit RFQs for free.' },
    { q: 'How does Aartha verify manufacturers?', a: 'Every supplier profile is verified against official government registries (GSTIN, IEC) and verified business documents before receiving a Verified Badge.' },
    { q: 'How do I request custom sourcing assistance?', a: 'You can submit an RFQ directly on our platform or contact our Sourcing Desk via WhatsApp or email for custom procurement coordination.' }
  ];

  const supplierFAQs = [
    { q: 'Does listing my factory cost anything?', a: 'No. Listing your manufacturing business and submitting your verification documents is completely free during our launch phase.' },
    { q: 'How do buyers find my factory?', a: 'Once verified, your profile appears in our public directory and is automatically matched with incoming buyer RFQs in your category.' },
    { q: 'How does Aartha differ from lead-selling directories?', a: 'Unlike directories that sell one lead to dozens of competitors, Aartha routes genuine buyer RFQs directly to verified, capacity-matched manufacturers without spam.' }
  ];

  const activeFAQs = userRole === 'buyer' ? buyerFAQs : supplierFAQs;

  return (
    <div className="bg-slate-50 dark:bg-navy-dark min-h-screen text-text-primary font-sans pb-20">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white py-16 px-4 text-center relative overflow-hidden border-b border-white/10 shadow-premium-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
            <Sparkles size={14} className="animate-pulse" />
            <span>Transparent & Grounded Partnership</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Clear, Value-Driven Access
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Direct, verified manufacturing infrastructure for global buyers and Indian factories. Zero hidden fees.
          </p>

          {/* Role selector tab */}
          <div className="inline-flex bg-white/5 border border-white/10 p-1.5 rounded-2xl shadow-premium-lg gap-1 mx-auto mt-4">
            <button
              onClick={() => setUserRole('supplier')}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer select-none ${
                userRole === 'supplier'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 size={14} />
              I am a Manufacturer
            </button>
            <button
              onClick={() => setUserRole('buyer')}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer select-none ${
                userRole === 'buyer'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe size={14} />
              I am a Buyer
            </button>
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Golden Trust Rule Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 max-w-4xl mx-auto flex items-center gap-3.5 text-left shadow-sm">
          <div className="bg-amber-500 text-white p-2.5 rounded-xl flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Core Trust Guarantee: Verification is strictly earned, never bought.
            </div>
            <div className="text-xs text-text-secondary dark:text-slate-300 mt-0.5 leading-relaxed">
              Aartha Verification Badges are strictly granted through validated government registries (GSTIN/IEC) and document authentication. Paid or priority features never buy verification status or alter quality scores.
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 gap-6 items-stretch max-w-5xl mx-auto ${
          userRole === 'buyer' ? 'md:grid-cols-2' : 'md:grid-cols-3'
        }`}>
          {(userRole === 'buyer' ? buyerTiers : supplierTiers).map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-navy border rounded-2xl p-6 space-y-6 relative flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? 'border-amber-500 shadow-xl ring-2 ring-amber-500/25 scale-[1.02]'
                  : 'border-black/15 dark:border-white/15 shadow-sm'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                  Recommended
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
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-text-secondary dark:text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5">
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
      </section>

      {/* Feature comparison table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
            Plan Feature Overview
          </h2>
          <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
            Review capabilities and workflows side-by-side.
          </p>
        </div>

        <div className="bg-white dark:bg-navy border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-light text-text-secondary dark:text-slate-300 font-extrabold uppercase tracking-wider border-b border-black/10 dark:border-white/10">
                  <th className="p-4 w-1/3">Feature</th>
                  {userRole === 'buyer' ? (
                    <>
                      <th className="p-4">Free Sourcing</th>
                      <th className="p-4">Enterprise</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4">Join Aartha</th>
                      <th className="p-4">Verified Supplier</th>
                      <th className="p-4">Priority Growth</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10 text-text-secondary dark:text-slate-300 font-semibold">
                {userRole === 'buyer' ? (
                  <>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">RFQ Submissions</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Included (Priority Routing)</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Directory & Badge Access</td>
                      <td className="p-4">Full Access</td>
                      <td className="p-4">Full Access</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Sourcing Support</td>
                      <td className="p-4">Self-Service + Chat</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Dedicated Coordinator</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Factory Listing</td>
                      <td className="p-4">Standard Profile</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Verified Directory Profile</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Priority Featured Profile</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Verification Status</td>
                      <td className="p-4">Under Review</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Official Verified Badge</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Official Verified Badge</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">RFQ Matching</td>
                      <td className="p-4">Standard</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Active Matching</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Priority Distribution</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-1">
          <HelpCircle size={32} className="text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-text-muted dark:text-slate-400">Common questions regarding verification, listings, and sourcing.</p>
        </div>

        <div className="space-y-4">
          {activeFAQs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-navy border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-2">
              <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                {faq.q}
              </h3>
              <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed pl-3.5 border-l border-amber-500/30">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="bg-gradient-to-r from-navy via-navy-light to-navy-dark rounded-3xl p-8 text-white relative overflow-hidden text-center space-y-4 border border-white/10 shadow-premium-lg">
          <div className="absolute inset-0 bg-gold/5 mix-blend-overlay pointer-events-none"></div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide">Ready to Join India's Verified Manufacturing Network?</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Get started today to list your factory or submit a sourcing RFQ. Zero credit card or listing fees needed.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/get-listed"
              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase tracking-wider text-xs px-8 py-3.5 rounded-xl shadow-md transition-colors"
            >
              List Your Factory
            </Link>
            <Link
              href="/rfq"
              className="border border-white/20 hover:bg-white/5 font-extrabold uppercase tracking-wider text-xs px-8 py-3.5 rounded-xl transition-all"
            >
              Submit an RFQ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
