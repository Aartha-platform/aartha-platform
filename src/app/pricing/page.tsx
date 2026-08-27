"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Star, Sparkles, Building2, Globe, FileText, Lock, Users, HelpCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PricingPage() {
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<'buyer' | 'supplier'>('buyer');
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly_quarterly'>('yearly');

  // Supplier Tiers
  const supplierTiers = [
    {
      name: 'Basic Free',
      price: '₹0',
      period: 'Forever',
      desc: 'Basic directory listing to establish your online presence in GIDC clusters.',
      buttonText: 'List My Factory',
      popular: false,
      features: [
        'GSTIN & IEC registration verification',
        'Basic directory profile page',
        'GIDC zone mapping & classification',
        'Standard response tracking',
        'View 3 incoming RFQs / month'
      ]
    },
    {
      name: 'Enhanced Profile',
      price: billingCycle === 'yearly' ? '₹999' : '₹299',
      period: billingCycle === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Active GSTIN & bank penny-drop validation fee + self-recorded video walkthrough review.',
      buttonText: 'Apply for Enhanced Review',
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
      name: 'Verification Review (Tier 3)',
      price: billingCycle === 'yearly' ? '₹9,999' : '₹2,999',
      period: billingCycle === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Covers manual document authentication and scheduled live facility video audit.',
      buttonText: 'Apply for Verification',
      popular: true,
      features: [
        'Full document verification (Udyam, Trademarks, Licenses)',
        'Scheduled live video walkthrough audit with regional staff',
        'Verification of directors & active GST/IEC licenses',
        'Earned verified supplier badge (when credentials pass)',
        'Access 15 RFQs / month + reply to 10'
      ]
    },
    {
      name: 'Export Pro (Physical Audit)',
      price: billingCycle === 'yearly' ? '₹29,999' : '₹8,999',
      period: billingCycle === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Covers on-site physical GPS plant inspection and continuous compliance monitoring.',
      buttonText: 'Apply for Plant Audit',
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
      price: billingCycle === 'yearly' ? '₹59,999' : '₹17,999',
      period: billingCycle === 'yearly' ? '/ year' : '/ quarter',
      desc: 'Full-service co-marketing representation and custom integration.',
      buttonText: 'Become Partner',
      popular: false,
      features: [
        'Dedicated human Account Manager & Trade Desk representative',
        'Co-marketing & direct representation at global trade fairs',
        'Direct video introduction calls with verified buyers',
        'Custom API integration with factory ERP systems',
        'Priority dispute resolution & trade assurance protection'
      ]
    }
  ];

  // Buyer Tiers
  const buyerTiers = [
    {
      name: 'Free Sourcing',
      price: '$0',
      period: 'Forever',
      desc: 'Search directories, view verified tags, and submit basic inquiries.',
      buttonText: 'Start Sourcing',
      popular: false,
      features: [
        'Full access to verified supplier directory',
        'Submit up to 3 RFQs / month',
        'Basic 2-supplier side-by-side comparison',
        'View supplier geolocated GPS trust scores',
        'Email support (48-hour response time)'
      ]
    },
    {
      name: 'Sourcing Pro',
      price: billingCycle === 'yearly' ? '$41.50' : '$49',
      period: '/ month',
      desc: 'Accelerated sourcing toolkit for active global trade procurement professionals.',
      buttonText: 'Go Sourcing Pro',
      popular: true,
      features: [
        'Unlimited RFQs submission & priority routing',
        '5-way Supplier Comparison Matrix dashboard',
        'Download complete physical verification GPS log audits',
        'Organize and save custom supplier shortlists',
        'Logistics & sample shipping quotation desk access'
      ]
    },
    {
      name: 'Enterprise Sourcing',
      price: billingCycle === 'yearly' ? '$166.50' : '$199',
      period: '/ month',
      desc: 'Enterprise-grade supplier compliance, custom sourcing management, and team tools.',
      buttonText: 'Verify Enterprise',
      popular: false,
      features: [
        'Multi-user team workspace (up to 10 buyer seats)',
        'Dedicated human sourcing manager at Aartha India',
        'Compliance certificate vault & automated expiration tracking',
        'Real-time Port Log data & Mandi commodity price indexes',
        'Corporate invoice options with PO-based billing'
      ]
    }
  ];

  // FAQs by Role
  const buyerFAQs = [
    { q: 'Is it completely free to search for suppliers?', a: 'Yes. Global buyers can search the entire GIDC database and view active compliance credentials for free. Paid tiers are only required for unlimited RFQs, downloading verification logs, and dedicated human account coordination.' },
    { q: 'What is the GPS verification audit report?', a: 'Every verified supplier undergoes a physical site audit by our local engineers. We verify their production capacity, document machinery, and record GPS coordinates from the plant floor. As a Pro Buyer, you can download these full PDF validation reports to bypass manual vetting.' },
    { q: 'How does payment by PO invoice work?', a: 'For Enterprise Sourcing, we support payment by bank wire or corporate ACH. Simply choose "PO Invoice" in checkout and our support desk will contact you to establish PO billing cycles.' }
  ];

  const supplierFAQs = [
    { q: 'Why is physical verification required?', a: 'Global buyers from Europe and the Americas require audited proof of manufacturing before requesting samples or closing deals. By physically auditing GIDC factories, we eliminate middleman agents and guarantee genuine deals to buyers, boosting your conversion.' },
    { q: 'How do you prevent price wars unlike IndiaMART?', a: 'IndiaMART sells one lead to 40+ competitors, creating a race to the bottom. Aartha matches RFQs to a maximum of 3-5 verified manufacturers based on capacity, quality certifications, and proximity. Zero spam, zero middleman brokers.' },
    { q: 'Can I choose to pay quarterly?', a: 'Yes. We support quarterly billing cycles to align with your factory’s cash flow and seasonal cycles. Selecting yearly billing saves you ~15% overall.' }
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
            <span>Fair, Transparent & ROI-Focused Pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Flexible Plans Built For Real Trade
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Choose your corridor workspace settings. Scale features up or down as your export contracts or manufacturing requirements expand.
          </p>

          {/* Role selector tab */}
          <div className="inline-flex bg-white/5 border border-white/10 p-1.5 rounded-2xl shadow-premium-lg gap-1 mx-auto mt-4">
            <button
              onClick={() => {
                setUserRole('buyer');
                setBillingCycle('yearly');
              }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer select-none ${
                userRole === 'buyer'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe size={14} />
              I am a Global Buyer
            </button>
            <button
              onClick={() => {
                setUserRole('supplier');
                setBillingCycle('yearly');
              }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer select-none ${
                userRole === 'supplier'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 size={14} />
              I am an Indian Manufacturer
            </button>
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Billing cycle toggle */}
        <div className="flex flex-col items-center space-y-2">
          <div className="inline-flex bg-white dark:bg-navy border border-black/10 dark:border-white/10 p-1.5 rounded-2xl shadow-premium-sm gap-1 mx-auto">
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer select-none ${
                billingCycle === 'yearly'
                  ? 'bg-navy dark:bg-amber-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary dark:text-slate-300'
              }`}
            >
              Yearly billing
              <span className="ml-1.5 text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md font-extrabold uppercase">Save ~15%</span>
            </button>
            <button
              onClick={() => setBillingCycle('monthly_quarterly')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer select-none ${
                billingCycle === 'monthly_quarterly'
                  ? 'bg-navy dark:bg-amber-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary dark:text-slate-300'
              }`}
            >
              {userRole === 'buyer' ? 'Monthly billing' : 'Quarterly billing'}
            </button>
          </div>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            {userRole === 'buyer' 
              ? 'Prices listed in USD. Enterprise accounts support corporate purchase orders.'
              : 'Prices listed in INR. Verified review fees cover independent verification processing.'}
          </p>
        </div>

        {/* Golden Trust Rule Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 max-w-4xl mx-auto flex items-center gap-3.5 text-left shadow-sm">
          <div className="bg-amber-500 text-white p-2.5 rounded-xl flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Core Trust Guarantee: You pay for the audit. You cannot pay for the ranking.
            </div>
            <div className="text-xs text-text-secondary dark:text-slate-300 mt-0.5 leading-relaxed">
              Aartha Quality Scores and Verification Badges are strictly earned from validated government registries (GSTIN/IEC) and physical factory audits. Subscription fees cover operational audit costs and platform capabilities — higher subscription tiers cannot buy verification status or match ranking.
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 gap-6 items-stretch max-w-7xl mx-auto ${
          userRole === 'buyer' ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
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
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">{plan.name}</h3>
                  <p className="text-[11px] text-text-secondary dark:text-slate-300 leading-normal min-h-[32px]">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 py-1.5 border-y border-black/5 dark:border-white/10">
                  <span className="text-3xl font-black text-amber-500">{plan.price}</span>
                  <span className="text-[10px] text-text-muted dark:text-slate-400 font-bold uppercase tracking-wider">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 pt-2 text-[11px] leading-snug">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-text-secondary dark:text-slate-300">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5">
                <Link
                  href={userRole === 'buyer' ? '/dashboard?upgrade=true' : '/get-listed'}
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
            Plan Feature Comparison Matrix
          </h2>
          <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
            Review detailed technical features and limits side-by-side.
          </p>
        </div>

        <div className="bg-white dark:bg-navy border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-light text-text-secondary dark:text-slate-300 font-extrabold uppercase tracking-wider border-b border-black/10 dark:border-white/10">
                  <th className="p-4 w-1/4">Core Features</th>
                  {userRole === 'buyer' ? (
                    <>
                      <th className="p-4">Free Sourcing</th>
                      <th className="p-4">Sourcing Pro</th>
                      <th className="p-4">Enterprise</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4">Basic Free</th>
                      <th className="p-4">Enhanced Profile</th>
                      <th className="p-4">Verified</th>
                      <th className="p-4">Export Pro / Partner</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10 text-text-secondary dark:text-slate-300 font-semibold">
                {userRole === 'buyer' ? (
                  <>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Monthly RFQ Limit</td>
                      <td className="p-4">3 submissions</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Supplier Verification Log Access</td>
                      <td className="p-4">Basic score only</td>
                      <td className="p-4">Full GPS PDF download</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Full GPS PDF + Video verification</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Compare Matrix Limit</td>
                      <td className="p-4">2 suppliers</td>
                      <td className="p-4">5 suppliers</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Unlimited comparative dashboards</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Sourcing Assistance</td>
                      <td className="p-4">Self-service directory</td>
                      <td className="p-4">Auto-matching assist</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Dedicated human Trade desk coordinator</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Product Categories Listed</td>
                      <td className="p-4">1 Category (10 items)</td>
                      <td className="p-4">2 Categories (20 items)</td>
                      <td className="p-4">5 Categories (50 items)</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Unlimited product showcase</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">RFQ Inbox Allocation</td>
                      <td className="p-4">View 3 RFQs / month</td>
                      <td className="p-4">View 6 RFQs / respond to 4</td>
                      <td className="p-4">View 15 RFQs / respond to 10</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Unlimited RFQ response dashboard</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Verification Level</td>
                      <td className="p-4">GSTIN & IEC verification</td>
                      <td className="p-4">Digital + AI Video Verification</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400">GST + GPS Site Visit Log</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">GST + GPS + WHO-GMP/ISO Audit report</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-text-primary dark:text-white">Multi-Lingual translation</td>
                      <td className="p-4">English only</td>
                      <td className="p-4">English only</td>
                      <td className="p-4">English & Hindi</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">English, German, French, Spanish, Arabic</td>
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
          <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">Pricing FAQs</h2>
          <p className="text-xs text-text-muted dark:text-slate-400">Common questions regarding trade validation, invoices, and subscriptions.</p>
        </div>

        <div className="space-y-4">
          {activeFAQs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-navy border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-2">
              <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                {faq.q}
              </h3>
              <p className="text-[11px] text-text-secondary dark:text-slate-300 leading-relaxed pl-3.5 border-l border-amber-500/30">
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
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide">Ready to Modernize Your Trade Operations?</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Get started on our basic free account today to list your factory or search GIDC industrial directories. Zero credit card or verification fees needed.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="bg-amber-555 bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase tracking-wider text-xs px-8 py-3.5 rounded-xl shadow-md transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href="/contact"
              className="border border-white/20 hover:bg-white/5 font-extrabold uppercase tracking-wider text-xs px-8 py-3.5 rounded-xl transition-all"
            >
              Talk to Sourcing Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
