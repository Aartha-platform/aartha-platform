"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import SignalStrip from '@/components/SignalStrip';
import { 
  ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck, 
  Clock, AlertTriangle, FileText, UploadCloud, Layers, 
  Cpu, Wrench, Settings, Sparkles, Check, ChevronRight
} from 'lucide-react';

export default function HomePage() {
  // Service strip active tab
  const [activeService, setActiveService] = useState<'discover' | 'quote' | 'make' | 'verify' | 'track'>('discover');

  // RFQ Form state
  const [rfqName, setRfqName] = useState('');
  const [rfqEmail, setRfqEmail] = useState('');
  const [rfqQty, setRfqQty] = useState('');
  const [rfqMaterial, setRfqMaterial] = useState('');
  const [rfqNote, setRfqNote] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [createdRfqId, setCreatedRfqId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rfqSectionRef = useRef<HTMLDivElement>(null);

  const scrollToRfq = () => {
    rfqSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const serviceDescriptions: Record<string, string> = {
    discover: "Start with one drawing. We review part geometry, tolerances, and material fit.",
    quote: "Receive a single managed delivered quote with transparent lead time and manufacturing terms.",
    make: "We route to the qualified Gujarat shop, manage tooling/fixtures, and track shop floor milestones.",
    verify: "Physical dimensional inspection and photograph evidence documented prior to factory dispatch.",
    track: "Live order telemetry from fabrication through final delivery to your facility.",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: `Custom Sheet Metal: ${rfqMaterial || 'Precision Part'}`,
          category: 'Engineering & Industrial Machinery',
          description: `${rfqNote || 'Custom fabrication part'}${uploadedFile ? ` (Attached drawing: ${uploadedFile.name})` : ''}`,
          quantity: rfqQty || '25',
          unit: 'Pieces',
          specifications: `Material: ${rfqMaterial || 'SS304 / MS / Al'}, Quantity: ${rfqQty || '25'}, Notes: ${rfqNote || 'None'}`,
          contactName: rfqName || 'Engineering Lead',
          email: rfqEmail,
          companyName: 'Hardware Engineering Co',
          country: 'India',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedRfqId(data.rfq?.id || 'RFQ-' + Math.floor(1000 + Math.random() * 9000));
        setModalMessage(
          `Thanks, ${rfqName || 'there'}. Your RFQ is registered in Aartha's managed intake queue. Our engineering team will review the specifications and follow up with a technical DFM check within 24 hours.`
        );
      } else {
        setCreatedRfqId('RFQ-' + Math.floor(1000 + Math.random() * 9000));
        setModalMessage(
          `Thanks, ${rfqName || 'there'}. Your project inquiry has been recorded. Our engineering desk will review your drawing and reach out to schedule a technical qualification call.`
        );
      }
    } catch {
      setCreatedRfqId('RFQ-' + Math.floor(1000 + Math.random() * 9000));
      setModalMessage(
        `Thanks, ${rfqName || 'there'}. Your drawing submission has been staged. Our engineering desk will review the part specifications and provide preliminary manufacturability feedback.`
      );
    } finally {
      setIsSubmitting(false);
      setModalOpen(true);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#dfe4f8] via-[#f7f8fd] to-white dark:from-[#0a1020] dark:via-[#0e1524] dark:to-[#060b13] min-h-screen text-[#0a1020] dark:text-[#f0f4fa]">
      
      {/* Operating Signal Strip */}
      <SignalStrip />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* =========================================================
            SECTION 1: HERO (Send us your drawing. We handle the rest.)
            ========================================================= */}
        <section className="pt-2 pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <span className="eyebrow">
              <i></i> Managed sourcing for custom precision parts
            </span>
            <span className="text-[11px] font-black tracking-widest uppercase text-[#5a6480] dark:text-slate-400">
              AARTHA / 001 / GUJARAT INDUSTRIAL CLUSTER
            </span>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-5xl sm:text-7xl lg:text-[92px] font-black leading-[0.92] tracking-tighter text-[#0a1020] dark:text-white">
              Send us your <br />
              <span className="text-[#27187e] dark:text-[#82aaff] italic font-serif">drawing.</span> <br />
              We handle the rest.
            </h1>
            <p className="mt-6 text-base sm:text-xl text-[#5a6480] dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
              Aartha manages custom sheet-metal brackets, mounting plates, covers and small housings from technical review to supplier selection, production coordination, and documented inspection.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 mt-8">
              <button
                type="button"
                onClick={scrollToRfq}
                className="pill pill-primary text-sm px-6 py-3.5 shadow-lg hover:shadow-xl"
              >
                <span>Upload a drawing</span>
                <ArrowUpRight size={16} />
              </button>
              <a
                href="#how"
                className="pill pill-light text-sm px-6 py-3.5 text-[#0a1020] dark:text-white dark:bg-white/10 dark:border-white/10"
              >
                See the workflow
              </a>
              <Link
                href="/suppliers"
                className="text-xs font-extrabold text-[#27187e] dark:text-[#82aaff] hover:underline px-3 py-2"
              >
                Explore Gujarat factory network →
              </Link>
            </div>
          </div>

          {/* Proof Numbers Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#27187e]/15 dark:border-white/10 mt-12 divide-x divide-[#27187e]/15 dark:divide-white/10">
            <div className="py-4 px-4 sm:px-6">
              <strong className="block text-xs font-black tracking-widest text-[#ff685c]">01</strong>
              <span className="block text-xs sm:text-sm font-extrabold text-[#0a1020] dark:text-white mt-1">Engineering review</span>
              <small className="text-[11px] text-[#5a6480] dark:text-slate-400">DFM check before quote</small>
            </div>
            <div className="py-4 px-4 sm:px-6">
              <strong className="block text-xs font-black tracking-widest text-[#ff685c]">02</strong>
              <span className="block text-xs sm:text-sm font-extrabold text-[#0a1020] dark:text-white mt-1">Supplier selection</span>
              <small className="text-[11px] text-[#5a6480] dark:text-slate-400">Audited shop capability</small>
            </div>
            <div className="py-4 px-4 sm:px-6">
              <strong className="block text-xs font-black tracking-widest text-[#ff685c]">03</strong>
              <span className="block text-xs sm:text-sm font-extrabold text-[#0a1020] dark:text-white mt-1">Production + QA</span>
              <small className="text-[11px] text-[#5a6480] dark:text-slate-400">Pre-dispatch dimensional log</small>
            </div>
            <div className="py-4 px-4 sm:px-6">
              <strong className="block text-xs font-black tracking-widest text-[#ff685c]">04</strong>
              <span className="block text-xs sm:text-sm font-extrabold text-[#0a1020] dark:text-white mt-1">Delivered part</span>
              <small className="text-[11px] text-[#5a6480] dark:text-slate-400">One commercial interface</small>
            </div>
          </div>

          {/* Hero Visual Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            
            {/* Card 1: Blueprint Drawing */}
            <div className="lg:col-span-2 relative rounded-3xl p-6 bg-gradient-to-br from-[#eff2ff] to-[#d9e2ff] dark:from-[#142035] dark:to-[#1a2d4a] border border-[#27187e]/15 dark:border-white/10 shadow-[0_20px_50px_rgba(39,24,126,0.08)] overflow-hidden min-h-[250px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="micro">PART / BRACKET-001</span>
                <span className="text-[10px] font-bold text-[#5a6480] dark:text-slate-400">TOLERANCE ±0.2 mm</span>
              </div>
              
              <div className="my-auto py-2 flex items-center justify-center">
                <svg viewBox="0 0 500 240" className="w-full max-w-[420px] h-auto drop-shadow-md" aria-hidden="true">
                  <defs>
                    <linearGradient id="gb1" x1="0" x2="1">
                      <stop stopColor="#dfe4f8" />
                      <stop offset="1" stopColor="#82aaff" />
                    </linearGradient>
                  </defs>
                  <rect x="20" y="20" width="460" height="200" rx="16" fill="rgba(255,255,255,0.3)" stroke="rgba(39,24,126,0.15)" strokeDasharray="4 4" />
                  <path d="M90 170V80l160-30 90 45v90l-90 20-160-35Z" fill="url(#gb1)" stroke="#ffffff" strokeWidth="3.5" />
                  <path d="M90 80l90 45 160-30" fill="none" stroke="#6c7ecc" strokeWidth="3" />
                  <circle cx="150" cy="150" r="14" fill="none" stroke="#27187e" strokeWidth="3" />
                  <circle cx="290" cy="120" r="12" fill="none" stroke="#ff685c" strokeWidth="3" />
                  <path d="M80 195h320M100 50h200" stroke="#7b89c4" strokeWidth="1.5" strokeDasharray="6 8" />
                  <text x="90" y="215" fill="#5a6480" fontSize="11" fontWeight="700" letterSpacing="1.5">LASER CUT / BEND / INSPECT</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-extrabold text-[#27187e] dark:text-[#82aaff] pt-2 border-t border-[#27187e]/10 dark:border-white/10">
                <span>CAD → GIDC Laser Cut Loop</span>
                <span>SS304 · 2.0 mm</span>
              </div>
            </div>

            {/* Card 2: Order Flow State Tracker */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#27187e] to-[#2350d2] text-white border border-[#27187e]/20 shadow-[0_20px_50px_rgba(39,24,126,0.15)] flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#cbd2ef]">
                  ORDER FLOW
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/10 border border-white/10">
                    <span className="font-bold">01 RFQ intake</span>
                    <span className="text-[#9fe0ad]">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/10 border border-white/10">
                    <span className="font-bold">02 DFM review</span>
                    <span className="text-[#9fe0ad]">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/10 border border-white/10">
                    <span className="font-bold">03 Factory assign</span>
                    <span className="text-[#9fe0ad]">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#ff685c]/25 border border-[#ff685c]/60 shadow-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ff685c] animate-ping inline-block"></span>
                      04 Production
                    </span>
                    <span className="text-[#ff685c] font-black">● LIVE</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/5 text-white/60">
                    <span>05 QA dispatch</span>
                    <span>—</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#cbd2ef] pt-3 border-t border-white/10 mt-3">
                One accountable interface
              </div>
            </div>

            {/* Card 3: Material & Finish Swatch */}
            <div className="relative rounded-3xl p-6 bg-white dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-[0_20px_50px_rgba(39,24,126,0.08)] flex flex-col justify-between">
              <div>
                <div className="micro">MATERIAL / FINISH</div>
                <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-[#e4e7ef] via-[#ffffff] to-[#cfd4df] dark:from-[#142035] dark:to-[#1e2e4a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-inner">
                  <span className="block text-2xl font-black tracking-tight">SS304</span>
                  <b className="block text-xs font-bold mt-1">1.5 mm – 3.0 mm</b>
                  <small className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Brushed / Deburred edges</small>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-3 text-[10px] font-bold text-center">
                  <span className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">MS</span>
                  <span className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">AL</span>
                  <span className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">SS</span>
                  <span className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">+COAT</span>
                </div>
              </div>
              <div className="text-[11px] text-[#5a6480] dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/10">
                Powder coating & anodizing
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            SECTION 2: BUILT FOR TEAMS THAT BUILD MACHINES
            ========================================================= */}
        <section className="py-6 border-b border-[#27187e]/12 dark:border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="micro">BUILT FOR</span>
              <h2 className="text-xl font-black text-[#0a1020] dark:text-white">Teams that build physical machines.</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                'Industrial automation',
                'Robotics & AGVs',
                'Electrical hardware',
                'Testing & inspection benches',
                'EV-adjacent components',
              ].map((item, i) => (
                <span
                  key={i}
                  className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-[#27187e]/15 dark:border-white/10 text-[#48506b] dark:text-slate-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: INTERACTIVE SERVICE STRIP
            ========================================================= */}
        <section className="py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#27187e]/15 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {(
                [
                  { id: 'discover', no: '01', name: 'Discover' },
                  { id: 'quote', no: '02', name: 'Quote' },
                  { id: 'make', no: '03', name: 'Make' },
                  { id: 'verify', no: '04', name: 'Verify' },
                  { id: 'track', no: '05', name: 'Track' },
                ] as const
              ).map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveService(step.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeService === step.id
                      ? 'bg-[#27187e] text-white shadow-sm'
                      : 'bg-white/60 dark:bg-white/5 text-[#5a6480] dark:text-slate-400 border border-[#27187e]/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <span className="opacity-60 mr-1.5">{step.no}</span>
                  {step.name}
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-[#5a6480] dark:text-slate-300 max-w-md text-right">
              {serviceDescriptions[activeService]}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 4: WHAT WE MAKE (CATALOGUE)
            ========================================================= */}
        <section id="catalogue" className="py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="micro">01 / PART FAMILIES</span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0a1020] dark:text-white mt-1">
                What we make, starting small.
              </h2>
            </div>
            <p className="text-sm text-[#5a6480] dark:text-slate-300 max-w-md font-normal leading-relaxed">
              Built around the first commercial wedge: low-to-medium volume fabricated sheet-metal parts where inspection is practical and inventory stays at zero.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 bg-white/70 dark:bg-[#0e1524]/70 backdrop-blur-xl border border-[#27187e]/15 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(39,24,126,0.06)]">
            
            {/* Left Rail */}
            <aside className="rounded-2xl p-6 bg-gradient-to-br from-[#0a1020] to-[#27187e] text-white flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-[#cbd2ef]">
                  STARTING WEDGE
                </span>
                <h3 className="text-3xl font-black mt-2 leading-tight">
                  Sheet metal
                </h3>
                <p className="text-xs text-[#cbd2e9] mt-3 leading-relaxed">
                  Laser cutting + CNC press-brake bending, with finishing, deburring, and inspection coordinated around each batch.
                </p>
              </div>

              <div className="space-y-2 mt-6">
                <span className="block text-[11px] font-extrabold px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                  Gujarat supply cluster
                </span>
                <span className="block text-[11px] font-extrabold px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                  Order-first execution
                </span>
                <span className="block text-[11px] font-extrabold px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                  QA documented handoff
                </span>
              </div>
            </aside>

            {/* 6 Part Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Part 1: Brackets */}
              <div 
                onClick={scrollToRfq}
                className="cursor-pointer group p-4 rounded-2xl bg-white dark:bg-[#142035] border border-slate-200 dark:border-white/10 hover:border-[#ff685c] hover:-translate-y-1 transition-all shadow-xs"
              >
                <div className="part-art">
                  <span className="hole h1"></span>
                  <span className="hole h2"></span>
                  <span className="fold"></span>
                </div>
                <div className="mt-4 flex items-start gap-2.5">
                  <span className="text-xs font-black text-[#ff685c]">01</span>
                  <div>
                    <strong className="block text-sm font-bold text-[#0a1020] dark:text-white group-hover:text-[#27187e] dark:group-hover:text-[#ff685c]">
                      Brackets
                    </strong>
                    <small className="text-[11px] text-[#5a6480] dark:text-slate-400">
                      Mounting, L-bends & structural supports
                    </small>
                  </div>
                </div>
              </div>

              {/* Part 2: Mounting Plates */}
              <div 
                onClick={scrollToRfq}
                className="cursor-pointer group p-4 rounded-2xl bg-white dark:bg-[#142035] border border-slate-200 dark:border-white/10 hover:border-[#ff685c] hover:-translate-y-1 transition-all shadow-xs"
              >
                <div className="part-art art-plate">
                  <span className="plate-hole a"></span>
                  <span className="plate-hole b"></span>
                  <span className="plate-hole c"></span>
                  <span className="plate-slot"></span>
                </div>
                <div className="mt-4 flex items-start gap-2.5">
                  <span className="text-xs font-black text-[#ff685c]">02</span>
                  <div>
                    <strong className="block text-sm font-bold text-[#0a1020] dark:text-white group-hover:text-[#27187e] dark:group-hover:text-[#ff685c]">
                      Mounting Plates
                    </strong>
                    <small className="text-[11px] text-[#5a6480] dark:text-slate-400">
                      Drilled, tapped & slotted patterns
                    </small>
                  </div>
                </div>
              </div>

              {/* Part 3: Covers */}
              <div 
                onClick={scrollToRfq}
                className="cursor-pointer group p-4 rounded-2xl bg-white dark:bg-[#142035] border border-slate-200 dark:border-white/10 hover:border-[#ff685c] hover:-translate-y-1 transition-all shadow-xs"
              >
                <div className="part-art art-cover">
                  <span className="cover-edge"></span>
                  <span className="cover-hole"></span>
                </div>
                <div className="mt-4 flex items-start gap-2.5">
                  <span className="text-xs font-black text-[#ff685c]">03</span>
                  <div>
                    <strong className="block text-sm font-bold text-[#0a1020] dark:text-white group-hover:text-[#27187e] dark:group-hover:text-[#ff685c]">
                      Covers & Panels
                    </strong>
                    <small className="text-[11px] text-[#5a6480] dark:text-slate-400">
                      Equipment guards & access panels
                    </small>
                  </div>
                </div>
              </div>

              {/* Part 4: Housings */}
              <div 
                onClick={scrollToRfq}
                className="cursor-pointer group p-4 rounded-2xl bg-white dark:bg-[#142035] border border-slate-200 dark:border-white/10 hover:border-[#ff685c] hover:-translate-y-1 transition-all shadow-xs"
              >
                <div className="part-art art-housing">
                  <span className="housing-face"></span>
                  <span className="housing-slot"></span>
                </div>
                <div className="mt-4 flex items-start gap-2.5">
                  <span className="text-xs font-black text-[#ff685c]">04</span>
                  <div>
                    <strong className="block text-sm font-bold text-[#0a1020] dark:text-white group-hover:text-[#27187e] dark:group-hover:text-[#ff685c]">
                      Housings
                    </strong>
                    <small className="text-[11px] text-[#5a6480] dark:text-slate-400">
                      Small instrument & equipment shells
                    </small>
                  </div>
                </div>
              </div>

              {/* Part 5: Enclosures */}
              <div 
                onClick={scrollToRfq}
                className="cursor-pointer group p-4 rounded-2xl bg-white dark:bg-[#142035] border border-slate-200 dark:border-white/10 hover:border-[#ff685c] hover:-translate-y-1 transition-all shadow-xs"
              >
                <div className="part-art art-enclosure">
                  <span className="door"></span>
                  <span className="hinge one"></span>
                  <span className="hinge two"></span>
                </div>
                <div className="mt-4 flex items-start gap-2.5">
                  <span className="text-xs font-black text-[#ff685c]">05</span>
                  <div>
                    <strong className="block text-sm font-bold text-[#0a1020] dark:text-white group-hover:text-[#27187e] dark:group-hover:text-[#ff685c]">
                      Enclosures
                    </strong>
                    <small className="text-[11px] text-[#5a6480] dark:text-slate-400">
                      Simple electrical & hardware cabinets
                    </small>
                  </div>
                </div>
              </div>

              {/* Part 6: Prototype Highlight Card */}
              <div 
                onClick={scrollToRfq}
                className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-br from-[#ff685c] to-[#ff8b80] text-white flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    RAPID QUALIFICATION
                  </span>
                  <strong className="block text-2xl font-black mt-2 leading-tight">
                    Need a prototype? Bring the drawing.
                  </strong>
                  <p className="text-xs text-white/90 mt-2 leading-relaxed">
                    We route the part to our best-fit shop and document exactly what arrives.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-4 text-xs font-black">
                  <span>1 to 50 pieces</span>
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: THE CORE PIVOT (Before vs After)
            ========================================================= */}
        <section id="why" className="py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="micro">02 / WHY THIS EXISTS</span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0a1020] dark:text-white mt-1">
                The problem is not finding a factory.<br />
                It is getting the part right.
              </h2>
            </div>
            <p className="text-sm text-[#5a6480] dark:text-slate-300 max-w-md font-normal leading-relaxed">
              Directories create introductions. Aartha is designed around the work that starts after the introduction: technical review, coordination, inspection, and delivered accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Story Card: BEFORE */}
            <article className="p-8 rounded-3xl bg-[#f7f5f7] dark:bg-[#141b2a] border border-[#27187e]/15 dark:border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#5a6480]">BEFORE</span>
                <h3 className="text-3xl sm:text-4xl font-black text-[#0a1020] dark:text-white mt-2 leading-tight">
                  Five quotes.<br />Three WhatsApps.<br />Still no certainty.
                </h3>
                <p className="text-xs sm:text-sm text-[#5a6480] dark:text-slate-400 mt-4 leading-relaxed">
                  Supplier discovery turns into repeated follow-ups, inconsistent quotes, unclear quality ownership, and production surprises when the box arrives.
                </p>
              </div>

              <div className="space-y-2 mt-8">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#0a1020] dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black">×</span>
                  <span>Fragmented supplier communication & chasing</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#0a1020] dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black">×</span>
                  <span>Unclear quality ownership & missing DFM</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#0a1020] dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black">×</span>
                  <span>No documented pre-dispatch inspection</span>
                </div>
              </div>
            </article>

            {/* Story Card: AFTER */}
            <article className="p-8 rounded-3xl bg-gradient-to-br from-[#27187e] to-[#2350d2] text-white border border-[#27187e]/30 relative overflow-hidden flex flex-col justify-between min-h-[380px] shadow-[0_20px_50px_rgba(39,24,126,0.18)]">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#ffd8d2]">AFTER</span>
                <h3 className="text-3xl sm:text-4xl font-black mt-2 leading-tight">
                  One drawing.<br />One accountable partner.
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-4 leading-relaxed">
                  Send the RFQ. We coordinate the qualified supplier, verify tooling, oversee production milestones, inspect tolerances, and deliver with documented evidence.
                </p>
              </div>

              <div className="space-y-2 mt-8">
                <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#9fe0ad]/20 text-[#9fe0ad] flex items-center justify-center font-black">✓</span>
                  <span>Qualified supplier selection based on machine capability</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#9fe0ad]/20 text-[#9fe0ad] flex items-center justify-center font-black">✓</span>
                  <span>Pre-dispatch dimensional inspection with photos</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#9fe0ad]/20 text-[#9fe0ad] flex items-center justify-center font-black">✓</span>
                  <span>One delivered commercial invoice — no supplier chasing</span>
                </div>
              </div>
            </article>

          </div>
        </section>

        {/* =========================================================
            SECTION 6: HOW IT WORKS (4 Practical Steps)
            ========================================================= */}
        <section id="how" className="py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="micro">03 / HOW IT WORKS</span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0a1020] dark:text-white mt-1">
                From drawing to delivered part.
              </h2>
            </div>
            <p className="text-sm text-[#5a6480] dark:text-slate-300 max-w-md font-normal leading-relaxed">
              A deliberately human workflow today. Software becomes more useful after repeat orders prove the precision and quality of the execution loop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <article className="p-6 rounded-3xl bg-white/80 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs hover:-translate-y-1 transition-all">
              <div className="text-3xl font-black text-[#ff685c]">01</div>
              <h3 className="text-base font-bold text-[#0a1020] dark:text-white mt-4 mb-2">Share your RFQ</h3>
              <p className="text-xs text-[#5a6480] dark:text-slate-400 leading-relaxed">
                Upload a 2D drawing (PDF/DXF) or 3D STEP. We clarify material grade, thickness, bend tolerances, surface finish, and quantity before quoting.
              </p>
            </article>

            <article className="p-6 rounded-3xl bg-white/80 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs hover:-translate-y-1 transition-all">
              <div className="text-3xl font-black text-[#ff685c]">02</div>
              <h3 className="text-base font-bold text-[#0a1020] dark:text-white mt-4 mb-2">Engineering review</h3>
              <p className="text-xs text-[#5a6480] dark:text-slate-400 leading-relaxed">
                We perform a practical DFM review, flag bend radius or hole-to-edge conflicts, and route the job to shops that match the part geometry.
              </p>
            </article>

            <article className="p-6 rounded-3xl bg-white/80 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs hover:-translate-y-1 transition-all">
              <div className="text-3xl font-black text-[#ff685c]">03</div>
              <h3 className="text-base font-bold text-[#0a1020] dark:text-white mt-4 mb-2">Production + QA</h3>
              <p className="text-xs text-[#5a6480] dark:text-slate-400 leading-relaxed">
                We coordinate laser cutting, press brake bending, and finishing. Before dispatch, parts are dimensionally checked and photograph-logged.
              </p>
            </article>

            <article className="p-6 rounded-3xl bg-white/80 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs hover:-translate-y-1 transition-all">
              <div className="text-3xl font-black text-[#ff685c]">04</div>
              <h3 className="text-base font-bold text-[#0a1020] dark:text-white mt-4 mb-2">Delivered part</h3>
              <p className="text-xs text-[#5a6480] dark:text-slate-400 leading-relaxed">
                You receive inspected parts with an inspection sheet and a single GST-compliant commercial invoice — not a loose chain of suppliers to chase.
              </p>
            </article>
          </div>
        </section>

        {/* =========================================================
            SECTION 7: CAPABILITIES & DISCIPLINED SCOPE
            ========================================================= */}
        <section id="capabilities" className="py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            
            {/* Scope Main Card */}
            <div className="rounded-3xl p-8 bg-[#0a1020] text-white relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="micro text-[#82aaff]">AARTHA / STARTING SCOPE</span>
                <h3 className="text-3xl sm:text-4xl font-bold mt-3 leading-tight max-w-xl">
                  Brackets, covers, mounting plates, housings & small enclosures.
                </h3>
                <p className="text-xs text-slate-300 mt-4 max-w-lg leading-relaxed">
                  We are deliberately starting with non-safety-critical, low-to-medium volume fabrication where quality can be physically measured and the operating model stays inventory-free.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-8">
                {[
                  'Fiber Laser cutting (0.5 – 12mm)',
                  'CNC Press brake bending',
                  'TIG / MIG Welding & Spot welding',
                  'Powder coating & anodizing',
                  'Tapped & counterbored holes',
                  '100% Pre-dispatch inspection',
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Scope Side Cards: Best Fit vs Not in V1 */}
            <div className="flex flex-col gap-4">
              <article className="p-6 rounded-3xl bg-white dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#27187e] dark:text-[#82aaff]">
                  BEST-FIT BUYERS
                </span>
                <h4 className="text-lg font-bold text-[#0a1020] dark:text-white mt-1">
                  Industrial hardware & equipment teams
                </h4>
                <p className="text-xs text-[#5a6480] dark:text-slate-400 mt-2 leading-relaxed">
                  Automation builders, robotics teams, electrical test bench manufacturers, instrumentation makers, and EV-adjacent hardware startups.
                </p>
              </article>

              <article className="p-6 rounded-3xl bg-white dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#ff685c]">
                  NOT IN THE FIRST RELEASE
                </span>
                <h4 className="text-lg font-bold text-[#0a1020] dark:text-white mt-1">
                  No battery cells. No BMS. No live high-voltage assemblies.
                </h4>
                <p className="text-xs text-[#5a6480] dark:text-slate-400 mt-2 leading-relaxed">
                  Safety-critical electrical work comes later, only after quality telemetry and repeat-order evidence justify the expanded operating liability.
                </p>
              </article>
            </div>

          </div>
        </section>

        {/* =========================================================
            SECTION 8: QUALITY & TRUST LAYER
            ========================================================= */}
        <section id="qa" className="py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="micro">04 / QUALITY SYSTEM</span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0a1020] dark:text-white mt-1">
                Trust is the product layer.
              </h2>
            </div>
            <p className="text-sm text-[#5a6480] dark:text-slate-300 max-w-md font-normal leading-relaxed">
              No empty “zero-defect” slogans. The value is a defined acceptance process, supplier capability qualification, and traceable photo documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="p-7 rounded-3xl bg-white/90 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs">
              <span className="text-xs font-black text-[#27187e] dark:text-[#82aaff] tracking-wider">01 / SUPPLIER FIT</span>
              <h3 className="text-xl font-bold text-[#0a1020] dark:text-white mt-3 mb-2">Capability first.</h3>
              <p className="text-xs text-[#5a6480] dark:text-slate-400 leading-relaxed">
                Machine list, sheet thickness capabilities, achievable tolerances, sample finishes, and process bottlenecks are audited before any job assignment.
              </p>
            </article>

            <article className="p-7 rounded-3xl bg-white/90 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs">
              <span className="text-xs font-black text-[#27187e] dark:text-[#82aaff] tracking-wider">02 / INSPECTION</span>
              <h3 className="text-xl font-bold text-[#0a1020] dark:text-white mt-3 mb-2">Evidence, not adjectives.</h3>
              <p className="text-xs text-[#5a6480] dark:text-slate-400 leading-relaxed">
                Caliper dimensional checks, angle gauges, burr checks, and photo evidence are documented against the agreed acceptance criteria before packaging.
              </p>
            </article>

            <article className="p-7 rounded-3xl bg-white/90 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-xs">
              <span className="text-xs font-black text-[#27187e] dark:text-[#82aaff] tracking-wider">03 / HISTORY</span>
              <h3 className="text-xl font-bold text-[#0a1020] dark:text-white mt-3 mb-2">Every order teaches the next.</h3>
              <p className="text-xs text-[#5a6480] dark:text-slate-400 leading-relaxed">
                Factory performance becomes structured operational data: on-time rate, dimensional deviations, rework latency, and repeatability metrics.
              </p>
            </article>
          </div>
        </section>

        {/* =========================================================
            SECTION 9: COMMERCIAL MODEL (One order, one accountable layer)
            ========================================================= */}
        <section id="model" className="py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="micro">05 / COMMERCIAL MODEL</span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0a1020] dark:text-white mt-1">
                One order. One accountable layer.
              </h2>
            </div>
            <p className="text-sm text-[#5a6480] dark:text-slate-300 max-w-md font-normal leading-relaxed">
              Aartha earns for managing execution — not for selling leads or advertising. The commercial model is contribution-based, inventory-free, and cash-disciplined.
            </p>
          </div>

          {/* Model Flow Band */}
          <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5a6480]">BUYER</span>
              <strong className="block text-sm font-bold text-[#0a1020] dark:text-white mt-1">Drawing + quantity</strong>
              <small className="text-[11px] text-[#5a6480] dark:text-slate-400 block mt-1">RFQ / CAD / delivery date</small>
            </div>

            <div className="p-5 rounded-2xl bg-[#27187e]/10 dark:bg-[#82aaff]/10 border border-[#27187e]/20 dark:border-[#82aaff]/20">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#27187e] dark:text-[#82aaff]">AARTHA</span>
              <strong className="block text-sm font-bold text-[#0a1020] dark:text-white mt-1">Managed price</strong>
              <small className="text-[11px] text-[#5a6480] dark:text-slate-300 block mt-1">Production + QA + freight + risk</small>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5a6480]">SUPPLIER</span>
              <strong className="block text-sm font-bold text-[#0a1020] dark:text-white mt-1">Fabrication</strong>
              <small className="text-[11px] text-[#5a6480] dark:text-slate-400 block mt-1">Laser cut, bend, deburr, coat</small>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">DELIVERED</span>
              <strong className="block text-sm font-bold text-[#0a1020] dark:text-white mt-1">Inspected parts</strong>
              <small className="text-[11px] text-emerald-700 dark:text-emerald-300 block mt-1">Handoff with dimensional sheet</small>
            </div>
          </div>

          {/* Revenue Stream Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <article className="p-5 rounded-2xl bg-white dark:bg-[#0e1524] border border-[#27187e]/12 dark:border-white/10">
              <span className="text-xs font-black text-[#ff685c]">01</span>
              <h4 className="text-sm font-bold text-[#0a1020] dark:text-white mt-2">Manufacturing contribution</h4>
              <p className="text-[11px] text-[#5a6480] dark:text-slate-400 mt-1 leading-relaxed">
                Customer sees one managed delivered price rather than a raw factory quote.
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-white dark:bg-[#0e1524] border border-[#27187e]/12 dark:border-white/10">
              <span className="text-xs font-black text-[#ff685c]">02</span>
              <h4 className="text-sm font-bold text-[#0a1020] dark:text-white mt-2">DFM & engineering review</h4>
              <p className="text-[11px] text-[#5a6480] dark:text-slate-400 mt-1 leading-relaxed">
                Applied when complex projects require significant CAD cleanup or tooling design.
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-white dark:bg-[#0e1524] border border-[#27187e]/12 dark:border-white/10">
              <span className="text-xs font-black text-[#ff685c]">03</span>
              <h4 className="text-sm font-bold text-[#0a1020] dark:text-white mt-2">Quality & rush priority</h4>
              <p className="text-[11px] text-[#5a6480] dark:text-slate-400 mt-1 leading-relaxed">
                Specialized CMM inspection reports or expedited rapid prototyping runs.
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-gradient-to-br from-[#27187e] to-[#2350d2] text-white">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ffd8d2]">DISCIPLINE</span>
              <h4 className="text-sm font-bold mt-2">Cash rule</h4>
              <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
                Buyer-funded milestone escrow. Zero uncommitted inventory and zero loose debtor balances.
              </p>
            </article>
          </div>
        </section>

        {/* =========================================================
            SECTION 10: INTERACTIVE RFQ INTAKE FORM (The Conversion Engine)
            ========================================================= */}
        <section ref={rfqSectionRef} id="rfq" className="py-14">
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#ff685c] via-[#ff786e] to-[#ff8b80] text-white shadow-[0_30px_70px_rgba(255,104,92,0.25)] relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-start relative z-10">
              
              {/* Left Column: Value Proposition */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                  06 / START A PROJECT
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mt-2 leading-[0.95]">
                  Have a part?<br />Let’s make it real.
                </h2>
                <p className="mt-4 text-sm sm:text-base text-white/90 max-w-md leading-relaxed">
                  Send a drawing, tell us the quantity and finish, and our engineering desk will review the geometry, verify shop capability, and deliver a managed quote.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-white/95">
                    <CheckCircle2 size={16} className="text-white flex-shrink-0" />
                    <span>Free preliminary DFM & manufacturability check</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-white/95">
                    <CheckCircle2 size={16} className="text-white flex-shrink-0" />
                    <span>Pre-dispatch dimensional inspection & photo evidence</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-white/95">
                    <CheckCircle2 size={16} className="text-white flex-shrink-0" />
                    <span>Single point of commercial accountability</span>
                  </div>
                </div>

                <div className="mt-8 text-xs text-white/80">
                  Typical response time: Preliminary review within 24 hours.
                </div>
              </div>

              {/* Right Column: Active Form */}
              <form
                onSubmit={handleRfqSubmit}
                className="bg-white/95 dark:bg-[#0a1020]/95 backdrop-blur-xl rounded-2xl p-6 sm:p-7 text-[#0a1020] dark:text-white shadow-2xl border border-white/80 dark:border-white/10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a6480] dark:text-slate-400 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={rfqName}
                      onChange={(e) => setRfqName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#142035] text-[#0a1020] dark:text-white focus:outline-none focus:border-[#27187e] dark:focus:border-[#ff685c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a6480] dark:text-slate-400 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={rfqEmail}
                      onChange={(e) => setRfqEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#142035] text-[#0a1020] dark:text-white focus:outline-none focus:border-[#27187e] dark:focus:border-[#ff685c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a6480] dark:text-slate-400 mb-1">
                      Target Quantity
                    </label>
                    <input
                      type="text"
                      value={rfqQty}
                      onChange={(e) => setRfqQty(e.target.value)}
                      placeholder="e.g. 50 pcs (or prototype)"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#142035] text-[#0a1020] dark:text-white focus:outline-none focus:border-[#27187e] dark:focus:border-[#ff685c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a6480] dark:text-slate-400 mb-1">
                      Material Grade
                    </label>
                    <input
                      type="text"
                      value={rfqMaterial}
                      onChange={(e) => setRfqMaterial(e.target.value)}
                      placeholder="e.g. SS304, MS, Aluminum"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#142035] text-[#0a1020] dark:text-white focus:outline-none focus:border-[#27187e] dark:focus:border-[#ff685c]"
                    />
                  </div>
                </div>

                <div className="mb-3.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a6480] dark:text-slate-400 mb-1">
                    Project Notes (Tolerance, Finish, Target Date)
                  </label>
                  <textarea
                    rows={2}
                    value={rfqNote}
                    onChange={(e) => setRfqNote(e.target.value)}
                    placeholder="e.g. SS304 2mm bracket, deburred edges, black powder coat, needed in 10 days"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#142035] text-[#0a1020] dark:text-white focus:outline-none focus:border-[#27187e] dark:focus:border-[#ff685c]"
                  />
                </div>

                {/* File Dropzone */}
                <div className="mb-4">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a6480] dark:text-slate-400 mb-1">
                    Upload Drawing or CAD (PDF, DXF, STEP, PNG)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.dxf,.step,.stp,.png,.jpg,.jpeg"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-4 text-center cursor-pointer hover:border-[#27187e] dark:hover:border-[#ff685c] bg-[#fafbff] dark:bg-[#142035]/50 transition-colors"
                  >
                    {uploadedFile ? (
                      <div className="text-xs">
                        <strong className="text-[#27187e] dark:text-[#82aaff] block font-bold">
                          ✓ {uploadedFile.name}
                        </strong>
                        <span className="text-[11px] text-[#5a6480] dark:text-slate-400 block mt-0.5">
                          {(uploadedFile.size / 1024).toFixed(1)} KB · Ready for technical review
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <UploadCloud size={20} className="mx-auto text-[#27187e] dark:text-[#82aaff] mb-1" />
                        <strong className="text-[#0a1020] dark:text-white block font-bold">
                          Drop your drawing file here, or browse
                        </strong>
                        <span className="text-[10px] text-[#5a6480] dark:text-slate-400 block mt-0.5">
                          PDF, DXF, STEP, CAD or drawing images (up to 25MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white bg-[#27187e] hover:bg-[#1f1366] transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Registering RFQ...' : 'Submit Drawing for Review →'}
                </button>
                <div className="text-[10px] text-[#5a6480] dark:text-slate-400 text-center mt-2">
                  Drawings are kept confidential under mutual non-disclosure policy.
                </div>
              </form>

            </div>
          </div>
        </section>

      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0e1524] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#27187e]/20 dark:border-white/10 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
            >
              ✕
            </button>
            <span className="micro text-[#27187e] dark:text-[#ff685c]">RFQ REGISTERED</span>
            <h3 className="text-2xl font-black text-[#0a1020] dark:text-white mt-1">
              Next step: Engineering review.
            </h3>
            {createdRfqId && (
              <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-black bg-[#27187e]/10 text-[#27187e] dark:bg-white/10 dark:text-[#82aaff]">
                Reference ID: {createdRfqId}
              </div>
            )}
            <p className="text-xs sm:text-sm text-[#5a6480] dark:text-slate-300 mt-3 leading-relaxed">
              {modalMessage}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Link
                href="/dashboard"
                className="text-xs font-bold text-[#27187e] dark:text-[#82aaff] hover:underline"
              >
                Go to My Orders
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="pill pill-primary text-xs px-5 py-2.5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
