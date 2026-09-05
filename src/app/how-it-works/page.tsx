"use client";

import Link from 'next/link';
import { 
  FileText, CheckCircle2, ShieldCheck, ArrowRight, ArrowUpRight, 
  Settings, Wrench, Layers, Clock, Award, Check 
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Share your Drawing & Specifications',
      subtitle: 'Upload 2D PDF, DXF, or 3D STEP file',
      desc: 'Send us your CAD file, target quantity, material grade (SS304, MS, Aluminum), and critical tolerances. We clarify hole patterns, bend allowances, and surface finishes before moving to quotation.',
      deliverable: 'Clear manufacturing specification sheet',
    },
    {
      num: '02',
      title: 'Engineering DFM Review',
      subtitle: 'Design for Manufacturability check',
      desc: 'Our mechanical engineers review the drawing for laser piercing constraints, press brake punch-die clearances, bend radius ratios, and potential distortion points to prevent shop floor failures.',
      deliverable: 'DFM feedback report & suggested geometry adjustments',
    },
    {
      num: '03',
      title: 'Supplier Capability Matching',
      subtitle: 'Routing to audited Gujarat fabrication shops',
      desc: 'Instead of blasting your RFQ across dozens of brokers, we route the job to 1–2 specific shops in Gujarat whose laser wattages, bed sizes, press-brake tonnage, and current capacity match your part.',
      deliverable: 'Single managed delivered quotation with fixed timeline',
    },
    {
      num: '04',
      title: 'Tooling & Production Coordination',
      subtitle: 'Active shop-floor milestone management',
      desc: 'Aartha manages the production loop: raw sheet sourcing, nesting optimization, CNC laser cutting, press brake folding, deburring, and optional surface treatments like powder coating or zinc plating.',
      deliverable: 'Live milestone updates without the WhatsApp chase',
    },
    {
      num: '05',
      title: 'Pre-Dispatch Dimensional Inspection',
      subtitle: 'Evidence-based quality control',
      desc: 'Before any parts leave the factory floor, physical samples are checked with calibrated vernier calipers, micrometers, and angle gauges. Dimensional deviation logs and clear macro photos are recorded.',
      deliverable: 'Aartha QA Inspection Certificate & photo evidence',
    },
    {
      num: '06',
      title: 'Delivered Parts & Single Accountability',
      subtitle: 'Handoff to your facility with full traceability',
      desc: 'Inspected parts arrive at your receiving dock carefully packed. You receive a single GST-compliant commercial invoice and one accountable point of contact for reorders, batch repeats, or design revisions.',
      deliverable: 'Ready-to-assemble hardware delivered on schedule',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#dfe4f8] via-[#f7f8fd] to-white dark:from-[#0a1020] dark:via-[#0e1524] dark:to-[#060b13] font-sans text-[#0a1020] dark:text-[#f0f4fa] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="eyebrow">AARTHA / EXECUTION LAYER</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0a1020] dark:text-white leading-[0.95]">
            How managed manufacturing works.
          </h1>
          <p className="text-base sm:text-lg text-[#5a6480] dark:text-slate-300 font-normal leading-relaxed">
            From technical CAD review to delivered batch — without becoming your procurement department. Here is how Aartha turns drawings into inspected precision parts.
          </p>
          <div className="pt-2">
            <Link
              href="/rfq"
              className="pill pill-primary text-xs px-6 py-3"
            >
              <span>Upload your drawing to start</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* 6 Steps List */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-[100px_1fr_260px] gap-6 items-start"
            >
              {/* Step Number */}
              <div className="text-4xl sm:text-5xl font-black text-[#ff685c]">
                {step.num}
              </div>

              {/* Step Details */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#27187e] dark:text-[#82aaff]">
                  {step.subtitle}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0a1020] dark:text-white mt-1">
                  {step.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#5a6480] dark:text-slate-400 mt-2.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Deliverable Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#5a6480] dark:text-slate-400 block mb-1">
                  Key Output / Handoff
                </span>
                <strong className="text-xs font-bold text-[#0a1020] dark:text-white flex items-start gap-1.5 leading-snug">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{step.deliverable}</span>
                </strong>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0a1020] to-[#27187e] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ffd8d2]">
              READY TO BUILD?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              Have a bracket, plate, or custom part to make?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg">
              Send us your drawing for a free manufacturability review and managed quotation within 24 hours.
            </p>
          </div>
          <Link
            href="/rfq"
            className="pill pill-coral text-xs px-6 py-3.5 whitespace-nowrap"
          >
            <span>Upload Drawing (PDF / STEP / DXF)</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
