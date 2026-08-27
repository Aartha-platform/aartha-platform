"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSavedAuthorityDeclaration, BuyerAuthorityDeclaration } from '@/lib/buyerAuthority';
import { getWorkspaceUpgrade, saveWorkspaceUpgrade } from '@/lib/workspaceUpgrade';
import UpgradeModal from '@/components/UpgradeModal';
import AuthorityDeclarationForm from '@/components/AuthorityDeclarationForm';
import FraudRiskPanel from '@/components/FraudRiskPanel';
import { evaluateBuyerRisk } from '@/lib/fraudDetection';
import Link from 'next/link';
import { 
  ShieldCheck, Clock, AlertTriangle, ArrowRight, CheckCircle, 
  Bell, MessageSquare, Zap, Search, Bookmark, Users, FileText, 
  GitCompare, Calendar, Key, Check, Plus, RefreshCw, Sparkles, AlertCircle,
  BarChart2, Settings, TrendingUp
} from 'lucide-react';
import dynamic from 'next/dynamic';
const DonutChart = dynamic(() => import('@/components/DonutChart'), { ssr: false });
import SidebarNav from '@/components/SidebarNav';
import Checkbox from '@/components/ui/Checkbox';
import QuoteComparisonTable from '@/components/QuoteComparisonTable';
import SavedSearchesPanel from '@/components/SavedSearchesPanel';
import AlertCenter from '@/components/AlertCenter';
import MarketPriceIntel from '@/components/MarketPriceIntel';
import OutcomeTracker from '@/components/OutcomeTracker';
import ConversationPanel from '@/components/ConversationPanel';
import AgentMatchPanel from '@/components/AgentMatchPanel';
import { calculateSupplierMatch } from '@/lib/aiMatching';
import { initialOutcomeRecords, OutcomeRecord, OutcomeStage } from '@/lib/outcomes';
import { buyerDashboard } from '@/data/buyerDashboard';
import { rfqQuotes } from '@/data/rfqQuotes';
import { suppliers } from '@/data/suppliers';
import { BuyerSection } from '@/types';
import LogoUploadField from '@/components/LogoUploadField';
import MobileBottomNav from '@/components/MobileBottomNav';
import OnboardingTour from '@/components/OnboardingTour';
import { useToast } from '@/components/Toast';
import WhatsAppButton from '@/components/WhatsAppButton';

const statusColors: Record<string, string> = {
  'In Negotiation': 'bg-trust-purple-bg text-trust-purple border border-trust-purple/20',
  Quoted: 'bg-trust-amber-bg text-trust-amber border border-trust-amber/20',
  New: 'bg-trust-blue-bg text-trust-blue border border-trust-blue/20',
  Closed: 'bg-trust-green-bg text-trust-green border border-trust-green/20',
};

import { ChevronDown, ChevronUp } from 'lucide-react';

export default function BuyerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-gold" size={24} />
          <span className="text-xs text-text-secondary font-bold uppercase tracking-wider text-navy">Loading Sourcing Dashboard...</span>
        </div>
      </div>
    }>
      <BuyerDashboardContent />
    </Suspense>
  );
}

function BuyerDashboardContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<BuyerSection>('overview');
  const [isPro, setIsPro] = useState(false);
  const [planName, setPlanName] = useState('Standard Free Plan');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(undefined);
  
  const [preferences, setPreferences] = useState({
    newQuoteAlerts: true,
    priceAlerts: true,
    customsWarnings: true,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outcomeRecords, setOutcomeRecords] = useState<OutcomeRecord[]>(initialOutcomeRecords);
  const [selectedRfqSearch, setSelectedRfqSearch] = useState<string | null>(null);
  const [selectedSupplierForMatch, setSelectedSupplierForMatch] = useState<string | null>(null);
  const [decl, setDecl] = useState<BuyerAuthorityDeclaration | null>(null);
  const [showDeclForm, setShowDeclForm] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [sourcingFlowExpanded, setSourcingFlowExpanded] = useState(false);

  const [buyerName, setBuyerName] = useState(buyerDashboard.buyerName);
  const [companyName, setCompanyName] = useState(buyerDashboard.company);
  const [buyerEmail, setBuyerEmail] = useState(buyerDashboard.verifiedEmail);

  useEffect(() => {
    // Set initial section from URL query param if present
    const sectionParam = searchParams.get('section') as BuyerSection;
    const validSections: BuyerSection[] = [
      'overview', 'saved-searches', 'shortlisted-suppliers', 'rfq-status',
      'quote-comparisons', 'messages', 'order-history', 'price-alerts',
      'market-insights', 'repeat-orders', 'settings'
    ];
    if (validSections.includes(sectionParam)) {
      setActiveSection(sectionParam);
    }

    if (searchParams.get('upgrade') === 'true') {
      setShowUpgradeModal(true);
    }

    setDecl(getSavedAuthorityDeclaration());
    const upgrade = getWorkspaceUpgrade();
    setIsPro(upgrade.isPro);
    setPlanName(upgrade.planName || 'Standard Free Plan');
    
    const storedPrefs = localStorage.getItem('artha_settings_preferences');
    if (storedPrefs) setPreferences(JSON.parse(storedPrefs));

    const storedLogo = localStorage.getItem('artha_buyer_avatar_url');
    if (storedLogo) setAvatarUrl(storedLogo);

    // Fetch actual logged-in user profile from session
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((d) => {
        if (d && d.authenticated && d.role === 'buyer') {
          if (d.contactName) setBuyerName(d.contactName);
          if (d.companyName) setCompanyName(d.companyName);
          if (d.email) setBuyerEmail(d.email);
        }
      })
      .catch((err) => console.warn('User session fetch notice:', err));

    setMounted(true);
  }, [searchParams]);

  const handleSectionChange = (section: BuyerSection) => {
    setActiveSection(section);
    router.push(`/dashboard?section=${section}`, { scroll: false });
  };

  const handleDeclSuccess = () => {
    const updated = getSavedAuthorityDeclaration();
    setDecl(updated);
    setShowDeclForm(false);
    showToast('Sourcing authority declared successfully!', 'success');

    // Trigger notification alert
    const stored = localStorage.getItem('artha_buyer_notifications');
    const currentAlerts = stored ? JSON.parse(stored) : [];
    const newAlert = {
      id: `a-${Date.now()}`,
      type: 'status',
      title: 'Authority Verified',
      description: `Sourcing authority updated to Tier 3 for ${updated?.companyName || 'your company'}.`,
      timestamp: 'Just now',
      unread: true
    };
    localStorage.setItem('artha_buyer_notifications', JSON.stringify([newAlert, ...currentAlerts]));
    window.dispatchEvent(new CustomEvent('artha_refresh_notifications'));
  };

  const handleUpgradeSuccess = () => {
    const upgrade = getWorkspaceUpgrade();
    setIsPro(upgrade.isPro);
    setPlanName(upgrade.planName || 'Standard Free Plan');
    setShowUpgradeModal(false);
    showToast(`Workspace upgraded to ${upgrade.planName || 'Pro'} successfully!`, 'success');

    // Trigger notification alert
    const stored = localStorage.getItem('artha_buyer_notifications');
    const currentAlerts = stored ? JSON.parse(stored) : [];
    const newAlert = {
      id: `a-${Date.now()}`,
      type: 'match',
      title: 'Upgrade Successful',
      description: `You are now a ${upgrade.planName || 'Pro'}. Geotagged GIDC matching queues and price indexes are unlocked.`,
      timestamp: 'Just now',
      unread: true
    };
    localStorage.setItem('artha_buyer_notifications', JSON.stringify([newAlert, ...currentAlerts]));
    window.dispatchEvent(new CustomEvent('artha_refresh_notifications'));
  };

  const handleDowngrade = () => {
    saveWorkspaceUpgrade({ isPro: false });
    setIsPro(false);
    setPlanName('Standard Free Plan');
    showToast('Workspace downgraded to Standard Plan.', 'warning');
  };

  const handleSavePreferences = () => {
    localStorage.setItem('artha_settings_preferences', JSON.stringify(preferences));
    showToast('Workspace preferences saved successfully!', 'success');
  };

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem('artha_buyer_avatar_url', url);
  };

  const handleAvatarRemove = () => {
    setAvatarUrl('');
    localStorage.removeItem('artha_buyer_avatar_url');
  };

  const data = buyerDashboard;
  const unreadMessages = data.messages.filter((m) => m.unread).length;

  const riskAnalysis = evaluateBuyerRisk(
    decl?.businessEmail || buyerEmail,
    decl?.companyName || companyName,
    data.stats.rfqsInProgress,
    10
  );

  const statCards = [
    { label: 'My Searches', value: data.stats.savedSearches, key: 'saved-searches' as BuyerSection, colorClass: 'border-l-blue-500 text-blue-600', bgClass: 'bg-blue-50/40', icon: Bookmark },
    { label: 'My Suppliers', value: data.stats.shortlistedSuppliers, key: 'shortlisted-suppliers' as BuyerSection, colorClass: 'border-l-purple-500 text-purple-600', bgClass: 'bg-purple-50/40', icon: Users },
    { label: 'RFQs in Progress', value: data.stats.rfqsInProgress, key: 'rfq-status' as BuyerSection, colorClass: 'border-l-amber-500 text-amber-600', bgClass: 'bg-amber-50/40', icon: FileText },
    { label: 'Compare Quotes', value: data.stats.quotesReceived, key: 'quote-comparisons' as BuyerSection, colorClass: 'border-l-emerald-500 text-emerald-600', bgClass: 'bg-emerald-50/40', icon: GitCompare },
    { label: 'Messages', value: data.stats.messages, key: 'messages' as BuyerSection, colorClass: 'border-l-navy text-navy', bgClass: 'bg-slate-50', icon: MessageSquare },
    { label: 'Orders', value: data.stats.ordersNegotiations, key: 'order-history' as BuyerSection, colorClass: 'border-l-gold text-gold', bgClass: 'bg-gold-light/40', icon: Clock },
  ];

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    showToast('RFQ ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-gradient-to-b from-cream via-cream-secondary to-cream dark:from-navy-dark dark:via-navy dark:to-[var(--surface)] font-sans min-h-screen text-text-primary pt-6 pb-20 md:pb-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[212px_minmax(0,1fr)] border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md min-h-[680px] shadow-premium">
          
          {/* Column 1: Left Sidebar */}
          <SidebarNav 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange} 
            unreadMessages={unreadMessages} 
            isPro={isPro}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />

          {/* Center and Right Columns Wrapper */}
          <div className="flex flex-col xl:flex-row flex-1 bg-cream/20 dark:bg-slate-900/20 divide-y xl:divide-y-0 xl:divide-x divide-slate-200/60 dark:divide-white/10 min-w-0">
            
            {/* Column 2: Main Dynamic Content */}
            <div className="flex-1 p-5 sm:p-6 overflow-auto min-w-0">
              
              {/* Common Header with World Data Ticker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                      <span>Workspace</span>
                      <span>/</span>
                      <span className="text-gold font-black">
                        {activeSection === 'overview' || activeSection === 'rfq-status' || activeSection === 'quote-comparisons' || activeSection === 'shortlisted-suppliers' ? 'Sourcing Center' : ''}
                        {activeSection === 'messages' || activeSection === 'order-history' || activeSection === 'repeat-orders' ? 'Communications' : ''}
                        {activeSection === 'saved-searches' || activeSection === 'price-alerts' || activeSection === 'market-insights' ? 'Market Intel' : ''}
                        {activeSection === 'settings' ? 'Workspace Settings' : ''}
                      </span>
                    </div>
                    {/* Live Corridor Status Indicator Ticker */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Mundra Corridor: Operational</span>
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-navy dark:text-white uppercase tracking-wide bg-gradient-to-r from-navy via-navy-light to-gold dark:from-white dark:to-gold bg-clip-text text-transparent">
                    {activeSection === 'overview' && 'Sourcing Control Center'}
                    {activeSection === 'saved-searches' && 'My Tracked Searches & Alerts'}
                    {activeSection === 'shortlisted-suppliers' && 'Shortlisted Gujarat Plants'}
                    {activeSection === 'rfq-status' && 'Sourcing RFQ Pipeline Status'}
                    {activeSection === 'quote-comparisons' && 'Supplier Quote Analysis Board'}
                    {activeSection === 'messages' && 'Encrypted Trade Messaging Inbox'}
                    {activeSection === 'order-history' && 'Negotiation & Order History Logs'}
                    {activeSection === 'price-alerts' && 'Commodity Price Benchmarking'}
                    {activeSection === 'market-insights' && 'Gujarat Export Trade Intelligence'}
                    {activeSection === 'repeat-orders' && 'One-Click Reorder Management'}
                    {activeSection === 'settings' && 'Workspace & Buyer Credentials'}
                  </h2>
                  <p className="text-text-secondary dark:text-slate-300 text-[11px] font-medium mt-0.5">
                    {activeSection === 'overview' && 'Overview of your active sourcing pipelines, quotes, and security scans.'}
                    {activeSection === 'saved-searches' && 'Automated background tracking alerts for matching GIDC manufacturing plants.'}
                    {activeSection === 'shortlisted-suppliers' && 'Directly bookmark and manage factory-visited Gujarat suppliers.'}
                    {activeSection === 'rfq-status' && 'Track stage progress for all active RFQs from match to final closing.'}
                    {activeSection === 'quote-comparisons' && 'Side-by-side technical, MOQ, price, and trust score offer evaluation.'}
                    {activeSection === 'messages' && 'Direct audit-logged messaging with verified plant key account managers.'}
                    {activeSection === 'order-history' && 'Complete ledger of confirmed transactions, inspection logs, and exports.'}
                    {activeSection === 'price-alerts' && 'Real-time market price index deviations and target purchasing windows.'}
                    {activeSection === 'market-insights' && 'Data-backed export demand surges, top search terms, and global corridors.'}
                    {activeSection === 'repeat-orders' && 'Quickly re-procure prior specifications with pre-filled order data.'}
                    {activeSection === 'settings' && 'Manage corporate email credentials, buyer authority declarations, and alerts.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <AlertCenter onRerunSearch={(term) => { setSelectedRfqSearch(term); handleSectionChange('saved-searches'); }} />
                  <Link 
                    href="/rfq" 
                    className="bg-gradient-to-r from-gold via-amber-500 to-gold-hover hover:from-gold-hover hover:to-gold text-white px-4 py-2 rounded-xl text-xs font-black transition-all select-none no-underline shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    <span>Submit RFQ Request</span>
                  </Link>
                </div>
              </div>

              {/* Dynamic Section Contents */}
              
              {/* SECTION: Overview */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  {/* Premium Dark Glass Welcome Banner */}
                  <div className="bg-gradient-to-r from-navy via-navy-light to-navy-dark border border-gold/30 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-premium group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gold/20 via-amber-500/10 to-transparent rounded-full filter blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-gold/25 text-gold border border-gold/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest shadow-2xs">
                              {isPro ? 'Verified Buyer Pro' : 'Verified Buyer Hub'}
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                              GIDC Live Connection
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black mt-2 uppercase tracking-tight text-white flex items-center gap-2">
                            <span>Welcome back, {buyerName}</span>
                            <span className="animate-bounce inline-block">👋</span>
                          </h3>
                          <p className="text-slate-300 text-xs mt-0.5 font-medium flex items-center gap-2">
                            <span>{companyName}</span>
                            <span>•</span>
                            <span className="text-gold font-bold">Gujarat Industrial Export Corridor</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-[10px] text-slate-200 shadow-2xs">
                          <Clock size={13} className="text-gold animate-spin-slow" />
                          <span>Last login: <strong className="text-white">{data.lastLogin}</strong></span>
                        </div>
                      </div>
                      
                      {/* Highlight stats metrics row */}
                      <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-white/10">
                        <div className="space-y-0.5 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Active RFQs</div>
                          <div className="text-lg font-black text-amber-400 flex items-center gap-1.5">
                            <span>{data.stats.rfqsInProgress}</span>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded">+12%</span>
                          </div>
                        </div>
                        <div className="space-y-0.5 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Quotes In Review</div>
                          <div className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
                            <span>{data.stats.quotesReceived}</span>
                            <span className="text-[10px] text-gold font-bold bg-gold/20 px-1 rounded">Live Matrix</span>
                          </div>
                        </div>
                        <div className="space-y-0.5 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Sourcing Helpline</div>
                          <div className="text-sm sm:text-base font-black text-gold font-mono">+91 72084 32138</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Intelligence Scan Reminder */}
                  <div className="bg-gradient-to-r from-navy via-[#102038] to-navy-dark text-white rounded-2xl p-5 border border-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-md group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent opacity-75 pointer-events-none"></div>
                    <div className="space-y-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-gold" />
                        <h4 className="font-black text-xs uppercase tracking-wider text-gold">Customs & L/C Document Intelligence Validation</h4>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl font-semibold">
                        Ensure packing lists, commercial invoices, and Certificates of Origin match Mundra port customs standards. AI OCR verification prevents port hold delays.
                      </p>
                    </div>
                    <Link 
                      href="/document-intelligence" 
                      className="bg-gold hover:bg-gold-hover text-white text-xs font-extrabold px-4.5 py-2.5 rounded-xl no-underline transition-all whitespace-nowrap relative z-10 shadow-2xs hover:scale-[1.02] flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Verify Trade Documents</span>
                    </Link>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {statCards.map((card, idx) => {
                      const CardIcon = card.icon;
                      return (
                        <div 
                          key={card.label} 
                          className={`border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[var(--surface)]/80 backdrop-blur-md rounded-2xl p-4 border-l-4 ${card.colorClass} hover:border-gold transition-all duration-300 transform space-y-1.5 shadow-2xs hover:-translate-y-1 hover:shadow-md ${
                            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                          }`}
                          style={{ transitionDelay: `${idx * 40}ms` }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-2xl font-black text-navy dark:text-white leading-none">{card.value}</div>
                            <div className={`p-2 rounded-xl ${card.bgClass} flex items-center justify-center border border-border-default/30`}>
                              <CardIcon size={16} className={card.colorClass.split(' ')[1] || card.colorClass} />
                            </div>
                          </div>
                          <div className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider pt-1">{card.label}</div>
                          <button onClick={() => handleSectionChange(card.key)} className="text-[10px] font-extrabold text-gold hover:text-gold-hover mt-2 flex items-center gap-1 cursor-pointer select-none group/btn">
                            <span>View details</span> <ArrowRight size={11} className="transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* RFQ Status & Recent Quotes */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                        <h3 className="font-black text-[10px] uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                          <BarChart2 size={14} className="text-gold" />
                          <span>RFQ Status Pipeline Overview</span>
                        </h3>
                        <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-bold">Real-time</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
                        <DonutChart data={data.rfqStatusData} width={120} height={120} />
                        <div className="space-y-2.5 w-full sm:w-auto font-sans text-xs">
                          {data.rfqStatusData.map((d) => (
                            <div key={d.label} className="flex items-center gap-2.5 bg-cream/40 dark:bg-slate-800/40 p-1.5 px-2.5 rounded-xl border border-border-default/30">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                              <span className="text-text-secondary dark:text-slate-300 font-bold">{d.label}</span>
                              <span className="font-black text-navy dark:text-white ml-auto">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                        <h3 className="font-black text-[10px] uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                          <GitCompare size={14} className="text-gold" />
                          <span>Recent Supplier Offers</span>
                        </h3>
                        <button onClick={() => handleSectionChange('quote-comparisons')} className="text-[10px] font-bold text-gold hover:underline cursor-pointer">
                          Full Matrix →
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-sans table-fixed">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-white/10 pb-2">
                              <th className="text-left py-2 text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px] w-5/12">RFQ</th>
                              <th className="text-center py-2 text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px] w-2/12">Offers</th>
                              <th className="text-right py-2 text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px] w-3/12 pr-4">Best Quote</th>
                              <th className="text-right py-2 text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px] w-2/12">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {data.recentQuotes.map((q) => (
                              <tr key={q.id} className="hover:bg-cream/40 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 text-text-primary dark:text-white font-bold truncate pr-2" title={q.rfqTitle}>{q.rfqTitle}</td>
                                <td className="py-2.5 text-center text-text-secondary dark:text-slate-300 font-bold">{q.quotesReceived}</td>
                                <td className="py-2.5 text-right font-black text-navy dark:text-gold pr-4 whitespace-nowrap">{q.bestQuote}</td>
                                <td className="py-2.5 text-right">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${statusColors[q.status]}`}>
                                    <span className={`w-1 h-1 rounded-full ${
                                      q.status === 'Closed' ? 'bg-trust-green' :
                                      q.status === 'Quoted' ? 'bg-trust-amber' :
                                      q.status === 'New' ? 'bg-trust-blue' : 'bg-trust-purple'
                                    }`} />
                                    {q.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Messages & Price Alerts */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                        <h3 className="font-black text-[10px] uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                          <MessageSquare size={14} className="text-gold" />
                          <span>Recent Supplier Messages</span>
                        </h3>
                        <button onClick={() => handleSectionChange('messages')} className="text-[10px] font-bold text-gold hover:underline cursor-pointer">
                          View Inbox →
                        </button>
                      </div>
                      <div className="space-y-2">
                        {data.messages.slice(0, 3).map((msg, idx) => {
                          const gradients = [
                            'bg-gradient-to-br from-blue-500 to-indigo-600',
                            'bg-gradient-to-br from-emerald-500 to-teal-600',
                            'bg-gradient-to-br from-purple-500 to-pink-600'
                          ];
                          const gradient = gradients[idx % gradients.length];
                          return (
                            <div key={msg.id} className={`flex items-start gap-3 p-3 rounded-xl border ${msg.unread ? 'bg-trust-blue-bg/40 border-trust-blue/30 dark:bg-blue-950/40' : 'bg-cream/30 dark:bg-slate-800/30 border-border-default/40'}`}>
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 ${gradient} shadow-2xs`}>
                                {msg.supplierName[0]}
                              </div>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex justify-between items-baseline">
                                  <span className="font-bold text-xs text-navy dark:text-white leading-tight">{msg.supplierName}</span>
                                  <span className="text-[10px] text-text-muted dark:text-slate-400 font-semibold ml-2 flex-shrink-0">{msg.timestamp}</span>
                                </div>
                                <p className="text-xs text-text-secondary dark:text-slate-300 truncate leading-normal">{msg.preview}</p>
                              </div>
                              {msg.unread && <div className="w-2 h-2 bg-trust-blue rounded-full flex-shrink-0 mt-2 animate-ping" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                        <h3 className="font-black text-[10px] uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                          <Bell size={14} className="text-gold" /> Price Benchmark Alerts
                        </h3>
                        <button onClick={() => handleSectionChange('price-alerts')} className="text-[10px] font-bold text-gold hover:underline cursor-pointer">
                          All Indices →
                        </button>
                      </div>
                      <div className="space-y-2">
                        {data.priceAlerts.slice(0, 3).map((alert) => (
                          <div key={alert.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/5 hover:border-gold/30 transition-colors">
                            <div>
                              <div className="text-xs font-bold text-navy dark:text-white leading-tight">{alert.commodity}</div>
                              <div className="text-[10px] text-text-secondary dark:text-slate-300 mt-0.5 font-mono">{alert.price}</div>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${alert.change > 0 ? 'bg-trust-red-bg text-trust-red border-trust-red/20' : 'bg-trust-green-bg text-trust-green border-trust-green/20'}`}>
                              {alert.change > 0 ? '▲' : '▼'} {Math.abs(alert.change)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fraud Security Breakdown */}
                  <div className="grid grid-cols-1 gap-4">
                    <FraudRiskPanel analysis={riskAnalysis} showBreakdown={true} />
                  </div>
                </div>
              )}

              {/* SECTION: Saved Searches */}
              {activeSection === 'saved-searches' && (
                <div className="space-y-4">
                  <SavedSearchesPanel 
                    onRerunSearch={(query, category) => {
                      setSelectedRfqSearch(query);
                      showToast(`Rerunning matching search query: "${query}" in "${category || 'General'}". Found matches in GIDC database!`, 'success');
                    }}
                  />
                  {selectedRfqSearch && (
                    <div className="bg-trust-blue-bg/25 border border-trust-blue/15 p-3.5 rounded-xl text-xs flex justify-between items-center gap-3">
                      <div className="font-semibold text-text-secondary">
                        Active Sourcing Query Tracker: <strong className="text-navy">{selectedRfqSearch}</strong>
                      </div>
                      <button 
                        onClick={() => setSelectedRfqSearch(null)}
                        className="text-[10px] font-bold text-gold hover:underline cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: Shortlisted Suppliers */}
              {activeSection === 'shortlisted-suppliers' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                    <div className="text-xs">
                      <span className="font-black text-navy dark:text-white uppercase text-[10px] tracking-wider block">Shortlisted GIDC Corridor Plants</span>
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-semibold">Showing {suppliers.filter(s => s.isVerified).length} verified manufacturing plants with physical GPS audit logs</span>
                    </div>
                    <Link 
                      href="/suppliers" 
                      className="bg-navy hover:bg-navy-light text-white text-[10px] font-black px-4 py-2 rounded-xl no-underline transition-all shadow-2xs text-center whitespace-nowrap uppercase tracking-wider hover:scale-[1.02]"
                    >
                      + Browse Factory Directory
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suppliers.filter(s => s.isVerified).map((s, idx) => {
                      const initials = s.companyName.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
                      const gradients = [
                        'bg-gradient-to-br from-navy via-navy-light to-blue-900',
                        'bg-gradient-to-br from-emerald-700 to-teal-900',
                        'bg-gradient-to-br from-purple-800 to-indigo-900',
                        'bg-gradient-to-br from-amber-700 to-amber-900',
                        'bg-gradient-to-br from-rose-800 to-red-950',
                      ];
                      const gradient = gradients[idx % gradients.length];
                      return (
                        <div key={s.id} className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 flex gap-3.5 shadow-2xs hover:border-gold transition-all duration-300 hover:-translate-y-0.5">
                          <div className={`w-12 h-12 ${gradient} text-white font-black rounded-2xl flex items-center justify-center text-xs flex-shrink-0 shadow-md border border-white/20`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-navy dark:text-white truncate" title={s.companyName}>{s.companyName}</div>
                                <div className="text-[10px] text-text-secondary dark:text-slate-300 font-semibold truncate">{s.location.city}, {s.location.gidcZone || 'Gujarat Cluster'}</div>
                              </div>
                              <span className="text-[10px] font-black text-gold bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-full flex-shrink-0">
                                {s.qualityScore.total}/100 Score
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-[10px] bg-trust-green-bg text-trust-green border border-trust-green/20 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                                ✓ Geotagged GIDC Verified
                              </span>
                              <span className="text-[10px] text-text-muted dark:text-slate-400 font-bold">
                                Active Capacity: 92%
                              </span>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/5 mt-2">
                              <Link href={`/suppliers/${s.slug}`} className="bg-cream/80 hover:bg-cream-secondary dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-navy dark:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-white/10 no-underline flex-1 text-center transition-all duration-300 hover:scale-[1.02] shadow-2xs">
                                Plant Dossier
                              </Link>
                              <button 
                                onClick={() => {
                                  const thread = data.messages.find(m => m.supplierName.includes(s.companyName.split(' ')[0]));
                                  if (thread) {
                                    setSelectedThreadId(thread.id);
                                  }
                                  handleSectionChange('messages');
                                }}
                                className="bg-gradient-to-r from-gold via-[#e0ad36] to-amber-600 hover:from-gold-hover hover:via-[#c9982b] hover:to-amber-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider no-underline flex-1 text-center transition-all duration-300 shadow-premium-sm hover:shadow-md hover:scale-[1.03] cursor-pointer"
                              >
                                Message Supplier
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: RFQ Status */}
              {activeSection === 'rfq-status' && (
                <div className="space-y-5 animate-fade-in">
                  {/* RFQ Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Active RFQs</span>
                      <div className="text-xl font-black text-navy dark:text-white">{outcomeRecords.length}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Quoted Offers</span>
                      <div className="text-xl font-black text-amber-500">
                        {outcomeRecords.filter(r => r.stage === 'quoted' || r.stage === 'sampled' || r.stage === 'negotiated').length}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Closed Orders</span>
                      <div className="text-xl font-black text-emerald-500">
                        {outcomeRecords.filter(r => r.stage === 'closed' || r.stage === 'ordered').length}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Est. Corridor Value</span>
                      <div className="text-xl font-black text-gold font-mono">$34,800</div>
                    </div>
                  </div>

                  {/* RFQ List Cards */}
                  <div className="space-y-4">
                    {outcomeRecords.map((record) => (
                      <div key={record.rfqId + '-' + record.supplierId} className="space-y-2 bg-white/80 dark:bg-[var(--surface)]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                        <OutcomeTracker record={record} />
                        <div className="flex justify-between items-center px-1 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
                          <span className="text-[10px] text-text-muted dark:text-slate-400 font-bold font-mono">RFQ ID: {record.rfqId}</span>
                          <button 
                            onClick={() => { handleSectionChange('quote-comparisons') }} 
                            className="bg-navy hover:bg-navy-light text-white px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5 hover:scale-[1.02]"
                          >
                            <GitCompare size={12} className="text-gold" />
                            <span>Analyze Quotes & Matrix</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Quote Comparisons */}
              {activeSection === 'quote-comparisons' && (
                <div className="space-y-4">
                  <QuoteComparisonTable 
                    quotes={rfqQuotes} 
                    onChatClick={(name) => { 
                      const thread = data.messages.find(m => m.supplierName.toLowerCase().includes(name.split(' ')[0].toLowerCase()));
                      if (thread) {
                        setSelectedThreadId(thread.id);
                      }
                      handleSectionChange('messages');
                    }}
                    onQuoteView={(quote) => {
                      setSelectedSupplierForMatch(quote.supplier.id);
                    }}
                  />
                  
                  {selectedSupplierForMatch && (() => {
                    const supplierObj = suppliers.find((s) => s.id === selectedSupplierForMatch);
                    if (!supplierObj) return null;
                    const req = {
                      category: supplierObj.category,
                      certifications: supplierObj.certifications,
                      gidcZone: supplierObj.location.gidcZone,
                    };
                    const matchResult = calculateSupplierMatch(supplierObj, req);
                    return (
                      <div className="border border-gold/30 rounded-2xl p-4 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md space-y-3 relative shadow-premium">
                        <button 
                          onClick={() => setSelectedSupplierForMatch(null)}
                          className="absolute top-3 right-3 text-text-muted hover:text-text-primary text-[10px] font-black cursor-pointer bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
                        >
                          ✕ Close Panel
                        </button>
                        <AgentMatchPanel match={matchResult} supplier={supplierObj} />
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SECTION: Messages */}
              {activeSection === 'messages' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-trust-blue-bg/40 dark:bg-blue-950/40 border border-trust-blue/30 rounded-2xl p-3.5 flex items-center justify-between text-xs backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-trust-blue flex-shrink-0" />
                      <span className="text-text-secondary dark:text-slate-200 font-bold">End-to-End Encrypted B2B Sourcing Communication Desk</span>
                    </div>
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-border-default dark:border-white/10 px-2.5 py-0.5 rounded-full text-navy dark:text-white font-mono font-black shadow-2xs">Audit Logged</span>
                  </div>
                  <ConversationPanel 
                    messages={data.messages} 
                    activeThreadId={selectedThreadId} 
                    onThreadChange={(id) => setSelectedThreadId(id)}
                  />
                </div>
              )}

              {/* SECTION: Order History */}
              {activeSection === 'order-history' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Order Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Total Orders</span>
                      <div className="text-xl font-black text-navy dark:text-white">3</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Delivered & Inspected</span>
                      <div className="text-xl font-black text-emerald-500">2</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">In Transit (Mundra)</span>
                      <div className="text-xl font-black text-blue-500">1</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider block">Total Transaction Vol</span>
                      <div className="text-xl font-black text-gold font-mono">$25,450</div>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-cream-secondary/40 dark:bg-slate-800/40">
                      <h3 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white">Active Negotiations & Sourcing Order Ledger</h3>
                      <button
                        onClick={() => {
                          const win = window.open("", "_blank");
                          if (win) {
                            win.document.write(`
                              <html>
                                <head>
                                  <title>Aartha Order Ledger Export</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; color: #0B1628; }
                                    h1 { text-transform: uppercase; font-size: 20px; border-bottom: 2px solid #C4962A; padding-bottom: 10px; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
                                    th { background-color: #0F1F35; color: #fff; text-transform: uppercase; }
                                  </style>
                                </head>
                                <body>
                                  <h1>Aartha Export Ledger - Sourcing Connection Report</h1>
                                  <p><strong>Generated Date:</strong> ${new Date().toLocaleString()}</p>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Order ID</th>
                                        <th>Supplier Name</th>
                                        <th>Product Description</th>
                                        <th>Transaction Amount</th>
                                        <th>Inspection Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>ORD-2026-042</td>
                                        <td>Ahmedabad Precision Tools</td>
                                        <td>CNC Boring Bits</td>
                                        <td>$4,850</td>
                                        <td>Delivered & Inspected</td>
                                      </tr>
                                      <tr>
                                        <td>ORD-2026-031</td>
                                        <td>Vadodara Chemicals Ltd.</td>
                                        <td>Paracetamol API</td>
                                        <td>$12,400</td>
                                        <td>In Transit (Mundra Port)</td>
                                      </tr>
                                      <tr>
                                        <td>ORD-2026-015</td>
                                        <td>Surat Textile Industries</td>
                                        <td>Woven Cotton Fabrics</td>
                                        <td>$8,200</td>
                                        <td>Delivered & Inspected</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <p style="font-size: 10px; margin-top: 40px; color: gray;">Verified by Aartha Audit Commission Corridor Ledger. Confidentially issued to Buyer.</p>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            win.document.close();
                          }
                        }}
                        className="bg-navy hover:bg-navy-light text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer uppercase select-none transition-all shadow-2xs hover:scale-[1.02]"
                      >
                        <FileText size={12} className="text-gold" />
                        <span>Export Connection PDF</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-sans text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-cream-secondary/60 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/10 text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider">
                            <th className="p-3.5">Order ID</th>
                            <th className="p-3.5">Supplier</th>
                            <th className="p-3.5">Product</th>
                            <th className="p-3.5 text-right">Amount</th>
                            <th className="p-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {[
                            { id: 'ORD-2026-042', supplier: 'Ahmedabad Precision Tools', product: 'CNC Boring Bits', amount: '$4,850', status: 'Delivered' },
                            { id: 'ORD-2026-031', supplier: 'Vadodara Chemicals Ltd.', product: 'Paracetamol API', amount: '$12,400', status: 'In Transit' },
                            { id: 'ORD-2026-015', supplier: 'Surat Textile Industries', product: 'Woven Cotton Fabrics', amount: '$8,200', status: 'Delivered' },
                          ].map((ord) => (
                            <tr key={ord.id} className="hover:bg-cream/40 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5 font-mono text-[10px] text-navy dark:text-gold font-bold">{ord.id}</td>
                              <td className="p-3.5 font-black text-navy dark:text-white">{ord.supplier}</td>
                              <td className="p-3.5 text-text-secondary dark:text-slate-300 font-semibold">{ord.product}</td>
                              <td className="p-3.5 text-right font-black text-navy dark:text-white font-mono">{ord.amount}</td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  ord.status === 'Delivered' ? 'bg-trust-green-bg text-trust-green border border-trust-green/20' : 'bg-trust-blue-bg text-trust-blue border border-trust-blue/20'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${ord.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Price Alerts */}
              {activeSection === 'price-alerts' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MarketPriceIntel productName="WHO-GMP Paracetamol API" targetPrice={3.20} />
                    <MarketPriceIntel productName="GOTS Organic Cotton Weave Fabric" targetPrice={4.50} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-white/10 pb-2">
                      <h4 className="font-black text-navy dark:text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-gold" />
                        <span>Tracked Gujarat Commodity Benchmark Indices</span>
                      </h4>
                      <span className="text-[10px] text-text-muted dark:text-slate-400 font-semibold">Updated daily from Gujarat mandis & Mundra port logs</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.priceAlerts.map((alert) => {
                        const isPriceDrop = alert.change < 0;
                        return (
                          <div key={alert.id} className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:border-gold transition-all duration-300">
                            <div className="space-y-1">
                              <h4 className="font-black text-xs text-navy dark:text-white leading-tight">{alert.commodity}</h4>
                              <div className="text-[11px] text-gold font-mono font-black">{alert.price}</div>
                              <p className="text-[10px] text-text-muted dark:text-slate-400 font-medium">
                                {isPriceDrop ? 'Favorable buying window — prices down.' : 'High demand curve — locking volume advised.'}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block ${
                                isPriceDrop ? 'bg-trust-green-bg text-trust-green border-trust-green/20' : 'bg-trust-red-bg text-trust-red border-trust-red/20'
                              }`}>
                                {isPriceDrop ? '▼' : '▲'} {Math.abs(alert.change)}%
                              </span>
                              <div className="text-[10px] text-text-muted dark:text-slate-400 mt-1 font-semibold">90d trend deviation</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Market Insights */}
              {activeSection === 'market-insights' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                      <h4 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                        <TrendingUp size={16} className="text-trust-green" />
                        <span>Rising Export Demand (Q2 Surge)</span>
                      </h4>
                      <div className="space-y-3 pt-1">
                        {data.marketInsight.risingDemand.map((d) => (
                          <div key={d.topic} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-navy dark:text-white font-bold">{d.topic}</span>
                              <span className="text-trust-green font-black text-[10px]">+ {d.growthPercent}% growth</span>
                            </div>
                            <div className="w-full bg-cream-secondary dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-border-default/20">
                              <div className="h-full bg-gradient-to-r from-trust-green to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, d.growthPercent * 2.5)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                      <h4 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                        <Search size={16} className="text-gold" />
                        <span>Top Searched Corridor Products</span>
                      </h4>
                      <p className="text-[10px] text-text-muted dark:text-slate-400 font-medium">Click any tag to search matching verified Gujarat plants</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {data.marketInsight.topSearchedItems.map((item) => (
                          <button 
                            key={item} 
                            onClick={() => {
                              setSelectedRfqSearch(item);
                              handleSectionChange('saved-searches');
                            }}
                            className="bg-cream/80 dark:bg-slate-800 hover:bg-gold/20 border border-border-strong/40 dark:border-white/10 text-navy dark:text-white hover:text-gold text-[10px] font-black px-3 py-1 rounded-full uppercase cursor-pointer transition-all shadow-3xs hover:scale-105"
                          >
                            + {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                    <h4 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white">Global Buyer Sourcing Distribution Map</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-center text-xs font-sans">
                      {[
                        { country: 'USA', flag: '🇺🇸', percent: 28 },
                        { country: 'UAE', flag: '🇦🇪', percent: 22 },
                        { country: 'Germany', flag: '🇩🇪', percent: 18 },
                        { country: 'UK', flag: '🇬🇧', percent: 15 },
                        { country: 'Australia', flag: '🇦🇺', percent: 17 },
                      ].map((c) => (
                        <div key={c.country} className="bg-cream/40 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1 hover:border-gold transition-colors">
                          <div className="text-xl">{c.flag}</div>
                          <div className="font-black text-navy dark:text-white text-xs">{c.country}</div>
                          <div className="text-xs font-black text-gold">{c.percent}% Share</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Repeat Orders */}
              {activeSection === 'repeat-orders' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-trust-green-bg/30 dark:bg-emerald-950/30 border border-trust-green/30 rounded-2xl p-3.5 flex items-center justify-between text-xs backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="text-trust-green flex-shrink-0 animate-spin-slow" />
                      <span className="text-text-secondary dark:text-slate-200 font-bold">One-Click Procurement Shortcuts from Previous Orders</span>
                    </div>
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-border-default dark:border-white/10 px-2.5 py-0.5 rounded-full text-navy dark:text-white font-black shadow-2xs">Auto-Filled Specs</span>
                  </div>

                  {[
                    { id: 'ORD-2026-015', supplier: 'Surat Textile Industries', product: 'Woven Cotton Fabrics', quantity: '5,000 meters', pricing: '$8,200', date: 'Ordered 3 months ago' },
                    { id: 'ORD-2026-042', supplier: 'Ahmedabad Precision Tools', product: 'CNC Boring Bits', quantity: '200 units', pricing: '$4,850', date: 'Ordered 1 month ago' },
                  ].map((rep) => (
                    <div key={rep.id} className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 border-l-4 border-l-gold rounded-2xl p-4.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-2xs hover:border-gold transition-all duration-300">
                      <div className="space-y-1 text-xs">
                        <div className="font-black text-navy dark:text-white text-sm flex items-center gap-2">
                          <span>{rep.product}</span>
                          <span className="text-[10px] bg-cream-secondary dark:bg-slate-800 text-navy dark:text-gold font-mono px-2 py-0.5 rounded-full font-bold">{rep.id}</span>
                        </div>
                        <div className="text-text-secondary dark:text-slate-300">Supplier: <strong className="text-navy dark:text-white">{rep.supplier}</strong> · Vol: <strong>{rep.quantity}</strong></div>
                        <div className="flex items-center gap-3 text-[10px] text-text-muted dark:text-slate-400 mt-1 font-semibold">
                          <span>{rep.date}</span>
                          <span>·</span>
                          <span>Previous Price: <strong className="text-gold font-mono">{rep.pricing}</strong></span>
                        </div>
                      </div>
                      <Link href="/rfq" className="bg-gradient-to-r from-navy via-navy-light to-navy hover:from-navy-light hover:to-navy text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all text-center no-underline whitespace-nowrap shadow-2xs hover:scale-[1.02]">
                        Quick Reorder Now
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION: Settings */}
              {activeSection === 'settings' && (
                <div className="space-y-5 animate-fade-in font-sans">
                  {/* Card 1: Verified Buyer Credentials */}
                  <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
                      <h3 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                        <Key size={14} className="text-gold" />
                        <span>Verified Buyer Credentials</span>
                      </h3>
                      <span className="text-[10px] bg-trust-green-bg text-trust-green border border-trust-green/20 px-2.5 py-0.5 rounded-full font-black uppercase">
                        ✓ KYC Cleared
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider block">Full Name</span>
                        <div className="font-bold text-navy dark:text-white bg-cream/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 p-2.5 rounded-xl mt-1">{data.buyerName}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider block">Corporate Email</span>
                        <div className="font-bold text-navy dark:text-white bg-cream/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 p-2.5 rounded-xl mt-1 font-mono">{data.verifiedEmail}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider block">Company Registration</span>
                        <div className="font-bold text-navy dark:text-white bg-cream/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 p-2.5 rounded-xl mt-1">{data.company}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider block">Member Since</span>
                        <div className="font-bold text-navy dark:text-white bg-cream/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 p-2.5 rounded-xl mt-1">{data.memberSince}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Corporate Identity */}
                  <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-2xs">
                    <h3 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2 flex items-center gap-2">
                      <Sparkles size={14} className="text-gold" />
                      <span>Corporate Branding & Entity Logo</span>
                    </h3>
                    <LogoUploadField
                      companyName={decl ? decl.companyName : data.company}
                      logoUrl={avatarUrl}
                      onChange={handleAvatarChange}
                      onRemove={handleAvatarRemove}
                      label="Buyer Entity Logo / Avatar"
                    />
                  </div>

                  {/* Card 3: Subscription Management */}
                  <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
                      <h3 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white flex items-center gap-2">
                        <Zap size={14} className="text-gold" />
                        <span>Workspace Subscription Status</span>
                      </h3>
                      <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-black uppercase ${
                        isPro ? 'bg-gold/15 text-gold border-gold/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary border-border-strong/50'
                      }`}>
                        {planName}
                      </span>
                    </div>
                    
                    <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed font-semibold">
                      {isPro 
                        ? `You have unlocked premium B2B sourcing capabilities on the Aartha trade corridor with your active ${planName} subscription. Your subscription billing is simulated in Sandbox mode.`
                        : 'Upgrade your workspace to access unlimited geocoded GIDC matching queries, priority coordinator dispatching, and direct port compliance audits.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end">
                      {isPro ? (
                        <button 
                          onClick={handleDowngrade}
                          className="bg-navy/10 hover:bg-navy/20 border border-border-strong text-text-secondary text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer select-none"
                        >
                          Downgrade Plan
                        </button>
                      ) : (
                        <button 
                          onClick={() => setShowUpgradeModal(true)}
                          className="bg-gradient-to-r from-gold via-amber-500 to-gold-hover hover:from-gold-hover hover:to-gold text-white text-xs font-black px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md select-none hover:scale-[1.02]"
                        >
                          Upgrade Workspace Plan
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Audit Notifications */}
                  <div className="bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-2xs">
                    <h3 className="font-black text-xs uppercase tracking-wider text-navy dark:text-white border-b border-slate-100 dark:border-white/10 pb-2 flex items-center gap-2">
                      <Bell size={14} className="text-gold" />
                      <span>Audit & Procurement Notification Toggles</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-cream/40 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                        <div className="space-y-0.5">
                          <div className="text-xs text-navy dark:text-white font-bold">New Quote Alerts</div>
                          <div className="text-[10px] text-text-muted dark:text-slate-400">Notify me immediately when verified GIDC plants submit quotes</div>
                        </div>
                        <Checkbox 
                          checked={preferences.newQuoteAlerts}
                          onChange={(e) => setPreferences(prev => ({ ...prev, newQuoteAlerts: e.target.checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-cream/40 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                        <div className="space-y-0.5">
                          <div className="text-xs text-navy dark:text-white font-bold">Commodity Price Alerts</div>
                          <div className="text-[10px] text-text-muted dark:text-slate-400">Receive weekly market price movement digests for tracked items</div>
                        </div>
                        <Checkbox 
                          checked={preferences.priceAlerts}
                          onChange={(e) => setPreferences(prev => ({ ...prev, priceAlerts: e.target.checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-cream/40 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                        <div className="space-y-0.5">
                          <div className="text-xs text-navy dark:text-white font-bold">Customs & Compliance Warning</div>
                          <div className="text-[10px] text-text-muted dark:text-slate-400">Alert me if L/C or certificate of origin validation discrepancies are found</div>
                        </div>
                        <Checkbox 
                          checked={preferences.customsWarnings}
                          onChange={(e) => setPreferences(prev => ({ ...prev, customsWarnings: e.target.checked }))}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end">
                      <button 
                        onClick={handleSavePreferences}
                        className="bg-gold hover:bg-gold-hover text-white text-xs font-black px-5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs select-none hover:scale-[1.02]"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Column 3: Right Verification Panel */}
            <div className="w-full xl:w-72 p-5 sm:p-6 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md space-y-6 flex-shrink-0">
              
              {/* Buyer Verification Card */}
              <div className="border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[var(--surface)]/60 backdrop-blur-md rounded-2xl p-5 space-y-4.5 shadow-sm hover:border-gold/30 hover:shadow-md transition-all duration-300 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                  <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider">Buyer Dossier</span>
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                    isPro 
                      ? 'bg-gold/15 text-gold border-gold/25'
                      : decl 
                        ? 'bg-trust-blue-bg text-trust-blue border-trust-blue/20' 
                        : 'bg-trust-green-bg text-trust-green border-trust-green/20'
                  }`}>
                    {isPro ? 'Verified Pro' : decl ? 'Authority Verified' : 'Domain Checked'}
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1 bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-white/10 p-2 rounded-xl">
                  <div className="w-10 h-10 rounded-xl border border-gold/30 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-navy font-black text-xs uppercase">
                        {(decl ? decl.companyName : companyName).slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-navy dark:text-white leading-tight text-xs truncate">{decl ? decl.companyName : companyName}</div>
                    <div className="text-[10px] text-text-muted dark:text-slate-400 uppercase font-black tracking-wider truncate mt-0.5">{buyerName}</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider">Purchasing Authority Limit</span>
                    <div className="font-bold text-navy dark:text-white leading-normal mt-0.5">{decl ? decl.authorityBand : data.purchaseAuthority}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider">Verified Business Domain</span>
                    <div className="font-bold text-navy dark:text-white font-mono leading-normal mt-0.5 break-all">{decl ? decl.businessEmail : buyerEmail}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider">Authorized Role</span>
                    <div className="font-bold text-navy dark:text-white leading-normal mt-0.5">
                      {decl ? `${decl.representativeName} (${decl.designation})` : data.role}
                    </div>
                  </div>
                </div>

                {/* Tier Progression */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10 text-[10px]">
                  <div className="flex justify-between items-center font-black tracking-wider uppercase text-text-muted dark:text-slate-400">
                    <span>Verification Progress</span>
                    <span className="text-gold">{isPro ? 'Tier 4 / 4' : decl ? 'Tier 3 / 4' : 'Tier 2 / 4'}</span>
                  </div>
                  <div className="w-full bg-cream dark:bg-slate-800 border border-slate-200 dark:border-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold to-amber-500 transition-all duration-300" style={{ width: isPro ? '100%' : decl ? '75%' : '50%' }}></div>
                  </div>
                  <p className="text-[10px] text-text-muted dark:text-slate-400 leading-relaxed font-semibold">
                    {isPro 
                      ? '✓ Complete KYC validation has been validated by our trade logs.'
                      : decl 
                        ? '✓ Complete KYC validation with our trade desk to reach Tier 4 (Corridor Approved).' 
                        : 'ℹ️ Declare purchasing authority limit to reach Tier 3 (Authority Verified).'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowDeclForm(true)}
                    className="w-full bg-gold hover:bg-gold-hover text-white text-[10px] font-black py-2 rounded-xl transition-all cursor-pointer select-none shadow-2xs hover:scale-[1.02]"
                  >
                    {decl ? 'Update Authority Band' : 'Declare Sourcing Authority'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1.5">
                  <span className="text-[10px] text-text-muted dark:text-slate-400 font-extrabold uppercase tracking-wider">Sourcing Cluster Interests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.sourcingInterests.map((interest) => (
                      <span key={interest} className="bg-navy/5 dark:bg-white/10 text-navy dark:text-white border border-slate-200/50 dark:border-white/10 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sourcing Steps / Journey */}
              <div className="space-y-2.5 border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[var(--surface)]/60 backdrop-blur-md rounded-2xl p-4 shadow-sm hover:border-gold/30 hover:shadow-md transition-all duration-300">
                <button
                  onClick={() => setSourcingFlowExpanded(!sourcingFlowExpanded)}
                  className="w-full flex justify-between items-center text-left cursor-pointer select-none"
                >
                  <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-navy dark:text-white">Corridor Sourcing Flow</h4>
                  {sourcingFlowExpanded ? <ChevronUp size={12} className="text-text-muted" /> : <ChevronDown size={12} className="text-text-muted" />}
                </button>
                
                {sourcingFlowExpanded ? (
                  <div className="space-y-3.5 text-xs leading-normal pt-2.5 border-t border-slate-100 dark:border-white/5 mt-2 animate-fade-in">
                    {[
                      { s: '1', title: 'Submit Requirement', desc: 'Post exact specs, volume & compliance needs.' },
                      { s: '2', title: 'Dynamic Quality Match', desc: 'GPS geotagged plants automatically route match.' },
                      { s: '3', title: 'Review Side-by-Side', desc: 'Compare verified trust scores and prices.' },
                      { s: '4', title: 'Secure Transact', desc: 'Close order via verified digital trade logs.' },
                    ].map((step) => (
                      <div key={step.s} className="flex gap-2.5">
                        <div className="w-5.5 h-5.5 rounded-full bg-gold/10 dark:bg-gold/20 border border-gold/30 text-gold font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-3xs">
                          {step.s}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-black text-navy dark:text-white">{step.title}</div>
                          <p className="text-[10px] text-text-secondary dark:text-slate-300 font-medium leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-text-muted dark:text-slate-400 leading-relaxed font-semibold">
                    Automated 4-step verified matching protocol from post to digital close. Click to inspect flow.
                  </p>
                )}
              </div>

              {/* Security Protection list */}
              <div className="bg-gradient-to-br from-[#0B1628]/98 via-[#0E1A2D]/98 to-[#050C18]/98 text-white rounded-2xl p-5 space-y-4 border border-gold/30 dark:border-gold/20 shadow-premium hover:border-gold/50 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-gradient-to-br from-gold/25 to-amber-500/10 rounded-full filter blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <h4 className="text-[10.5px] uppercase tracking-widest relative z-10 flex items-center gap-1.5 font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-300 to-amber-500">
                  <ShieldCheck size={14} className="text-gold animate-pulse flex-shrink-0" />
                  <span>Aartha Protection Guarantee</span>
                </h4>
                <ul className="space-y-3 text-[10px] text-slate-300 leading-relaxed font-semibold relative z-10">
                  <li className="flex gap-2.5 items-start">
                    <div className="w-4 h-4 rounded-full bg-gold/10 dark:bg-gold/20 border border-gold/30 text-gold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-3xs">
                      <Check size={9} strokeWidth={3} />
                    </div>
                    <span>100% factory-visited manufacturers verified in GIDC zones.</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <div className="w-4 h-4 rounded-full bg-gold/10 dark:bg-gold/20 border border-gold/30 text-gold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-3xs">
                      <Check size={9} strokeWidth={3} />
                    </div>
                    <span>Corporate email checks protect against supplier ghosting.</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <div className="w-4 h-4 rounded-full bg-gold/10 dark:bg-gold/20 border border-gold/30 text-gold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-3xs">
                      <Check size={9} strokeWidth={3} />
                    </div>
                    <span>Direct access to dispute resolution & arbitration desks.</span>
                  </li>
                </ul>
                <div className="pt-3 border-t border-white/10 relative z-10">
                  <WhatsAppButton
                    phoneNumber="+91 72084 32138"
                    message="Buyer sourcing security assistance request."
                    label="WhatsApp Support Desk"
                    variant="glass"
                    className="w-full text-center text-[10px]"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Authority Declaration Modal */}
      {showDeclForm && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in animate-scale-in">
          <div className="bg-white border border-border-default rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border-default pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-navy">Declare Sourcing Authority</h3>
              <button onClick={() => setShowDeclForm(false)} className="text-text-muted hover:text-text-primary font-bold">✕</button>
            </div>
            <AuthorityDeclarationForm onSuccess={handleDeclSuccess} onCancel={() => setShowDeclForm(false)} />
          </div>
        </div>
      )}

      {/* Upgrade Workspace Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in animate-scale-in">
          <div className="bg-white border border-border-default rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border-default pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-navy">Upgrade Workspace Status</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-text-muted hover:text-text-primary font-bold">✕</button>
            </div>
            <UpgradeModal onSuccess={handleUpgradeSuccess} onCancel={() => setShowUpgradeModal(false)} />
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Nav */}
      <MobileBottomNav
        items={[
          { key: 'overview', label: 'Overview', icon: BarChart2 },
          { key: 'rfq-status', label: 'RFQs', icon: FileText },
          { key: 'quote-comparisons', label: 'Compare', icon: GitCompare },
          { key: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
          { key: 'settings', label: 'Settings', icon: Settings },
        ]}
        activeItem={activeSection}
        onItemChange={(key) => handleSectionChange(key as BuyerSection)}
      />

      {/* Guided Onboarding Walkthrough */}
      <OnboardingTour role="buyer" />
    </div>
  );
}
