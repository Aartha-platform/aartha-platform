"use client";

import Link from 'next/link';
import { 
  FileText, CheckCircle2, ShieldCheck, ArrowRight, ArrowUpRight, 
  Settings, Wrench, Layers, Clock, Award, Check, AlertCircle, HelpCircle 
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Share your Drawing or Sketch',
      subtitle: 'Upload 2D PDF, DXF, 3D STEP, or hand sketch',
      desc: 'Send us your CAD file, target quantity, material grade (SS304, MS, Aluminum), and critical tolerances. If you don’t have a CAD file, a dimensioned hand sketch or physical sample reference is completely fine. We clarify hole patterns, bend allowances, and surface finishes before moving to quotation.',
      deliverable: 'Standardized manufacturing specification sheet',
    },
    {
      num: '02',
      title: 'Engineering DFM Review',
      subtitle: 'Design for Manufacturability check in 24 hours',
      desc: 'Our mechanical engineers review the drawing for laser piercing constraints, press brake punch-die clearances, bend radius ratios, and potential distortion points to prevent shop floor scrap and costly rework.',
      deliverable: 'DFM feedback report & geometry optimization',
    },
    {
      num: '03',
      title: 'Audited Cluster Routing',
      subtitle: 'Routing to specialized Gujarat fabrication shops',
      desc: 'Instead of blasting your RFQ across dozens of brokers or open directories, we route the job directly to 1–2 audited shops in Rajkot, Ahmedabad, or Vadodara whose laser wattages, bed sizes, press-brake tonnage, and live capacity match your part.',
      deliverable: 'Single managed delivered quotation with fixed timeline',
    },
    {
      num: '04',
      title: 'Tooling & Production Coordination',
      subtitle: 'Active shop-floor milestone oversight',
      desc: 'Aartha coordinates the full fabrication cycle: raw sheet sourcing, nesting optimization, CNC laser cutting, press brake folding, deburring, and optional surface treatments like powder coating, zinc plating, or anodizing.',
      deliverable: 'Live milestone updates without chasing vendors on WhatsApp',
    },
    {
      num: '05',
      title: 'Pre-Dispatch Dimensional Inspection',
      subtitle: 'Evidence-based quality control',
      desc: 'Before any parts leave the factory floor, physical samples are checked with calibrated vernier calipers, micrometers, and angle gauges. Dimensional deviation logs and clear macro photos are recorded and certified.',
      deliverable: 'Aartha QA Inspection Certificate & photo evidence',
    },
    {
      num: '06',
      title: 'Door Delivery & Single Accountability',
      subtitle: 'Handoff to your facility with full traceability',
      desc: 'Inspected parts arrive at your receiving dock carefully packaged. You receive a single GST-compliant commercial invoice and one accountable point of contact for reorders, batch repeats, or design revisions.',
      deliverable: 'Ready-to-assemble hardware delivered to your facility',
    },
  ];

  return (
    <div className="bg-[#f8fafc] font-sans text-[#0f172a] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-[#eff6ff] text-[#2563eb] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#dbeafe]">
            <i>•</i> Aartha Execution Layer
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0f172a] leading-[0.95]">
            How managed manufacturing works.
          </h1>
          <p className="text-base sm:text-lg text-[#64748b] font-normal leading-relaxed">
            From technical CAD review to delivered batch — without becoming your procurement department. Here is how Aartha turns drawings into inspected precision parts.
          </p>
          <div className="pt-2">
            <Link
              href="/rfq"
              className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all no-underline shadow-md"
            >
              <span>Upload your drawing to start</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        {/* 6 Steps List */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-[100px_1fr_260px] gap-6 items-start"
            >
              {/* Step Number */}
              <div className="text-4xl sm:text-5xl font-black text-[#f97316]">
                {step.num}
              </div>

              {/* Step Details */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2563eb]">
                  {step.subtitle}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1">
                  {step.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-2.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Deliverable Badge */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#64748b] block mb-1">
                  Key Output / Handoff
                </span>
                <strong className="text-xs font-bold text-[#0f172a] flex items-start gap-1.5 leading-snug">
                  <CheckCircle2 size={14} className="text-[#059669] shrink-0 mt-0.5" />
                  <span>{step.deliverable}</span>
                </strong>
              </div>
            </div>
          ))}
        </div>

        {/* Accountability & Edge Cases FAQ Grid */}
        <div className="mt-16 bg-white border border-[#e2e8f0] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2563eb]">
              REAL OPERATIONAL POLICIES
            </span>
            <h3 className="text-2xl font-black text-[#0f172a] mt-1">
              Common Questions on Accountability & Quality
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#2563eb]" />
                <span>What happens if a part fails tolerance or arrives out-of-spec?</span>
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Because Aartha conducts pre-dispatch physical inspection with vernier calipers and gauges, out-of-spec parts are caught on the shop floor before shipping. If any dimension is non-conforming upon arrival, Aartha owns the remake immediately at zero extra cost to you. No factory finger-pointing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                <Award size={16} className="text-[#059669]" />
                <span>Why not just contact a local factory or IndiaMART broker?</span>
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Local factories frequently deprioritize small startup runs (10–50 pieces), ignore drawing revision control, and provide no inspection documentation. IndiaMART bombards you with 15 unvetted brokers. Aartha gives you 1 accountable invoice, audited tier-1 Gujarat machine shops, and rigorous QA.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                <Clock size={16} className="text-[#f97316]" />
                <span>What batch sizes do you support?</span>
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                We specialize in prototype runs from 1 to 25 pieces up to production batches of 100 to 5,000 pieces. Our nesting software and quick-change press brake tooling make small custom runs economically viable.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                <FileText size={16} className="text-[#6366f1]" />
                <span>Are our drawings and IP confidential?</span>
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Yes. All CAD drawings, specifications, and sketches are protected under mutual non-disclosure terms. Your proprietary geometry is never published or exposed to open bidder networks.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 bg-[#0f172a] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#93c5fd]">
              READY TO BUILD?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Have a bracket, plate, or custom part to make?
            </h3>
            <p className="text-xs sm:text-sm text-[#cbd5e1] mt-1 max-w-lg">
              Send us your drawing for a free manufacturability review and managed quotation within 24 hours.
            </p>
          </div>
          <Link
            href="/rfq"
            className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all no-underline shadow-md shrink-0"
          >
            <span>Upload Drawing (PDF / STEP / DXF)</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}
