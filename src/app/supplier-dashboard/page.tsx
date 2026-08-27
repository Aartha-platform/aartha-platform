"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MessageSquare, Clock, Users, ArrowUpRight, 
  CheckCircle, RefreshCw, Zap, Bell, Check, MapPin, Send, AlertTriangle, X, Sparkles, Image as ImageIcon
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import ConversationPanel from '@/components/ConversationPanel';
import OutcomeTracker from '@/components/OutcomeTracker';
import AgentMatchPanel from '@/components/AgentMatchPanel';
import { calculateSupplierMatch } from '@/lib/aiMatching';
import { initialOutcomeRecords, OutcomeRecord, OutcomeStage } from '@/lib/outcomes';
import { suppliers } from '@/data/suppliers';
import { evaluateSupplierRisk } from '@/lib/fraudDetection';
import FraudRiskPanel from '@/components/FraudRiskPanel';
import LogoUploadField from '@/components/LogoUploadField';
import ProductImageGallery from '@/components/ProductImageGallery';
import OnboardingTour from '@/components/OnboardingTour';
import { useToast } from '@/components/Toast';
import { Supplier } from '@/types';


const mockSupplierInbox = [
  { 
    id: 'RFQ-2026-06-0042', 
    buyerName: 'Global Chemical Corp (Germany)', 
    buyerCountry: 'Germany',
    buyerTier: 'Tier 3 (Authority Verified)',
    authorityLimit: '$500k+ Sourcing budget',
    product: 'GMP Paracetamol API', 
    quantity: '5,000 kg', 
    targetPrice: '$3.50 / kg',
    specifications: 'USP grade, 25kg bulk fiber drums packaging. Certificate of Analysis (CoA) required.',
    date: 'Today' 
  },
  { 
    id: 'RFQ-2026-06-0019', 
    buyerName: 'Mehta Traders (Ahmedabad)', 
    buyerCountry: 'India',
    buyerTier: 'Tier 2 (Domain Checked)',
    authorityLimit: '$50k-$100k Sourcing limit',
    product: 'WHO grade Ibuprofen', 
    quantity: '10,000 kg', 
    targetPrice: '$4.20 / kg',
    specifications: 'BP/USP compliance, custom packing with raw material geotag verification report.',
    date: 'Yesterday' 
  },
];

function CountdownTimer({ initialHours }: { initialHours: number }) {
  const [seconds, setSeconds] = useState(Math.floor(initialHours * 3600));

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (seconds === 0) {
    return <span className="text-trust-red">Expired - priority dropped</span>;
  }

  return (
    <span>
      {hrs}h {mins}m {secs}s remaining to respond before matching priority drops
    </span>
  );
}

