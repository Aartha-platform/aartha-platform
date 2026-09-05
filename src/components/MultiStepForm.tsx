"use client";

import { useState } from 'react';
import { 
  Upload, X, Check, HelpCircle, FileText, ArrowRight, 
  ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 
} from 'lucide-react';
import { RFQFormData } from '../types';

interface MultiStepFormProps {
  currentStep: number;
  formData: RFQFormData;
  onStepChange: (step: number) => void;
  onFormDataChange: (data: Partial<RFQFormData>) => void;
  onSubmit: () => void;
}

const partFamilyPresets = [
  { id: 'bracket', name: 'Brackets & Mounts', desc: 'L-brackets, gussets, sensor brackets' },
  { id: 'plate', name: 'Mounting & Base Plates', desc: 'Flange plates, DIN mounts, adapter plates' },
  { id: 'cover', name: 'Covers & Guard Panels', desc: 'Chassis covers, inspection plates, louvers' },
  { id: 'housing', name: 'Housings & Enclosures', desc: 'Sheet metal chassis, controller boxes' },
  { id: 'custom', name: 'Custom Fabrication', desc: 'Multi-bend or prototype sheet metal assembly' },
];

const materialOptions = [
  { id: 'SS304', label: 'Stainless Steel 304', sub: 'Corrosion resistant, food/medical grade' },
  { id: 'MS_CRCA', label: 'Mild Steel (CRCA / HR)', sub: 'High strength, economical, easy to paint' },
  { id: 'AL6061', label: 'Aluminum (5052 / 6061)', sub: 'Lightweight, aerospace & robotics' },
  { id: 'NOT_SURE', label: 'Not sure — recommend for me', sub: 'Aartha engineering will suggest based on load & environment' },
];

const processOptions = [
  { id: 'LASER_BEND', label: 'CNC Laser Cut + Press Brake Bending', sub: 'Precision cut sheets folded to drawing specifications' },
  { id: 'LASER_ONLY', label: 'CNC Laser Cutting Only (Flat)', sub: 'Flat profiles, base plates, cut-outs, washers' },
  { id: 'WELDED', label: 'Fabricated & Welded Assembly', sub: 'Laser, bend, MIG/TIG welding with hardware insertion' },
  { id: 'NOT_SURE', label: 'Help me choose the process', sub: 'We evaluate manufacturability from your drawing' },
];

const finishOptions = [
  { id: 'MILL', label: 'Mill / Deburred Finish (Raw)' },
  { id: 'POWDER', label: 'Powder Coated (Matte / Gloss)' },
  { id: 'ZINC', label: 'Zinc Plated (Clear / Yellow)' },
  { id: 'ANODIZED', label: 'Anodized (for Aluminum)' },
  { id: 'NOT_SURE', label: 'Not sure / Need recommendation' },
];

const quantityPresets = ['5 pcs (Prototype)', '25 pcs (Batch)', '100 pcs (Pilot)', '500 pcs (Production)'];

const timelineOptions = [
  { id: 'urgent', label: 'Rapid Prototype (1–2 weeks)', desc: 'Prioritized queue for tight project deadlines' },
  { id: 'standard', label: 'Standard Production (2–4 weeks)', desc: 'Optimal balance of cost and speed' },
  { id: 'flexible', label: 'Flexible / Cost-first', desc: 'Longer window for maximum batch economy' },
];

