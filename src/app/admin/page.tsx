"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, FileText, Calendar, Users, ListFilter, 
  AlertTriangle, CheckCircle, RefreshCw, Plus, X, Award, MapPin, Database,
  GitCompare, TrendingUp, Settings, DollarSign, Hammer, Scale, SlidersHorizontal
} from 'lucide-react';
import { suppliers } from '@/data/suppliers';
import { evaluateBuyerRisk, evaluateSupplierRisk } from '@/lib/fraudDetection';
import RiskBreakdown from '@/components/RiskBreakdown';
import WhatsAppButton from '@/components/WhatsAppButton';
import Checkbox from '@/components/ui/Checkbox';

const mockPendingApplications = [
  { id: 'app1', companyName: 'Bhavnagar Agro Foods', category: 'Food & Agro', gstin: '24BHAAG7789D1Z9', iec: '0315004321', city: 'Bhavnagar', date: '2 days ago' },
  { id: 'app2', companyName: 'Ankleshwar Plastics Ltd', category: 'Plastics & Polymers', gstin: '24ANKPL3241F1Z1', iec: '0312009876', city: 'Ankleshwar', date: '3 days ago' },
];

const mockPendingRFQs = [
  { 
    id: 'RFQ-2026-06-0042', 
    buyerName: 'Global Chemical Corp', 
    email: 'procurement@globalchem.de',
    product: 'GMP Paracetamol API', 
    quantity: '5,000 kg', 
    category: 'Pharma & Healthcare',
    specifications: 'USP grade, 25kg bulk drums packaging. Certificate of Analysis (CoA) required.',
    date: '2 hours ago'
  },
  { 
    id: 'RFQ-2026-06-0019', 
    buyerName: 'Mehta Traders', 
    email: 'rahul@mehtatraders.com',
    product: 'WHO grade Ibuprofen', 
    quantity: '10,000 kg', 
    category: 'Pharma & Healthcare',
    specifications: 'BP/USP compliance, custom packing with raw material geotag verification report.',
    date: '5 hours ago'
  }
];

