"use client";

import { useState, useEffect } from 'react';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { getSavedAuthorityDeclaration, saveAuthorityDeclaration, BuyerAuthorityDeclaration } from '@/lib/buyerAuthority';
import Checkbox from '@/components/ui/Checkbox';

interface AuthorityDeclarationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AuthorityDeclarationForm({ onSuccess, onCancel }: AuthorityDeclarationFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    representativeName: '',
    designation: '',
    businessEmail: '',
    authorityBand: 'Micro (<$10K)' as BuyerAuthorityDeclaration['authorityBand'],
    declarationSigned: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = getSavedAuthorityDeclaration();
    if (saved) {
      setFormData({
        companyName: saved.companyName,
        representativeName: saved.representativeName,
        designation: saved.designation,
        businessEmail: saved.businessEmail,
        authorityBand: saved.authorityBand,
        declarationSigned: saved.declarationSigned
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName.trim()) return setError('Company name is required.');
    if (!formData.representativeName.trim()) return setError('Authorized representative name is required.');
    if (!formData.designation.trim()) return setError('Designation is required.');
    if (!formData.businessEmail.trim() || !formData.businessEmail.includes('@')) {
      return setError('A valid corporate email domain is required.');
    }
    if (!formData.declarationSigned) {
      return setError('You must sign the declaration checkbox to proceed.');
    }

    // Save declaration
    saveAuthorityDeclaration({
      ...formData,
      signedAt: new Date().toISOString()
    });

    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-text-primary">
      <div className="bg-navy/5 border border-border-default rounded-xl p-3.5 flex gap-2">
        <ShieldCheck size={18} className="text-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold uppercase tracking-wider text-navy text-[10px]">Buyer Verification & Authority Setup</h5>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            By declaring your purchasing authority band, manufacturers verify your buyer legitimacy and prioritize your enquiries over unverified leads.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-trust-red-bg text-trust-red border border-trust-red/20 p-2.5 rounded-lg flex items-center gap-1.5 font-semibold">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Corporate Entity Name *</label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
            placeholder="e.g. Global Sourcing Partners Ltd"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Corporate Email *</label>
          <input
            type="email"
            required
            value={formData.businessEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
            className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
            placeholder="e.g. procurement@globalsourcing.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Your Full Name *</label>
          <input
            type="text"
            required
            value={formData.representativeName}
            onChange={(e) => setFormData(prev => ({ ...prev, representativeName: e.target.value }))}
            className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
            placeholder="e.g. John Doe"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Professional Designation *</label>
          <input
            type="text"
            required
            value={formData.designation}
            onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
            className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
            placeholder="e.g. Senior Procurement Manager"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[9px] uppercase font-bold tracking-wider text-text-secondary">Sourcing Authority Limit Band *</label>
        <div className="grid grid-cols-2 gap-2">
          {['Micro (<$10K)', 'SME ($10K-$50K)', 'Mid-Market ($50K-$500K)', 'Enterprise ($500K+)'].map((band) => (
            <button
              key={band}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, authorityBand: band as BuyerAuthorityDeclaration['authorityBand'] }))}
              className={`p-2.5 rounded-lg border text-left font-semibold transition-colors cursor-pointer select-none ${
                formData.authorityBand === band
                  ? 'bg-navy text-white border-navy font-bold'
                  : 'bg-white text-text-secondary border-border-strong hover:bg-cream-secondary/20'
              }`}
            >
              {band}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cream border border-border-default rounded-xl p-3.5 space-y-2 pt-3">
        <Checkbox
          id="sign-check"
          checked={formData.declarationSigned}
          onChange={(e) => setFormData(prev => ({ ...prev, declarationSigned: e.target.checked }))}
          label="I hereby declare that I am an authorized representative of the corporate entity declared above, and hold procurement authority within the selected pricing band. I understand that false declarations will result in instant account suspension."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border-default/45">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border-strong rounded-lg text-text-secondary hover:bg-cream cursor-pointer font-bold transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-navy hover:bg-navy-light text-white px-6 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Check size={12} />
          <span>Sign & Verify Account</span>
        </button>
      </div>
    </form>
  );
}
