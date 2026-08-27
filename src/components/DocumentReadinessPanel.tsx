"use client";

import { useState } from 'react';
import { FileText, ShieldCheck, AlertTriangle, Lightbulb, RefreshCw, Download, FileArchive, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { DocumentDossier, DocumentException } from '@/lib/documentIntel';
import { createSimpleZip } from '@/lib/zipGenerator';
import InteractiveDocMockup from './InteractiveDocMockup';

interface DocumentReadinessPanelProps {
  dossier: DocumentDossier;
  onFixApplied?: (exceptionId: string, newValue: string) => void;
  isLoading?: boolean;
}

const severityColors = {
  critical: 'bg-trust-red-bg text-trust-red border-trust-red/25',
  high: 'bg-trust-amber-bg text-trust-amber border-trust-amber/25',
  medium: 'bg-trust-blue-bg text-trust-blue border-trust-blue/25',
  low: 'bg-cream-secondary text-text-secondary border-border-default'
};

function generatePdfReport(dossier: DocumentDossier): Blob {
  const title = `AARTHA - COMPLIANCE & CORRECTION REPORT`;
  const date = `Generated: ${new Date().toISOString()}`;
  const scoreLine = `Readiness Scores: Customs: ${dossier.scores.customs}%, Bank: ${dossier.scores.bank}%, Freight: ${dossier.scores.freight}%, Inspection: ${dossier.scores.inspection}%`;
  
  let exceptionsText = "OUTSTANDING COMPLIANCE ANOMALIES:\n";
  if (dossier.exceptions.length === 0) {
    exceptionsText += "No outstanding compliance anomalies found.\n";
  } else {
    dossier.exceptions.forEach((exc, index) => {
      exceptionsText += `\n[${index + 1}] Severity: ${exc.severity.toUpperCase()} | Field: ${exc.field}\n`;
      exceptionsText += `    Message: ${exc.message}\n`;
      exceptionsText += `    Risk: ${exc.risk}\n`;
      exceptionsText += `    Suggestion: ${exc.suggestion}\n`;
    });
  }

  let assertionsText = "\nSYSTEM COMPLIANCE ASSERTIONS:\n";
  dossier.assertions.forEach((ast, index) => {
    assertionsText += `\n[${index + 1}] ${ast.name}: ${ast.passed ? "PASSED" : "FAILED"}\n`;
    assertionsText += `    Message: ${ast.message}\n`;
  });

  let fieldsText = "\nOCR EXTRACTED PARAMETERS:\n";
  dossier.extractedFields.forEach((f) => {
    fieldsText += `  - ${f.label}: ${f.value} (${f.confidence}% confidence)\n`;
  });

  const fullReportText = `${title}\n${date}\n${scoreLine}\n\n${exceptionsText}\n${assertionsText}\n${fieldsText}`;

  const escapedText = fullReportText.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lines = escapedText.split('\n');
  
  let textStream = 'BT\n/F1 10 Tf\n12 TL\n50 800 Td\n';
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
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n` +
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

export default function DocumentReadinessPanel({ dossier, onFixApplied, isLoading = false }: DocumentReadinessPanelProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(true);

  const handleDownloadPdf = () => {
    const pdfBlob = generatePdfReport(dossier);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aartha_Correction_Report_${dossier.scores.customs}pct.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportZip = () => {
    const complianceText = `AARTHA - COMPLIANCE REPORT\n` +
      `Readiness Scores: Customs: ${dossier.scores.customs}%, Bank: ${dossier.scores.bank}%, Freight: ${dossier.scores.freight}%, Inspection: ${dossier.scores.inspection}%\n\n` +
      `Anomalies:\n` +
      dossier.exceptions.map((e, idx) => `[${idx+1}] ${e.severity.toUpperCase()} - ${e.field}: ${e.message}\nSuggestion: ${e.suggestion}\n`).join('\n') +
      `\nAssertions:\n` +
      dossier.assertions.map((a, idx) => `[${idx+1}] ${a.name}: ${a.passed ? 'PASSED' : 'FAILED'} - ${a.message}\n`).join('\n');

    const files = [
      { name: 'compliance_report.txt', content: complianceText },
      { name: 'ocr_extracted_fields.json', content: JSON.stringify(dossier.extractedFields, null, 2) },
      { name: 'readiness_scores.json', content: JSON.stringify(dossier.scores, null, 2) },
      { name: 'compliance_assertions.json', content: JSON.stringify(dossier.assertions, null, 2) }
    ];

    const zipBytes = createSimpleZip(files);
    const zipBlob = new Blob([zipBytes as any], { type: 'application/zip' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aartha_Dossier_Export.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const avgScore = Math.round((dossier.scores.customs + dossier.scores.bank + dossier.scores.freight + dossier.scores.inspection) / 4);
  const totalIssues = dossier.exceptions.length;
  const hasCritical = dossier.exceptions.some(e => e.severity === 'critical');
  const hasHigh = dossier.exceptions.some(e => e.severity === 'high');

  const heroTheme = totalIssues === 0
    ? { border: 'border-trust-green/30', bg: 'bg-emerald-500/5', badgeBg: 'bg-trust-green-bg text-trust-green', icon: <CheckCircle className="w-5 h-5 text-trust-green" />, title: 'All Clear — Ready to Ship', desc: 'This document conforms to all validation guidelines. Zero compliance issues found.' }
    : hasCritical
    ? { border: 'border-trust-red/35', bg: 'bg-rose-500/5', badgeBg: 'bg-trust-red-bg text-trust-red', icon: <XCircle className="w-5 h-5 text-trust-red" />, title: `${totalIssues} Critical Issue${totalIssues > 1 ? 's' : ''} Found — Fix Required`, desc: 'This document contains severe errors that will trigger border seizure or banking rejection.' }
    : { border: 'border-trust-amber/35', bg: 'bg-amber-500/5', badgeBg: 'bg-trust-amber-bg text-trust-amber', icon: <AlertTriangle className="w-5 h-5 text-trust-amber" />, title: `${totalIssues} Compliance Issue${totalIssues > 1 ? 's' : ''} Found — Action Needed`, desc: 'Minor mismatches or formatting discrepancies detected. Apply suggestions to optimize clearance speed.' };

  return (
    <div className="space-y-6 font-sans text-text-primary animate-fade-in-up">
      {/* Hero Summary Card */}
      <div className={`border ${heroTheme.border} ${heroTheme.bg} rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-center md:items-start justify-between gap-5 relative overflow-hidden transition-all duration-300`}>
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-white rounded-xl shadow-3xs flex-shrink-0 border border-border-default/40">
            {heroTheme.icon}
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-text-primary">
              {heroTheme.title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-xl font-medium">
              {heroTheme.desc}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1.5 text-[10px] font-bold text-text-muted">
              <span className="bg-cream-secondary px-2 py-0.5 rounded-md border border-border-default/45">Issues: {totalIssues}</span>
              {totalIssues > 0 && (
                <>
                  <span className="bg-rose-100/60 text-trust-red px-2 py-0.5 rounded-md border border-trust-red/10">
                    Critical: {dossier.exceptions.filter(e => e.severity === 'critical').length}
                  </span>
                  <span className="bg-amber-100/60 text-trust-amber px-2 py-0.5 rounded-md border border-trust-amber/10">
                    High/Medium: {dossier.exceptions.filter(e => e.severity === 'high' || e.severity === 'medium').length}
                  </span>
                </>
              )}
              <span className="bg-navy/5 text-navy px-2 py-0.5 rounded-md border border-navy/10">Overall Score: {avgScore}%</span>
            </div>
          </div>
        </div>

        {/* Large overall radial score */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border-default/45 shadow-3xs flex-shrink-0">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg width="60" height="60" className="transform -rotate-90">
              <circle
                cx="30"
                cy="30"
                r="24"
                stroke="rgba(15, 31, 53, 0.05)"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="30"
                cy="30"
                r="24"
                stroke={totalIssues === 0 ? '#2D7A4F' : hasCritical ? '#DC2626' : '#D97706'}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 - (avgScore / 100) * (2 * Math.PI * 24)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-black font-mono text-navy">{avgScore}%</span>
          </div>
          <div className="text-left">
            <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider block">Compliance Score</span>
            <span className={`text-[10px] font-black uppercase ${totalIssues === 0 ? 'text-trust-green' : hasCritical ? 'text-trust-red' : 'text-trust-amber'}`}>
              {totalIssues === 0 ? 'Ready ✓' : hasCritical ? 'Risk Alert' : 'Fix Needed'}
            </span>
          </div>
        </div>
      </div>

      {/* Exception Review Dashboard - Positioned prominently above readiness detail cards */}
      {dossier.exceptions.length > 0 && (
        <div className="bg-white border border-border-default rounded-xl p-5 shadow-2xs space-y-3 font-sans">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-trust-red flex items-center gap-1.5">
              <AlertTriangle size={15} />
              <span>Found Compliance Issues ({dossier.exceptions.length}) — Action Needed</span>
            </h4>
            <p className="text-[10px] text-text-muted mt-0.5 font-medium leading-normal">
              Correct the issues below by clicking "Apply Suggested Fix" to update your document values automatically.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossier.exceptions.map((exc) => (
              <div key={exc.id} className={`border rounded-xl p-4 space-y-2.5 text-xs border-border-default hover:shadow-2xs transition-all duration-300 flex flex-col justify-between ${severityColors[exc.severity]}`}>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-bold uppercase tracking-wider text-[10px] bg-white/40 px-2 py-0.5 rounded-full border border-current">
                      {exc.severity} Severity
                    </span>
                    <span className="font-semibold text-text-primary">Field: <strong className="font-mono">{exc.field}</strong></span>
                  </div>
                  
                  <p className="font-medium leading-relaxed">{exc.message}</p>
                  
                  <div className="bg-white/50 p-2.5 rounded-lg border border-border-default/15 text-[10px] leading-relaxed text-text-secondary space-y-1">
                    <div><strong className="text-text-primary uppercase tracking-wide">Why this is a risk:</strong> {exc.risk}</div>
                    <div className="flex items-start gap-1 text-trust-blue font-semibold pt-1 border-t border-border-default/10 mt-1">
                      <Lightbulb size={12} className="flex-shrink-0 mt-0.5 text-gold" />
                      <span><strong className="uppercase font-extrabold text-[9px] tracking-wide">Aartha AI Suggestion:</strong> {exc.suggestion}</span>
                    </div>
                  </div>
                </div>

                {onFixApplied && (
                  <div className="pt-3 border-t border-border-default/10 mt-2">
                    <button
                      type="button"
                      onClick={() => onFixApplied(exc.id, exc.suggestion)}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold uppercase tracking-wider text-[10px] py-2.5 px-4 rounded-xl shadow-[0_2px_8px_rgba(217,119,6,0.15)] hover:shadow-[0_4px_16px_rgba(217,119,6,0.3)] transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                      <span>✨ Apply Suggested Fix</span>
                    </button>
                    <p className="text-[9px] text-text-muted mt-1 text-center font-medium">Click to automatically correct this parameter in your shipping document.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Readiness Level Grid */}
      <div className="bg-white border border-border-default rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">
            2. Compliance Readiness Level
          </h4>
          <p className="text-[10px] text-text-muted mt-0.5 font-medium leading-normal">
            Higher readiness percentages mean lower risk of customs rejection or clearance delays.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Customs', val: dossier.scores.customs, desc: 'Will this pass border check?', color: dossier.scores.customs >= 90 ? '#2D7A4F' : dossier.scores.customs >= 70 ? '#D97706' : '#DC2626', bg: dossier.scores.customs >= 90 ? 'bg-trust-green-bg' : dossier.scores.customs >= 70 ? 'bg-trust-amber-bg' : 'bg-trust-red-bg' },
            { label: 'Bank / Letter of Credit', val: dossier.scores.bank, desc: 'Is it bank-compliant?', color: dossier.scores.bank >= 90 ? '#2D7A4F' : dossier.scores.bank >= 70 ? '#D97706' : '#DC2626', bg: dossier.scores.bank >= 90 ? 'bg-trust-green-bg' : dossier.scores.bank >= 70 ? 'bg-trust-amber-bg' : 'bg-trust-red-bg' },
            { label: 'Shipping manifest', val: dossier.scores.freight, desc: 'Is logistics info complete?', color: dossier.scores.freight >= 90 ? '#2D7A4F' : dossier.scores.freight >= 70 ? '#D97706' : '#DC2626', bg: dossier.scores.freight >= 90 ? 'bg-trust-green-bg' : dossier.scores.freight >= 70 ? 'bg-trust-amber-bg' : 'bg-trust-red-bg' },
            { label: 'Quality Audit', val: dossier.scores.inspection, desc: 'Is facility certified?', color: dossier.scores.inspection >= 90 ? '#2D7A4F' : dossier.scores.inspection >= 70 ? '#D97706' : '#DC2626', bg: dossier.scores.inspection >= 90 ? 'bg-trust-green-bg' : dossier.scores.inspection >= 70 ? 'bg-trust-amber-bg' : 'bg-trust-red-bg' }
          ].map((item) => {
            const radius = 22;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (item.val / 100) * circumference;

            return (
              <div key={item.label} className="bg-cream-secondary/25 border border-border-default/45 p-3.5 rounded-xl flex items-center gap-3.5 hover:shadow-xs hover:border-border-strong transition-all duration-300 select-none">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <svg width="52" height="52" className="transform -rotate-90">
                    <circle
                      cx="26"
                      cy="26"
                      r={radius}
                      stroke="rgba(15, 31, 53, 0.05)"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="26"
                      cy="26"
                      r={radius}
                      stroke={item.color}
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black font-mono text-navy">{item.val}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block leading-tight">{item.label}</span>
                  <span className="text-[8.5px] text-text-muted/80 leading-none block pb-1 font-medium">{item.desc}</span>
                  <span className={`inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.bg}`} style={{ color: item.color }}>
                    {item.val >= 90 ? 'Ready ✓' : item.val >= 70 ? 'Needs Review' : 'Action Needed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Layout: Workspace Left (data inspector) and Workspace Right (document mockup canvas) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left column: Data Inspectors & Collapsible Panels */}
        <div className="space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Validation Checks (Compliance Rules Check) */}
            <div className="bg-white border border-border-default rounded-xl p-5 shadow-2xs space-y-3 font-sans">
              <button
                type="button"
                onClick={() => setRulesExpanded(!rulesExpanded)}
                className="w-full flex items-center justify-between border-b border-border-default/50 pb-2 text-left cursor-pointer group select-none"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary group-hover:text-gold transition-colors flex items-center gap-1.5">
                    <span>Compliance Rules Check</span>
                    <span className="bg-cream-secondary text-text-secondary text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                      {dossier.assertions.filter(a => a.passed).length}/{dossier.assertions.length} Passed
                    </span>
                  </h4>
                  <p className="text-[9px] font-medium text-text-muted leading-normal">Platform checks matching trade corridor guidelines.</p>
                </div>
                {rulesExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
              </button>
              
              {rulesExpanded && (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 animate-fade-in-up">
                  {dossier.assertions.map((ast) => (
                    <div
                      key={ast.name}
                      className={`p-3 rounded-lg border text-xs leading-normal flex items-start justify-between gap-3 transition-colors ${
                        ast.passed
                          ? 'bg-trust-green-bg/30 border-trust-green/15 text-text-primary'
                          : 'bg-trust-red-bg/30 border-trust-red/15 text-text-primary'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5">
                          {ast.passed ? (
                            <ShieldCheck size={14} className="text-trust-green flex-shrink-0" />
                          ) : (
                            <AlertTriangle size={14} className="text-trust-red flex-shrink-0" />
                          )}
                          <span>{ast.name}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-relaxed">{ast.message}</p>
                      </div>
                      <span className={`font-mono text-[9px] font-bold uppercase flex-shrink-0 ${ast.passed ? 'text-trust-green' : 'text-trust-red'}`}>
                        {ast.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OCR Fields (AI Extracted Details) */}
            <div className="bg-white border border-border-default rounded-xl p-5 shadow-2xs space-y-3 font-sans">
              <button
                type="button"
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                className="w-full flex items-center justify-between border-b border-border-default/50 pb-2 text-left cursor-pointer group select-none"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary group-hover:text-gold transition-colors flex items-center gap-1.5">
                    <span>AI Extracted Details</span>
                    <span className="bg-cream-secondary text-text-secondary text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono">{dossier.extractedFields.length} Fields</span>
                  </h4>
                  <p className="text-[9px] font-medium text-text-muted leading-normal">Check the raw values read by our AI from the document.</p>
                </div>
                {detailsExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
              </button>

              {detailsExpanded && (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 animate-fade-in-up">
                  {dossier.extractedFields.map((field) => (
                    <div key={field.label} className="flex justify-between items-center py-1.5 border-b border-border-default/20 last:border-0 text-xs hover:bg-cream-secondary/20 px-1 rounded transition-colors">
                      <div>
                        <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block font-sans">{field.label}</span>
                        <span className="font-mono text-navy font-bold leading-normal break-all">{field.value}</span>
                      </div>
                      <span className="text-[9px] text-text-muted bg-cream-secondary px-1.5 py-0.5 rounded font-mono font-medium flex-shrink-0 ml-2">
                        {field.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right column: Sticky visual mockup display */}
        <div className="xl:sticky xl:top-6 w-full">
          <InteractiveDocMockup dossier={dossier} />
        </div>
      </div>

      {/* Export Controls */}
      <div className="bg-cream-secondary/40 border border-border-default rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <FileArchive size={14} className="text-gold" />
            <span>Download Your Report</span>
          </h4>
          <p className="text-[10px] text-text-muted leading-normal max-w-xl font-sans">
            Download the full compliance report to share with your customs agent, logistics partner, or global buyer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            id="btn-download-pdf-report"
            onClick={handleDownloadPdf}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-white border border-navy/20 text-navy hover:border-navy hover:bg-navy/5 font-extrabold uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none whitespace-nowrap hover:-translate-y-0.5 shadow-2xs hover:shadow-xs"
          >
            <Download size={14} /> Download Report (PDF)
          </button>
          <button
            type="button"
            id="btn-export-zip-dossier"
            onClick={handleExportZip}
            className="flex-1 md:flex-none relative group overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-extrabold uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(217,119,6,0.25)] hover:shadow-[0_4px_20px_rgba(217,119,6,0.45)] border border-amber-300/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5 select-none whitespace-nowrap cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            <FileArchive size={14} /> Export Dossier (ZIP)
          </button>
        </div>
      </div>
    </div>
  );
}
