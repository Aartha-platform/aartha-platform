"use client";

import { useState, useEffect } from 'react';
import { Zap, ShieldCheck, Check, RefreshCw, AlertCircle, Sparkles, Star } from 'lucide-react';
import { saveWorkspaceUpgrade } from '@/lib/workspaceUpgrade';

interface UpgradeModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const steps = [
  "Checking GSTIN corporate registry...",
  "Validating geocoded manufacturing coordinates...",
  "Checking D&B financial risk score card...",
  "Establishing secure digital trade audit trails...",
  "Registering Verified Buyer Pro licenses..."
];

export default function UpgradeModal({ onSuccess, onCancel }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card');
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');

  const getPrice = () => {
    if (selectedPlan === 'pro') {
      return billingPeriod === 'annual' ? 41.5 : 49;
    } else {
      return billingPeriod === 'annual' ? 166.5 : 199;
    }
  };

  const getFormattedTotal = () => {
    if (selectedPlan === 'pro') {
      return billingPeriod === 'annual' ? '$499 / year' : '$49 / month';
    } else {
      return billingPeriod === 'annual' ? '$1,999 / year' : '$199 / month';
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && currentStep < steps.length) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            // Save local Pro status
            saveWorkspaceUpgrade({
              isPro: true,
              upgradedAt: new Date().toISOString(),
              planName: `${selectedPlan === 'pro' ? 'Sourcing Pro' : 'Enterprise Sourcing'} (${billingPeriod === 'annual' ? 'Annual' : 'Monthly'})`
            });
            setTimeout(() => {
              setLoading(false);
              onSuccess();
            }, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, currentStep, billingPeriod, selectedPlan, onSuccess]);

  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'card') {
      if (!cardNumber.trim() || cardNumber.length < 15) {
        return setError('Please enter a valid credit card number.');
      }
      if (!expiry.trim() || !expiry.includes('/')) {
        return setError('Please enter card expiry date (MM/YY).');
      }
      if (!cvv.trim() || cvv.length < 3) {
        return setError('Please enter CVV.');
      }
    } else {
      if (!companyName.trim()) {
        return setError('Please enter your company registered name.');
      }
      if (!purchaseOrderNumber.trim()) {
        return setError('Please enter a valid Purchase Order (PO) number.');
      }
    }

    setLoading(true);
    setCurrentStep(0);
  };

  return (
    <div className="font-sans text-xs text-text-primary">
      {!loading ? (
        <form onSubmit={handleUpgrade} className="space-y-4">
          <div className="bg-gradient-to-r from-navy via-navy-light to-navy-dark border border-gold/20 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full filter blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-2 z-10 relative">
              <div className="bg-gold p-1 rounded-lg text-white">
                <Zap size={14} className="text-navy fill-navy animate-pulse" />
              </div>
              <h4 className="font-black uppercase tracking-wider text-gold text-xs">Verify Sourcing Workspace</h4>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed font-semibold z-10 relative">
              Gain access to global corridors and verified premium Gujarat manufacturing plants with advanced priority tools.
            </p>
          </div>

          {error && (
            <div className="bg-trust-red-bg text-trust-red border border-trust-red/20 p-2.5 rounded-lg flex items-center gap-1.5 font-semibold">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Plan Selection Toggle */}
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-bold tracking-wider text-text-muted">Select Sourcing Plan</label>
            <div className="grid grid-cols-2 gap-2 bg-cream-secondary/40 border border-border-default p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan('pro');
                  setPaymentMethod('card'); // Reset payment method to card if switching to pro
                }}
                className={`py-2 px-3 text-left rounded-lg transition-all cursor-pointer select-none ${
                  selectedPlan === 'pro'
                    ? 'bg-white text-navy shadow-3xs border border-border-default/45'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                <div className="font-bold text-[11px]">Sourcing Pro</div>
                <div className="text-[9px] text-text-muted mt-0.5">For active buyers ($49/mo)</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan('enterprise')}
                className={`py-2 px-3 text-left rounded-lg transition-all cursor-pointer select-none ${
                  selectedPlan === 'enterprise'
                    ? 'bg-white text-navy shadow-3xs border border-border-default/45'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                <div className="font-bold text-[11px]">Enterprise Sourcing</div>
                <div className="text-[9px] text-text-muted mt-0.5">For procurement teams ($199/mo)</div>
              </button>
            </div>
          </div>

          {/* Billing Period Toggle */}
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-bold tracking-wider text-text-muted">Billing Cycle</label>
            <div className="bg-cream-secondary/40 border border-border-default p-1 rounded-xl flex gap-1">
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 py-2 text-center rounded-lg font-bold transition-all cursor-pointer select-none ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-navy shadow-3xs'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                Annual Billing (${getPrice()}/mo)
                <span className="block text-[8px] text-trust-green font-extrabold uppercase mt-0.5">Save ~15%</span>
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 py-2 text-center rounded-lg font-bold transition-all cursor-pointer select-none ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-navy shadow-3xs'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                Monthly Billing (${getPrice()}/mo)
                <span className="block text-[8px] text-text-muted font-semibold mt-0.5">Billed monthly</span>
              </button>
            </div>
          </div>

          {/* Features Checkbox list based on chosen plan */}
          <div className="space-y-2 border border-border-default/60 rounded-xl p-3.5 bg-cream/15">
            <h5 className="font-bold text-[9px] uppercase tracking-wider text-text-muted">
              {selectedPlan === 'pro' ? 'Sourcing Pro Perks:' : 'Enterprise Sourcing Perks:'}
            </h5>
            <ul className="space-y-1.5 font-semibold text-[10px]">
              {selectedPlan === 'pro' ? (
                <>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>Unlimited RFQs submission (vs. 3 / month limits)</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>5-way Supplier Comparison Matrix dashboard</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>Download full physical verification GPS logs & audit reports</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>Priority matchmaking routing (suppliers notified first)</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>Multi-user Team Access (up to 10 buyer seats included)</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>Compliance document vault auto-expiry tracking (ISO, WHO-GMP)</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>Dedicated sourcing coordinator (Human representative support)</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary">
                    <Check size={12} className="text-trust-green flex-shrink-0" />
                    <span>Real-time Port Log & Mandi commodity index reports</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-bold tracking-wider text-text-muted">Payment Method</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-1.5 text-center border rounded-lg font-bold text-[10px] cursor-pointer select-none transition-all ${
                  paymentMethod === 'card'
                    ? 'border-navy bg-navy/5 text-navy'
                    : 'border-border-default text-text-secondary hover:bg-cream/20'
                }`}
              >
                Credit Card
              </button>
              <button
                type="button"
                disabled={selectedPlan !== 'enterprise'}
                onClick={() => setPaymentMethod('invoice')}
                className={`flex-1 py-1.5 text-center border rounded-lg font-bold text-[10px] cursor-pointer select-none transition-all ${
                  selectedPlan !== 'enterprise'
                    ? 'opacity-40 cursor-not-allowed border-border-default text-text-muted'
                    : paymentMethod === 'invoice'
                    ? 'border-navy bg-navy/5 text-navy'
                    : 'border-border-default text-text-secondary hover:bg-cream/20'
                }`}
              >
                PO Invoice (Enterprise Only)
              </button>
            </div>
          </div>

          {/* Billing Form Fields */}
          {paymentMethod === 'card' ? (
            <div className="space-y-3">
              <h5 className="font-bold text-[9px] uppercase tracking-wider text-text-muted">Credit Card Details (Sandbox)</h5>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.length === 2 && !val.includes('/')) {
                          val = val + '/';
                        }
                        setExpiry(val.slice(0, 5));
                      }}
                      className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h5 className="font-bold text-[9px] uppercase tracking-wider text-text-muted">PO Billing Details</h5>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Registered Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Globex Procurement Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Purchase Order (PO) #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-2026-9874"
                    value={purchaseOrderNumber}
                    onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-2">
            <Star size={14} className="text-amber-500 flex-shrink-0 mt-0.5 fill-amber-500 animate-spin-slow" />
            <p className="text-[9px] text-amber-700 leading-normal font-semibold">
              <strong>Simulated Sandbox:</strong> No actual transaction charges will occur. This payment represents a functional simulation to test trade validation desk integrations.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-default/45">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-border-strong rounded-lg text-text-secondary hover:bg-cream cursor-pointer font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck size={14} />
              <span>Activate Sourcing Workspace ({getFormattedTotal()})</span>
            </button>
          </div>
        </form>
      ) : (
        /* Sourcing Verification Loading steps */
        <div className="py-6 flex flex-col items-center justify-center space-y-5 text-center min-h-[320px]">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-gold/10 border-t-gold rounded-full animate-spin"></div>
            <Sparkles size={24} className="text-gold animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="font-extrabold text-navy text-xs uppercase tracking-wider">Evaluating Trade Dossier Credentials</h4>
            <p className="text-[10px] text-text-muted">Direct verification pipeline with GIDC registries</p>
          </div>

          {/* Live Step Progress list */}
          <div className="w-full max-w-xs space-y-2 text-left bg-cream-secondary/45 border border-border-default/60 p-4 rounded-xl font-mono text-[9px]">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {currentStep > idx ? (
                  <Check size={10} className="text-trust-green flex-shrink-0" />
                ) : currentStep === idx ? (
                  <RefreshCw size={10} className="text-gold animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full border border-border-strong flex-shrink-0" />
                )}
                <span className={currentStep === idx ? 'text-navy font-bold' : currentStep > idx ? 'text-text-secondary' : 'text-text-muted'}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-text-muted animate-pulse">Establishing ledger sync with Nandesari/Morbi trade ports...</p>
        </div>
      )}
    </div>
  );
}
