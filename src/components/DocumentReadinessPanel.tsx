"use client";

import { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  FileArchive, 
  Sparkles, 
  Layers,
  Edit3,
  Check,
  Building2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { DocumentDossier, DocumentException, DOCUMENT_TYPES_METADATA } from '@/lib/documentIntel';
import { createSimpleZip } from '@/lib/zipGenerator';

interface DocumentReadinessPanelProps {
  dossier: DocumentDossier;
  onFixApplied?: (exceptionId: string, newValue: string) => void;
  onFieldUpdated?: (fieldLabel: string, newValue: string) => void;
}

const severityBadges = {
  critical: { bg: 'bg-rose-100 text-rose-700 border-rose-300', label: 'CRITICAL / गंभीर' },
  high: { bg: 'bg-amber-100 text-amber-700 border-amber-300', label: 'HIGH PRIORITY / उच्च' },
  medium: { bg: 'bg-sky-100 text-sky-700 border-sky-300', label: 'MEDIUM / मध्यम' },
  low: { bg: 'bg-slate-100 text-slate-600 border-slate-300', label: 'LOW / सामान्य' }
};

function generatePdfReport(dossier: DocumentDossier): Blob {
  const title = `AARTHA - STATUTORY TRADE COMPLIANCE REPORT`;
  const meta = DOCUMENT_TYPES_METADATA[dossier.type] || { name: dossier.type.toUpperCase() };
  const date = `Generated: ${new Date().toLocaleString('en-IN')}`;
  const docInfo = `Document: ${dossier.name} | Type: ${meta.name}`;
  const scoreLine = `Compliance Scores -> Customs: ${dossier.scores.customs}% | Bank/LC: ${dossier.scores.bank}% | Freight: ${dossier.scores.freight}% | Quality: ${dossier.scores.inspection}% | Overall: ${dossier.scores.overall}%`;
  
  let exceptionsText = "OUTSTANDING COMPLIANCE ANOMALIES:\n";
  if (dossier.exceptions.length === 0) {
    exceptionsText += "  [x] ZERO COMPLIANCE ANOMALIES FOUND. Document is fully verified.\n";
  } else {
    dossier.exceptions.forEach((exc, index) => {
      exceptionsText += `\n[${index + 1}] Severity: ${exc.severity.toUpperCase()} | Parameter: ${exc.field}\n`;
      exceptionsText += `    Anomaly: ${exc.message}\n`;
      exceptionsText += `    Trade Risk: ${exc.risk}\n`;
      exceptionsText += `    Statutory Remedy: ${exc.suggestion}\n`;
    });
  }

  let assertionsText = "\nSTATUTORY COMPLIANCE AUDITS:\n";
  dossier.assertions.forEach((ast, index) => {
    assertionsText += `  [${ast.passed ? 'PASSED' : 'FAILED'}] ${ast.name}: ${ast.message}\n`;
  });

  let fieldsText = "\nEXTRACTED DOCUMENT PARAMETERS:\n";
  dossier.extractedFields.forEach((f) => {
    fieldsText += `  * ${f.label}: ${f.value} (${f.confidence}% confidence)\n`;
  });

  const fullReportText = `${title}\n${docInfo}\n${date}\n${scoreLine}\n\n${exceptionsText}\n${assertionsText}\n${fieldsText}\n\nVerified by Aartha Statutory Intelligence Engine.`;

  const escapedText = fullReportText.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lines = escapedText.split('\n');
  
  let textStream = 'BT\n/F1 9 Tf\n12 TL\n40 800 Td\n';
  lines.forEach((line) => {
    textStream += `(${line}) Tj T*\n`;
  });
  textStream += 'ET';

  const encoder = new TextEncoder();
  const textStreamBytes = encoder.encode(textStream);

  const headerPart = encoder.encode(
    `%PDF-1.4\n` +
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n` +
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n` +
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n` +
    `4 0 obj\n<< /Length ${textStreamBytes.length} >>\nstream\n`
  );
  
  const footerPart = encoder.encode(
    `\nendstream\nendobj\n` +
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n` +
    `xref\n0 6\n` +
    `0000000000 65535 f \n` +
    `trailer\n<< /Size 6 /Root 1 0 R >>\n` +
    `startxref\n300\n` +
    `%%EOF`
  );

  const pdfBytes = new Uint8Array(headerPart.length + textStreamBytes.length + footerPart.length);
  pdfBytes.set(headerPart, 0);
  pdfBytes.set(textStreamBytes, headerPart.length);
  pdfBytes.set(footerPart, headerPart.length + textStreamBytes.length);

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export default function DocumentReadinessPanel({ 
  dossier, 
  onFixApplied, 
  onFieldUpdated 
}: DocumentReadinessPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'fields' | 'checks'>('overview');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempFieldValue, setTempFieldValue] = useState('');

  const meta = DOCUMENT_TYPES_METADATA[dossier.type] || {
    name: dossier.type.toUpperCase(),
    nameHi: '',
    category: 'Trade & Commercial'
  };

  const handleDownloadPdf = () => {
    const pdfBlob = generatePdfReport(dossier);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aartha_${dossier.type.toUpperCase()}_Audit_Report_${dossier.scores.overall}pct.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportZip = () => {
    const complianceText = `AARTHA - COMPLIANCE AUDIT DOSSIER\n` +
      `File: ${dossier.name} (${meta.name})\n` +
      `Scanned: ${dossier.scannedAt}\n` +
      `Overall Readiness Score: ${dossier.scores.overall}%\n\n` +
      `Readiness Metrics:\n` +
      `  - Customs Clearance: ${dossier.scores.customs}%\n` +
      `  - Banking / LC Acceptance: ${dossier.scores.bank}%\n` +
      `  - Logistics & Freight Manifest: ${dossier.scores.freight}%\n` +
      `  - Inspection & Quality Standards: ${dossier.scores.inspection}%\n\n` +
      `Outstanding Exceptions:\n` +
      dossier.exceptions.map((e, idx) => `[${idx+1}] [${e.severity.toUpperCase()}] ${e.field}: ${e.message}\nAction: ${e.suggestion}\n`).join('\n') +
      `\nStatutory Assertions:\n` +
      dossier.assertions.map((a, idx) => `[${idx+1}] ${a.name}: ${a.passed ? 'PASSED' : 'FAILED'} -> ${a.message}\n`).join('\n');

    const files = [
      { name: 'statutory_audit_report.txt', content: complianceText },
      { name: 'extracted_parameters.json', content: JSON.stringify(dossier.extractedFields, null, 2) },
      { name: 'readiness_scores.json', content: JSON.stringify(dossier.scores, null, 2) },
      { name: 'compliance_assertions.json', content: JSON.stringify(dossier.assertions, null, 2) }
    ];

    const zipBytes = createSimpleZip(files);
    const zipBlob = new Blob([zipBytes as any], { type: 'application/zip' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aartha_Dossier_${dossier.type}_${dossier.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalIssues = dossier.exceptions.length;
  const criticalCount = dossier.exceptions.filter(e => e.severity === 'critical').length;
  const passedAssertionsCount = dossier.assertions.filter(a => a.passed).length;
  const scoreColor = dossier.scores.overall >= 90 ? '#10B981' : dossier.scores.overall >= 70 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      
      {/* 1. Hero Summary Banner — Enterprise Light with thick left border */}
      <div className={`p-6 rounded-2xl border-l-4 border shadow-sm transition-all ${
        totalIssues === 0 
          ? 'bg-emerald-50/50 border-l-emerald-500 border-slate-200' 
          : criticalCount > 0 
          ? 'bg-rose-50/50 border-l-rose-500 border-slate-200' 
          : 'bg-amber-50/50 border-l-amber-500 border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-300">
                {meta.name}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                dossier.source === 'live-scan' 
                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}>
                {dossier.source === 'live-scan' ? '● Live Verified Scan' : '○ Verified Benchmark'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                File: {dossier.name}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              {totalIssues === 0 ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                  <span>100% Compliant — Clear to Ship</span>
                </>
              ) : criticalCount > 0 ? (
                <>
                  <XCircle className="w-7 h-7 text-rose-600 flex-shrink-0" />
                  <span>{totalIssues} Critical Issue{totalIssues > 1 ? 's' : ''} Detected — Action Required</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-7 h-7 text-amber-600 flex-shrink-0" />
                  <span>{totalIssues} Discrepanc{totalIssues > 1 ? 'ies' : 'y'} Detected — Fix Needed</span>
                </>
              )}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {dossier.summary}
            </p>
          </div>

          {/* Overall Readiness Radial Score — Light */}
          <div className="flex items-center gap-4 bg-white border border-slate-200/90 p-4 rounded-xl shadow-sm flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <svg width="76" height="76" className="transform -rotate-90">
                <circle cx="38" cy="38" r="32" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                <circle
                  cx="38"
                  cy="38"
                  r="32"
                  stroke={scoreColor}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 - (dossier.scores.overall / 100) * (2 * Math.PI * 32)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-black font-mono text-slate-900 block leading-none">{dossier.scores.overall}%</span>
                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Statutory Status</span>
              <span className={`text-sm font-black uppercase ${
                dossier.scores.overall >= 90 ? 'text-emerald-600' : dossier.scores.overall >= 70 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {dossier.scores.overall >= 90 ? 'Ready for Export ✓' : dossier.scores.overall >= 70 ? 'Fix Recommended' : 'Border Risk'}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">{passedAssertionsCount}/{dossier.assertions.length} audits passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Corridor Readiness Score Cards (4 Pillars) — Light */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { 
            title: 'Customs Clearance', 
            titleHi: 'सीमा शुल्क निकासी',
            score: dossier.scores.customs, 
            desc: 'Border tariff & origin declaration' 
          },
          { 
            title: 'Bank / Letter of Credit', 
            titleHi: 'बैंक और एलसी स्वीकृति',
            score: dossier.scores.bank, 
            desc: 'Payment release compliance' 
          },
          { 
            title: 'Logistics & Manifest', 
            titleHi: 'शिपिंग और कार्गो',
            score: dossier.scores.freight, 
            desc: 'Carrier & port corridor sync' 
          },
          { 
            title: 'Quality & Facility', 
            titleHi: 'गुणवत्ता और मानक',
            score: dossier.scores.inspection, 
            desc: 'Regulatory audit validity' 
          }
        ].map((item) => {
          const isGreen = item.score >= 90;
          const isAmber = item.score >= 70 && item.score < 90;
          const bgBadge = isGreen ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : isAmber ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-rose-100 text-rose-700 border-rose-300';

          return (
            <div key={item.title} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-400/60 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{item.title}</h4>
                  <span className="text-[10px] text-amber-600 font-medium block">{item.titleHi}</span>
                </div>
                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-full border ${bgBadge}`}>
                  {item.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-2 border border-slate-200/60">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isGreen ? 'bg-emerald-500' : isAmber ? 'bg-amber-500' : 'bg-rose-500'
                  }`} 
                  style={{ width: `${item.score}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Found Compliance Issues Section with 1-Click Fix — Light */}
      {dossier.exceptions.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Found Compliance Issues ({dossier.exceptions.length}) — Action Needed</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Click <strong>&quot;Apply 1-Click Fix&quot;</strong> to automatically update your document to international statutory standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossier.exceptions.map((exc) => {
              const badge = severityBadges[exc.severity] || severityBadges.medium;
              return (
                <div key={exc.id} className="border border-slate-200/90 rounded-xl p-5 bg-white flex flex-col justify-between space-y-4 hover:border-amber-300 hover:shadow-md transition-all shadow-xs">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                        {exc.field}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {exc.message}
                    </p>

                    {exc.hindiSummary && (
                      <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 leading-relaxed font-medium">
                        💡 <strong>सरल उपाय:</strong> {exc.hindiSummary}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                      <div><strong className="text-rose-600 uppercase text-[10px] tracking-wide">Trade Risk:</strong> {exc.risk}</div>
                      <div><strong className="text-sky-600 uppercase text-[10px] tracking-wide">Statutory Remedy:</strong> {exc.suggestion}</div>
                    </div>
                  </div>

                  {onFixApplied && (
                    <button
                      type="button"
                      onClick={() => onFixApplied(exc.id, exc.autoFixValue || exc.suggestion)}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>✨ Apply 1-Click Fix ({exc.autoFixValue || 'Auto Correct'})</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tab Navigation (Extracted Parameters vs Statutory Verification Audits) — Light */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'border-amber-500 text-amber-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Extracted Parameters ({dossier.extractedFields.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checks')}
            className={`flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'checks' 
                ? 'border-amber-500 text-amber-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Statutory Verification Audits ({dossier.assertions.length})</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
                <span>Extracted from statutory structure & document tokens</span>
                <span>Confidence score</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dossier.extractedFields.map((field) => {
                  const isEditing = editingField === field.label;
                  return (
                    <div 
                      key={field.label} 
                      className={`p-4 rounded-xl border transition-all ${
                        field.highlight 
                          ? 'bg-amber-50/60 border-amber-300' 
                          : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                          {field.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {field.confidence}% Match
                          </span>
                          {onFieldUpdated && !isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingField(field.label);
                                setTempFieldValue(field.value);
                              }}
                              className="text-slate-400 hover:text-amber-600 p-1 rounded cursor-pointer transition-colors"
                              title="Edit Value"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={tempFieldValue}
                            onChange={(e) => setTempFieldValue(e.target.value)}
                            className="flex-1 text-xs font-mono font-bold text-slate-900 bg-white px-3 py-1.5 border border-amber-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (onFieldUpdated && tempFieldValue) {
                                onFieldUpdated(field.label, tempFieldValue);
                              }
                              setEditingField(null);
                            }}
                            className="p-1.5 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-mono font-bold text-slate-900 break-all">
                          {field.value}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'checks' && (
            <div className="space-y-3">
              {dossier.assertions.map((ast) => (
                <div 
                  key={ast.name}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    ast.passed 
                      ? 'bg-emerald-50/60 border-emerald-200' 
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {ast.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-800">{ast.name}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium pl-6">
                      {ast.message}
                    </p>
                    {ast.hindiHint && (
                      <p className="text-[11px] text-amber-700 pl-6 font-medium">
                        🌐 {ast.hindiHint}
                      </p>
                    )}
                  </div>

                  <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase flex-shrink-0 ${
                    ast.passed 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                  }`}>
                    {ast.passed ? 'PASSED / सफल' : 'FAILED / असफल'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Export Report & Download Actions — Navy footer */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-navy-dark border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center justify-center md:justify-start gap-2">
            <FileArchive className="w-4 h-4 text-amber-400" />
            <span>Download Verified Compliance Report</span>
          </h4>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Export the official statutory compliance report to submit to your customs clearing agent, logistics forwarder, or international buyer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
          <button
            type="button"
            id="btn-download-pdf-report"
            onClick={handleDownloadPdf}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Report (PDF)</span>
          </button>
          <button
            type="button"
            id="btn-export-zip-dossier"
            onClick={handleExportZip}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider"
          >
            <FileArchive className="w-4 h-4" />
            <span>Export Full Dossier (ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
