"use client";

import { useState } from 'react';
import { ShieldCheck, FileText, Upload, RefreshCw, AlertCircle, FileCheck, CheckCircle } from 'lucide-react';
import { runOcrSimulation, DocumentDossier, mockDossiers, checkCrossDocumentConsistency } from '@/lib/documentIntel';
import DocumentReadinessPanel from '@/components/DocumentReadinessPanel';
import { useToast } from '@/components/Toast';

export default function DocumentIntelligencePage() {
  const { showToast } = useToast();
  const [selectedDocType, setSelectedDocType] = useState<'gst' | 'iec' | 'invoice' | 'packing_list' | 'coo' | 'bill_of_lading' | 'gots' | 'who_gmp' | 'iso_9001' | 'msme' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeDossier, setActiveDossier] = useState<DocumentDossier | null>(null);

  const startScan = async (type: 'gst' | 'iec' | 'invoice' | 'packing_list' | 'coo' | 'bill_of_lading' | 'gots' | 'who_gmp' | 'iso_9001' | 'msme') => {
    setSelectedDocType(type);
    setProcessing(true);
    setActiveDossier(null);
    
    const dossier = await runOcrSimulation(type);
    // Create a copy so we can apply corrections locally in state
    setActiveDossier(JSON.parse(JSON.stringify(dossier)));
    setProcessing(false);
    showToast(`Scanned and processed ${dossier.name} successfully!`, 'success');
  };

  const handleFixApplied = (exceptionId: string, newValue: string) => {
    if (!activeDossier) return;

    let fieldLabel = "Dossier parameter";
    if (exceptionId === 'exc-inv-1') fieldLabel = "Country of Origin: India";
    if (exceptionId === 'exc-inv-2') fieldLabel = "8-digit HS Code 3004.90.99";
    if (exceptionId === 'exc-coo-1') fieldLabel = "Gujarat Chamber Signature Seal";

    showToast(`Successfully applied compliance fix: ${fieldLabel}!`, 'success');

    setActiveDossier(prev => {
      if (!prev) return null;
      
      // Filter out fixed exception
      const updatedExceptions = prev.exceptions.filter(e => e.id !== exceptionId);
      
      // Update score and assertions based on which fix was applied
      const updatedScores = { ...prev.scores };
      const updatedAssertions = prev.assertions.map(a => ({ ...a }));
      const updatedFields = prev.extractedFields.map(f => ({ ...f }));

      if (exceptionId === 'exc-inv-1') {
        // Country of Origin fixed
        updatedScores.customs = 98;
        updatedScores.inspection = 98;
        const originAssertion = updatedAssertions.find(a => a.name === 'Country of Origin Specified');
        if (originAssertion) {
          originAssertion.passed = true;
          originAssertion.message = 'Country of Origin "India" successfully declared in invoice body.';
        }
        updatedFields.push({ label: 'Country of Origin', value: 'India (Verified)', confidence: 99 });
      }

      if (exceptionId === 'exc-inv-2') {
        // HS Code fixed
        updatedScores.customs = 100;
        const hsField = updatedFields.find(f => f.label === 'Declared HS Code');
        if (hsField) {
          hsField.value = '3004.90.99 (Verified Paracetamol)';
        }
      }

      if (exceptionId === 'exc-coo-1') {
        // Chamber signature fixed
        updatedScores.customs = 95;
        updatedScores.bank = 95;
        updatedScores.inspection = 95;
        const sigAssertion = updatedAssertions.find(a => a.name === 'Chamber Validation Signature');
        if (sigAssertion) {
          sigAssertion.passed = true;
          sigAssertion.message = 'Chamber of Commerce digital signature stamp matches registry.';
        }
        const sigField = updatedFields.find(f => f.label === 'Chamber Signature');
        if (sigField) {
          sigField.value = 'Digitally Signed by Gujarat Chamber of Commerce (GCC-2406)';
        }
      }

      return {
        ...prev,
        extractedFields: updatedFields,
        exceptions: updatedExceptions,
        assertions: updatedAssertions,
        scores: updatedScores
      };
    });
  };

  const getDocStatus = (type: string) => {
    if (activeDossier && activeDossier.type === type) {
      if (activeDossier.exceptions.length === 0) return { dot: 'bg-trust-green', label: 'Verified' };
      const hasCritical = activeDossier.exceptions.some(e => e.severity === 'critical');
      return {
        dot: hasCritical ? 'bg-trust-red' : 'bg-trust-amber',
        label: `${activeDossier.exceptions.length} ${activeDossier.exceptions.length === 1 ? 'Issue' : 'Issues'}`
      };
    }
    // Default mock statuses
    if (type === 'coo') return { dot: 'bg-trust-red', label: 'Action Needed' };
    if (type === 'invoice') return { dot: 'bg-trust-amber', label: '2 Issues' };
    return { dot: 'bg-trust-green', label: 'Verified' };
  };

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary py-10 px-4 relative overflow-hidden">
      {/* Inline styles for laser scanning line and visual effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(220px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.8; }
        }
      `}} />

      {/* Background radial blobs for premium look */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10 font-sans">
        {/* Banner Title */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-navy text-gold px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs">
            <FileCheck size={12} className="animate-pulse" />
            <span>Aartha Compliance Verifier</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#0B1628] via-[#1A2D4A] to-[#A07B1E] bg-clip-text text-transparent">
            AI Trade Document Verification Workspace
          </h1>
          <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed font-medium">
            Scan and verify your trade documents (Invoices, GST Certificates, Certificates of Origin) in real-time. Make sure they are 100% compliant before shipping to prevent customs delays.
          </p>
        </div>

        {/* Simple Demo Sandbox Banner */}
        <div className="bg-navy/5 border border-navy/15 text-navy-light text-[11px] font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 max-w-3xl mx-auto shadow-3xs">
          <span className="flex-shrink-0 text-xs">🔬</span>
          <div className="leading-relaxed">
            <strong>Demo Mode</strong> — Using representative sample files to demonstrate automated document checking.
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Left Column: Sample Dossiers Selector */}
          <div className="bg-white border border-border-default rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="space-y-0.5 border-b border-border-default pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-gold" />
                <span>1. Select Trade Document</span>
              </h3>
              <p className="text-[10px] text-text-muted">Click on a document below to scan it</p>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { type: 'gst', label: 'GST Registration Cert', ext: '.pdf', size: '240 KB', desc: 'Verifies tax registration status in India' },
                { type: 'iec', label: 'Import Export License', ext: '.jpg', size: '1.2 MB', desc: 'DGFT code required for active traders' },
                { type: 'invoice', label: 'Commercial Export Invoice', ext: '.pdf', size: '480 KB', desc: 'Main billing and cargo value details' },
                { type: 'packing_list', label: 'Customs Packing List', ext: '.xlsx', size: '110 KB', desc: 'Itemized net/gross weight declaration' },
                { type: 'coo', label: 'Certificate of Origin (Draft)', ext: '.pdf', size: '320 KB', desc: 'Certifies country where goods were made' },
                { type: 'bill_of_lading', label: 'Carrier Bill of Lading', ext: '.pdf', size: '880 KB', desc: 'Contract with ocean shipping line' },
                { type: 'gots', label: 'GOTS Textile Scope Cert', ext: '.pdf', size: '450 KB', desc: 'Organic certification for fabric cargo' },
                { type: 'who_gmp', label: 'WHO GMP Facility Cert', ext: '.pdf', size: '1.5 MB', desc: 'Good Manufacturing Practices audit proof' },
                { type: 'iso_9001', label: 'ISO 9001 Quality System', ext: '.jpg', size: '920 KB', desc: 'Quality management standard certificate' },
                { type: 'msme', label: 'MSME Udyam Registration', ext: '.pdf', size: '380 KB', desc: 'Udyam micro-enterprise registration' }
              ].map((doc) => {
                const status = getDocStatus(doc.type);
                return (
                  <button
                    key={doc.type}
                    onClick={() => startScan(doc.type as any)}
                    disabled={processing}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                      selectedDocType === doc.type
                        ? 'border-navy/50 bg-gradient-to-r from-cream-secondary/60 to-white font-bold shadow-xs border-l-4 border-l-gold'
                        : 'border-border-default bg-white hover:bg-cream-secondary/15 hover:border-navy/35 border-l-4 border-l-transparent'
                    } disabled:opacity-50`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-text-primary truncate font-sans leading-tight">{doc.label}</div>
                      <div className="text-[9px] text-text-muted/80 leading-normal line-clamp-1 mb-0.5">{doc.desc}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] text-text-muted font-mono">{doc.type.toUpperCase()} · {doc.size}</span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          <span className="text-[8px] text-text-secondary font-medium tracking-wide uppercase">{status.label}</span>
                        </div>
                      </div>
                    </div>
                    <FileText size={15} className={selectedDocType === doc.type ? 'text-gold' : 'text-text-muted/60'} />
                  </button>
                );
              })}
            </div>

            {/* Custom file upload */}
            <label className="block border border-dashed border-border-strong rounded-xl p-4 text-center cursor-pointer hover:bg-cream-secondary/10 hover:border-gold transition-all relative">
              <input
                type="file"
                className="hidden"
                accept="application/pdf,image/png,image/jpeg"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setProcessing(true);
                  setActiveDossier(null);
                  setSelectedDocType(null);

                  const formData = new FormData();
                  formData.append('file', file);

                  try {
                    const res = await fetch('/api/documents/upload', {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.dossier) {
                      setActiveDossier(data.dossier);
                    } else {
                      alert(data.error || 'Failed to upload document');
                    }
                  } catch (err) {
                    alert('Network error uploading document.');
                  } finally {
                    setProcessing(false);
                  }
                }}
              />
              <Upload size={20} className="text-text-muted mx-auto animate-pulse" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-primary mt-2">Upload Custom Dossier</div>
              <p className="text-[9px] text-text-muted leading-relaxed mt-0.5">PDF, JPG, PNG up to 15MB</p>
            </label>
          </div>

          {/* Right Column: Processing & Results Workspace */}
          <div className="bg-white border border-border-default rounded-2xl p-6 shadow-2xs min-h-[500px] flex flex-col justify-center">
            {processing && (
              <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-fade-in-up">
                {/* Holographic Sheet Mockup */}
                <div className="relative w-48 h-64 bg-cream-secondary/30 border-2 border-dashed border-border-strong rounded-xl overflow-hidden shadow-xs flex flex-col justify-between p-4">
                  {/* Glowing Laser Scan Bar */}
                  <div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_10px_rgba(196,150,42,0.6)]" 
                    style={{ animation: 'scan 2.2s infinite ease-in-out' }}
                  />
                  
                  {/* Skeleton Lines */}
                  <div className="space-y-2 mt-2">
                    <div className="h-2.5 bg-navy/15 rounded w-3/4 animate-pulse" />
                    <div className="h-1.5 bg-navy/10 rounded w-1/2 animate-pulse delay-75" />
                    <div className="h-1.5 bg-navy/10 rounded w-5/6 animate-pulse delay-150" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 bg-navy/10 rounded w-2/3 animate-pulse delay-75" />
                    <div className="h-1.5 bg-navy/10 rounded w-3/4 animate-pulse delay-200" />
                  </div>
                  <div className="h-6 bg-navy/5 border border-navy/10 rounded flex items-center justify-center text-[7px] font-bold font-mono tracking-widest text-navy/40 animate-pulse">
                    Reading document...
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-navy">
                    <RefreshCw size={14} className="animate-spin text-gold" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">Scanning in Progress...</h4>
                  </div>
                  <p className="text-[10px] text-text-secondary max-w-xs mx-auto leading-relaxed font-medium">
                    Checking for compliance issues, verifying codes, and matching trade data.
                  </p>
                </div>
              </div>
            )}

            {!processing && !activeDossier && (
              <div className="text-center py-12 px-4 space-y-6 max-w-lg mx-auto animate-fade-in-up">
                <div className="w-16 h-16 bg-gradient-to-tr from-cream to-cream-secondary rounded-full flex items-center justify-center mx-auto border border-border-default shadow-3xs">
                  <FileCheck size={28} className="text-gold" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">Ready to verify your documents?</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">
                    Follow these 3 simple steps to ensure your files are 100% compliant before you ship to international buyers or submit to customs:
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3.5 text-left text-xs">
                  <div className="p-3 bg-cream-secondary/35 border border-border-default/45 rounded-xl flex items-start gap-3">
                    <span className="bg-navy text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                    <div>
                      <strong className="text-text-primary block font-bold mb-0.5">Select a trade document</strong>
                      <span className="text-text-muted text-[10px]">Click any file in the left sidebar (GST, Invoice, License, etc.).</span>
                    </div>
                  </div>
                  <div className="p-3 bg-cream-secondary/35 border border-border-default/45 rounded-xl flex items-start gap-3">
                    <span className="bg-navy text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                    <div>
                      <strong className="text-text-primary block font-bold mb-0.5">AI runs instant audits</strong>
                      <span className="text-text-muted text-[10px]">We match rules, check registry records, and highlight missing seals.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-cream-secondary/35 border border-border-default/45 rounded-xl flex items-start gap-3">
                    <span className="bg-navy text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                    <div>
                      <strong className="text-text-primary block font-bold mb-0.5">Fix errors with 1 click</strong>
                      <span className="text-text-muted text-[10px]">Apply automatic corrections instantly and download the final report.</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-text-muted font-bold animate-pulse">
                  Select a document from the left sidebar to begin ↗
                </p>
              </div>
            )}

            {!processing && activeDossier && (
              <div className="space-y-6">
                {/* Result header */}
                <div className="flex justify-between items-center border-b border-border-default pb-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider bg-cream-secondary/60 border border-border-default px-2 py-0.5 rounded">
                      AI Verified
                    </span>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-text-primary leading-none">
                      File: {activeDossier.name}
                    </h3>
                  </div>
                  <span className="bg-trust-green-bg text-trust-green text-[10px] font-bold px-3 py-1 rounded-full border border-trust-green/20 shadow-3xs flex items-center gap-1 uppercase">
                    <CheckCircle className="w-3.5 h-3.5 fill-current text-white" />
                    <span>Scan Complete</span>
                  </span>
                </div>

                {/* Main panel component */}
                <DocumentReadinessPanel
                  dossier={activeDossier}
                  onFixApplied={handleFixApplied}
                />

                {/* Cross-Document Consistency Section */}
                {(() => {
                  const consistencyResults = checkCrossDocumentConsistency([activeDossier, ...mockDossiers.filter(d => d.type !== activeDossier.type)]);
                  if (consistencyResults.length === 0) return null;
                  return (
                    <div className="bg-cream-secondary/25 border border-border-default rounded-xl p-5 space-y-4 shadow-3xs">
                      <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border-default/40">
                        <ShieldCheck size={14} className="text-gold" />
                        <span>Cross-Document Consistency Audits</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-normal">
                        {consistencyResults.map((rule, idx) => (
                          <div key={idx} className={`p-3 rounded-xl border transition-all duration-300 ${
                            rule.passed 
                              ? 'bg-trust-green-bg/25 border-trust-green/20 text-trust-green' 
                              : 'bg-trust-amber-bg/20 border-trust-amber/20 text-trust-amber'
                          }`}>
                            <div className="font-bold flex items-center gap-1.5">
                              <span className="text-xs">{rule.passed ? '✓' : '⚠'}</span>
                              <span>{rule.ruleName}</span>
                            </div>
                            <p className="text-[10px] text-text-secondary mt-1 font-medium leading-relaxed">{rule.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
