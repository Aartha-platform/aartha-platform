"use client";

import Link from 'next/link';
import { X, CheckCircle, Star, MapPin, FileText } from 'lucide-react';
import { Supplier, SupplierTab } from '../types';
import QualityScore from './QualityScore';
import TrustBadge from './TrustBadge';
import WhatsAppButton from './WhatsAppButton';

interface SlideOutPanelProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  activeTab: SupplierTab;
  onTabChange: (tab: SupplierTab) => void;
}

const tabs: { key: SupplierTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'products', label: 'Products' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'activity', label: 'Activity' },
];

export default function SlideOutPanel({
  supplier,
  isOpen,
  onClose,
  activeTab,
  onTabChange
}: SlideOutPanelProps) {
  if (!supplier) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[999] backdrop-blur-xs transition-opacity" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cream shadow-2xl z-[1000] transition-transform duration-300 overflow-y-auto flex flex-col font-sans border-l border-border-default ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-navy text-white p-5 space-y-4 flex-shrink-0 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer select-none">
            <X size={20} />
          </button>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {supplier.isVerified && (
                <TrustBadge
                  tier={supplier.verificationTier}
                  verifiedDate={supplier.verifiedDate}
                  expiryDate={supplier.verificationExpiryDate || ''}
                  auditorName={supplier.verificationDetails?.auditorId || 'Aartha Auditor'}
                  gpsCoordinates={supplier.location.gpsCoordinates || '22.0000° N, 72.0000° E'}
                  documentsVerified={supplier.certifications}
                  state={['verified_supplier', 'premium_audited', 'business_verified'].includes(supplier.verificationGateState) ? 'active' : 'suspended'}
                />
              )}
            </div>
            <h3 className="font-bold text-base leading-snug pr-8">{supplier.companyName}</h3>
            <div className="flex items-center gap-1 text-white/70 text-xs">
              <MapPin size={12} className="text-gold" />
              <span>{supplier.location.city}, {supplier.location.state}</span>
              {supplier.location.gidcZone && (
                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10 ml-1">
                  {supplier.location.gidcZone}
                </span>
              )}
            </div>
          </div>

          {/* Verification Quality Score */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <QualityScore
              score={supplier.qualityScore.total}
              breakdown={supplier.qualityScore}
              showTooltip={true}
              showBar={true}
              state={supplier.reviewCount >= 3 ? 'sufficient' : 'insufficient'}
            />
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-border-default bg-white overflow-x-auto flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 min-w-[70px] text-center py-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer select-none ${
                activeTab === tab.key
                  ? 'border-navy text-navy font-bold bg-cream/10'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-cream">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">About Company</h4>
                <p className="text-text-secondary text-xs leading-relaxed">{supplier.about}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-border-default rounded-xl p-3 space-y-0.5">
                  <div className="text-text-muted text-[10px] uppercase font-semibold">Employees</div>
                  <div className="font-bold text-xs text-text-primary">{supplier.employees}</div>
                </div>
                <div className="bg-white border border-border-default rounded-xl p-3 space-y-0.5">
                  <div className="text-text-muted text-[10px] uppercase font-semibold">Est. Year</div>
                  <div className="font-bold text-xs text-text-primary">{supplier.yearEstablished}</div>
                </div>
                <div className="bg-white border border-border-default rounded-xl p-3 space-y-0.5">
                  <div className="text-text-muted text-[10px] uppercase font-semibold">Annual Turnover</div>
                  <div className="font-bold text-xs text-text-primary">{supplier.annualTurnover}</div>
                </div>
                <div className="bg-white border border-border-default rounded-xl p-3 space-y-0.5">
                  <div className="text-text-muted text-[10px] uppercase font-semibold">Min Order Qty (MOQ)</div>
                  <div className="font-bold text-xs text-text-primary">{supplier.moq}</div>
                </div>
              </div>

              <div className="space-y-2 border-t border-border-default/50 pt-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Audit Metadata</h4>
                <div className="bg-white border border-border-default rounded-xl p-3 text-xs space-y-2 font-mono text-text-secondary">
                  <div className="flex justify-between">
                    <span>Audit Grade:</span>
                    <span className="font-bold text-trust-green">
                      {supplier.auditRecords?.[0]?.grade || 'A'} (PASSED)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Date:</span>
                    <span>{supplier.verifiedDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span>{supplier.location.gpsCoordinates || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GSTIN:</span>
                    <span>{supplier.verificationDetails?.gstin || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IEC Code:</span>
                    <span>{supplier.verificationDetails?.iec || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Featured Products</h4>
              <div className="space-y-2.5">
                {supplier.products.map((p, idx) => (
                  <div key={idx} className="bg-white border border-border-default rounded-xl p-3 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-text-primary line-clamp-1">{p}</div>
                      <span className="text-[10px] text-text-muted">Spec Sheet Verified</span>
                    </div>
                    <span className="bg-cream border border-border-default text-navy text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0">
                      View
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Verified Credentials</h4>
              <div className="space-y-2">
                {supplier.certifications.map((cert) => (
                  <div key={cert} className="flex items-center justify-between p-3 bg-white border border-border-default rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-trust-green" />
                      <span className="text-xs font-semibold text-text-primary">{cert}</span>
                    </div>
                    <span className="text-[10px] font-bold text-trust-green uppercase tracking-wider">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Verified Buyer Reviews</h4>
              {supplier.reviewCount >= 3 ? (
                <div className="space-y-3">
                  {supplier.reviews.map((rev) => (
                    <div key={rev.id} className="bg-white border border-border-default rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < rev.rating ? 'text-gold fill-gold' : 'text-border-strong'} />
                          ))}
                        </div>
                        <span className="text-[9px] text-text-muted font-mono">{rev.date}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">"{rev.comment}"</p>
                      <div className="text-[10px] text-text-muted font-bold flex items-center justify-between">
                        <span>{rev.buyerName}</span>
                        <span>{rev.buyerCountry}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-border-default rounded-xl p-8 text-center text-text-muted text-xs">
                  Insufficient review data. Minimal 3 reviews required.
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">Audit & Verification Timeline</h4>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-default">
                {[
                  { title: 'Profile Published', desc: 'On-boarding verified profile made visible to public buyers.', date: supplier.verifiedDate || 'Recent' },
                  { title: 'Physical Visit Logged', desc: 'Aartha Auditor visited factory site and GPS verified operations.', date: supplier.verifiedDate || 'Recent' },
                  { title: 'Credential Checks', desc: 'Dossier check for GSTIN and regulatory filings completed.', date: '3 days prior to visit' }
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 relative pl-8">
                    <div className="absolute left-[9px] top-[5px] w-2 h-2 rounded-full bg-gold border border-white" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-text-primary">{act.title}</div>
                      <div className="text-[10px] text-text-muted">{act.date}</div>
                      <div className="text-[11px] text-text-secondary leading-relaxed">{act.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Actions Footer */}
        <div className="p-4 border-t border-border-default bg-white space-y-2 flex-shrink-0">
          <WhatsAppButton
            phoneNumber="+91 72084 32138"
            message={`Hi! I am interested in sourcing from ${supplier.companyName}. Can you share your product catalog?`}
            className="w-full"
          />
          <Link
            href="/rfq"
            className="w-full flex items-center justify-center gap-1.5 bg-navy hover:bg-navy-light text-white py-2.5 rounded-lg text-xs font-bold transition-all text-center no-underline"
          >
            <FileText size={14} /> Submit Sourcing RFQ
          </Link>
          <Link
            href="/ai-assistant"
            className="w-full flex items-center justify-center gap-1.5 bg-cream border border-border-strong text-navy py-2.5 rounded-lg text-xs font-bold transition-all text-center no-underline select-none"
          >
            Ask AI Sourcing Assistant
          </Link>
        </div>
      </div>
    </>
  );
}
