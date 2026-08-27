"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Clock, Lock, CheckCircle, Copy, Check, MapPin, Sparkles } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import MultiStepForm from '@/components/MultiStepForm';
import QuoteComparisonTable from '@/components/QuoteComparisonTable';
import WhatsAppButton from '@/components/WhatsAppButton';
import MarketPriceIntel from '@/components/MarketPriceIntel';
import { calculateSupplierMatch } from '@/lib/aiMatching';
import { rfqQuotes } from '@/data/rfqQuotes';
import { suppliers } from '@/data/suppliers';
import { RFQFormData } from '@/types';


const emptyFormData: RFQFormData = {
  product: '', description: '', category: '', images: [],
  quantity: '', unit: '', targetPrice: '', specifications: '',
  companyName: '', contactName: '', email: '', phone: '', country: '',
};

const rfqSteps = ['Sourcing Specs', 'Quantity & Specs', 'Company Details'];

const benefitBadges = [
  { label: 'Verified Suppliers Only', icon: ShieldCheck },
  { label: 'Corridor Routing', icon: Award },
  { label: 'Zero Spam', icon: Lock },
];

export default function RFQPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RFQFormData>(emptyFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [rfqId, setRfqId] = useState('');
  const [copied, setCopied] = useState(false);

  const suggestedSuppliers = suppliers.filter(s => s.isVerified).slice(0, 3);

  const handleFormDataChange = (data: Partial<RFQFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleApiSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        product: formData.product,
        category: formData.category,
        description: formData.description,
        quantity: formData.quantity,
        unit: formData.unit,
        targetPrice: formData.targetPrice,
        specifications: formData.specifications,
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
      };
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed. Please try again.');
        return;
      }
      setRfqId(data.id);
      setIsSubmitted(true);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
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
    <div className="bg-cream font-sans min-h-screen py-8 text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 space-y-3">
          <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-wide">
            Request a Quote (RFQ)
          </h1>
          <div className="flex flex-wrap justify-center gap-2">
            {benefitBadges.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5 bg-navy/10 text-navy px-3 py-1 rounded-full text-xs font-bold border border-navy/5">
                <Icon size={12} className="text-gold" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="bg-white border border-border-default rounded-xl p-5 mb-6 shadow-2xs">
            <ProgressBar steps={rfqSteps} currentStep={currentStep} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left: Form or Confirmation */}
          <div className="space-y-6">
            {!isSubmitted ? (
              <div className="bg-white border border-border-default rounded-xl p-6 shadow-2xs">
                <h2 className="font-bold text-sm uppercase tracking-wider text-text-primary mb-5 border-b border-border-default/50 pb-2">
                  {currentStep === 1 && 'Step 1: Sourcing Requirements'}
                  {currentStep === 2 && 'Step 2: Volume & Technical Specs'}
                  {currentStep === 3 && 'Step 3: Verification & Submission'}
                </h2>
                {submitError && (
                  <div className="mb-4 bg-trust-red-bg text-trust-red text-xs font-semibold p-3 rounded-lg border border-trust-red/15">
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
              <div className="space-y-6">
                {/* Confirmation */}
                <div className="bg-white border border-border-default rounded-xl p-6 space-y-6 shadow-2xs">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-trust-green-bg rounded-full flex items-center justify-center mx-auto border border-trust-green/20 animate-bounce">
                      <CheckCircle size={24} className="text-trust-green" />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                      RFQ Successfully Dispatched
                    </h2>
                    <p className="text-text-secondary text-xs leading-relaxed max-w-md mx-auto">
                      Your sourcing request has been validated and georouted to verified manufacturers in the Gujarat industrial corridor. Quotes are expected in 24–48 hours.
                    </p>
                  </div>

                  <div className="bg-cream-secondary border border-border-default rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Sourcing RFQ ID</div>
                        <div className="font-bold text-navy font-mono text-sm">{rfqId}</div>
                      </div>
                      <button
                        onClick={handleCopyId}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                          copied ? 'bg-trust-green-bg text-trust-green border border-trust-green/30' : 'bg-navy text-white hover:bg-navy-light'
                        }`}
                      >
                        {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy ID</>}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center border-t border-border-default/50 pt-3">
                      <div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Responses</div>
                        <div className="font-bold text-xs mt-0.5">24–48 Hours</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Notified</div>
                        <div className="font-bold text-xs text-navy mt-0.5">8 plants</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">State</div>
                        <span className="bg-trust-green-bg text-trust-green text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-trust-green/20">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link href="/dashboard" className="bg-navy hover:bg-navy-light text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all no-underline text-center">
                      Go to Buyer Workspace
                    </Link>
                    <WhatsAppButton
                      phoneNumber="+91 72084 32138"
                      message={`Hi! I have just submitted a new RFQ with ID ${rfqId} on Aartha. Please expedite matching.`}
                      label="Expedite via WhatsApp"
                    />
                    <button onClick={() => { setIsSubmitted(false); setFormData(emptyFormData); setCurrentStep(1); }} className="text-gold text-xs font-bold hover:underline cursor-pointer select-none">
                      Submit Another RFQ →
                    </button>
                  </div>
                </div>

                {/* Market Price Intelligence Benchmark */}
                <MarketPriceIntel 
                  productName={formData.product || 'Paracetamol API'} 
                  targetPrice={formData.targetPrice ? parseFloat(formData.targetPrice.replace(/[^0-9.]/g, '')) : undefined} 
                />

                {/* Pre-Match Quotes Table */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary pl-1">Pre-Match Quote Simulations ({rfqQuotes.length})</h3>
                  <QuoteComparisonTable
                    quotes={rfqQuotes}
                    onQuoteView={(quote) => alert(`Viewing details for quote from ${quote.supplier.companyName}`)}
                    onChatClick={(name) => alert(`Opening chat with ${name}`)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Suggested Suppliers */}
          <div>
            <div className="bg-white border border-border-default rounded-xl p-4 sticky top-20 space-y-4 shadow-2xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary">Suggested Matches</h3>
              <p className="text-[11px] text-text-muted">Physically visited GIDC plants matching category:</p>
              <div className="space-y-3">
                {suggestedSuppliers.map((s) => {
                  const matchResult = calculateSupplierMatch(s, {
                    category: s.category,
                    certifications: s.certifications,
                    gidcZone: s.location.gidcZone
                  });
                  return (
                    <div key={s.id} className="flex flex-col gap-2 p-3 border border-border-default rounded-xl bg-cream-secondary/20 hover:border-gold/30 transition-all text-xs">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 bg-navy text-white font-bold rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                          {s.companyName[0]}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="font-bold text-xs text-text-primary leading-tight truncate">{s.companyName}</div>
                          <div className="text-[10px] text-text-muted flex items-center gap-1">
                            <MapPin size={10} className="text-gold" /> {s.location.city}
                          </div>
                          {s.isVerified && (
                            <div className="text-[10px] font-bold text-trust-green flex items-center gap-1 mt-0.5">
                              ✓ Verified
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-border-default/45 mt-1 space-y-1">
                        <div className="flex justify-between font-bold text-[9px] text-navy uppercase font-mono">
                          <span>Match Score</span>
                          <span>{matchResult.score}/100</span>
                        </div>
                        <div className="text-[9px] text-text-secondary leading-normal font-semibold">
                          {matchResult.reasons[0]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
