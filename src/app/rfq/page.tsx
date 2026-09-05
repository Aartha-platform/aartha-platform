"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Award, Clock, Lock, CheckCircle2, Copy, 
  Check, ArrowRight, Sparkles, MessageCircle, FileText, 
  HelpCircle, ChevronRight, Layers, CheckCircle
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import MultiStepForm from '@/components/MultiStepForm';
import WhatsAppButton from '@/components/WhatsAppButton';
import { RFQFormData } from '@/types';

const emptyFormData: RFQFormData = {
  product: '',
  description: '',
  category: 'Engineering & Industrial Machinery',
  images: [],
  quantity: '25',
  unit: 'Pieces',
  targetPrice: '',
  specifications: 'Material: SS304; Process: LASER_BEND; Finish: MILL; Timeline: standard;',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  country: 'India',
};

const rfqSteps = ['Part Requirements', 'Drawings & Files', 'Quantity & Specs', 'Contact & Delivery'];

const benefitBadges = [
  { label: 'DFM Review in 24 Hours', icon: ShieldCheck },
  { label: 'Documented Inspection & QA', icon: Award },
  { label: 'Single Accountable Invoice', icon: Clock },
  { label: 'Mutual NDA Confidential', icon: Lock },
];

function RFQContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RFQFormData>(emptyFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [rfqId, setRfqId] = useState('');
  const [dealId, setDealId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Read intent or part family from query parameters
  useEffect(() => {
    const intent = searchParams.get('intent');
    const family = searchParams.get('family');
    const part = searchParams.get('part');

    if (family || part) {
      const partName = part || (family ? `${family.charAt(0).toUpperCase() + family.slice(1)} Component` : '');
      setFormData((prev) => ({
        ...prev,
        product: partName,
        description: `Custom ${partName} requirement for hardware assembly.`,
      }));
    } else if (intent === 'idea') {
      setFormData((prev) => ({
        ...prev,
        product: 'New Physical Product Idea',
        description: 'I have a product concept or sketch. Need help with DFM, material selection, and prototype fabrication.',
      }));
    } else if (intent === 'prototype') {
      setFormData((prev) => ({
        ...prev,
        product: 'Precision Prototype Batch',
        quantity: '5',
        description: 'Fast-turnaround prototype batch for functional fit testing and engineering validation.',
      }));
    } else if (intent === 'repeat') {
      setFormData((prev) => ({
        ...prev,
        product: 'Production Repeat Order',
        quantity: '250',
        description: 'Repeat batch fabrication to tight dimensional tolerances with inspection certification.',
      }));
    }
  }, [searchParams]);

  const handleFormDataChange = (data: Partial<RFQFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleApiSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        product: formData.product || 'Custom Sheet Metal Part',
        category: formData.category || 'Engineering & Industrial Machinery',
        description: `${formData.description || 'Custom fabrication part'}${
          formData.images.length > 0 ? ` (Attached files: ${formData.images.map((f) => f.name).join(', ')})` : ''
        }`,
        quantity: formData.quantity || '25',
        unit: formData.unit || 'Pieces',
        targetPrice: formData.targetPrice,
        specifications: formData.specifications,
        companyName: formData.companyName || 'Independent Founder / Hardware Team',
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country || 'India',
      };

      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed. Please check the fields and try again.');
        return;
      }

      setRfqId(data.id || 'RFQ-' + Math.floor(10000 + Math.random() * 90000));
      if (data.dealId) setDealId(data.dealId);
      setIsSubmitted(true);
    } catch {
      setSubmitError('Network connection issue. Please verify your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(rfqId).catch(() => {
      window.prompt('Copy RFQ ID:', rfqId);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#f8fafc] font-sans min-h-screen py-10 sm:py-14 text-[#0f172a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-[#eff6ff] text-[#2563eb] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#dbeafe]">
            <i>•</i> Aartha Managed Intake
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0f172a] leading-tight">
            Send us your drawing. We handle the rest.
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] max-w-2xl mx-auto leading-relaxed">
            From technical CAD review and audited factory routing to pre-dispatch dimensional inspection and door delivery.
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {benefitBadges.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-white text-[#334155] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#e2e8f0] shadow-xs"
              >
                <Icon size={13} className="text-[#f97316]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Progress Bar */}
        {!isSubmitted && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 mb-8 shadow-xs">
            <ProgressBar steps={rfqSteps} currentStep={currentStep} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          
          {/* Main Form or Submission Result */}
          <div className="space-y-6">
            {!isSubmitted ? (
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 shadow-xs">
                {submitError && (
                  <div className="mb-6 bg-[#fef2f2] text-[#ef4444] text-xs font-semibold p-4 rounded-xl border border-[#fee2e2]">
                    {submitError}
                  </div>
                )}
                <MultiStepForm
                  currentStep={currentStep}
                  formData={formData}
                  onStepChange={setCurrentStep}
                  onFormDataChange={handleFormDataChange}
                  onSubmit={handleApiSubmit}
                />
              </div>
            ) : (
              /* Managed Intake Confirmation */
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto border border-[#a7f3d0]">
                    <CheckCircle2 size={28} className="text-[#059669]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">
                    RFQ Successfully Registered
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed max-w-lg mx-auto">
                    Your specifications and drawings are securely queued for Aartha engineering review. We perform a full DFM geometry check and prepare your managed quotation.
                  </p>
                </div>

                {/* RFQ Reference ID Box */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">
                        Managed RFQ Identifier
                      </div>
                      <div className="font-mono text-base font-black text-[#0f172a] mt-0.5">
                        {rfqId}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyId}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        copied 
                          ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]' 
                          : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      }`}
                    >
                      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy ID</>}
                    </button>
                  </div>

                  {/* 4-Stage Execution Timeline */}
                  <div className="border-t border-[#e2e8f0] pt-4 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                      Workflow Progress
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-left">
                      <div className="bg-white border border-[#2563eb] rounded-lg p-3">
                        <div className="text-[10px] font-bold text-[#2563eb] uppercase">01 Review</div>
                        <div className="text-xs font-bold text-[#0f172a] mt-0.5">DFM Check</div>
                        <div className="text-[10px] text-[#059669] font-semibold mt-1">● In Progress</div>
                      </div>
                      <div className="bg-white border border-[#e2e8f0] rounded-lg p-3">
                        <div className="text-[10px] font-bold text-[#94a3b8] uppercase">02 Routing</div>
                        <div className="text-xs font-bold text-[#64748b] mt-0.5">Shop Fit</div>
                        <div className="text-[10px] text-[#94a3b8] mt-1">Pending Review</div>
                      </div>
                      <div className="bg-white border border-[#e2e8f0] rounded-lg p-3">
                        <div className="text-[10px] font-bold text-[#94a3b8] uppercase">03 Quote</div>
                        <div className="text-xs font-bold text-[#64748b] mt-0.5">Delivered Price</div>
                        <div className="text-[10px] text-[#94a3b8] mt-1">Within 24-48h</div>
                      </div>
                      <div className="bg-white border border-[#e2e8f0] rounded-lg p-3">
                        <div className="text-[10px] font-bold text-[#94a3b8] uppercase">04 QA</div>
                        <div className="text-xs font-bold text-[#64748b] mt-0.5">Inspection</div>
                        <div className="text-[10px] text-[#94a3b8] mt-1">Pre-dispatch</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                  {dealId && (
                    <Link
                      href={`/deals/${dealId}`}
                      className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all no-underline shadow-sm"
                    >
                      <Sparkles size={14} />
                      <span>Enter Deal Room</span>
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all no-underline"
                  >
                    <span>View Workspace</span>
                  </Link>
                  <WhatsAppButton
                    phoneNumber="+91 72084 32138"
                    message={`Hi Aartha Engineering! I just submitted RFQ ${rfqId} for "${formData.product}". Could you please check drawing manufacturability?`}
                    label="Chat with Engineering on WhatsApp"
                  />
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData(emptyFormData);
                      setCurrentStep(1);
                    }}
                    className="text-xs font-bold text-[#2563eb] hover:underline px-3 py-2 cursor-pointer"
                  >
                    + Submit Another Drawing
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Sidebar: Aartha Managed Guarantee */}
          <div className="sticky top-24 space-y-5">
            
            {/* Guarantee Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2563eb]">
                  The Aartha Model
                </span>
                <h3 className="font-bold text-sm text-[#0f172a]">
                  One Accountable Partner
                </h3>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed">
                You never have to browse 50 factories, chase quotes across WhatsApp, or coordinate separate QA agencies. Aartha takes responsibility from drawing to delivery.
              </p>

              <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
                <div className="flex items-start gap-2.5 text-xs text-[#334155]">
                  <CheckCircle size={15} className="text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0f172a]">DFM Engineering Check:</span>
                    <span className="text-[#64748b] ml-1">We inspect bend radii, punch clearances, and nesting to avoid shop floor scrap.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#334155]">
                  <CheckCircle size={15} className="text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0f172a]">Audited Gujarat Shops:</span>
                    <span className="text-[#64748b] ml-1">Routed to proven laser cutting and CNC press brake shops in Rajkot, Ahmedabad, and Vadodara.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#334155]">
                  <CheckCircle size={15} className="text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0f172a]">Inspection Evidence:</span>
                    <span className="text-[#64748b] ml-1">Vernier caliper measurements and macro photo evidence documented before dispatch.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Support Card */}
            <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1d4ed8]">
                <MessageCircle size={15} />
                <span>Need quick guidance before submitting?</span>
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Speak directly with an Aartha mechanical engineer to discuss part feasibility, tolerances, or batch pricing.
              </p>
              <div className="pt-1">
                <WhatsAppButton
                  phoneNumber="+91 72084 32138"
                  message="Hi Aartha! I'm planning a sheet-metal part manufacturing run and have a few questions before submitting my RFQ."
                  label="Message Engineering Desk"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default function RFQPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-[#64748b]">Loading RFQ intake...</div>}>
      <RFQContent />
    </Suspense>
  );
}
