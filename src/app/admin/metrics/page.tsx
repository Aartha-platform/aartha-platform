'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState({
    successfulSourcingValue: '₹0.00',
    successfulSourcingRate: 0,
    totalTracked: 0,
    matchedCount: 0,
    quotedCount: 0,
    sampleCount: 0,
    orderCount: 0,
    closedCount: 0,
    disputeRate: '0.0%',
    avgResponseHours: '2.4 hrs',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setMetrics((prev) => ({
            ...prev,
            totalTracked: data.totalRfqs || 0,
            matchedCount: data.totalRfqs || 0,
          }));
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Operations Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
              North Star & Procurement Funnel Metrics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Tracking Successful Sourcing Value (SSV) and verified transaction throughput.
            </p>
          </div>

          <Link
            href="/admin"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            ← Back to Admin Console
          </Link>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 font-medium">Successful Sourcing Value (SSV)</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.successfulSourcingValue}</p>
            <p className="text-[11px] text-slate-500 mt-1">Completed & verified delivery GMV</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 font-medium">Successful Sourcing Rate (SSR)</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">{metrics.successfulSourcingRate}%</p>
            <p className="text-[11px] text-slate-500 mt-1">RFQ to closed transaction conversion</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 font-medium">Avg Factory Response Time</p>
            <p className="text-2xl font-bold text-amber-400 mt-2">{metrics.avgResponseHours}</p>
            <p className="text-[11px] text-slate-500 mt-1">First quote submission latency</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400 font-medium">Dispute / Defect Rate</p>
            <p className="text-2xl font-bold text-purple-400 mt-2">{metrics.disputeRate}</p>
            <p className="text-[11px] text-slate-500 mt-1">Quality claims per 100 orders</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-base font-semibold text-white mb-6">RFQ-to-Outcome Transaction Funnel</h2>
          <div className="space-y-4">
            {[
              { label: '1. RFQs Submitted & Qualified', count: metrics.totalTracked, color: 'bg-blue-500', pct: '100%' },
              { label: '2. Precision Matches Delivered', count: metrics.matchedCount, color: 'bg-indigo-500', pct: '100%' },
              { label: '3. Supplier Quotations Received', count: metrics.quotedCount, color: 'bg-purple-500', pct: '0%' },
              { label: '4. Physical Samples Approved', count: metrics.sampleCount, color: 'bg-amber-500', pct: '0%' },
              { label: '5. Purchase Orders & Payment Secured', count: metrics.orderCount, color: 'bg-emerald-500', pct: '0%' },
              { label: '6. Delivered & Successfully Closed', count: metrics.closedCount, color: 'bg-emerald-400', pct: '0%' },
            ].map((step) => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{step.label}</span>
                  <span className="text-slate-400 font-mono">{step.count} ({step.pct})</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: step.count > 0 ? step.pct : '2%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