export default function SupplierDashboardPage() {
  const { showToast } = useToast();
  const [inbox, setInbox] = useState(mockSupplierInbox);
  const [activeRFQToQuote, setActiveRFQToQuote] = useState<typeof mockSupplierInbox[0] | null>(null);
  const [quoteFormData, setQuoteFormData] = useState({
    price: '',
    moq: '',
    leadTime: '',
    certifications: [] as string[],
    notes: '',
  });
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<string, boolean>>({});
  const [outcomeRecords, setOutcomeRecords] = useState<OutcomeRecord[]>(initialOutcomeRecords);
  const [selectedRfqForMatch, setSelectedRfqForMatch] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [showMediaDrawer, setShowMediaDrawer] = useState(false);

  // Load authenticated supplier from session
  const [mySupplierProfile, setMySupplierProfile] = useState<Supplier | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!data || !data.authenticated || data.role !== 'supplier' || !data.supplierId) {
          setSessionError('Could not load your supplier profile. Please sign in again.');
          return;
        }
        const found = suppliers.find(s => s.id === data.supplierId);
        if (!found) {
          setSessionError(`Supplier profile not found for ID: ${data.supplierId}`);
          return;
        }
        setMySupplierProfile(found);
      })
      .catch(() => setSessionError('Network error loading profile.'))
      .finally(() => setSessionLoading(false));
  }, []);

  // Don't compute risk until profile is loaded
  const supplierRiskAnalysis = mySupplierProfile
    ? evaluateSupplierRisk(
        mySupplierProfile.verificationDetails?.gstin || '',
        mySupplierProfile.location.gpsCoordinates || '',
        '+91'
      )
    : null;

  const handleUpdateOutcomeStage = (rfqId: string, stage: OutcomeStage) => {
    setOutcomeRecords(prev =>
      prev.map(rec =>
        rec.rfqId === rfqId ? { ...rec, stage, lastUpdated: new Date().toISOString() } : rec
      )
    );
  };


  const handleOpenQuoteDrawer = (rfq: typeof mockSupplierInbox[0]) => {
    setActiveRFQToQuote(rfq);
    setQuoteFormData({
      price: rfq.targetPrice,
      moq: rfq.quantity,
      leadTime: '7-14 days',
      certifications: ['WHO-GMP', 'ISO 9001'],
      notes: 'Price includes standard sea freight packaging to Mundra Port.',
    });
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRFQToQuote) return;

    // Simulate sending quote
    setSubmittedQuotes(prev => ({ ...prev, [activeRFQToQuote.id]: true }));
    setActiveRFQToQuote(null);
    showToast('Quote submitted successfully to global buyer!', 'success');
  };

  const handleToggleCert = (cert: string) => {
    setQuoteFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  return (
    <div className="bg-gradient-to-b from-cream via-cream-secondary to-cream dark:from-navy-dark dark:via-navy dark:to-[var(--surface)] font-sans min-h-screen text-text-primary pt-8 pb-20 md:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Session loading / error */}
        {sessionLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
          </div>
        )}

        {!sessionLoading && sessionError && (
          <div className="bg-trust-red-bg/30 text-trust-red text-xs font-semibold p-4 rounded-xl border border-trust-red/20 flex items-start gap-2 backdrop-blur-md">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Session Error</div>
              <div>{sessionError}</div>
              <a href="/signin" className="underline font-bold mt-2 inline-block">Return to Sign In</a>
            </div>
          </div>
        )}

        {!sessionLoading && !sessionError && mySupplierProfile && (
          <>
            <div className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white rounded-2xl p-6 border border-gold/25 relative overflow-hidden shadow-premium group hover:border-gold/50 transition-all duration-300">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent opacity-75 pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-gold/30 shadow-md overflow-hidden flex-shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-navy font-bold text-lg">
                        {mySupplierProfile.companyName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-gold font-bold uppercase tracking-widest">Manufacturer Control Center</div>
                    <h1 className="text-xl font-black uppercase tracking-wide text-white">{mySupplierProfile.companyName}</h1>
                    <p className="text-slate-300 text-xs font-medium">{mySupplierProfile.location.gidcZone || mySupplierProfile.location.city} · Dynamic Quality Score: <strong className="text-gold font-black">{mySupplierProfile.qualityScore.total}/100</strong></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href="/ai-assistant" className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-gold/50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all no-underline shadow-2xs hover:scale-[1.02] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-gold animate-pulse" />
                    <span>Ask AI Assistant</span>
                  </Link>
                  <div className="bg-trust-green-bg/25 text-trust-green text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-trust-green/20 backdrop-blur-md shadow-2xs">
                    <CheckCircle size={15} />
                    <span>Dossier Active & Geotagged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Opportunities', value: inbox.length, border: 'border-l-4 border-l-gold' },
                { label: 'Response Rate', value: '98%', border: 'border-l-4 border-l-trust-green' },
                { label: 'Avg Matching Speed', value: '<2 Hrs', border: 'border-l-4 border-l-trust-blue' },
                { label: 'Badge Expiry', value: '180 Days', border: 'border-l-4 border-l-purple-500' },
              ].map((stat) => (
                <div key={stat.label} className={`bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 ${stat.border} rounded-2xl p-4.5 space-y-1.5 shadow-2xs hover:border-gold transition-all duration-300 hover:shadow-xs`}>
                  <div className="text-2xl font-black text-navy dark:text-white leading-none">{stat.value}</div>
                  <div className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider pt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* WhatsApp Notification Indicator Banner */}
            <div className="bg-trust-green-bg/30 dark:bg-emerald-950/30 border border-trust-green/30 rounded-2xl p-3.5 flex items-center justify-between text-xs text-trust-green backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-trust-green rounded-full inline-block animate-pulse"></span>
                <span className="font-semibold text-text-secondary dark:text-slate-200"><strong>WhatsApp Alerts Active:</strong> Aartha Trade Desk is routing live RFQ matching alerts directly to your registered business mobile on WhatsApp (+91 72084 32138).</span>
              </div>
              <span className="font-black text-[10px] uppercase bg-trust-green text-white px-2.5 py-1 rounded-lg border border-trust-green/30 select-none shadow-2xs">Connected</span>
            </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          
          {/* RFQ Inbox */}
          <div id="supplier-inbox-section" className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm min-w-0">
            <h3 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">Corridor RFQ Inbox</h3>
            
            {inbox.length === 0 ? (
              <div className="text-center text-text-muted dark:text-slate-400 py-8 text-xs font-bold">
                No active buyer matches found.
              </div>
            ) : (
              <div className="space-y-5">
                {inbox.map((rfq) => {
                  const hasSubmitted = submittedQuotes[rfq.id] || outcomeRecords.some(o => o.rfqId === rfq.id && o.stage !== 'matched');
                  const matchingOutcome = outcomeRecords.find(o => o.rfqId === rfq.id);

                  // Calculate explainable match score
                  const matchResult = calculateSupplierMatch(mySupplierProfile, {
                    category: mySupplierProfile.category,
                    certifications: mySupplierProfile.certifications,
                    gidcZone: mySupplierProfile.location.gidcZone
                  });

                  return (
                    <div key={rfq.id} className="border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 bg-white/60 dark:bg-[var(--surface)]/60 backdrop-blur-md space-y-4 hover:border-gold/40 hover:shadow-xs transition-all duration-300">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-mono text-[10px] font-black text-text-muted dark:text-slate-400">{rfq.id}</span>
                            <span className="bg-navy/5 dark:bg-white/10 text-navy dark:text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-slate-200/50 dark:border-white/10">
                              {rfq.buyerTier}
                            </span>
                            <span className="text-[10px] text-text-muted dark:text-slate-400 font-semibold">({rfq.buyerCountry})</span>
                            <span className="text-[10px] font-black text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/10">
                              Match Score: {matchResult.score}/100
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              rfq.id === 'RFQ-2026-06-0042'
                                ? 'bg-trust-green-bg text-trust-green border-trust-green/15'
                                : 'bg-trust-blue-bg text-trust-blue border-trust-blue/15'
                            }`}>
                              Intent: {rfq.id === 'RFQ-2026-06-0042' ? '95% (High)' : '78% (Medium)'}
                            </span>
                          </div>

                          <h4 className="font-black text-navy dark:text-white text-xs leading-snug">{rfq.product}</h4>
                          <div className="text-xs text-text-secondary dark:text-slate-300">
                            Quantity: <strong className="text-navy dark:text-white">{rfq.quantity}</strong> · Target: <strong className="text-navy dark:text-white">{rfq.targetPrice}</strong>
                          </div>
                          <p className="text-[11px] text-text-muted dark:text-slate-400 leading-relaxed font-semibold">
                            Specs: {rfq.specifications}
                          </p>

                          {!hasSubmitted && (
                            <div className="flex items-center gap-1.5 text-[10px] text-trust-amber font-black uppercase tracking-wider bg-trust-amber-bg/30 border border-trust-amber/25 px-2.5 py-1 rounded-lg w-fit mt-1 select-none">
                              <Clock size={11} className="text-trust-amber animate-pulse" />
                              <CountdownTimer initialHours={rfq.id === 'RFQ-2026-06-0042' ? 18.7 : 3.25} />
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 pt-2 text-[10px] text-text-muted dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-white/5 flex-wrap">
                            <span>Budget Limit: <strong className="text-text-secondary dark:text-slate-200">{rfq.authorityLimit}</strong></span>
                            <span>•</span>
                            <span>Inquiry Date: <strong className="text-text-secondary dark:text-slate-200">{rfq.date}</strong></span>
                            <span>•</span>
                            <span>Buyer Intent Score: <strong className={rfq.id === 'RFQ-2026-06-0042' ? 'text-trust-green font-black' : 'text-trust-blue font-black'}>{rfq.id === 'RFQ-2026-06-0042' ? '95%' : '78%'}</strong></span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-3 md:pt-0 flex flex-col gap-2 justify-end">
                          {hasSubmitted ? (
                            <div className="bg-trust-green-bg text-trust-green text-xs font-black px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-trust-green/20">
                              <Check size={14} />
                              <span>Active Quote Thread</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleOpenQuoteDrawer(rfq)}
                              className="bg-navy hover:bg-navy-light text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all cursor-pointer w-full md:w-auto select-none shadow-2xs hover:scale-[1.02]"
                            >
                              Create Quote
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedRfqForMatch(selectedRfqForMatch === rfq.id ? null : rfq.id)}
                            className="border border-slate-200 dark:border-white/10 hover:bg-cream dark:hover:bg-slate-800 text-text-primary dark:text-slate-200 text-[10px] font-bold px-3 py-1.5 rounded transition-all flex items-center justify-center gap-1"
                          >
                            <Sparkles size={10} className="text-gold" />
                            {selectedRfqForMatch === rfq.id ? 'Hide Match Reason' : 'Show Match Reason'}
                          </button>
                        </div>
                      </div>

                      {selectedRfqForMatch === rfq.id && (
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                          <AgentMatchPanel match={matchResult} supplier={mySupplierProfile} />
                        </div>
                      )}

                      {matchingOutcome && (
                        <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                          <OutcomeTracker 
                            record={matchingOutcome} 
                            isSupplierView={true} 
                            onUpdateStage={(newStage) => handleUpdateOutcomeStage(rfq.id, newStage)} 
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Conversation Panel */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white pb-2 flex items-center gap-2">
                <MessageSquare size={14} className="text-gold" />
                <span>Active Sourcing Conversations</span>
              </h3>
              <ConversationPanel 
                messages={[
                  { id: 'm1', supplierName: 'Global Chemical Corp (Germany)', preview: 'We have received your quotation and are checking specs.', timestamp: '2 hours ago', unread: true },
                  { id: 'm2', supplierName: 'Mehta Traders (Ahmedabad)', preview: 'Can you expedite the sample dispatch checklist?', timestamp: 'Yesterday', unread: false }
                ]}
                isSupplierView={true}
              />
            </div>
          </div>

          {/* Right Panel: WhatsApp & Badge Renewal */}
          <div className="space-y-6">
            {/* Profile Media Settings */}
            <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm hover:border-gold/30 transition-all duration-300">
              <h4 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">Company Media Assets</h4>
              <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed font-semibold">Upload your corporate logo and factory plant photos to boost your verified matchmaking score.</p>
              
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-navy dark:text-white text-[11px] font-black">MIC</span>
                  )}
                </div>
                <div className="text-[10px] text-text-muted dark:text-slate-400 font-bold">
                  {galleryImages.length} gallery images uploaded
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMediaDrawer(true)}
                className="w-full flex items-center justify-center gap-1.5 bg-navy hover:bg-navy-light text-white py-2.5 rounded-xl text-xs font-black transition-all text-center cursor-pointer uppercase tracking-wider border border-navy shadow-2xs hover:scale-[1.02]"
              >
                Manage Profile Media
              </button>
            </div>

            <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm hover:border-gold/30 transition-all duration-300">
              <h4 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">WhatsApp Sourcing Touchpoint</h4>
              <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed font-semibold">Ensure your WhatsApp business account is linked. Global buyer leads route to your phone via geotracking logs.</p>
              
              <WhatsAppButton
                phoneNumber="+91 72084 32138"
                message="Supplier desk active. Responding to matches."
                className="w-full"
              />
            </div>

            {/* Document Upload Reminder */}
            <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm hover:border-gold/30 transition-all duration-300">
              <h4 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">Verification Document Center</h4>
              <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed font-semibold">Upload your GST certificate and Import Export Code (IEC) to maintain active verification credentials.</p>
              
              <Link href="/document-intelligence" className="w-full flex items-center justify-center gap-1.5 bg-navy hover:bg-navy-light text-white py-2.5 rounded-xl text-xs font-black transition-all text-center no-underline shadow-2xs hover:scale-[1.02]">
                Upload Compliance Files
              </Link>
            </div>

            {/* Account Risk Factor Widget */}
            {supplierRiskAnalysis && (
              <FraudRiskPanel analysis={supplierRiskAnalysis} showBreakdown={true} type="supplier" />
            )}

            <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm hover:border-gold/30 transition-all duration-300">
              <h4 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">Compliance Renewal Warning</h4>
              <div className="bg-trust-amber-bg/30 text-trust-amber border border-trust-amber/20 rounded-2xl p-3.5 flex gap-2.5 backdrop-blur-md shadow-2xs">
                <Clock size={16} className="text-trust-amber flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-black text-trust-amber">Inspection renewal scheduled</div>
                  <p className="text-text-secondary dark:text-slate-300 leading-relaxed font-semibold">Your 12-month geocode validation expires soon. Schedule visit to avoid rating downgrade.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </>
        )}
      </div>

      {/* Quoting Modal / Drawer Backdrop */}
      {activeRFQToQuote && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-default rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl animate-scale-in">
            {/* Header */}
            <div className="bg-navy text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gold font-bold uppercase tracking-wider font-mono">Compose Sourcing Quote</span>
                <h3 className="font-bold text-sm truncate">{activeRFQToQuote.product}</h3>
              </div>
              <button 
                onClick={() => setActiveRFQToQuote(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quoting Form */}
            <form onSubmit={handleQuoteSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-cream p-3 rounded-lg border border-border-default/40 space-y-1.5">
                <div className="font-bold text-navy">Buyer Context: {activeRFQToQuote.buyerName}</div>
                <div className="text-text-secondary">Quantity Requested: <strong className="text-navy">{activeRFQToQuote.quantity}</strong></div>
                <div className="text-text-secondary">Buyer Target price: <strong className="text-navy">{activeRFQToQuote.targetPrice}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Your Unit Price *</label>
                  <input
                    type="text"
                    required
                    value={quoteFormData.price}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Minimum Order Quantity (MOQ) *</label>
                  <input
                    type="text"
                    required
                    value={quoteFormData.moq}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, moq: e.target.value }))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Estimated Lead Time *</label>
                  <input
                    type="text"
                    required
                    value={quoteFormData.leadTime}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, leadTime: e.target.value }))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Trade Protection Badges</label>
                  <div className="flex gap-2 pt-2">
                    {['WHO-GMP', 'ISO 9001', 'REACH'].map((cert) => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => handleToggleCert(cert)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          quoteFormData.certifications.includes(cert)
                            ? 'bg-navy text-white border-navy'
                            : 'bg-white text-text-secondary border-border-strong'
                        }`}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Additional Notes / Export Packing details</label>
                <textarea
                  rows={3}
                  value={quoteFormData.notes}
                  onChange={(e) => setQuoteFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-default/40">
                <button
                  type="button"
                  onClick={() => setActiveRFQToQuote(null)}
                  className="px-4 py-2 border border-border-strong rounded-lg text-text-secondary hover:bg-cream cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-navy hover:bg-navy-light text-white px-6 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <Send size={12} />
                  <span>Send Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Media Drawer */}
      {showMediaDrawer && mySupplierProfile && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in animate-scale-in">
          <div className="bg-white border border-border-default rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-border-default">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-navy">Manage Profile Media Assets</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Upload logo and product visuals to boost matchmaking trust.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaDrawer(false)}
                className="text-text-muted hover:text-text-primary font-bold bg-cream-secondary p-1.5 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <LogoUploadField
                companyName={mySupplierProfile.companyName}
                logoUrl={logoUrl}
                onChange={(url) => {
                  setLogoUrl(url);
                  showToast('Logo updated successfully!', 'success');
                }}
                onRemove={() => {
                  setLogoUrl('');
                  showToast('Logo removed.', 'warning');
                }}
              />

              <ProductImageGallery
                images={galleryImages}
                onChange={(imgs) => {
                  setGalleryImages(imgs);
                  showToast('Product gallery updated successfully!', 'success');
                }}
                maxImages={6}
              />
            </div>

            <div className="p-4 border-t border-border-default/50 bg-cream-secondary/45 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaDrawer(false)}
                className="bg-navy hover:bg-navy-light text-white text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default shadow-lg p-3 md:hidden flex gap-2">
        <button
          onClick={() => {
            const el = document.getElementById('supplier-inbox-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }
          }}
          className="flex-1 bg-navy text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg h-11 py-3 cursor-pointer select-none"
        >
          <Zap size={14} /> Inbox ({inbox.length})
        </button>
        <button
          onClick={() => setShowMediaDrawer(true)}
          className="flex-1 bg-gold text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg h-11 py-3 cursor-pointer select-none"
        >
          <ImageIcon size={14} /> Media Assets
        </button>
        <WhatsAppButton
          phoneNumber="+91 72084 32138"
          message="Supplier support request from dashboard."
          label="Support"
          className="flex-shrink-0 h-11 py-3"
        />
      </div>

      {/* Guided Onboarding Walkthrough */}
      <OnboardingTour role="supplier" />
    </div>
  );
}
