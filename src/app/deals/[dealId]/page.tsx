'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Deal, DealEvent, DealStatus } from '@/types/deal';
import { useSession } from '@/hooks/useSession';
import Link from 'next/link';

const STAGES: { key: DealStatus; label: string; desc: string }[] = [
  { key: 'qualification', label: '1. Qualified', desc: 'Requirement confirmed' },
  { key: 'matching', label: '2. Matched', desc: 'Top factory identified' },
  { key: 'supplier_contacted', label: '3. Contacted', desc: 'RFQ routed to factory' },
  { key: 'sample', label: '4. Sample Stage', desc: 'Material testing & QC' },
  { key: 'negotiation', label: '5. Terms Locked', desc: 'PO & pricing agreed' },
  { key: 'ordered', label: '6. Payment Secured', desc: 'Payment secured' },
  { key: 'production', label: '7. In Production', desc: 'Factory machining' },
  { key: 'inspection', label: '8. Inspection', desc: 'On-site pre-shipment check' },
  { key: 'shipping', label: '9. In Transit', desc: 'Customs & bill of lading' },
  { key: 'delivered', label: '10. Delivered', desc: '7-day inspection window' },
  { key: 'closed', label: '11. Completed', desc: 'Funds settled & outcome logged' },
];

export default function DealRoomPage() {
  const params = useParams();
  const dealId = params?.dealId as string;
  const { user, loading: sessionLoading } = useSession();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [events, setEvents] = useState<DealEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (!dealId) return;

    async function loadDealData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/deals/${dealId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Deal Room not found');
          if (res.status === 403) throw new Error('Unauthorized access to this Deal Room');
          throw new Error('Failed to load Deal Room data');
        }
        const data = await res.json();
        setDeal(data.deal);

        const eventsRes = await fetch(`/api/deals/${dealId}/events`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events || []);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading deal');
      } finally {
        setLoading(false);
      }
    }

    loadDealData();
  }, [dealId]);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmittingNote(true);
      const res = await fetch(`/api/deals/${dealId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'COMMUNICATION_LOG',
          message: newNote,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvents((prev) => [data.event, ...prev]);
        setNewNote('');
      }
    } catch (err) {
      console.error('Failed to append event:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAdvanceStage = async (nextStage: DealStatus) => {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStage,
          message: `Stage advanced to ${nextStage.replace(/_/g, ' ').toUpperCase()}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDeal(data.deal);
        // Refresh events
        const eventsRes = await fetch(`/api/deals/${dealId}/events`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events || []);
        }
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    }
  };

  const currentStageIndex = STAGES.findIndex((s) => s.key === deal?.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Deal Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Aartha Protected Deal Room
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {dealId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {deal ? deal.requirementsSnapshot.productName : 'Procurement Deal Room'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Buyer: <span className="text-slate-200 font-medium">{deal?.buyerCompanyName || 'Buyer Org'}</span> · 
              Factory: <span className="text-emerald-400 font-medium">{deal?.supplierCompanyName || 'Gujarat Factory'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            {deal?.status === 'qualification' && (
              <button
                onClick={() => handleAdvanceStage('sample')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-950"
              >
                Request Material Sample →
              </button>
            )}
            {deal?.status === 'sample' && (
              <button
                onClick={() => handleAdvanceStage('ordered')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-950"
              >
                Approve Sample & Create PO →
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400">Securing and loading Deal Room environment...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-xl bg-rose-950/20 border border-rose-800/40 text-center">
            <h3 className="text-lg font-semibold text-rose-400 mb-2">Deal Room Access Error</h3>
            <p className="text-sm text-slate-300 mb-4">{error}</p>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-slate-200">
              Return to Buyer Workspace
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Transaction Stage Progression */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">
                Procurement & Delivery Milestones
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {STAGES.slice(0, 6).map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div
                      key={stage.key}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-950/50'
                          : isCompleted
                          ? 'bg-slate-800/40 border-slate-700/60'
                          : 'bg-slate-950/30 border-slate-800/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCurrent
                              ? 'bg-emerald-400 animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-xs font-semibold text-white">{stage.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{stage.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Core 3-Column Workspace: Requirement | Factory Evidence | Timeline Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Frozen Requirements Snapshot */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-semibold text-white">Requirement Snapshot</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Locked
                  </span>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div>
                    <label className="text-xs text-slate-400">Product / Part</label>
                    <p className="font-medium text-slate-200">{deal?.requirementsSnapshot.productName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Manufacturing Category</label>
                    <p className="font-medium text-slate-200">{deal?.requirementsSnapshot.category}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Order Quantity</label>
                    <p className="font-medium text-slate-200">{deal?.requirementsSnapshot.quantity}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Destination Port</label>
                    <p className="font-medium text-slate-200">{deal?.requirementsSnapshot.destination}</p>
                  </div>
                  {deal?.requirementsSnapshot.specification && (
                    <div>
                      <label className="text-xs text-slate-400">Technical Specifications</label>
                      <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-1 font-mono">
                        {deal.requirementsSnapshot.specification}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Column: Frozen Factory Evidence Snapshot */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-semibold text-white">Factory Evidence Dossier</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400">Trust Quality Index</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {deal?.evidenceSnapshot.supplierQualityScore}/100
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">
                      Tier: {deal?.evidenceSnapshot.verificationTier}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">GSTIN Government Registry</span>
                      <span className="text-emerald-400 font-medium">✓ Active & Confirmed</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Physical Plant Audit</span>
                      <span className="text-emerald-400 font-medium">
                        ✓ Grade {deal?.evidenceSnapshot.auditGrade || 'A'} Passed
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Commercial Terms</span>
                      <span className="text-slate-300">MOQ {deal?.commercialSnapshot.moq || 'Standard'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Verified Credentials on File</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {deal?.evidenceSnapshot.certificationsVerified.map((cert) => (
                        <span
                          key={cert}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Immutable Event Ledger & Communication */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-semibold text-white">Immutable Event Ledger</h3>
                  <span className="text-xs text-slate-400 font-mono">{events.length} Events</span>
                </div>

                {/* Event timeline log */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-emerald-400">{ev.eventType}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300">{ev.message || 'Milestone event recorded.'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Actor: {ev.actor}</p>
                    </div>
                  ))}
                </div>

                {/* Add note/message input */}
                <form onSubmit={handlePostNote} className="mt-auto pt-3 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add event log or message..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={submittingNote || !newNote.trim()}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
