"use client";

import React from 'react';

interface StepPriorityProps {
  data: {
    urgency: 'critical' | 'high' | 'medium' | 'low';
    willingnessToPay: string;
    additionalNotes?: string;
    contactInfo?: string;
  };
  updateData: (fields: Partial<StepPriorityProps['data']>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const URGENCY_OPTIONS = [
  { id: 'critical', label: 'Critical', desc: 'Affects my business operations daily' },
  { id: 'high', label: 'High', desc: 'Losing significant time or money weekly' },
  { id: 'medium', label: 'Medium', desc: 'Would improve operational efficiency' },
  { id: 'low', label: 'Low', desc: 'Nice-to-have suggestion / cosmetic issue' }
] as const;

export const WTP_OPTIONS = [
  'I expect this to be free / part of the standard platform',
  'I would pay a small subscription (₹500 - ₹2,000/month)',
  'I would pay a professional subscription (₹2,000 - ₹10,000/month)',
  'I would pay an enterprise tier (₹10,000+/month)',
  'I need to see the implementation details before deciding'
];

export default function StepPriority({ data, updateData, onSubmit, onBack, isSubmitting }: StepPriorityProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.willingnessToPay) {
      newErrors.willingnessToPay = 'Please select your willingness to pay option';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          How urgently do you need a solution for this? *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {URGENCY_OPTIONS.map((opt) => {
            const isChecked = data.urgency === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateData({ urgency: opt.id })}
                className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                  isChecked
                    ? 'border-gold bg-gold/5 dark:bg-gold/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-gold/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isChecked ? 'border-gold' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isChecked && <div className="w-2 h-2 rounded-full bg-gold" />}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {opt.label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-7">
                  {opt.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="willingnessToPay" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          What would you be willing to pay for this solution? *
        </label>
        <select
          id="willingnessToPay"
          value={data.willingnessToPay}
          onChange={(e) => {
            updateData({ willingnessToPay: e.target.value });
            if (errors.willingnessToPay) setErrors({ ...errors, willingnessToPay: '' });
          }}
          className={`input-base cursor-pointer ${errors.willingnessToPay ? 'border-red-500 focus:border-red-500' : ''}`}
        >
          <option value="">Select willingness to pay...</option>
          {WTP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.willingnessToPay && (
          <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.willingnessToPay}</p>
        )}
      </div>

      <div>
        <label htmlFor="additionalNotes" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Anything else you want to share with us? (Optional)
        </label>
        <textarea
          id="additionalNotes"
          rows={3}
          value={data.additionalNotes || ''}
          onChange={(e) => updateData({ additionalNotes: e.target.value })}
          placeholder="Any other comments, design details, or relevant information..."
          className="input-base resize-none py-3"
        />
      </div>

      <div>
        <label htmlFor="contactInfo" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Contact Info (Optional)
        </label>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-2">
          Provide your email or phone if you wish to receive updates regarding this feature request. Leave blank to remain anonymous.
        </p>
        <input
          id="contactInfo"
          type="text"
          value={data.contactInfo || ''}
          onChange={(e) => updateData({ contactInfo: e.target.value })}
          placeholder="e.g., mail@example.com or +91 9999999999"
          className="input-base"
        />
      </div>

      <div className="pt-4 flex justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="btn-outline px-6 py-3 text-sm text-slate-500 border-slate-200 hover:border-slate-300 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-amber px-8 py-3 text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Feedback 🚀'
          )}
        </button>
      </div>
    </form>
  );
}
