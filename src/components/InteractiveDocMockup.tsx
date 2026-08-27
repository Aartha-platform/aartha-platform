"use client";

import { DocumentDossier } from '@/lib/documentIntel';
import { ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface InteractiveDocMockupProps {
  dossier: DocumentDossier;
}

export default function InteractiveDocMockup({ dossier }: InteractiveDocMockupProps) {
  const { type, exceptions, extractedFields } = dossier;

  // Helper to check if a specific exception is still outstanding
  const hasException = (id: string) => exceptions.some(e => e.id === id);

  // Find value of an extracted field
  const getFieldValue = (label: string, fallback: string = "") => {
    return extractedFields.find(f => f.label.toLowerCase() === label.toLowerCase() || f.label.replace(/\s+/g, '').toLowerCase() === label.replace(/\s+/g, '').toLowerCase())?.value || fallback;
  };

  // Render the specific visual layout of each document type
  const renderDocumentBody = () => {
    switch (type) {
      case 'invoice': {
        const isCountryOfOriginMissing = hasException('exc-inv-1');
        const isHsCodeShort = hasException('exc-inv-2');
        const invoiceNo = getFieldValue('Invoice No', 'INV-2026-098');
        const invoiceDate = getFieldValue('Invoice Date', '2026-06-25');
        const hsCode = getFieldValue('Declared HS Code', '3004.90');
        const originVal = isCountryOfOriginMissing ? 'MISSING' : 'India';

        return (
          <div className="p-5 font-mono text-[9px] text-slate-700 bg-white border border-slate-200 shadow-sm rounded-lg relative overflow-hidden h-full flex flex-col justify-between">
            {/* Watermark/Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
              <span className="text-4xl font-extrabold uppercase tracking-widest rotate-12">AARTHA SECURE</span>
            </div>

            {/* Document Header */}
            <div className="border-b border-slate-300 pb-3 flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-[12px] text-navy uppercase tracking-wider">Commercial Invoice</h3>
                <p className="text-[8px] text-slate-400 mt-0.5">Original Export Dossier</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[10px] text-navy block">{invoiceNo}</span>
                <span className="text-slate-500 block">Date: {invoiceDate}</span>
              </div>
            </div>

            {/* Exporter / Importer Row */}
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100">
              <div>
                <span className="text-[7px] uppercase font-bold text-slate-400 block">Exporter (Seller)</span>
                <span className="font-bold text-slate-800 block truncate">MEHTA INDUS-CHEMICALS LTD</span>
                <span className="text-slate-500 block text-[8px] leading-relaxed">Phase IV, GIDC Vatva, Gujarat, India</span>
              </div>
              <div>
                <span className="text-[7px] uppercase font-bold text-slate-400 block">Importer (Buyer)</span>
                <span className="font-bold text-slate-800 block truncate">GLOBAL CHEMICAL CORP</span>
                <span className="text-slate-500 block text-[8px] leading-relaxed">Hamburg Zone 4, Germany</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="py-2 flex-grow">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[7px]">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-center">HS Code</th>
                    <th className="py-1 text-right">Qty / Weight</th>
                    <th className="py-1 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2">
                      <span className="font-bold text-slate-800 block">Paracetamol API</span>
                      <span className="text-[8px] text-slate-400 block">USP Pharma Grade / Drums</span>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded font-bold font-mono transition-colors ${
                        isHsCodeShort
                          ? 'bg-trust-amber-bg text-trust-amber border border-trust-amber/20 animate-pulse'
                          : 'bg-trust-green-bg text-trust-green border border-trust-green/20'
                      }`}>
                        {hsCode}
                      </span>
                    </td>
                    <td className="py-2 text-right text-slate-700">5,000 kg</td>
                    <td className="py-2 text-right font-bold text-slate-800">USD 17,500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Anomaly Highlight / Dynamic Origin */}
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-end gap-3 flex-wrap">
              <div className="space-y-1">
                <span className="text-[7px] uppercase font-bold text-slate-400 block">Declarations & Origin Status</span>
                <div className={`p-2 rounded border transition-all ${
                  isCountryOfOriginMissing
                    ? 'bg-trust-red-bg border-trust-red/20 text-trust-red animate-glow-pulse'
                    : 'bg-trust-green-bg border-trust-green/20 text-trust-green'
                }`}>
                  <div className="font-bold flex items-center gap-1">
                    {isCountryOfOriginMissing ? <AlertCircle size={10} /> : <ShieldCheck size={10} />}
                    <span>COUNTRY OF ORIGIN: {originVal.toUpperCase()}</span>
                  </div>
                  {isCountryOfOriginMissing && (
                    <p className="text-[7px] font-normal leading-normal mt-0.5">⚠️ Required for Hamburg Port Customs Clearance</p>
                  )}
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex-shrink-0 flex items-center gap-1.5 bg-trust-green-bg border border-trust-green/20 text-trust-green px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[8px]">
                <CheckCircle2 size={10} />
                <span>Format Match</span>
              </div>
            </div>
          </div>
        );
      }

      case 'coo': {
        const isChamberSigMissing = hasException('exc-coo-1');
        const consignor = getFieldValue('Consignor', 'MEHTA INDUS-CHEMICALS LTD');
        const consignee = getFieldValue('Consignee', 'GLOBAL CHEMICAL CORP');
        const originState = getFieldValue('Origin State', 'Gujarat');

        return (
          <div className="p-5 font-sans text-[9px] text-slate-700 bg-amber-50/15 border border-amber-900/10 shadow-sm rounded-lg relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-4xl font-extrabold uppercase tracking-widest rotate-12">CHAMBER OF COMMERCE</span>
            </div>

            {/* Document Header */}
            <div className="border-b border-amber-900/10 pb-2 text-center space-y-0.5">
              <h3 className="font-extrabold text-[11px] text-amber-800 uppercase tracking-widest">Certificate of Origin</h3>
              <p className="text-[7px] text-slate-500 uppercase tracking-wider">Federation of Indian Chambers of Commerce & Industry</p>
            </div>

            {/* Core Details grid */}
            <div className="grid grid-cols-2 gap-3 py-3 text-[8px] flex-grow">
              <div className="space-y-2 border-r border-amber-900/5 pr-2">
                <div>
                  <span className="text-[7px] font-bold text-slate-400 uppercase block">1. Consignor (Exporter)</span>
                  <span className="font-bold text-slate-800 block truncate">{consignor}</span>
                  <span className="text-slate-500 block leading-tight">Ahmedabad, Gujarat, India</span>
                </div>
                <div>
                  <span className="text-[7px] font-bold text-slate-400 uppercase block">2. Consignee (Importer)</span>
                  <span className="font-bold text-slate-800 block truncate">{consignee}</span>
                  <span className="text-slate-500 block leading-tight">Germany</span>
                </div>
              </div>
              <div className="space-y-2 pl-1">
                <div>
                  <span className="text-[7px] font-bold text-slate-400 uppercase block">3. Origin of Goods</span>
                  <span className="font-bold text-slate-800 block">INDIA (State: {originState})</span>
                </div>
                <div>
                  <span className="text-[7px] font-bold text-slate-400 uppercase block">4. Transport Details</span>
                  <span className="font-bold text-slate-800 block">Sea Cargo - Mundra Port</span>
                </div>
              </div>
            </div>

            {/* Dynamic Stamp Section */}
            <div className="border-t border-amber-900/10 pt-3 flex justify-between items-center gap-4">
              <div className="text-[8px] leading-relaxed max-w-[160px]">
                <span className="font-bold uppercase text-slate-500 block text-[6px]">5. Exporter Declaration</span>
                I hereby declare that the goods described above originate in the declared country of origin and conform to active export regulation guidelines.
              </div>

              {/* Chamber Seal / Stamp */}
              <div className="relative w-28 h-20 flex items-center justify-center">
                {isChamberSigMissing ? (
                  <div className="w-full h-full border-2 border-dashed border-trust-red rounded-lg flex flex-col items-center justify-center bg-trust-red-bg/40 text-trust-red p-1 text-center animate-glow-pulse">
                    <AlertCircle size={14} className="mb-0.5" />
                    <span className="font-bold uppercase tracking-wider text-[7px] leading-tight">Seal Missing</span>
                    <span className="text-[6px] opacity-75 font-medium leading-none mt-0.5">Pending Chamber Validation</span>
                  </div>
                ) : (
                  <div className="w-full h-full border-2 border-double border-trust-green rounded-full flex flex-col items-center justify-center bg-trust-green-bg/50 text-trust-green p-1.5 text-center transform -rotate-6 transition-all duration-700 ease-out shadow-xs">
                    <ShieldCheck size={16} className="mb-0.5 text-trust-green" />
                    <span className="font-bold uppercase tracking-widest text-[7px] leading-tight">APPROVED</span>
                    <span className="text-[5px] font-bold uppercase tracking-wider opacity-90 mt-0.5">GUJARAT CHAMBER</span>
                    <span className="text-[5px] font-mono text-slate-400">GCC-2406-VERIFIED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'gst': {
        const gstin = getFieldValue('GSTIN', '24AAAAM8901D1Z1');
        const legalName = getFieldValue('Legal Name', 'MEHTA INDUS-CHEMICALS LTD');
        const address = getFieldValue('Address', 'GIDC Vatva, Ahmedabad, Gujarat 382445');
        const regDate = getFieldValue('Registration Date', '2018-04-12');
        const status = getFieldValue('Status', 'Active');

        return (
          <div className="p-5 font-sans text-[9px] text-slate-700 bg-white border border-slate-200 shadow-sm rounded-lg relative overflow-hidden h-full flex flex-col justify-between">
            {/* Ashoka Emblem / Header Background */}
            <div className="absolute top-2 right-4 opacity-[0.08] pointer-events-none select-none text-[22px] font-bold">GSTIN</div>

            <div className="text-center pb-2.5 border-b-2 border-slate-800 space-y-0.5">
              <h3 className="font-extrabold text-[10px] text-navy uppercase tracking-wider">Government of India</h3>
              <p className="font-bold text-[8px] text-slate-600 uppercase">GST Registration Certificate</p>
            </div>

            {/* GST Details Box */}
            <div className="py-2.5 space-y-1.5 flex-grow font-mono text-[8px]">
              <div className="flex border-b border-slate-100 py-1">
                <span className="w-24 text-slate-400 uppercase font-semibold">Registration Number</span>
                <span className="font-bold text-navy bg-cream-secondary/40 px-1 rounded">{gstin}</span>
              </div>
              <div className="flex border-b border-slate-100 py-1">
                <span className="w-24 text-slate-400 uppercase font-semibold">Legal Name</span>
                <span className="font-bold text-slate-800 truncate flex-1">{legalName}</span>
              </div>
              <div className="flex border-b border-slate-100 py-1">
                <span className="w-24 text-slate-400 uppercase font-semibold">Principal Address</span>
                <span className="text-slate-600 flex-1 leading-normal line-clamp-2">{address}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 py-1">
                <div className="flex">
                  <span className="w-16 text-slate-400 uppercase font-semibold">Date of Issue</span>
                  <span className="font-bold text-slate-700">{regDate}</span>
                </div>
                <div className="flex">
                  <span className="w-16 text-slate-400 uppercase font-semibold">Status</span>
                  <span className="font-bold text-trust-green flex items-center gap-0.5 uppercase">{status}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row with QR/Stamp */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
              {/* Mock QR Code */}
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded p-1 flex flex-wrap gap-0.5 pointer-events-none select-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-2xs ${i % 3 === 0 || i % 5 === 2 ? 'bg-navy' : 'bg-transparent'}`} />
                ))}
              </div>

              {/* Verification Stamp */}
              <div className="border border-trust-green text-trust-green px-2 py-1 rounded font-bold uppercase tracking-wider text-[7px] flex items-center gap-1 bg-trust-green-bg/30">
                <ShieldCheck size={11} />
                <span>GSTIN VALID</span>
              </div>
            </div>
          </div>
        );
      }

      default: {
        // Fallback layout that handles packing_list, iec, etc. gracefully
        const name = dossier.name;
        const totalExceptions = exceptions.length;

        return (
          <div className="p-5 font-sans text-[9px] text-slate-700 bg-white border border-slate-200 shadow-sm rounded-lg relative overflow-hidden h-full flex flex-col justify-between font-mono">
            {/* Generic Document Representation */}
            <div className="border-b border-slate-200 pb-2.5 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-navy font-bold text-[10px] uppercase font-sans">
                <FileText size={14} className="text-gold" />
                <span>{type.toUpperCase()} Certificate</span>
              </div>
              <span className="text-[8px] text-slate-400">{name}</span>
            </div>

            {/* Extracted content list mock */}
            <div className="py-3 flex-grow space-y-2">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block font-sans">Key Details</span>
              <div className="bg-cream/40 p-2.5 rounded-lg border border-border-default/40 space-y-2">
                {extractedFields.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex justify-between items-center text-[8px] border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                    <span className="font-bold text-slate-500 uppercase font-sans">{f.label}</span>
                    <span className="font-mono text-navy font-bold">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Status Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[7px] uppercase font-bold text-slate-400 block font-sans">Compliance Status</span>
                <span className={`font-bold uppercase font-sans ${totalExceptions > 0 ? 'text-trust-amber' : 'text-trust-green'}`}>
                  {totalExceptions > 0 ? `${totalExceptions} Warning Detected` : 'All Checks Passed'}
                </span>
              </div>

              {/* Status Emblem */}
              <div className={`px-2 py-1 rounded font-bold uppercase tracking-wider text-[7px] flex items-center gap-1 font-sans ${
                totalExceptions > 0
                  ? 'bg-trust-amber-bg text-trust-amber border border-trust-amber/20'
                  : 'bg-trust-green-bg text-trust-green border border-trust-green/20'
              }`}>
                {totalExceptions > 0 ? <AlertCircle size={10} /> : <ShieldCheck size={10} />}
                <span>{totalExceptions > 0 ? 'Review Needed' : 'Dossier Valid'}</span>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between pb-2">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Document Preview</span>
        <span className="text-[9px] font-mono text-text-muted bg-cream-secondary px-2 py-0.5 rounded-md border border-border-default">
          Live Preview
        </span>
      </div>
      <div className="flex-1 bg-cream-secondary/40 border border-border-default rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow duration-300">
        {renderDocumentBody()}
      </div>
    </div>
  );
}
