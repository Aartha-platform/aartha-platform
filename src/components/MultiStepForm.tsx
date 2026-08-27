import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { RFQFormData } from '../types';
import { isBusinessEmail } from '../lib/validation';
import { useTranslation } from '@/hooks/useTranslation';

interface MultiStepFormProps {
  currentStep: number;
  formData: RFQFormData;
  onStepChange: (step: number) => void;
  onFormDataChange: (data: Partial<RFQFormData>) => void;
  onSubmit: () => void;
}

const suggestedCategories = ['Machinery & Industrial', 'Electronics & Electrical', 'Chemicals & Materials', 'Packaging & Printing', 'Textiles & Apparel', 'Pharma & Healthcare'];
const units = ['kg', 'MT', 'liters', 'meters', 'sqm', 'pieces', 'units'];
const countries = ['India', 'USA', 'UAE', 'Germany', 'UK', 'Singapore', 'Australia', 'Canada'];

export default function MultiStepForm({
  currentStep,
  formData,
  onStepChange,
  onFormDataChange,
  onSubmit
}: MultiStepFormProps) {
  const { lang } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(
      (f) => f.size <= 10 * 1024 * 1024 && ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)
    );
    onFormDataChange({ images: [...formData.images, ...validFiles] });
  };

  const removeFile = (index: number) => {
    const updated = formData.images.filter((_, i) => i !== index);
    onFormDataChange({ images: updated });
  };

  // Validate step fields client-side before proceeding
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.product.trim()) newErrors.product = 'Product name is required.';
      if (!formData.description.trim()) newErrors.description = 'Please describe your requirement.';
      if (!formData.category) newErrors.category = 'Please select a category.';
    } else if (step === 2) {
      if (!formData.quantity.trim() || Number(formData.quantity) <= 0) newErrors.quantity = 'Please enter a valid quantity.';
      if (!formData.unit) newErrors.unit = 'Please select a unit of measurement.';
    } else if (step === 3) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required.';
      if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required.';
      if (!formData.country) newErrors.country = 'Please select your country.';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
      
      const email = formData.email.trim();
      if (!email) {
        newErrors.email = 'Email address is required.';
      } else if (!isBusinessEmail(email)) {
        newErrors.email = 'Free email addresses (Gmail, Yahoo, etc.) are blocked. Use a company/business domain.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (nextStep: number) => {
    if (validateStep(currentStep)) {
      onStepChange(nextStep);
    }
  };

  const handleFormSubmit = () => {
    if (validateStep(3)) {
      onSubmit();
    }
  };

  return (
    <div className="font-sans text-text-primary pb-16 md:pb-0">
      {/* Step 1: Product Details */}
      {currentStep === 1 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Product name *{lang !== 'en' && ' / उत्पाद का नाम'}</label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => {
                onFormDataChange({ product: e.target.value });
                if (errors.product) setErrors(prev => ({ ...prev, product: '' }));
              }}
              placeholder="e.g. WHO-GMP Paracetamol API USP"
              className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white ${errors.product ? 'border-trust-red' : 'border-border-strong'}`}
            />
            {errors.product && <p className="text-trust-red text-[10px] font-bold">{errors.product}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              Requirement Description *{lang !== 'en' && ' / आवश्यकता विवरण'}
              <span className="float-right text-text-muted font-normal text-[10px] normal-case">{formData.description.length}/1000</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  onFormDataChange({ description: e.target.value });
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              rows={4}
              placeholder="Provide exact material specs, packing requirements, delivery terms..."
              className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white resize-none ${errors.description ? 'border-trust-red' : 'border-border-strong'}`}
            />
            {errors.description && <p className="text-trust-red text-[10px] font-bold">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Select Industry Category *{lang !== 'en' && ' / उद्योग श्रेणी'}</label>
            <div className="flex flex-wrap gap-1.5">
              {suggestedCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onFormDataChange({ category: cat });
                    if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                    formData.category === cat
                      ? 'bg-navy text-white border-navy shadow-sm'
                      : 'bg-white text-text-secondary border-border-strong hover:bg-cream-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-trust-red text-[10px] font-bold">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Attachment Documents (PDF / Drawings / Specifications){lang !== 'en' && ' / संलग्न दस्तावेज़'}</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-navy bg-trust-blue-bg/30' : 'border-border-strong hover:border-navy hover:bg-cream-secondary/20'
              }`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload size={20} className="mx-auto text-text-muted mb-2 animate-pulse" />
              <p className="text-xs text-text-secondary font-bold">Drag & drop spec sheets or <span className="text-navy font-bold hover:underline">click to browse</span></p>
              <p className="text-[10px] text-text-muted mt-1">PDF, JPG, PNG — up to 10MB each</p>
              <input id="file-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
            </div>
            {formData.images.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.images.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-cream-secondary border border-border-default px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <span className="text-text-primary truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-text-muted hover:text-trust-red ml-2 cursor-pointer select-none">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border-default/50 md:static fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default shadow-lg p-3 md:shadow-none md:p-0 flex justify-end items-center">
            <button
              onClick={() => handleNext(2)}
              className="bg-navy hover:bg-navy-light text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none h-11 min-h-[44px] flex items-center justify-center"
            >
              Quantity & Specs →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Quantity & Specs */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Quantity *{lang !== 'en' && ' / मात्रा'}</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  onFormDataChange({ quantity: e.target.value });
                  if (errors.quantity) setErrors(prev => ({ ...prev, quantity: '' }));
                }}
                placeholder="e.g. 1000"
                className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white ${errors.quantity ? 'border-trust-red' : 'border-border-strong'}`}
              />
              {errors.quantity && <p className="text-trust-red text-[10px] font-bold">{errors.quantity}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Unit *{lang !== 'en' && ' / इकाई'}</label>
              <select
                value={formData.unit}
                onChange={(e) => {
                  onFormDataChange({ unit: e.target.value });
                  if (errors.unit) setErrors(prev => ({ ...prev, unit: '' }));
                }}
                className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white cursor-pointer ${errors.unit ? 'border-trust-red' : 'border-border-strong'}`}
              >
                <option value="">Select unit</option>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <p className="text-trust-red text-[10px] font-bold">{errors.unit}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Target Price (Optional){lang !== 'en' && ' / लक्षित मूल्य (वैकल्पिक)'}</label>
            <input
              type="text"
              value={formData.targetPrice}
              onChange={(e) => onFormDataChange({ targetPrice: e.target.value })}
              placeholder="e.g. $3.50 per kg"
              className="w-full border border-border-strong rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Specifications / Packing requirements{lang !== 'en' && ' / विनिर्देश और पैकिंग (वैकल्पिक)'}</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => onFormDataChange({ specifications: e.target.value })}
              rows={5}
              placeholder="Add parameters like particle size, packaging format, humidity, container type..."
              className="w-full border border-border-strong rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-border-default/50 md:static fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default shadow-lg p-3 md:shadow-none md:p-0 flex justify-between items-center md:justify-end gap-4">
            <button onClick={() => onStepChange(1)} className="text-text-muted hover:text-navy text-xs font-bold cursor-pointer select-none h-11 min-h-[44px] flex items-center px-4">← Back</button>
            <button
              onClick={() => handleNext(3)}
              className="bg-navy hover:bg-navy-light text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none h-11 min-h-[44px] flex items-center justify-center"
            >
              Contact Details →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Company & Contact */}
      {currentStep === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Company Name *{lang !== 'en' && ' / कंपनी का नाम'}</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => {
                  onFormDataChange({ companyName: e.target.value });
                  if (errors.companyName) setErrors(prev => ({ ...prev, companyName: '' }));
                }}
                placeholder="Mehta Enterprises Ltd."
                className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white ${errors.companyName ? 'border-trust-red' : 'border-border-strong'}`}
              />
              {errors.companyName && <p className="text-trust-red text-[10px] font-bold">{errors.companyName}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Contact Name *{lang !== 'en' && ' / संपर्क व्यक्ति का नाम'}</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => {
                  onFormDataChange({ contactName: e.target.value });
                  if (errors.contactName) setErrors(prev => ({ ...prev, contactName: '' }));
                }}
                placeholder="Rahul Mehta"
                className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white ${errors.contactName ? 'border-trust-red' : 'border-border-strong'}`}
              />
              {errors.contactName && <p className="text-trust-red text-[10px] font-bold">{errors.contactName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Business Email * (No free email){lang !== 'en' && ' / व्यावसायिक ईमेल'}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  onFormDataChange({ email: e.target.value });
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="rahul.mehta@mehta.com"
                className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white ${errors.email ? 'border-trust-red' : 'border-border-strong'}`}
              />
              {errors.email && <p className="text-trust-red text-[10px] font-bold leading-relaxed">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Phone Number *{lang !== 'en' && ' / मोबाइल नंबर'}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  onFormDataChange({ phone: e.target.value });
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                }}
                placeholder="+1 555-0199"
                className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white ${errors.phone ? 'border-trust-red' : 'border-border-strong'}`}
              />
              {errors.phone && <p className="text-trust-red text-[10px] font-bold">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Country *{lang !== 'en' && ' / देश'}</label>
              <select
                value={formData.country}
                onChange={(e) => {
                  onFormDataChange({ country: e.target.value });
                  if (errors.country) setErrors(prev => ({ ...prev, country: '' }));
                }}
                className={`w-full border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-navy bg-white cursor-pointer ${errors.country ? 'border-trust-red' : 'border-border-strong'}`}
              >
                <option value="">Select country</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className="text-trust-red text-[10px] font-bold">{errors.country}</p>}
            </div>
          </div>

          <div className="pt-3 border-t border-border-default/50 md:static fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default shadow-lg p-3 md:shadow-none md:p-0 flex justify-between items-center md:justify-end gap-4">
            <button onClick={() => onStepChange(2)} className="text-text-muted hover:text-navy text-xs font-bold cursor-pointer select-none h-11 min-h-[44px] flex items-center px-4">← Back</button>
            <button
              onClick={handleFormSubmit}
              className="bg-gold hover:bg-gold-hover text-white px-8 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none h-11 min-h-[44px] flex items-center justify-center"
            >
              Submit Sourcing Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
