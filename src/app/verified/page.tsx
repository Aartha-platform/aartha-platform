"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Award, Lock, Scale, CheckCircle2, Search, HelpCircle, 
  FileText, MapPin, Users, AlertTriangle, AlertCircle, Landmark, ChevronRight, Check
} from 'lucide-react';
import TrustCenterPanel from '@/components/TrustCenterPanel';

const badgeDirectory = [
  {
    name: 'Tier 0: Listed',
    icon: FileText,
    color: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
    description: 'Basic verification of identity via email/phone OTP and self-declared business type details.',
    checks: ['Phone OTP verification', 'Business email validation', 'Declared business type taxonomy mapping'],
    monetization: 'Free. Automatic upon registration.',
    validity: 'Lifetime (unless flagged for activity abuse)',
    revocation: 'Suspended if spam or security guidelines are violated.'
  },
  {
    name: 'Tier 1: Business Verified',
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'Corporate registration, tax status and bank details checked automatically against national registries.',
    checks: ['Active GSTIN status check', 'DGFT IEC validity registry check', 'Bank account penny drop KYC'],
    monetization: 'Free. Automatically run for all listed suppliers at registration.',
    validity: '30 Days (auto-renewed monthly)',
    revocation: 'Revoked instantly if GSTIN status becomes inactive or registry filings lapse.'
  },
  {
    name: 'Tier 2: Verified Supplier',
    icon: Award,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Elevated verification based on seller type credentials and self-recorded video walkthroughs.',
    checks: ['Seller-type documents verified', 'Self-recorded video walkthrough', 'Quality certifications checked with issuing bodies'],
    monetization: 'Included under the Verified Supplier subscription (₹9,999/yr).',
    validity: '12 Months (requires annual re-validation)',
    revocation: 'Revoked if video validation checks fail or bank account mismatch flags are triggered.'
  },
  {
    name: 'Tier 3: Premium Audited',
    icon: ShieldCheck,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Verified on-site by a certified field engineer to guarantee physical capacity, address, and equipment.',
    checks: ['GPS coordinate & GIDC boundary match', 'Physical machinery check & serial log verification', 'Third-party auditor inspection (SGS/BV/TÜV/Aartha)'],
    monetization: 'Requires Premium Audited tier (₹29,999/yr) or paid standalone audit fee.',
    validity: '12 Months (requires physical re-audit)',
    revocation: 'Revoked if factory address changes, machinery is decommissioned, or security logs fail.'
  },
  {
    name: 'Verified Buyer Badge',
    icon: Users,
    color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    description: 'Granted to buyers with verified domain credentials and declared sourcing authority bands.',
    checks: ['Corporate domain validation', 'Entity registry match', 'Authority band declaration'],
    monetization: 'Cannot be purchased. Requires corporate email matching and KYC verification.',
    validity: '12 Months (re-verified annually)',
    revocation: 'Revoked for spam behavior, fake RFQ submissions, or platform terms violation.'
  }
];

const steps = [
  { num: '01', title: 'GST & IEC Check (Tier 1)', desc: 'Auto-verify GSTIN records and DGFT Import Export Code at government registries.', icon: FileText },
  { num: '02', title: 'Video & AI Scan (Tier 2)', desc: 'Submit a verified self-recorded factory walkthrough video for automated AI analysis.', icon: Award },
  { num: '03', title: 'Onsite Visitation (Tier 3)', desc: 'Schedule a physical plant audit by a regional field engineer (optional/paid tier).', icon: ShieldCheck },
  { num: '04', title: 'GPS Geotagging (Tier 3)', desc: 'Geolocate plant coordinates to match official corporate registry bounds.', icon: MapPin },
  { num: '05', title: 'Trust Score Release', desc: 'Publish the verified trust profile and output active badge ratings to global buyers.', icon: Scale }
];

const anonymizedRevocations: Array<{ date: string; location: string; industry: string; reason: string; status: string }> = [];