const mockAuditLogs = [
  { timestamp: '10:15:32 AM', action: 'SYSTEM_BOOT', details: 'Dynamic quality scoring indices recalculated successfully.' },
  { timestamp: '10:30:15 AM', action: 'GATEWAY_UP', details: 'corridor port sync completed. 8 plants online.' },
];

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [apps, setApps] = useState(mockPendingApplications);
  const [pendingRFQs, setPendingRFQs] = useState(mockPendingRFQs);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [activeRFQToRoute, setActiveRFQToRoute] = useState<typeof mockPendingRFQs[0] | null>(null);
  
  // Selection of suppliers to route to
  const [selectedSuppliersToRoute, setSelectedSuppliersToRoute] = useState<string[]>([]);
  
  // Schedule Visit state
  const [scheduleData, setScheduleData] = useState({ show: false, id: '', company: '', date: '' });
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  
  // Override state
  const [overrideData, setOverrideData] = useState({ show: false, type: '', companyId: '', value: '' });

  // New admin tab and control states
  const [adminTab, setAdminTab] = useState<'queue' | 'disputes' | 'analytics' | 'policy'>('queue');
  const [disputes, setDisputes] = useState([
    { id: 'DISP-2401', buyer: 'Pharma Corp DE (Germany)', supplier: 'Ahmedabad Pharma APIs', issue: 'Material Purity Spec Mismatch', amount: '$45,000', status: 'Mediation Assigned', date: '2 days ago' },
    { id: 'DISP-2402', buyer: 'Dieter Müller Engineering (Munich)', supplier: 'Rajkot Brass Castings', issue: 'CNC tolerance dimension mismatch (>15 microns)', amount: '$12,500', status: 'Under Review', date: '4 days ago' }
  ]);
  const [policies, setPolicies] = useState({
    blockFreeWebmail: true,
    enableIpGeocoding: true,
    maxRfqPerDay: 5,
    rateLimitRequests: 100,
    minTrustScoreLimit: 40
  });
  const [scoreWeights, setScoreWeights] = useState({
    verificationTier: 25,
    complianceCerts: 20,
    responseTime: 20,
    activeLogs: 10,
    reviews: 10,
    onsiteAudits: 15
  });

  const [flaggedAccounts, setFlaggedAccounts] = useState([
    { id: 'flg1', name: 'Rahul Sharma', email: 'rahul.s@gmail.com', company: 'Sharma Exports', type: 'buyer' as const, rfqCount: 15, averageInterval: 3 },
    { id: 'flg2', name: 'Morbi Ceramics Co', email: 'sales@morbiceramics.com', company: 'Morbi Ceramics Co', type: 'supplier' as const, gstin: '24MORB1234A1Z9', gpsCoords: '22.0000', phoneCode: '+1' }
  ]);

  // Load real data from API on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!data || !data.authenticated || data.role !== 'admin') {
          router.push('/signin?error=unauthorized');
          return;
        }
        setIsAdmin(true);
        setLoading(false);

        // Load real RFQs
        fetch('/api/admin/rfqs', { credentials: 'same-origin' })
          .then(r => {
            if (!r.ok) return null;
            return r.json();
          })
          .then(data => {
            if (data && data.rfqs?.length > 0) {
              setPendingRFQs(data.rfqs.slice(0, 10).map((r: Record<string, string>) => ({
                id: r.id,
                buyerName: r.companyName,
                email: r.email,
                product: r.product,
                quantity: `${r.quantity} ${r.unit}`,
                category: r.category,
                specifications: r.specifications || '',
                date: new Date(r.submittedAt).toLocaleString(),
              })));
            }
          })
          .catch(() => null);

        // Load real applications
        fetch('/api/admin/applications', { credentials: 'same-origin' })
          .then(r => {
            if (!r.ok) return null;
            return r.json();
          })
          .then(data => {
            if (data && data.applications?.length > 0) {
              setApps(prev => [
                ...data.applications.slice(0, 10).map((a: Record<string, string>) => ({
                  id: a.id,
                  companyName: a.companyName,
                  category: a.category,
                  gstin: a.gstin,
                  iec: a.iec,
                  city: a.city,
                  date: new Date(a.submittedAt).toLocaleString(),
                })),
                ...prev,
              ]);
            }
          })
          .catch(() => null);

        // Load real audit log
        fetch('/api/admin/audit-log', { credentials: 'same-origin' })
          .then(r => {
            if (!r.ok) return null;
            return r.json();
          })
          .then(data => {
            if (data && data.log?.length > 0) {
              setAuditLogs(prev => [
                ...data.log.slice(0, 50).map((e: Record<string, string>) => ({
                  timestamp: new Date(e.timestamp).toLocaleTimeString(),
                  action: e.action,
                  details: e.details,
                })),
                ...prev,
              ]);
            }
          })
          .catch(() => null);
      })
      .catch(() => {
        router.push('/signin?error=unauthorized');
      });
  }, [router]);

  const handleFraudAction = (id: string, action: string, name: string) => {
    setFlaggedAccounts(prev => prev.filter(f => f.id !== id));
    // Persist to API
    fetch('/api/admin/fraud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ accountId: id, accountName: name, action }),
    }).catch(() => null);
    addAuditLog('FRAUD_RESOLUTION', `Flagged account "${name}" marked as ${action.toUpperCase()} by admin override.`);
  };

  const addAuditLog = (action: string, details: string) => {
    const time = new Date().toLocaleTimeString();
    setAuditLogs(prev => [{ timestamp: time, action, details }, ...prev]);
  };

  const handleApproveApp = (id: string, name: string) => {
    setApps(prev => prev.filter(a => a.id !== id));
    // Persist to API
    fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ applicationId: id, action: 'approve', companyName: name }),
    }).catch(() => null);
    addAuditLog('APPROVE_DOSSIER', `Approved verification application for ${name}. Badge set to standard.`);
  };

  const handleRouteRFQ = (rfqId: string) => {
    fetch(`/api/admin/rfqs/${rfqId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ selectedSupplierIds: selectedSuppliersToRoute }),
    })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          setPendingRFQs(prev => prev.filter(r => r.id !== rfqId));
          addAuditLog('ROUTE_RFQ', `Manually routed RFQ ${rfqId} to ${selectedSuppliersToRoute.length} pre-verified plants.`);
          setSelectedSuppliersToRoute([]);
          setActiveRFQToRoute(null);
        }
      })
      .catch(() => null);
  };

  const handleScheduleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/admin/applications/${scheduleData.id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ visitDate: scheduleData.date, assignedAuditor: 'Rajesh Shah' }),
    })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          addAuditLog('SCHEDULE_AUDIT', `Site visit inspection scheduled for ${scheduleData.company} on ${scheduleData.date}.`);
          setScheduleData({ show: false, id: '', company: '', date: '' });
          // Update local status in queue
          setApps(prev => prev.map(a => a.id === scheduleData.id ? { ...a, date: scheduleData.date } : a));
        }
      })
      .catch(() => null);
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('SYSTEM_OVERRIDE', `Force modification triggered on ${overrideData.type} for Supplier ID ${overrideData.companyId} to ${overrideData.value}.`);
    setOverrideData({ show: false, type: '', companyId: '', value: '' });
  };

  // Filter verified suppliers that match RFQ's category using AI matches
  const matchedSuppliers = activeRFQToRoute 
    ? aiMatches.map(m => {
        const sup = suppliers.find(s => s.id === m.supplierId);
        return sup ? { ...sup, matchScore: m.score } : null;
      }).filter(Boolean) as any[]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-navy text-white rounded-2xl p-6 border border-border-default/10 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="bg-gold p-2 rounded-xl text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">Corridor Operating Control Layer</h1>
              <p className="text-white/60 text-xs">Admin authorization panel · Manual override controls active</p>
            </div>
          </div>
          <div className="text-right hidden sm:block text-xs font-mono text-white/50">
            Node: IN-WEST-GUJ-AHM-01
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-border-default flex gap-6 pb-1">
          {[
            { id: 'queue', label: 'Queues & Logs', icon: ListFilter },
            { id: 'disputes', label: 'Dispute Management', icon: Scale },
            { id: 'analytics', label: 'Platform Analytics', icon: TrendingUp },
            { id: 'policy', label: 'Policy & Quality Weights', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer select-none ${
                  adminTab === tab.id
                    ? 'border-navy text-navy font-black'
                    : 'border-transparent text-text-muted hover:text-text-primary font-semibold'
                }`}
              >
                <Icon size={14} className={adminTab === tab.id ? 'text-gold' : 'text-text-muted'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Operating Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          
          <div className="space-y-6">
            
            {adminTab === 'queue' && (
              <>
                {/* RFQ Routing Queue */}
                <div className="bg-white border border-border-default rounded-2xl p-6 space-y-4 shadow-2xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">RFQ Matching & Georouting Queue</h3>
                  
                  {pendingRFQs.length === 0 ? (
                    <div className="text-center text-text-muted py-8 text-xs font-semibold">
                      All buyer RFQs processed. Corridor queue clear.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRFQs.map((rfq) => (
                        <div key={rfq.id} className="border border-border-default rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-cream/10">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[9px] font-bold text-text-muted">{rfq.id}</span>
                              <span className="bg-navy/10 text-navy font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">
                                {rfq.category}
                              </span>
                            </div>
                            <h4 className="font-bold text-text-primary text-xs">{rfq.product}</h4>
                            <p className="text-text-secondary">Buyer: {rfq.buyerName} ({rfq.email}) · Quantity: <strong>{rfq.quantity}</strong></p>
                            <span className="text-[10px] text-text-muted">{rfq.date}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setActiveRFQToRoute(rfq);
                              setLoadingMatches(true);
                              fetch(`/api/admin/rfqs/${rfq.id}/matches`)
                                .then(r => r.json())
                                .then(data => {
                                  if (data.matches) {
                                    setAiMatches(data.matches);
                                    setSelectedSuppliersToRoute(data.matches.filter((m: any) => m.score >= 60).map((m: any) => m.supplierId));
                                  }
                                  setLoadingMatches(false);
                                })
                                .catch(() => setLoadingMatches(false));
                            }}
                            className="bg-navy hover:bg-navy-light text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer select-none flex items-center gap-1.5"
                          >
                            {loadingMatches ? <RefreshCw size={12} className="animate-spin" /> : null}
                            <span>Match & Route</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Applications Queue */}
                <div className="bg-white border border-border-default rounded-2xl p-6 space-y-4 shadow-2xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Supplier Verification Audit Queue</h3>
                  
                  {apps.length === 0 ? (
                    <div className="text-center text-text-muted text-xs font-semibold py-8">
                      All verification applications reviewed. Queue clear.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {apps.map((app) => (
                        <div key={app.id} className="border border-border-default rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-cream/10">
                          <div className="space-y-1 text-xs">
                            <div className="font-bold text-text-primary text-sm">{app.companyName}</div>
                            <p className="text-text-secondary">
                              Category: {app.category} · City: {app.city} · GSTIN: <strong className="font-mono text-navy">{app.gstin}</strong>
                            </p>
                            <span className="text-[10px] text-text-muted">Registered: {app.date}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => setScheduleData({ show: true, id: app.id, company: app.companyName, date: '2026-07-05' })}
                              className="border border-border-strong text-text-secondary hover:bg-cream text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Schedule Visit
                            </button>
                            <button
                              onClick={() => handleApproveApp(app.id, app.companyName)}
                              className="bg-trust-green hover:bg-trust-green/90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Approve Dossier
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fraud Risk Screening Center */}
                <div className="bg-white border border-border-default rounded-2xl p-6 space-y-4 shadow-2xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-trust-red border-b border-border-default pb-2">
                    Fraud Risk Review Queue
                  </h3>
                  {flaggedAccounts.length === 0 ? (
                    <div className="text-center text-text-muted py-6 text-xs font-semibold">
                      All suspicious activity cleared.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {flaggedAccounts.map(acc => {
                        const analysis = acc.type === 'buyer' 
                          ? evaluateBuyerRisk(acc.email, acc.company, acc.rfqCount, acc.averageInterval)
                          : evaluateSupplierRisk(acc.gstin || '', acc.gpsCoords || '22.0000', acc.phoneCode || '+91');

                        return (
                          <div key={acc.id} className="border border-border-default rounded-xl p-4 bg-cream-secondary/15 space-y-3">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-text-muted font-mono uppercase">ID: {acc.id} · {acc.type.toUpperCase()}</span>
                                <h4 className="font-bold text-text-primary text-xs">{acc.name} ({acc.company})</h4>
                                <p className="text-[10px] text-text-secondary">Email: {acc.email}</p>
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                analysis.totalScore >= 50 ? 'bg-trust-red-bg text-trust-red border-trust-red/20' : 'bg-trust-amber-bg text-trust-amber border-trust-amber/20'
                              }`}>
                                Risk Score: {analysis.totalScore} ({analysis.rating})
                              </span>
                            </div>

                            {/* Explainable risk indicators breakdown */}
                            <div className="pt-2 border-t border-border-default/45">
                              <RiskBreakdown analysis={analysis} />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-border-default/45">
                              <button
                                type="button"
                                onClick={() => handleFraudAction(acc.id, 'Safe', acc.name)}
                                className="bg-trust-green hover:bg-trust-green/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Mark Safe
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFraudAction(acc.id, 'Monitor', acc.name)}
                                className="bg-navy hover:bg-navy-light text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Add Monitor Flag
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFraudAction(acc.id, 'Blocked', acc.name)}
                                className="bg-trust-red hover:bg-trust-red/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Block Account
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Live Session Audit Trail */}
                <div className="bg-white border border-border-default rounded-2xl p-6 space-y-3 shadow-2xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Live Session Audit Log</h3>
                  
                  <div className="font-mono text-[10px] space-y-2 bg-cream-secondary p-4 rounded-xl max-h-40 overflow-y-auto">
                    {auditLogs.map((log, index) => (
                      <div key={index} className="flex gap-2 items-start py-1 border-b border-border-default/20 last:border-0">
                        <span className="text-text-muted">{log.timestamp}</span>
                        <span className="text-navy font-bold">[{log.action}]</span>
                        <span className="text-text-secondary leading-normal">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {adminTab === 'disputes' && (
              <div className="bg-white border border-border-default rounded-2xl p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center border-b border-border-default pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary">Dispute Resolution Desk</h3>
                  <span className="bg-trust-amber-bg text-trust-amber text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-trust-amber/20">Active Mediation</span>
                </div>
                
                {disputes.length === 0 ? (
                  <div className="text-center text-text-muted py-8 text-xs font-semibold">
                    No active buyer-supplier disputes filed.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map((disp) => (
                      <div key={disp.id} className="border border-border-default rounded-xl p-4 bg-cream/10 space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                          <div>
                            <span className="font-mono text-[9px] font-bold text-text-muted">{disp.id} · Filed {disp.date}</span>
                            <h4 className="font-bold text-text-primary text-xs uppercase mt-0.5">{disp.issue}</h4>
                            <p className="text-text-secondary mt-1 leading-normal">
                              Buyer: <strong>{disp.buyer}</strong> ↔ Supplier: <strong>{disp.supplier}</strong>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-navy">{disp.amount}</div>
                            <span className="inline-block bg-trust-amber-bg text-trust-amber text-[9px] font-bold px-2 py-0.5 rounded border border-trust-amber/20 mt-1 select-none">
                              {disp.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border-default/45">
                          <button
                            onClick={() => {
                              addAuditLog('DISPUTE_MEDIATION', `Mediator assigned to dispute ${disp.id} between ${disp.buyer} and ${disp.supplier}.`);
                              setDisputes(prev => prev.map(d => d.id === disp.id ? { ...d, status: 'Mediator Assigned' } : d));
                            }}
                            className="border border-border-strong text-text-secondary hover:bg-cream text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer select-none"
                          >
                            Assign Mediator
                          </button>
                          <button
                            onClick={() => {
                              addAuditLog('DISPUTE_RESOLUTION', `Dispute ${disp.id} marked as RESOLVED by admin override.`);
                              setDisputes(prev => prev.filter(d => d.id !== disp.id));
                            }}
                            className="bg-trust-green hover:bg-trust-green/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer select-none"
                          >
                            Resolve Dispute
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {adminTab === 'analytics' && (
              <div className="bg-white border border-border-default rounded-2xl p-6 space-y-6 shadow-2xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Corridor Sourcing Analytics</h3>
                
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cream-secondary/40 border border-border-default p-3 rounded-xl shadow-3xs">
                    <div className="text-[9px] text-text-muted font-bold uppercase">Total Sourcing Volume</div>
                    <div className="text-lg font-bold text-navy mt-1">₹25.40 Cr</div>
                  </div>
                  <div className="bg-cream-secondary/40 border border-border-default p-3 rounded-xl shadow-3xs">
                    <div className="text-[9px] text-text-muted font-bold uppercase">Avg Response Speed</div>
                    <div className="text-lg font-bold text-navy mt-1">1h 48m</div>
                  </div>
                  <div className="bg-cream-secondary/40 border border-border-default p-3 rounded-xl shadow-3xs">
                    <div className="text-[9px] text-text-muted font-bold uppercase">Active Match Count</div>
                    <div className="text-lg font-bold text-navy mt-1">1,420 RFQs</div>
                  </div>
                  <div className="bg-cream-secondary/40 border border-border-default p-3 rounded-xl shadow-3xs">
                    <div className="text-[9px] text-text-muted font-bold uppercase">Verification Pass Rate</div>
                    <div className="text-lg font-bold text-navy mt-1">18.4%</div>
                  </div>
                </div>

                {/* Monthly Volume Bar Chart */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[10px] text-text-secondary uppercase tracking-wider pl-1">Monthly Sourcing Value (INR Cr)</h4>
                  <div className="bg-cream border border-border-default rounded-xl p-4 flex items-end justify-between h-44 pt-8">
                    {[
                      { month: 'Jan', val: 12, height: 'h-[30%]' },
                      { month: 'Feb', val: 18, height: 'h-[45%]' },
                      { month: 'Mar', val: 24, height: 'h-[60%]' },
                      { month: 'Apr', val: 32, height: 'h-[75%]' },
                      { month: 'May', val: 40, height: 'h-[90%]' },
                      { month: 'Jun', val: 50, height: 'h-[100%]' }
                    ].map((bar) => (
                      <div key={bar.month} className="flex flex-col items-center gap-1.5 w-10">
                        <span className="text-[9px] font-mono text-navy font-bold">{bar.val}Cr</span>
                        <div className={`w-6 bg-gold hover:bg-gold-hover transition-all rounded-t ${bar.height}`}></div>
                        <span className="text-[9px] text-text-muted uppercase font-bold">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Share progress list */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[10px] text-text-secondary uppercase tracking-wider pl-1">Category RFQ Share (%)</h4>
                  <div className="space-y-2.5">
                    {[
                      { cat: 'Pharmaceuticals & APIs', pct: 35, color: 'bg-navy' },
                      { cat: 'Specialty Chemicals', pct: 25, color: 'bg-gold' },
                      { cat: 'Engineering & Brass castings', pct: 20, color: 'bg-trust-green' },
                      { cat: 'Textiles & Apparel', pct: 15, color: 'bg-trust-blue' },
                      { cat: 'Ceramics & Wall tiles', pct: 5, color: 'bg-trust-amber' }
                    ].map((item) => (
                      <div key={item.cat} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-text-secondary">
                          <span>{item.cat}</span>
                          <span className="font-bold text-navy">{item.pct}%</span>
                        </div>
                        <div className="w-full bg-cream border border-border-default/45 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'policy' && (
              <div className="bg-white border border-border-default rounded-2xl p-6 space-y-6 shadow-2xs">
                
                {/* Policy Config */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Policy Engine & Fraud Config</h3>
                  
                  <div className="space-y-3 text-xs font-semibold text-text-secondary">
                    <div className="flex justify-between items-center p-3 border border-border-default bg-cream/10 rounded-xl">
                      <div>
                        <h4 className="text-text-primary font-bold text-xs">Block Free Webmail Signups</h4>
                        <p className="text-[10px] text-text-muted font-normal mt-0.5">Enforce business email domains for all accounts.</p>
                      </div>
                      <Checkbox 
                        checked={policies.blockFreeWebmail}
                        onChange={(e) => setPolicies(prev => ({ ...prev, blockFreeWebmail: e.target.checked }))}
                      />
                    </div>

                    <div className="flex justify-between items-center p-3 border border-border-default bg-cream/10 rounded-xl">
                      <div>
                        <h4 className="text-text-primary font-bold text-xs">Enable Geocoding Mismatch Validation</h4>
                        <p className="text-[10px] text-text-muted font-normal mt-0.5">Flag accounts if IP geolocation does not match registration coordinates.</p>
                      </div>
                      <Checkbox 
                        checked={policies.enableIpGeocoding}
                        onChange={(e) => setPolicies(prev => ({ ...prev, enableIpGeocoding: e.target.checked }))}
                      />
                    </div>

                    <div className="p-3 border border-border-default bg-cream/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-text-primary font-bold text-xs">Max RFQs Postings Per User (Day)</h4>
                          <p className="text-[10px] text-text-muted font-normal mt-0.5">Limits matching spams across GIDC industrial corridors.</p>
                        </div>
                        <span className="bg-navy text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">{policies.maxRfqPerDay} RFQs</span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max="20"
                        value={policies.maxRfqPerDay}
                        onChange={(e) => setPolicies(prev => ({ ...prev, maxRfqPerDay: parseInt(e.target.value) || 5 }))}
                        className="w-full accent-navy cursor-pointer"
                      />
                    </div>

                    <div className="p-3 border border-border-default bg-cream/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-text-primary font-bold text-xs">Supplier Auto-Suspension Threshold</h4>
                          <p className="text-[10px] text-text-muted font-normal mt-0.5">Suspend badge if computed Quality Score drops below threshold.</p>
                        </div>
                        <span className="bg-trust-red text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">{policies.minTrustScoreLimit}/100</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="70"
                        value={policies.minTrustScoreLimit}
                        onChange={(e) => setPolicies(prev => ({ ...prev, minTrustScoreLimit: parseInt(e.target.value) || 40 }))}
                        className="w-full accent-trust-red cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Quality Weights Formula */}
                <div className="space-y-4 pt-4 border-t border-border-default">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Quality Ranking Formula Weights</h3>
                  <p className="text-[10px] text-text-secondary leading-relaxed">Adjust percentage impact weights of components. The total must equal <strong>100%</strong>.</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-text-secondary">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold tracking-wider">Verification Tier (%)</label>
                      <input 
                        type="number"
                        value={scoreWeights.verificationTier}
                        onChange={(e) => setScoreWeights(prev => ({ ...prev, verificationTier: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold tracking-wider">Compliance Certs (%)</label>
                      <input 
                        type="number"
                        value={scoreWeights.complianceCerts}
                        onChange={(e) => setScoreWeights(prev => ({ ...prev, complianceCerts: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold tracking-wider">Response Speed (%)</label>
                      <input 
                        type="number"
                        value={scoreWeights.responseTime}
                        onChange={(e) => setScoreWeights(prev => ({ ...prev, responseTime: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold tracking-wider">Onsite Audits (%)</label>
                      <input 
                        type="number"
                        value={scoreWeights.onsiteAudits}
                        onChange={(e) => setScoreWeights(prev => ({ ...prev, onsiteAudits: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-cream border border-border-default/45 p-3 rounded-xl text-xs font-bold mt-2">
                    <span>Sum of weights:</span>
                    <span className={scoreWeights.verificationTier + scoreWeights.complianceCerts + scoreWeights.responseTime + scoreWeights.onsiteAudits + scoreWeights.activeLogs + scoreWeights.reviews === 100 ? 'text-trust-green' : 'text-trust-red'}>
                      {scoreWeights.verificationTier + scoreWeights.complianceCerts + scoreWeights.responseTime + scoreWeights.onsiteAudits + scoreWeights.activeLogs + scoreWeights.reviews}%
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={scoreWeights.verificationTier + scoreWeights.complianceCerts + scoreWeights.responseTime + scoreWeights.onsiteAudits + scoreWeights.activeLogs + scoreWeights.reviews !== 100}
                    onClick={() => {
                      addAuditLog('WEIGHTS_RECALCULATED', `Quality Score formula weights updated: Verification=${scoreWeights.verificationTier}%, Compliance=${scoreWeights.complianceCerts}%, Response=${scoreWeights.responseTime}%, Audits=${scoreWeights.onsiteAudits}%. Bulk recalculation triggered.`);
                      alert('Formula weights saved. Platform indices bulk recalculation triggered in background.');
                    }}
                    className="w-full bg-navy hover:bg-navy-light text-white font-bold py-2.5 rounded-lg uppercase tracking-wider text-xs cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save & Recalculate Scoring Formula
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            <div className="bg-white border border-border-default rounded-2xl p-5 space-y-3 shadow-2xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">System Manual Overrides</h4>
              <button 
                onClick={() => setOverrideData({ show: true, type: 'BADGE_REVOKE', companyId: 's1', value: 'revoked' })}
                className="w-full bg-cream border border-border-strong text-text-secondary text-xs font-bold py-2 rounded-lg hover:bg-cream-secondary transition-colors cursor-pointer"
              >
                Revoke Supplier Badge (Force)
              </button>
              <button 
                onClick={() => setOverrideData({ show: true, type: 'SCORE_OVERRIDE', companyId: 's2', value: '98' })}
                className="w-full bg-cream border border-border-strong text-text-secondary text-xs font-bold py-2 rounded-lg hover:bg-cream-secondary transition-colors cursor-pointer"
              >
                Override Quality Score Index
              </button>
            </div>

            <div className="bg-white border border-border-default rounded-2xl p-5 space-y-3 shadow-2xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Audit Visit Scheduling</h4>
              <button 
                onClick={() => setScheduleData({ show: true, id: 'app1', company: 'Ahmedabad Precision Tools', date: '2026-07-10' })}
                className="w-full bg-navy text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-navy-light transition-colors cursor-pointer"
              >
                <Calendar size={14} />
                <span>Schedule New Inspection</span>
              </button>
            </div>

            <div className="bg-white border border-border-default rounded-2xl p-5 space-y-3 shadow-2xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Admin Support Desk</h4>
              <p className="text-[11px] text-text-secondary leading-normal font-semibold">Need platform override assistance or API gateway status validation? Contact developer support.</p>
              <WhatsAppButton
                phoneNumber="+91 72084 32138"
                message="Admin dashboard tech override request."
                label="WhatsApp Tech Desk"
                className="w-full"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Georouting Matching Drawer */}
      {activeRFQToRoute && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-default rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-scale-in font-sans">
            <div className="bg-navy text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-gold font-bold uppercase tracking-wider font-mono">Georouting Matcher</span>
                <h3 className="font-bold text-sm">Match Setup: {activeRFQToRoute.id}</h3>
              </div>
              <button onClick={() => setActiveRFQToRoute(null)} className="text-white/70 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-cream p-4 rounded-xl border border-border-default space-y-1.5 leading-relaxed">
                <div>Buyer Name: <strong className="text-navy">{activeRFQToRoute.buyerName}</strong></div>
                <div>Product: <strong className="text-navy">{activeRFQToRoute.product}</strong> · Qty: <strong>{activeRFQToRoute.quantity}</strong></div>
                <div>Specs: <span className="text-text-secondary">{activeRFQToRoute.specifications}</span></div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[10px] text-text-secondary tracking-wider pl-1">Available Pre-Verified Matches</h4>
                
                {loadingMatches ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="animate-spin text-gold" size={24} />
                  </div>
                ) : matchedSuppliers.length === 0 ? (
                  <p className="text-text-muted italic py-3 text-center">No verified suppliers matching this category currently in directory.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {matchedSuppliers.map((supplier) => (
                      <div key={supplier.id} className="border border-border-default rounded-xl p-3 flex justify-between items-center bg-white hover:border-gold/30">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={selectedSuppliersToRoute.includes(supplier.id)}
                            onChange={() => {
                              setSelectedSuppliersToRoute(prev => 
                                prev.includes(supplier.id) 
                                  ? prev.filter(id => id !== supplier.id)
                                  : [...prev, supplier.id]
                              );
                            }}
                            id={`route-supplier-${supplier.id}`}
                          />
                          <label htmlFor={`route-supplier-${supplier.id}`} className="space-y-0.5 cursor-pointer">
                            <div className="font-bold text-text-primary flex items-center gap-1.5">
                              {supplier.companyName}
                              <ShieldCheck size={12} className="text-trust-green" />
                            </div>
                            <div className="text-[10px] text-text-muted">
                              {supplier.location.city} · Score: <strong className="text-navy">{supplier.matchScore || supplier.qualityScore.total}/100</strong>
                            </div>
                          </label>
                        </div>
                        <span className="text-[10px] font-bold text-trust-green bg-trust-green-bg px-2 py-0.5 rounded-full border border-trust-green/20">
                          {supplier.verificationTier}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-default/40">
                <button
                  type="button"
                  onClick={() => setActiveRFQToRoute(null)}
                  className="px-4 py-2 border border-border-strong rounded-lg text-text-secondary hover:bg-cream cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedSuppliersToRoute.length === 0}
                  onClick={() => handleRouteRFQ(activeRFQToRoute.id)}
                  className="bg-navy hover:bg-navy-light text-white px-6 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                  <span>Route to {selectedSuppliersToRoute.length} Plants</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Scheduler Modal */}
      {scheduleData.show && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-border-default rounded-2xl w-full max-w-sm overflow-hidden shadow-xl font-sans">
            <div className="bg-navy text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gold">Schedule Factory Visit</h3>
              <button onClick={() => setScheduleData(prev => ({ ...prev, show: false }))} className="text-white/70 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleScheduleVisitSubmit} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Company Name</label>
                <input
                  type="text"
                  required
                  value={scheduleData.company}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border-default/40">
                <button
                  type="button"
                  onClick={() => setScheduleData(prev => ({ ...prev, show: false }))}
                  className="px-4 py-1.5 border border-border-strong rounded-lg text-text-secondary hover:bg-cream cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-navy text-white px-5 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-navy-light"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Override Modal */}
      {overrideData.show && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-border-default rounded-2xl w-full max-w-sm overflow-hidden shadow-xl font-sans">
            <div className="bg-navy text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gold">System Override Control</h3>
              <button onClick={() => setOverrideData(prev => ({ ...prev, show: false }))} className="text-white/70 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleOverrideSubmit} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Action Type</label>
                <div className="font-bold text-navy bg-cream p-2.5 rounded-lg border border-border-default/40">{overrideData.type}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Supplier ID</label>
                <input
                  type="text"
                  required
                  value={overrideData.companyId}
                  onChange={(e) => setOverrideData(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Override Target Value</label>
                <input
                  type="text"
                  required
                  value={overrideData.value}
                  onChange={(e) => setOverrideData(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border-default/40">
                <button
                  type="button"
                  onClick={() => setOverrideData(prev => ({ ...prev, show: false }))}
                  className="px-4 py-1.5 border border-border-strong rounded-lg text-text-secondary hover:bg-cream cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-trust-red text-white px-5 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-trust-red/90"
                >
                  Execute Force Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-default shadow-lg px-4 py-2 md:hidden flex justify-around items-center h-[64px] font-sans">
        {[
          { id: 'queue', label: 'Queue', icon: ListFilter },
          { id: 'disputes', label: 'Disputes', icon: Scale },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'policy', label: 'Policy', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 cursor-pointer select-none transition-colors ${
                isActive ? 'text-gold' : 'text-text-muted hover:text-navy'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
