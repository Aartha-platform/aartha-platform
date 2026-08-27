"use client";

import React from 'react';

interface StepProblemsProps {
  data: {
    problemDescription: string;
    currentTools?: string;
    painPoints: string[];
  };
  updateData: (fields: Partial<StepProblemsProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PAIN_POINTS = [
  'Finding verified suppliers / buyers',
  'Quality assurance & product testing',
  'Price transparency & fair quotes',
  'Trade documentation, compliance & GST',
  'Payment security & trade assurance',
  'Inefficient negotiation & communication',
  'Logistics, shipping & custom clearance',
  'Access to working capital & credit'
];

export default function StepProblems({ data, updateData, onNext, onBack }: StepProblemsProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.problemDescription || data.problemDescription.trim().length < 10) {
      newErrors.problemDescription = 'Please describe your problem in more detail (minimum 10 characters)';
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

  const handleCheckboxChange = (painPoint: string) => {
    const current = [...data.painPoints];
    const index = current.indexOf(painPoint);
    if (index === -1) {
      current.push(painPoint);
    } else {
      current.splice(index, 1);
    }
    updateData({ painPoints: current });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="problemDescription" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          What challenges or problems do you face in B2B trade? *
        </label>
        <textarea
          id="problemDescription"
          rows={4}
          value={data.problemDescription}
          onChange={(e) => {
            updateData({ problemDescription: e.target.value });
            if (errors.problemDescription) setErrors({ ...errors, problemDescription: '' });
          }}
          placeholder="Please tell us about what is broken, hard to use, or missing in your current sourcing or selling workflow..."
          className={`input-base resize-none py-3 ${errors.problemDescription ? 'border-red-500 focus:border-red-500 focus:box-shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
        />
        {errors.problemDescription && (
          <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.problemDescription}</p>
        )}
      </div>

      <div>
        <label htmlFor="currentTools" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          What tools, platforms, or manual methods do you currently use?
        </label>
        <input
          id="currentTools"
          type="text"
          value={data.currentTools || ''}
          onChange={(e) => updateData({ currentTools: e.target.value })}
          placeholder="e.g., IndiaMart, WhatsApp groups, spreadsheets, brokers..."
          className="input-base"
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Select your biggest pain points (Select all that apply)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAIN_POINTS.map((pain) => {
            const isChecked = data.painPoints.includes(pain);
            return (
              <div
                key={pain}
                onClick={() => handleCheckboxChange(pain)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
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
                  {pain}
                </span>
              </div>
            );
          })}
        </div>
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
