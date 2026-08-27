"use client";

import React from 'react';
import { UserCategory } from './CategorySelector';

interface StepContextProps {
  data: {
    userCategory: UserCategory;
    industry: string;
    companySize?: string;
  };
  updateData: (fields: Partial<StepContextProps['data']>) => void;
  onNext: () => void;
}

export const INDUSTRIES = [
  'Textiles & Garments',
  'Chemicals & Solvents',
  'Industrial Machinery & Parts',
  'Pharmaceuticals & APIs',
  'Agriculture & Food Processing',
  'Packaging & Plastics',
  'Construction Materials',
  'Electricals & Electronics',
  'Metals, Alloys & Casting',
  'Automotive & Spare Parts',
  'Logistics & Warehousing',
  'Other'
];

export const COMPANY_SIZES = [
  '1-10 employees (Micro)',
  '11-50 employees (Small)',
  '51-200 employees (Medium-Small)',
  '201-500 employees (Medium)',
  '500+ employees (Enterprise)'
];

export default function StepContext({ data, updateData, onNext }: StepContextProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.industry) {
      newErrors.industry = 'Industry selection is required';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Your Role / Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['buyer', 'supplier', 'manufacturer', 'other'] as UserCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => updateData({ userCategory: cat })}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider border-2 transition-all duration-200 capitalize text-center ${
                data.userCategory === cat
                  ? 'border-gold bg-gold/5 text-gold-text dark:text-gold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-gold/30 hover:text-navy dark:hover:text-white'
              }`}
            >
              {cat === 'manufacturer' ? 'Manufacturer' : cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="industry" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Industry Segment *
        </label>
        <select
          id="industry"
          value={data.industry}
          onChange={(e) => {
            updateData({ industry: e.target.value });
            if (errors.industry) setErrors({ ...errors, industry: '' });
          }}
          className={`input-base cursor-pointer ${errors.industry ? 'border-red-500 focus:border-red-500 focus:box-shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}`}
        >
          <option value="">Select your industry...</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.industry}</p>
        )}
      </div>

      <div>
        <label htmlFor="companySize" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Company Size (Optional)
        </label>
        <select
          id="companySize"
          value={data.companySize || ''}
          onChange={(e) => updateData({ companySize: e.target.value })}
          className="input-base cursor-pointer"
        >
          <option value="">Select company size...</option>
          {COMPANY_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="btn-amber px-8 py-3 text-sm">
          Next Step
        </button>
      </div>
    </form>
  );
}
