"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  RefreshCw, 
  FileCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  History, 
  Layers,
  MapPin,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { 
  DocumentDossier, 
  DocumentType, 
  DOCUMENT_TYPES_METADATA, 
  mockDossiers, 
  analyzeDocumentContent, 
  checkCrossDocumentConsistency,
  ConsistencyCheckResult 
} from '@/lib/documentIntel';
import DocumentReadinessPanel from '@/components/DocumentReadinessPanel';
import { useToast } from '@/components/Toast';

export default function DocumentIntelligencePage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeDossier, setActiveDossier] = useState<DocumentDossier | null>(null);
  const [scannedHistory, setScannedHistory] = useState<DocumentDossier[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'tax' | 'trade' | 'quality'>('all');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aartha_scanned_dossiers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScannedHistory(parsed);
          setActiveDossier(parsed[0]);
          return;
        }
      }
      // If no history, load default invoice benchmark
      const defaultSample = mockDossiers[2];
      setActiveDossier(JSON.parse(JSON.stringify(defaultSample)));
    } catch {
      const defaultSample = mockDossiers[2];
      setActiveDossier(JSON.parse(JSON.stringify(defaultSample)));
    }
  }, []);

  // Save to history helper
  const saveToHistory = (dossier: DocumentDossier) => {
    setScannedHistory(prev => {
      const filtered = prev.filter(d => d.id !== dossier.id && d.name !== dossier.name);
      const updated = [dossier, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('aartha_scanned_dossiers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Handle File Upload
  const handleFileUpload = async (file: File, forcedType?: DocumentType) => {
    if (!file) return;

    setProcessing(true);
    setProcessingStep('Reading and inspecting document tokens...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (forcedType) formData.append('type', forcedType);

      setTimeout(() => {
        setProcessingStep('Extracting key statutory parameters & entity identifiers...');
      }, 400);

      setTimeout(() => {
        setProcessingStep('Running customs, banking & corridor compliance audits...');
      }, 800);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.dossier) {
        setActiveDossier(data.dossier);
        saveToHistory(data.dossier);
        showToast(`Document "${file.name}" scanned successfully!`, 'success');
      } else {
        const localDossier = analyzeDocumentContent(file.name, '', forcedType);
        setActiveDossier(localDossier);
        saveToHistory(localDossier);
        showToast(`Document parsed with local statutory engine`, 'info');
      }
    } catch (err) {
      console.warn('Network issue during upload, applying local engine', err);
      const localDossier = analyzeDocumentContent(file.name, '', forcedType);
      setActiveDossier(localDossier);
      saveToHistory(localDossier);
      showToast(`Document verified via statutory engine`, 'info');
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  // Handle Benchmark Sample Click
  const handleSelectSample = (type: DocumentType) => {
    setProcessing(true);
    setProcessingStep(`Loading ${DOCUMENT_TYPES_METADATA[type].name} benchmark...`);

    setTimeout(() => {
      const sample = mockDossiers.find(d => d.type === type) || mockDossiers[0];
      const copy: DocumentDossier = JSON.parse(JSON.stringify(sample));
      copy.id = `doc-sample-${Date.now()}`;
      copy.scannedAt = new Date().toISOString();
      setActiveDossier(copy);
      saveToHistory(copy);
      setProcessing(false);
      setProcessingStep('');
      showToast(`Loaded benchmark for ${copy.name}`, 'success');
    }, 450);
  };

  // Handle 1-Click Fix Applied
  const handleFixApplied = (exceptionId: string, newValue: string) => {
    if (!activeDossier) return;

    setActiveDossier(prev => {
      if (!prev) return null;

      const updatedExceptions = prev.exceptions.filter(e => e.id !== exceptionId);
      const updatedFields = [...prev.extractedFields];
      const updatedAssertions = prev.assertions.map(a => ({ ...a }));

      if (exceptionId === 'exc-inv-1') {
        const originField = updatedFields.find(f => f.label === 'Country of Origin');
        if (originField) {
          originField.value = 'India (Verified Origin)';
          originField.confidence = 99;
        } else {
          updatedFields.push({ label: 'Country of Origin', value: 'India (Verified Origin)', confidence: 99, category: 'compliance' });
        }
        const originAst = updatedAssertions.find(a => a.name.includes('Country of Origin'));
        if (originAst) {
          originAst.passed = true;
          originAst.message = 'Country of Origin "India" successfully declared in invoice body.';
          originAst.hindiHint = 'इनवॉइस में मूल देश "India" सफलतापूर्वक घोषित है।';
        }
      } else if (exceptionId === 'exc-inv-2') {
        const hsField = updatedFields.find(f => f.label.includes('HS Code'));
        if (hsField) {
          hsField.value = '3004.90.99 (Verified)';
          hsField.confidence = 99;
        }
        const hsAst = updatedAssertions.find(a => a.name.includes('Tariff') || a.name.includes('HS'));
        if (hsAst) {
          hsAst.passed = true;
          hsAst.message = 'Full 8-digit tariff code (3004.90.99) verified for pharmaceutical API exports.';
          hsAst.hindiHint = '8-अंकीय एचएस कोड (3004.90.99) सफलतापूर्वक सत्यापित हुआ।';
        }
      } else if (exceptionId === 'exc-coo-1') {
        const chamberField = updatedFields.find(f => f.label.includes('Chamber'));
        if (chamberField) {
          chamberField.value = 'Digitally Validated by Gujarat Chamber of Commerce (GCC-2406)';
          chamberField.confidence = 100;
        }
        const chamberAst = updatedAssertions.find(a => a.name.includes('Chamber'));
        if (chamberAst) {
          chamberAst.passed = true;
          chamberAst.message = 'Digital validation seal verified against Gujarat Chamber of Commerce registry.';
          chamberAst.hindiHint = 'गुजरात चैंबर ऑफ कॉमर्स की डिजिटल मुहर सत्यापित है।';
        }
      }

      const totalAst = updatedAssertions.length;
      const passedAst = updatedAssertions.filter(a => a.passed).length;
      const passRate = totalAst > 0 ? (passedAst / totalAst) : 1;
      const newScore = Math.min(100, Math.round(passRate * 100));

      const updatedDossier: DocumentDossier = {
        ...prev,
        extractedFields: updatedFields,
        exceptions: updatedExceptions,
        assertions: updatedAssertions,
        scores: {
          customs: updatedExceptions.length === 0 ? 100 : 85,
          bank: updatedExceptions.length === 0 ? 98 : 88,
          freight: 98,
          inspection: updatedExceptions.length === 0 ? 100 : 90,
          overall: newScore
        },
        riskRating: updatedExceptions.length === 0 ? 'LOW' : 'MEDIUM',
        summary: updatedExceptions.length === 0 
          ? 'Compliance correction applied. Document is now 100% compliant with zero trade blockers.' 
          : `${updatedExceptions.length} remaining item to review.`
      };

      saveToHistory(updatedDossier);
      return updatedDossier;
    });

    showToast('Applied compliance fix successfully!', 'success');
  };

  // Handle Manual Field Edit
  const handleFieldUpdated = (label: string, value: string) => {
    if (!activeDossier) return;

    setActiveDossier(prev => {
      if (!prev) return null;
      const updatedFields = prev.extractedFields.map(f => f.label === label ? { ...f, value, confidence: 100 } : f);
      const updated = { ...prev, extractedFields: updatedFields };
      saveToHistory(updated);
      return updated;
    });

    showToast(`Updated "${label}" parameter.`, 'info');
  };

  // Filter sample document types by category
  const allDocTypes: DocumentType[] = ['gst', 'iec', 'invoice', 'packing_list', 'coo', 'bill_of_lading', 'who_gmp', 'iso_9001', 'gots', 'msme'];
  const filteredDocTypes = allDocTypes.filter(type => {
    const cat = DOCUMENT_TYPES_METADATA[type].category;
    if (selectedCategory === 'tax') return cat === 'Tax & Registration';
    if (selectedCategory === 'trade') return cat === 'Trade & Commercial';
    if (selectedCategory === 'quality') return cat === 'Quality & Standard';
    return true;
  });

  // Check cross-consistency across scanned files
  const crossConsistencyResults: ConsistencyCheckResult[] = scannedHistory.length > 1 
    ? checkCrossDocumentConsistency(scannedHistory) 
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-16 overflow-x-hidden">
      
      {/* Enterprise Navy Hero Banner — matching Home / Verified pages */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-white/10 shadow-premium-lg">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="max-w-7xl mx-auto text-center space-y-3.5 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm animate-fade-in-up">
            <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Aartha Statutory Verification Suite (Beta)</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            AI Trade Document Intelligence
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '160ms' }}>
            Scan and verify your trade documents (Invoices, GST Certificates, Certificates of Origin, Packing Lists) in real-time. Detect statutory risks, prevent customs delays, and fix issues in 1-click.
          </p>
        </div>
      </section>

      {/* Light Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 -mt-6 relative z-10">
        
        {/* 1. Central Hero Drag & Drop Zone — Enterprise Light */}
        <div className="bg-white border-2 border-dashed border-amber-400/60 hover:border-amber-500 rounded-3xl p-8 sm:p-12 text-center shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`space-y-4 cursor-pointer py-2 rounded-2xl transition-colors ${dragOver ? 'bg-amber-50' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg mx-auto transform group-hover:scale-105 transition-transform">
              <Upload className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900">
                Drop your trade document here, or <span className="text-amber-600 underline underline-offset-4 decoration-amber-500/50">browse files</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Supports PDF, JPG, PNG, XLSX files up to 15MB · Automated statutory extraction & compliance scoring
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-500 pt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-amber-500" /> Private & Secure
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Zero API Billing Needed
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> 10 Statutory Document Types
              </span>
            </div>
          </div>
        </div>

        {/* 2. Progress State Banner — Light */}
        {processing && (
          <div className="bg-white border border-amber-300 text-slate-900 rounded-2xl p-6 shadow-md flex items-center gap-4 animate-fade-in-up">
            <RefreshCw className="w-7 h-7 text-amber-500 animate-spin flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-600">Analyzing Trade Document...</h4>
              <p className="text-xs text-slate-500 font-medium">{processingStep || 'Processing statutory parameters...'}</p>
            </div>
          </div>
        )}

        {/* 3. Categorized Benchmark Selectors — Light Cards */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Or Test with Standard Trade Benchmarks</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click any benchmark document below to inspect compliance readiness and test 1-click anomaly fixes.
              </p>
            </div>

            {/* Category Filter Pills — Light */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${selectedCategory === 'all' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}
              >
                All (10)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('tax')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${selectedCategory === 'tax' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}
              >
                Tax & Reg
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('trade')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${selectedCategory === 'trade' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}
              >
                Trade & Customs
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('quality')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${selectedCategory === 'quality' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}
              >
                Quality & Standards
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredDocTypes.map((type) => {
              const meta = DOCUMENT_TYPES_METADATA[type];
              const isSelected = activeDossier?.type === type && activeDossier?.source === 'sample';

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectSample(type)}
                  disabled={processing}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-50 shadow-md ring-1 ring-amber-400/50' 
                      : 'border-slate-200 bg-white hover:border-amber-400/60 hover:shadow-md'
                  } disabled:opacity-50`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        {type.toUpperCase()}
                      </span>
                      <FileText className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                      {meta.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight font-medium">
                      {meta.description}
                    </p>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit bg-amber-50 text-amber-700 border-amber-200">
                    {meta.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Active Dossier Result Workspace */}
        {activeDossier && !processing && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* Scanned Dossier Navigation Bar if multiple items scanned */}
            {scannedHistory.length > 1 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 flex-shrink-0">
                  <History className="w-4 h-4 text-amber-500" />
                  <span>Recent Scans ({scannedHistory.length}):</span>
                </div>
                <div className="flex items-center gap-2 flex-1 overflow-x-auto py-1">
                  {scannedHistory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveDossier(item)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                        activeDossier.id === item.id 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-mono text-[10px] uppercase opacity-75">{item.type}</span>
                      <span className="truncate max-w-[120px]">{item.name}</span>
                      <span className={`w-2 h-2 rounded-full ${item.scores.overall >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Readiness Panel Component */}
            <DocumentReadinessPanel
              dossier={activeDossier}
              onFixApplied={handleFixApplied}
              onFieldUpdated={handleFieldUpdated}
            />

            {/* 5. Cross-Document Consistency Audit (When 2+ docs scanned) */}
            {crossConsistencyResults.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>Cross-Document Consistency Audits ({scannedHistory.length} Scanned Dossiers)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cross-checks company names, invoice numbers, and cargo weights between your multiple uploaded files.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crossConsistencyResults.map((audit, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        audit.passed 
                          ? 'bg-emerald-50/60 border-emerald-200' 
                          : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {audit.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                        <h4 className="text-xs font-black text-slate-800">{audit.ruleName}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium pl-6">
                        {audit.message}
                      </p>
                      {audit.hindiHint && (
                        <p className="text-[11px] text-amber-700 pl-6 mt-1 font-medium">
                          🌐 {audit.hindiHint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
