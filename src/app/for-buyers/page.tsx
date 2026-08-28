"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, CheckCircle2, Clock, Search, FileText, Lock, Globe, 
  ArrowRight, ChevronDown, Award, Check, X as XIcon, Building2, Layers, 
  MapPin, Sparkles, HelpCircle 
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

const coreBenefits = [
  { icon: ShieldCheck, title: 'Geotagged Visit Reports', desc: 'Verify physical presence and plant production capabilities with GPS coordinates.', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { icon: Clock, title: '48h Response Sourcing', desc: 'Pre-qualified manufacturers quote within 24-48 hours directly.', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { icon: Lock, title: 'Compliance Audited', desc: 'We verify GSTIN registration logs and Import Export Codes at the government registry.', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { icon: Globe, title: 'Direct Corridor Ports', desc: 'Georouted transport logs from GIDC factories straight to Mundra and Kandla ports.', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
];

const marketplaceComparison = [
  {
    feature: 'Lead Filtering & Quality',
    indiamart: '47 replies from trading agents (high spam)',
    alibaba: 'Gold Suppliers buy badges (unknown audit)',
    artha: 'Automated registry checks. Honestly labeled. 0% broker fee.',
  },
  {
    feature: 'Plant Operations Audit',
    indiamart: 'Self-declared capacity details only',
    alibaba: 'Third-party paperwork upload only',
    artha: 'National registry checks + optional onsite GPS physical audits.',
  },
  {
    feature: 'Buyer Verification',
    indiamart: 'No validation. Anyone can submit fake RFQs.',
    alibaba: 'Basic email check. Highly anonymous bidding.',
    artha: 'Strict domain verification. Authority band checks.',
  },
  {
    feature: 'Response Prioritization',
    indiamart: 'Hours or days (requires heavy chase)',
    alibaba: '24-72 hours average turnaround',
    artha: 'Guaranteed responses in <4 hours average.',
  },
];

const buyerJourneySteps = [
  { num: '01', title: 'Find GIDC Clusters', subtitle: 'Search verified factories in GIDC industrial corridors.', icon: Search, badge: 'Cluster Search', color: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
  { num: '02', title: 'Validate Authority', subtitle: 'Confirm business domain & purchasing limits.', icon: ShieldCheck, badge: 'Trust Gate', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' },
  { num: '03', title: 'Submit RFQ Specs', subtitle: 'Specify quantity, target price & certifications required.', icon: FileText, badge: '30-Sec RFQ', color: 'border-blue-500/30 bg-blue-500/10 text-blue-500' },
  { num: '04', title: 'AI Factory Match', subtitle: 'Request routed directly to 3-5 factory owners.', icon: Sparkles, badge: 'Direct Match', color: 'border-purple-500/30 bg-purple-500/10 text-purple-500' },
  { num: '05', title: 'Compare Matrix', subtitle: 'Analyze price, lead times & trust scores side-by-side.', icon: Layers, badge: 'Side-by-Side', color: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
  { num: '06', title: 'Direct Order Log', subtitle: 'Close deals directly with 0% middleman fees.', icon: Building2, badge: '0% Brokerage', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' },
];

const categoryComplianceRequirements = [
  {
    catName: 'Pharma & Healthcare API',
    requirements: ['WHO-GMP Compliance Certificate', 'US FDA / DMF filing verification', 'Active Purity Lab Log audits', 'Certificate of Analysis (CoA) logs']
  },
  {
    catName: 'Textiles & Apparel',
    requirements: ['GOTS Standard certification', 'OEKO-TEX Standard 100 registration', 'Lab-verified GSM weight metrics', 'Social and child-labor-free audits']
  },
  {
    catName: 'Engineering & Industrial',
    requirements: ['CE marking verification for Europe', 'ISO 9001:2015 Quality management logs', 'Raw Material Test Certificates (MTC)', 'CNC machine precision logs']
  }
];

const buyerFAQs = [
  {
    q: 'How does Aartha prevent supplier spam?',
    a: 'Every supplier on our platform undergoes active GSTIN/IEC registry audits, bank KYC verification, and document checks. For factories, on-site physical GPS audits are executed to verify machine presence and physical GIDC boundary limits.'
  },
  {
    q: 'Why should I verify my Buyer Sourcing Authority?',
    a: 'Real manufacturers ignore anonymous inquiries. By verifying your business domain and declaring your target authority band, you signal to factory directors that you are a genuine buyer.'
  },
  {
    q: 'What is the dynamic Quality Score?',
    a: 'The Quality Score is an evidence-backed rating (out of 100) computed based on verification tier, active certifications, response time history, factory audit grades, and buyer reviews.'
  },
  {
    q: 'Is there a fee to browse suppliers or submit RFQs?',
    a: 'Aartha offers a generous Free tier that allows searching the directory, viewing trust scores, and submitting up to 3 RFQs per month. Sourcing Pro ($49/mo) and Enterprise Sourcing ($199/mo) are available for active sourcing teams needing unlimited queries and white-glove coordination.'
  }
];


export default function ForBuyersPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');

  const buyerTiers = [
    {
      name: 'Free Sourcing',
      price: '$0',
      period: 'Forever',
      desc: 'Search verified factories, inspect compliance credentials, and submit manufacturing RFQs.',
      buttonText: 'Start Sourcing Free',
      buttonHref: '/rfq',
      popular: true,
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
      features: [
        'Dedicated human sourcing coordinator',
        'Custom factory inspection coordination',
        'High-volume multi-category RFQ routing',
        'Supplier background compliance validation',
        'Priority trade support desk'
      ]
    }
  ];

  return (
    <div className="bg-transparent font-sans min-h-screen text-text-primary pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white py-16 px-4 border-b border-white/10 shadow-premium-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
              <ShieldCheck size={16} />
              <span>Verified B2B Sourcing Operating System</span>
            </div>
            
            <h1 className="type-hero uppercase">
              Source from India's Most Verified Manufacturers.<br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Zero Spam. Zero Ghost Factories.</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Eliminate purchasing risk. Aartha connects international enterprise procurement teams directly to physically audited GIDC manufacturing plants in Gujarat, India.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 items-center">
              <Link
                href="/rfq"
                className="btn-amber text-xs font-extrabold uppercase tracking-wider px-8 py-3.5 shadow-lg rounded-xl"
              >
                Submit Sourcing Request (RFQ)
              </Link>
              <Link
                href="/suppliers"
                className="border-[1.5px] border-white/40 text-white hover:bg-white hover:text-[#0B1628] text-xs font-extrabold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all"
              >
                Browse Verified Exporters
              </Link>
              <WhatsAppButton
                phoneNumber="+91 72084 32138"
                message="Hi! I am a buyer and I want to verify GIDC factory credentials."
              />
            </div>
          </div>

          <div className="w-full lg:w-96 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 backdrop-blur-md">
            <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Independent Audit Guarantee</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every manufacturer listed on Aartha undergoes physical plant inspection, GPS mapping verification, director identity screening, and active registry validation of GSTIN & IEC licenses.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Benefits Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coreBenefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className={`p-3 rounded-xl w-fit ${b.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-extrabold text-sm text-text-primary dark:text-white uppercase tracking-wide">{b.title}</h3>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Step-by-Step Buyer Journey */}
      <section className="bg-slate-50 dark:bg-[var(--surface)] border-y border-black/5 dark:border-white/10 py-14 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Procurement Workflow
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
              The Verified Buyer Journey
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
              How global buyers source directly from Gujarat GIDC factories in 6 visual steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {buyerJourneySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="bg-white dark:bg-navy-light border border-black/10 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${step.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-lg font-black text-slate-300 dark:text-slate-600">{step.num}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">{step.badge}</span>
                    <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider mt-0.5">{step.title}</h3>
                  </div>
                  <p className="text-[11px] text-text-secondary dark:text-slate-300 leading-normal">{step.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Comparison Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-text-primary dark:text-white">How Aartha Compares to Generic Directories</h2>
          <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
            Why leading procurement teams in Germany, USA, and UAE trust Aartha over spam-heavy portals.
          </p>
        </div>

        <div className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[var(--surface)] shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-black/10 dark:border-white/10">
                  <th className="p-4 w-1/4">Key Sourcing Feature</th>
                  <th className="p-4 w-1/4">IndiaMART (Generic Directory)</th>
                  <th className="p-4 w-1/4">Alibaba (Paid Badge Supplier)</th>
                  <th className="p-4 w-1/4 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black">Aartha (Verified Network)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {marketplaceComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-extrabold text-text-primary dark:text-white">{row.feature}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{row.indiamart}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{row.alibaba}</td>
                    <td className="p-4 bg-amber-500/5 font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>{row.artha}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Category Compliance Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-text-primary dark:text-white">Corridor Quality Audit Standards</h2>
          <p className="text-xs text-text-muted dark:text-slate-400">Strict compliance verification across key industrial verticals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categoryComplianceRequirements.map((cat) => (
            <div key={cat.catName} className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-sm">
              <h3 className="font-extrabold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider border-b border-black/5 dark:border-white/10 pb-2 flex items-center gap-2">
                <Award size={14} />
                <span>{cat.catName}</span>
              </h3>
              <ul className="space-y-2 text-xs">
                {cat.requirements.map((req, rIdx) => (
                  <li key={rIdx} className="flex items-center gap-2 text-text-secondary dark:text-slate-300">
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Buyer Pricing Section */}
      <section className="bg-slate-50 dark:bg-[var(--surface)] border-y border-black/5 dark:border-white/10 py-14 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
              Flexible Sourcing Workspaces
            </h2>
            <p className="text-xs text-text-muted dark:text-slate-400 max-w-md mx-auto">
              Select a workspace plan built for your procurement volume. Cancel or adjust anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {buyerTiers.map((plan) => (
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
                    Recommended
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-text-primary dark:text-white uppercase tracking-wider">{plan.name}</h3>
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
          <p className="text-xs text-text-muted dark:text-slate-400">Everything global buyers need to know about Aartha verification.</p>
        </div>

        <div className="space-y-3">
          {buyerFAQs.map((faq, idx) => (
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
            "mainEntity": buyerFAQs.map(faq => ({
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
