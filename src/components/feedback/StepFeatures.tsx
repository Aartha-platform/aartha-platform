"use client";

import React from 'react';

interface StepFeaturesProps {
  data: {
    featureRequests: string;
    documentStruggles: string[];
    missingServices?: string;
  };
  updateData: (fields: Partial<StepFeaturesProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DOCUMENT_TYPES = [
  'Purchase Orders (PO)',
  'GST Invoices & Tax Filings',
  'Quality & Inspection Certificates',
  'Bills of Lading (B/L) & Shipping Docs',
  'MSDS & Compliance Documents',
  'Letter of Credit (L/C) & Bank Guarantees',
  'Customs Declarations'
];

export default function StepFeatures({ data, updateData, onNext, onBack }: StepFeaturesProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.featureRequests || data.featureRequests.trim().length < 5) {
      newErrors.featureRequests = 'Please suggest what feature or solution would help you (minimum 5 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleCheckboxChange = (docType: string) => {
    const current = [...data.documentStruggles];
    const index = current.indexOf(docType);
    if (index === -1) {
      current.push(docType);
    } else {
      current.splice(index, 1);
    }
    updateData({ documentStruggles: current });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="featureRequests" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          What feature or solution could we build to solve these problems? *
        </label>
        <textarea
          id="featureRequests"
          rows={4}
          value={data.featureRequests}
          onChange={(e) => {
            updateData({ featureRequests: e.target.value });
            if (errors.featureRequests) setErrors({ ...errors, featureRequests: '' });
          }}
          placeholder="Describe your ideal product, feature, tool or automation that would make your trade workflows frictionless..."
          className={`input-base resize-none py-3 ${errors.featureRequests ? 'border-red-500 focus:border-red-500 focus:box-shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
        />
        {errors.featureRequests && (
          <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.featureRequests}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Which trade documents do you struggle to manage? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DOCUMENT_TYPES.map((doc) => {
            const isChecked = data.documentStruggles.includes(doc);
            return (
              <div
                key={doc}
                onClick={() => handleCheckboxChange(doc)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                  isChecked
                    ? 'border-gold bg-gold/5 dark:bg-gold/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-gold/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                  isChecked ? 'bg-gold border-gold text-white' : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isChecked && <span className="text-[10px] font-bold">✓</span>}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                  {doc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="missingServices" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Are there any missing services in B2B marketplaces that you expect? (Optional)
        </label>
        <input
          id="missingServices"
          type="text"
          value={data.missingServices || ''}
          onChange={(e) => updateData({ missingServices: e.target.value })}
          placeholder="e.g., third-party laboratory inspections, credit/financing integrations..."
          className="input-base"
        />
      </div>

      <div className="pt-4 flex justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline px-6 py-3 text-sm text-slate-500 border-slate-200 hover:border-slate-300"
        >
          Back
        </button>
        <button type="submit" className="btn-amber px-8 py-3 text-sm">
          Next Step
        </button>
      </div>
    </form>
  );
}