export default function TrustCenterPage() {
  const [activeTab, setActiveTab] = useState<'directory' | 'fraud' | 'revocations'>('directory');

  return (
    <div className="bg-transparent font-sans min-h-screen text-text-primary pb-16">
      {/* Banner Hero */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white py-16 px-4 text-center border-b border-white/10 shadow-premium-lg">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30">
            <Award size={15} />
            <span>Aartha Governance & Compliance Standards</span>
          </div>
          <h1 className="type-hero uppercase">
            Aartha Trust Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Understand how our physical verification gates prevent supplier fraud, ghost listings, and unverified data claims inside the export corridor.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Lookup Tool */}
        <section className="space-y-4">
          <div className="text-center space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-text-primary dark:text-white">Dossier Credential Validator</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">Lookup live geocoded logs and active certifications directly from our registry database.</p>
          </div>
          <TrustCenterPanel />
        </section>

        {/* 5-Step Verification Process Diagram */}
        <section className="space-y-6 pt-8 border-t border-black/5 dark:border-white/10">
          <div className="text-center space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-text-primary dark:text-white">How Verification Works</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">Every badge is backed by physical evidence, never by payment ranking boosts.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-4 space-y-2.5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Icon size={18} />
                    </div>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">STEP {step.num}</span>
                  </div>
                  <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">{step.title}</h3>
                  <p className="text-[11px] text-text-secondary dark:text-slate-300 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dynamic Section Tabs */}
        <div className="border-b border-black/10 dark:border-white/10 flex justify-center gap-4 sm:gap-8 overflow-x-auto pb-1">
          {[
            { id: 'directory', label: 'Badge Directory (4 Badges)' },
            { id: 'fraud', label: 'Fraud Detection Standards' },
            { id: 'revocations', label: 'Revocation History Ledger' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-text-muted hover:text-text-primary dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Badge Directory */}
        {activeTab === 'directory' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {badgeDirectory.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.name} className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl border ${badge.color}`}>
                            <Icon size={18} />
                          </div>
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-text-primary dark:text-white">{badge.name}</h4>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold uppercase border border-emerald-500/20">Active</span>
                      </div>
                      <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">{badge.description}</p>
                      
                      <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10 text-[11px]">
                        <div>
                          <strong className="text-text-primary dark:text-white uppercase tracking-wider text-[9px] font-extrabold">Audit Checks Required:</strong>
                          <ul className="space-y-1 mt-1 text-text-secondary dark:text-slate-300">
                            {badge.checks.map(c => (
                              <li key={c} className="flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-1">
                          <strong className="text-text-primary dark:text-white uppercase tracking-wider text-[9px] font-extrabold">Monetization Rule:</strong>
                          <p className="text-amber-600 dark:text-amber-400 mt-0.5 font-bold italic text-[10px]">{badge.monetization}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-between items-center text-[10px] text-text-muted dark:text-slate-400">
                      <span>Validity: <strong>{badge.validity}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: Fraud Prevention Standards */}
        {activeTab === 'fraud' && (
          <section className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm max-w-4xl mx-auto">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-primary dark:text-white border-b border-black/5 dark:border-white/10 pb-3">Fraud Detection Engine Standards</h3>
            <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
              We monitor transaction matching and user logs continuously. The Aartha Fraud Detection Engine flags suspicious signals across 4 primary risk channels:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="bg-slate-50 dark:bg-navy-light p-4 rounded-xl space-y-2 border border-black/5 dark:border-white/5">
                <h4 className="font-extrabold text-xs text-text-primary dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>1. Identity Risk Channels</span>
                </h4>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Flags users registering with free webmail services (Gmail, Yahoo) instead of official corporate domains. Requires strict tax database matching.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-light p-4 rounded-xl space-y-2 border border-black/5 dark:border-white/5">
                <h4 className="font-extrabold text-xs text-text-primary dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>2. Behavior Risk Channels</span>
                </h4>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Monitors spam signals such as mass RFQ postings across unaligned categories and template-based messaging patterns.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-light p-4 rounded-xl space-y-2 border border-black/5 dark:border-white/5">
                <h4 className="font-extrabold text-xs text-text-primary dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>3. Geographic Geocoding Mismatch</span>
                </h4>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Validates user IP locations against corporate registry addresses. If a supplier claims a GIDC plant but submits elsewhere, verification is suspended.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-light p-4 rounded-xl space-y-2 border border-black/5 dark:border-white/5">
                <h4 className="font-extrabold text-xs text-text-primary dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>4. Content Inconsistency Flags</span>
                </h4>
                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Validates trade documents using Document Intelligence rules. Mismatches between Bill of Lading and Invoice trigger mandatory reviews.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: Revocation History Log */}
        {activeTab === 'revocations' && (
          <section className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto">
            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 border-b border-black/10 dark:border-white/10">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary dark:text-white">Anonymized Badge Revocation Ledger</h3>
              <p className="text-[10px] text-text-muted dark:text-slate-400 mt-0.5">Immutable audit log of badge status updates for absolute transparency.</p>
            </div>
                    <div className="overflow-x-auto">
              {anonymizedRevocations.length > 0 ? (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-light text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-black/10 dark:border-white/10">
                      <th className="p-4">Date</th>
                      <th className="p-4">Region/GIDC</th>
                      <th className="p-4">Industry Sector</th>
                      <th className="p-4">Reason for Revocation</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {anonymizedRevocations.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-text-primary dark:text-white">{row.date}</td>
                        <td className="p-4 text-text-secondary dark:text-slate-300 font-semibold">{row.location}</td>
                        <td className="p-4 text-text-secondary dark:text-slate-300">{row.industry}</td>
                        <td className="p-4 text-text-secondary dark:text-slate-300">{row.reason}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            row.status === 'Revoked' 
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' 
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-text-secondary dark:text-slate-400 font-medium">
                  No revocations logged. The corridor trust ledger is clear and active.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
