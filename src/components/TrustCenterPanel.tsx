"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, MapPin, CheckCircle, ExternalLink, Calendar, Users, FileText, AlertTriangle, X } from 'lucide-react';
import { lookupTrustRegistry, TrustRegistryRecord } from '@/lib/trustCenter';

export default function TrustCenterPanel() {
  const [query, setQuery] = useState('');
  const [record, setRecord] = useState<TrustRegistryRecord | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = lookupTrustRegistry(query);
    setRecord(res);
    setSearched(true);
  };

  return (
    <div className="space-y-6 font-sans text-text-primary max-w-3xl mx-auto">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="bg-white border border-border-default rounded-xl p-5 shadow-2xs space-y-3">
        <div className="space-y-1 text-center">
          <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary">Dossier Credential Directory Search</h3>
          <p className="text-[10px] text-text-secondary">Input a supplier name, GSTIN, IEC, or Audit ID to fetch dynamic verification logs.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 24AAAAC1234A1Z1 or AUDIT-AHD-01"
              className="w-full bg-white border border-border-strong rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-navy"
            />
            <Search className="absolute left-3 top-2.5 text-text-muted/60" size={14} />
          </div>
          <button
            type="submit"
            className="bg-navy hover:bg-navy-light text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer select-none"
          >
            Validate
          </button>
        </div>
        
        {/* Helper Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] text-text-muted">
          <span>Quick Lookup Examples:</span>
          {['24AAAAC1234A1Z1', '24SURAT7890A2Z2', '24BHAVN1234A1Z8'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setQuery(ex); const res = lookupTrustRegistry(ex); setRecord(res); setSearched(true); }}
              className="bg-cream hover:bg-cream-secondary text-text-secondary font-mono px-2 py-0.5 rounded border border-border-default transition-colors cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {/* Results Display */}
      {searched && (
        <div className="bg-white border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
          {!record ? (
            <div className="text-center py-10 space-y-2">
              <div className="text-trust-red font-bold text-xs uppercase tracking-wider">Unverified Credentials Tagged</div>
              <p className="text-[10px] text-text-secondary leading-relaxed max-w-sm mx-auto">
                No active records found in our audited registry for query "{query}". Please check your spellings or verify this is not an unregistered broker.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-gold font-mono uppercase font-bold tracking-wider">{record.auditDetails.id}</span>
                  <h3 className="text-base font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                    {record.companyName}
                    {record.isVerified ? (
                      <ShieldCheck size={16} className="text-trust-green" />
                    ) : (
                      <AlertTriangle size={16} className="text-trust-red" />
                    )}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary font-medium">
                    <MapPin size={12} className="text-gold" />
                    <span>{record.city}, {record.gidcZone}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  {record.isVerified ? (
                    <span className="bg-trust-green-bg text-trust-green text-[10px] font-bold px-3 py-1 rounded-full border border-trust-green/20 uppercase">
                      Verification Tier: {record.verificationTier}
                    </span>
                  ) : (
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
                      record.lifecycleState === 'expired' 
                        ? 'bg-trust-amber-bg text-trust-amber border-trust-amber/20' 
                        : 'bg-trust-red-bg text-trust-red border-trust-red/20'
                    }`}>
                      Badge {record.lifecycleState}
                    </span>
                  )}
                  <div className="text-[10px] text-text-muted mt-1.5 font-medium">
                    {record.isVerified ? `Verified Since: ${record.verifiedDate}` : `Status Check Date: ${new Date().toISOString().split('T')[0]}`}
                  </div>
                </div>
              </div>

              {/* Registry Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-cream-secondary/40 border border-border-default p-3 rounded-lg space-y-1">
                  <span className="text-[9px] text-text-muted font-bold uppercase font-sans">Ministry GSTIN Record</span>
                  <div className="font-bold text-navy leading-normal">{record.gstin}</div>
                </div>
                <div className="bg-cream-secondary/40 border border-border-default p-3 rounded-lg space-y-1">
                  <span className="text-[9px] text-text-muted font-bold uppercase font-sans">DGFT Import Export Code (IEC)</span>
                  <div className="font-bold text-navy leading-normal">{record.iec}</div>
                </div>
              </div>

              {/* Physical Audit Report */}
              <div className="space-y-3 pt-2 border-t border-border-default/50">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">
                  Site Audit Report & Coordinates
                </h4>
                <div className="bg-cream-secondary/25 border border-border-default rounded-xl p-4 space-y-3 text-xs leading-relaxed">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[10px] text-text-secondary border-b border-border-default/30 pb-2">
                    <div>
                      <span className="text-[9px] text-text-muted font-sans font-bold uppercase">Auditor Representative</span>
                      <div className="font-semibold text-text-primary mt-0.5">{record.auditorName}</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-sans font-bold uppercase">Verified Coordinates</span>
                      <div className="font-semibold text-text-primary mt-0.5">{record.gpsCoordinates}</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-sans font-bold uppercase">Audit Result</span>
                      {record.isVerified ? (
                        <div className="text-trust-green font-bold mt-0.5">GRADE {record.auditDetails.grade} · PASSED</div>
                      ) : (
                        <div className="text-trust-red font-bold mt-0.5">BADGE {record.lifecycleState.toUpperCase()}</div>
                      )}
                    </div>
                  </div>

                  <p className="text-text-secondary italic">
                    "{record.auditDetails.findings}"
                  </p>

                  <div className="pt-2 border-t border-border-default/30">
                    <span className="text-[9px] text-text-muted font-bold uppercase block mb-1.5">Documents Audited & Checked:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {record.documentsVerified.map((doc) => (
                        <span key={doc} className="bg-white border border-border-default text-text-secondary text-[10px] px-2 py-0.5 rounded font-sans font-bold flex items-center gap-1 shadow-2xs">
                          {record.isVerified ? (
                            <CheckCircle size={10} className="text-trust-green" />
                          ) : (
                            <X size={10} className="text-trust-red" />
                          )}
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA link to profile */}
              <div className="flex justify-end pt-2">
                <Link
                  href={`/suppliers/${record.slug}`}
                  className="bg-gold hover:bg-gold-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors select-none no-underline flex items-center gap-1"
                >
                  <span>View Verified Profile</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