export default function MultiStepForm({
  currentStep,
  formData,
  onStepChange,
  onFormDataChange,
  onSubmit,
}: MultiStepFormProps) {
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extracted technical state helpers from specifications string
  const getSpecField = (key: string): string => {
    const match = formData.specifications?.match(new RegExp(`${key}:\\s*([^;]+)`));
    return match ? match[1].trim() : '';
  };

  const updateSpecField = (key: string, value: string) => {
    const currentSpecs = formData.specifications || '';
    const regex = new RegExp(`${key}:\\s*[^;]+;?`);
    const newEntry = `${key}: ${value}; `;
    const updated = regex.test(currentSpecs) 
      ? currentSpecs.replace(regex, newEntry) 
      : `${currentSpecs} ${newEntry}`.trim();
    onFormDataChange({ specifications: updated });
  };

  const selectedMaterial = getSpecField('Material') || '';
  const selectedProcess = getSpecField('Process') || '';
  const selectedFinish = getSpecField('Finish') || '';
  const selectedTimeline = getSpecField('Timeline') || 'standard';

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(
      (f) => f.size <= 25 * 1024 * 1024
    );
    onFormDataChange({ images: [...formData.images, ...validFiles] });
  };

  const removeFile = (index: number) => {
    const updated = formData.images.filter((_, i) => i !== index);
    onFormDataChange({ images: updated });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.product.trim()) {
        newErrors.product = 'Please provide a part name or brief title.';
      }
      if (!formData.category) {
        onFormDataChange({ category: 'Engineering & Industrial Machinery' });
      }
    } else if (step === 2) {
      // Step 2: Drawing & Specs. We don't hard-block if files are missing (an idea/description is allowed),
      // but if neither description nor file exists, prompt user.
      if (!formData.description.trim() && formData.images.length === 0) {
        newErrors.description = 'Please either upload a drawing/sketch or write a brief description of your part.';
      }
    } else if (step === 3) {
      // Step 3: Quantity & Technical preferences
      if (!formData.quantity.trim() || Number(formData.quantity) <= 0) {
        newErrors.quantity = 'Please specify how many pieces you need.';
      }
    } else if (step === 4) {
      // Step 4: Contact & Destination
      if (!formData.contactName.trim()) {
        newErrors.contactName = 'Your name is required.';
      }
      const email = formData.email.trim();
      if (!email) {
        newErrors.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required for engineering follow-up.';
      }
      if (!formData.country) {
        onFormDataChange({ country: 'India' });
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
    if (validateStep(4)) {
      onSubmit();
    }
  };

  return (
    <div className="font-sans text-[#0f172a]">
      {/* =========================================================
          STEP 1: What are you building?
          ========================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#2563eb]">Step 01 / 04</span>
            <h3 className="text-xl font-bold text-[#0f172a] mt-1">What are you trying to build?</h3>
            <p className="text-xs text-[#64748b] mt-1">
              Select the closest part family or start with a custom requirement.
            </p>
          </div>

          {/* Quick part family presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              Part Family
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {partFamilyPresets.map((item) => {
                const isSelected = formData.product.toLowerCase().includes(item.name.toLowerCase()) ||
                  formData.description.toLowerCase().includes(item.name.toLowerCase());
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!formData.product || partFamilyPresets.some(p => p.name === formData.product)) {
                        onFormDataChange({ product: item.name, category: 'Engineering & Industrial Machinery' });
                      }
                      updateSpecField('Family', item.name);
                      if (errors.product) setErrors((prev) => ({ ...prev, product: '' }));
                    }}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0f172a]">{item.name}</span>
                      {isSelected && <Check size={14} className="text-[#2563eb]" />}
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Part Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              Part Name or Project Title *
            </label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => {
                onFormDataChange({ product: e.target.value });
                if (errors.product) setErrors((prev) => ({ ...prev, product: '' }));
              }}
              placeholder="e.g. Sensor Mounting Bracket, Motor Housing Plate, Chassis Cover"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white transition-all ${
                errors.product ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
              }`}
            />
            {errors.product && <p className="text-[#ef4444] text-xs font-medium">{errors.product}</p>}
          </div>

          {/* Plain English Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              Describe the part in your own words (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                onFormDataChange({ description: e.target.value });
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              rows={3}
              placeholder="Tell us what this part does, how it mounts, critical clearances, or what help you need from Aartha engineering..."
              className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white resize-none"
            />
          </div>

          <div className="pt-4 border-t border-[#e2e8f0] flex justify-end">
            <button
              type="button"
              onClick={() => handleNext(2)}
              className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <span>Next: Upload Drawings</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 2: Upload Drawing, CAD, or Sketch
          ========================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#2563eb]">Step 02 / 04</span>
            <h3 className="text-xl font-bold text-[#0f172a] mt-1">Upload CAD, Drawing, or Sketch</h3>
            <p className="text-xs text-[#64748b] mt-1">
              Upload whatever files you have. 2D PDF, 3D STEP, DXF, hand sketches, or reference photos are all welcome.
            </p>
          </div>

          {/* Drag & drop upload box */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files); }}
            onClick={() => document.getElementById('rfq-file-upload')?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragOver 
                ? 'border-[#2563eb] bg-[#eff6ff]' 
                : 'border-[#cbd5e1] hover:border-[#2563eb] bg-[#f8fafc] hover:bg-white'
            }`}
          >
            <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Upload size={22} className="text-[#2563eb]" />
            </div>
            <p className="text-sm font-bold text-[#0f172a]">
              Drag and drop your drawing or <span className="text-[#2563eb] underline">browse files</span>
            </p>
            <p className="text-xs text-[#64748b] mt-1.5 max-w-sm mx-auto">
              Accepts STEP, STP, DXF, DWG, PDF, PNG, JPG, or ZIP (Up to 25MB per file)
            </p>
            <input
              id="rfq-file-upload"
              type="file"
              accept=".step,.stp,.dxf,.dwg,.pdf,.png,.jpg,.jpeg,.zip"
              multiple
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </div>

          {/* Uploaded files list */}
          {formData.images.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                Attached Files ({formData.images.length})
              </span>
              <div className="space-y-1.5">
                {formData.images.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white border border-[#e2e8f0] px-4 py-2.5 rounded-xl text-xs font-medium"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText size={16} className="text-[#2563eb] shrink-0" />
                      <span className="truncate text-[#0f172a] font-semibold">{file.name}</span>
                      <span className="text-[11px] text-[#94a3b8] shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-[#94a3b8] hover:text-[#ef4444] p-1 transition-colors cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reassurance for founders without CAD */}
          <div className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl p-4 flex items-start gap-3 text-xs text-[#475569]">
            <HelpCircle size={16} className="text-[#2563eb] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0f172a]">Don’t have a full 3D CAD or standard drawing yet?</span>
              <p className="mt-0.5 leading-relaxed">
                That is completely fine. You can upload a dimensioned hand sketch or reference photo. Our engineering desk will review your concept and help turn it into a production-ready DFM drawing.
              </p>
            </div>
          </div>

          {errors.description && (
            <p className="text-[#ef4444] text-xs font-medium">{errors.description}</p>
          )}

          <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onStepChange(1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-[#0f172a] px-3 py-2 cursor-pointer transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => handleNext(3)}
              className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <span>Next: Quantity & Materials</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 3: Quantity & Known Specifications
          ("I don't know" as first-class option)
          ========================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#2563eb]">Step 03 / 04</span>
            <h3 className="text-xl font-bold text-[#0f172a] mt-1">Quantity & Technical Preferences</h3>
            <p className="text-xs text-[#64748b] mt-1">
              Select what you know. If you are not sure about material, finish, or tolerances, choose "Not sure" and Aartha engineering will guide you.
            </p>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              How many pieces do you need? *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {quantityPresets.map((preset) => {
                const qtyVal = preset.split(' ')[0];
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      onFormDataChange({ quantity: qtyVal, unit: 'Pieces' });
                      if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.quantity === qtyVal
                        ? 'bg-[#0f172a] text-white border-[#0f172a]'
                        : 'bg-white text-[#475569] border-[#e2e8f0] hover:border-[#cbd5e1]'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => {
                  onFormDataChange({ quantity: e.target.value, unit: 'Pieces' });
                  if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                }}
                placeholder="Or type custom quantity (e.g. 50)"
                className={`w-full sm:w-64 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white ${
                  errors.quantity ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
                }`}
              />
              <span className="text-xs font-bold text-[#64748b]">Pieces</span>
            </div>
            {errors.quantity && <p className="text-[#ef4444] text-xs font-medium">{errors.quantity}</p>}
          </div>

          {/* Material Selection with "Not sure" */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              Material Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {materialOptions.map((mat) => {
                const isSelected = selectedMaterial === mat.id || (mat.id === 'NOT_SURE' && selectedMaterial === 'NOT_SURE');
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => updateSpecField('Material', mat.id)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mat.id === 'NOT_SURE' ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                        {mat.label}
                      </span>
                      {isSelected && <Check size={14} className="text-[#2563eb]" />}
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{mat.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Process Selection with "Not sure" */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              Manufacturing Process
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {processOptions.map((proc) => {
                const isSelected = selectedProcess === proc.id;
                return (
                  <button
                    key={proc.id}
                    type="button"
                    onClick={() => updateSpecField('Process', proc.id)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] shadow-xs'
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${proc.id === 'NOT_SURE' ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                        {proc.label}
                      </span>
                      {isSelected && <Check size={14} className="text-[#2563eb]" />}
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{proc.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Surface Finish */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              Surface Finish
            </label>
            <div className="flex flex-wrap gap-2">
              {finishOptions.map((fin) => {
                const isSelected = selectedFinish === fin.id;
                return (
                  <button
                    key={fin.id}
                    type="button"
                    onClick={() => updateSpecField('Finish', fin.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0f172a] text-white border-[#0f172a]'
                        : 'bg-white text-[#475569] border-[#e2e8f0] hover:border-[#cbd5e1]'
                    }`}
                  >
                    {fin.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Timeline Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
              Target Timeline
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {timelineOptions.map((t) => {
                const isSelected = selectedTimeline === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateSpecField('Timeline', t.id)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff]'
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#0f172a]">{t.label}</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onStepChange(2)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-[#0f172a] px-3 py-2 cursor-pointer transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => handleNext(4)}
              className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <span>Next: Contact Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 4: Contact Information & Destination
          ========================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#2563eb]">Step 04 / 04</span>
            <h3 className="text-xl font-bold text-[#0f172a] mt-1">Where should we deliver & who is this for?</h3>
            <p className="text-xs text-[#64748b] mt-1">
              All valid email domains (personal, startup, or corporate) are supported.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => {
                  onFormDataChange({ contactName: e.target.value });
                  if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: '' }));
                }}
                placeholder="e.g. Siddharth Rao"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white ${
                  errors.contactName ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
                }`}
              />
              {errors.contactName && <p className="text-[#ef4444] text-xs font-medium">{errors.contactName}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                Company / Project / Team Name (Optional)
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => onFormDataChange({ companyName: e.target.value })}
                placeholder="e.g. AeroDynamics / Hardware Labs / Independent"
                className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  onFormDataChange({ email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="founder@company.com or personal Gmail"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white ${
                  errors.email ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
                }`}
              />
              {errors.email && <p className="text-[#ef4444] text-xs font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  onFormDataChange({ phone: e.target.value });
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="+91 98765 43210"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white ${
                  errors.phone ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
                }`}
              />
              {errors.phone && <p className="text-[#ef4444] text-xs font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                Delivery City & Pincode
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru 560001, Pune 411001"
                onChange={(e) => updateSpecField('DeliveryCity', e.target.value)}
                className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                Destination Country
              </label>
              <select
                value={formData.country || 'India'}
                onChange={(e) => onFormDataChange({ country: e.target.value })}
                className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white cursor-pointer"
              >
                <option value="India">India (Domestic Freight)</option>
                <option value="USA">United States (Air/Ocean Cargo)</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="Germany">Germany / EU</option>
                <option value="UK">United Kingdom</option>
                <option value="Singapore">Singapore</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          {/* Trust strip */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748b]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#059669]" />
              <span>Mutual NDA Confidential. Drawings never publicly shared.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2563eb]" />
              <span>DFM check included before quotation.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onStepChange(3)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-[#0f172a] px-3 py-2 cursor-pointer transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Sparkles size={15} />
              <span>Submit RFQ for Engineering Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
