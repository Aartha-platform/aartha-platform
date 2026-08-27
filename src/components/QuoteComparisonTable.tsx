"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RFQQuote } from '../types';
import { ShieldCheck, MessageSquare, Star, ArrowUpRight, Lock } from 'lucide-react';
import { analyzePriceAgainstMarket } from '../lib/marketIntel';
import { getWorkspaceUpgrade } from '../lib/workspaceUpgrade';

interface QuoteComparisonTableProps {
  quotes: RFQQuote[];
  onQuoteView?: (quote: RFQQuote) => void;
  onChatClick?: (supplierName: string) => void;
}

export default function QuoteComparisonTable({
  quotes,
  onQuoteView,
  onChatClick
}: QuoteComparisonTableProps) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsPro(getWorkspaceUpgrade().isPro);
  }, []);

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-8 bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl">
        <p className="text-xs text-text-secondary dark:text-slate-300 font-semibold">No quotes available for comparison.</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden bg-white/90 dark:bg-[var(--surface)]/90 backdrop-blur-md shadow-2xs font-sans">
      {/* Responsive Horizontal Scroll Banner Indicator */}
      <div className="bg-cream-secondary/60 dark:bg-slate-800/60 px-4 py-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between text-[10px] text-text-muted dark:text-slate-400">
        <span className="font-extrabold text-navy dark:text-white uppercase tracking-wider">Comparing {quotes.length} Verified Supplier Offers Matrix</span>
        <span className="hidden sm:inline-block font-bold text-gold">↔ Scroll horizontally to analyze technical specs</span>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border-strong">
        <table className="w-full min-w-[840px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-cream-secondary/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-white/10">
              <th className="p-3.5 text-[10px] text-text-muted dark:text-slate-400 font-black uppercase tracking-wider sticky left-0 bg-cream-secondary dark:bg-[var(--surface)] z-10 min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                Supplier / GIDC Zone
              </th>
              <th className="p-3 text-[10px] text-text-muted font-bold uppercase tracking-wider text-center">
                Trust Score
              </th>
              <th className="p-3 text-[10px] text-text-muted font-bold uppercase tracking-wider text-right">
                Unit Price
              </th>
              <th className="p-3 text-[10px] text-text-muted font-bold uppercase tracking-wider text-center">
                MOQ
              </th>
              <th className="p-3 text-[10px] text-text-muted font-bold uppercase tracking-wider text-center">
                Lead Time
              </th>
              <th className="p-3 text-[10px] text-text-muted font-bold uppercase tracking-wider text-center">
                Response
              </th>
              <th className="p-3 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Certifications
              </th>
              <th className="p-3 text-[10px] text-text-muted font-bold uppercase tracking-wider text-center min-w-[110px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/50">
            {quotes.map((quote, idx) => {
              const supplierInitials = quote.supplier.companyName
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();

              const isLocked = !isPro && idx >= 2;

              return (
                <tr
                  key={quote.id}
                  className={`transition-colors hover:bg-cream-secondary/20 ${
                    quote.isBestPrice ? 'bg-gold/5 border-l-4 border-gold' : ''
                  }`}
                >
                  {/* Supplier Sticky Column */}
                  <td className="p-3 sticky left-0 bg-white z-10 min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-navy text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {supplierInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-text-primary truncate block max-w-[120px]">
                            {quote.supplier.companyName}
                          </span>
                          {quote.supplier.isVerified && (
                            <ShieldCheck size={12} className="text-trust-green flex-shrink-0" />
                          )}
                          {quote.isBestPrice && (
                            <span className="bg-gold/10 text-gold text-[10px] px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-0.5 border border-gold/20 shadow-2xs select-none">
                              ★ Best
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5 truncate">
                          {quote.supplier.location.city}, {quote.supplier.location.gidcZone || 'Gujarat'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Trust Score */}
                  <td className={`p-3 text-center transition-all ${isLocked ? 'blur-[3px] select-none pointer-events-none opacity-20' : ''}`}>
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-navy text-xs leading-none">
                        {quote.trustScore}/100
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={8}
                            className={
                              i < Math.round(quote.trustScore / 20)
                                ? 'text-gold fill-gold'
                                : 'text-text-muted/30'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Quote Price */}
                  <td className={`p-3 text-right transition-all ${isLocked ? 'blur-[3px] select-none pointer-events-none opacity-20' : ''}`}>
                    <div className="font-bold text-text-primary text-sm leading-none">
                      {quote.quotePriceDisplay}
                    </div>
                    {(() => {
                      const analysis = analyzePriceAgainstMarket(quote.supplier.companyName, quote.quotePrice);
                      if (!analysis) return null;
                      return (
                        <div className="mt-1">
                          <span className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                            analysis.comparedToAverage === 'low'
                              ? 'bg-trust-green-bg text-trust-green border-trust-green/20'
                              : analysis.comparedToAverage === 'high'
                              ? 'bg-trust-red-bg text-trust-red border-trust-red/20'
                              : 'bg-trust-blue-bg text-trust-blue border-trust-blue/20'
                          }`}>
                            {analysis.comparedToAverage === 'low' ? 'Under Avg' : analysis.comparedToAverage === 'high' ? 'Above Avg' : 'In-Band'}
                          </span>
                        </div>
                      );
                    })()}
                    {quote.isBestPrice && (
                      <span className="inline-block bg-trust-green text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase mt-1 leading-none">
                        Best Value
                      </span>
                    )}
                  </td>

                  {/* MOQ */}
                  <td className={`p-3 text-center text-text-secondary font-semibold transition-all ${isLocked ? 'blur-[3px] select-none pointer-events-none opacity-20' : ''}`}>
                    {quote.moq}
                  </td>

                  {/* Lead Time */}
                  <td className={`p-3 text-center text-text-secondary font-semibold transition-all ${isLocked ? 'blur-[3px] select-none pointer-events-none opacity-20' : ''}`}>
                    {quote.leadTime}
                  </td>

                  {/* Response Speed */}
                  <td className={`p-3 text-center transition-all ${isLocked ? 'blur-[3px] select-none pointer-events-none opacity-20' : ''}`}>
                    <span className="font-bold text-trust-green bg-trust-green-bg px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                      {quote.responseTime}
                    </span>
                  </td>

                  {/* Certifications */}
                  <td className={`p-3 transition-all ${isLocked ? 'blur-[3px] select-none pointer-events-none opacity-20' : ''}`}>
                    <div className="flex flex-wrap gap-1">
                      {quote.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="bg-cream border border-border-default/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-text-secondary uppercase"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-3 text-center">
                    {isLocked ? (
                      <div className="flex justify-center">
                        <Link
                          href="/dashboard?upgrade=true"
                          className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg uppercase shadow-2xs select-none"
                        >
                          <Lock size={10} />
                          <span>Unlock Pro</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={async () => {
                            try {
                              const numericPrice = quote.quotePrice || 5000;
                              const { getCsrfToken } = require('@/lib/csrfClient');
                              const res = await fetch('/api/trade-assurance/create-order', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'X-CSRF-Token': getCsrfToken(),
                                },
                                body: JSON.stringify({
                                  buyerEmail: 'procurement@company.com',
                                  buyerName: 'Enterprise Buyer',
                                  buyerCompany: 'Corporate Sourcing Group',
                                  supplierId: quote.supplier.id || 's1',
                                  items: [
                                    {
                                      productName: quote.supplier.companyName + ' Component Order',
                                      specification: 'As per quote specifications',
                                      quantity: 100,
                                      unitPrice: numericPrice,
                                    },
                                  ],
                                  quoteId: quote.id,
                                }),
                              });
                              const data = await res.json();
                              if (res.ok && data.order?.id) {
                                window.location.href = `/checkout/${data.order.id}`;
                              } else {
                                alert(data.error || 'Failed to initialize purchase order.');
                              }
                            } catch {
                              alert('Network error initiating order.');
                            }
                          }}
                          className="btn-amber px-2.5 py-1.5 rounded-lg font-extrabold text-[10px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                          title="Secure with Aartha Protect"
                        >
                          <ShieldCheck size={11} />
                          <span>Secure PO</span>
                        </button>

                        <button
                          onClick={() => onChatClick?.(quote.supplier.companyName)}
                          className="bg-navy hover:bg-navy-light text-white p-2 rounded-lg transition-colors cursor-pointer"
                          title="Chat with Supplier"
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button
                          onClick={() => onQuoteView?.(quote)}
                          className="bg-cream border border-border-strong text-navy px-2.5 py-1.5 rounded-lg font-bold text-[10px] hover:bg-cream-secondary transition-colors cursor-pointer flex items-center gap-1"
                        >
                          Details
                          <ArrowUpRight size={10} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer Banner */}
      <div className="p-3 bg-cream-secondary border-t border-border-default/50 text-[10px] text-text-muted flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-trust-green" />
          <span>All supplier quotes are background audited and verified by Aartha.</span>
        </div>
        <div className="flex gap-4">
          <span className="font-semibold text-text-secondary">✓ Geotracked Corridor Logs</span>
          <span className="font-semibold text-text-secondary">✓ Secure Legal Framework</span>
        </div>
      </div>
    </div>
  );
}
