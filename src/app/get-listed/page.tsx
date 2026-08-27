"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle, Clock, AlertTriangle, Upload, X, MapPin, Calendar, HelpCircle } from 'lucide-react';
import { supplierApplicationSchema, isBusinessEmail } from '@/lib/validation';
import WhatsAppButton from '@/components/WhatsAppButton';
import LogoUploadField from '@/components/LogoUploadField';
import ProductImageGallery from '@/components/ProductImageGallery';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';

const primaryCategories = [
  { id: 'chemicals', label: 'Specialty Chemicals', subs: ['fine-chemicals', 'dyes-pigments', 'agro-chemicals', 'solvents'] },
  { id: 'pharma', label: 'Pharmaceuticals & APIs', subs: ['apis', 'intermediates', 'formulations', 'excipients'] },
  { id: 'textiles', label: 'Textiles & Apparel', subs: ['spinning', 'weaving', 'knitting', 'finishing'] },
  { id: 'industrial', label: 'Engineering & Brass', subs: ['machining', 'casting', 'forging', 'brass-components'] },
  { id: 'ceramics', label: 'Ceramics & Tiles', subs: ['floor-tiles', 'wall-tiles', 'sanitaryware'] },
];

const availableCertifications = ['ISO 9001', 'WHO-GMP', 'CE', 'GOTS', 'OEKO-TEX', 'REACH', 'FDA', 'BIS'];

export default function GetListedPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    sellerType: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    gstin: '',
    iec: '',
    category: '',
    city: '',
    gidcZone: '',
    fullAddress: '',
    preferredVisitDate: '',
    subcategories: [] as string[],
    certifications: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  // Clear subcategories if primary category changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, subcategories: [] }));
  }, [formData.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleToggleSubcategory = (sub: string) => {
    setFormData((prev) => {
      const active = prev.subcategories.includes(sub)
        ? prev.subcategories.filter((s) => s !== sub)
        : [...prev.subcategories, sub];
      
      if (errors.subcategories && active.length > 0) {
        setErrors((errs) => ({ ...errs, subcategories: '' }));
      }
      return { ...prev, subcategories: active };
    });
  };

  const handleToggleCert = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod validation check
    const validation = supplierApplicationSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      showToast("Please correct the validation errors in the form.", "error");
      
      // Scroll to first error field
      const firstErrorKey = Object.keys(fieldErrors)[0];
      if (firstErrorKey) {
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Strict Business Email check
    if (!isBusinessEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Free email domains are blocked. Please use your official company email address.',
      }));
      showToast("Free email domains are blocked.", "error");
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/get-listed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          for (const [field, msgs] of Object.entries(data.details)) {
            fieldErrors[field] = Array.isArray(msgs) ? (msgs as string[])[0] : String(msgs);
          }
          setErrors(fieldErrors);
        } else {
          setSubmitError(data.error || 'Submission failed. Please try again.');
        }
        showToast(data.error || 'Submission failed. Please check form details.', 'error');
        return;
      }
      setApplicationId(data.id);
      setIsSubmitted(true);
      showToast("Application submitted successfully! Your audit visit will be scheduled shortly.", "success");
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategoryObject = primaryCategories.find(c => c.id === formData.category);
  const { t, lang } = useTranslation();

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-border-default rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-navy/10 text-navy rounded-full flex items-center justify-center mx-auto border border-navy/5">
            <ShieldCheck size={24} className="text-gold" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wide">{t('gl_title')}</h1>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            {t('gl_subtitle')}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* SECTION 1: Company Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-bold text-navy border-b border-border-default pb-1 tracking-wider">{t('gl_sec_1')}</h3>
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Seller Type *</label>
                <select
                  name="sellerType"
                  value={formData.sellerType}
                  onChange={handleChange}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.sellerType ? 'border-trust-red' : 'border-border-strong'}`}
                >
                  <option value="">Select Seller Type</option>
                  <option value="direct_manufacturer">Direct Manufacturer (Owns & operates factory)</option>
                  <option value="contract_manufacturer">Contract Manufacturer (Produces for other brands)</option>
                  <option value="brand_owner">Brand Owner (Outsources production, owns IP)</option>
                  <option value="authorized_distributor">Authorized Distributor (Exclusively sells a brand's products)</option>
                  <option value="trading_company">Trading Company / Merchant Exporter (Sells on behalf of factories)</option>
                  <option value="wholesaler">Wholesaler (Bulk reseller, non-exclusive)</option>
                </select>
                {errors.sellerType && <p className="text-trust-red text-[10px] font-bold">{errors.sellerType}</p>}
                <p className="text-[10px] text-text-secondary leading-normal">
                  Your business type determines which verification credentials (e.g. Udyam cert, trademark, distribution agreement) are audited.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_company_name')}{lang !== 'en' && ' / Company Name *'}</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Gujarat Synthetics Ltd"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.companyName ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.companyName && <p className="text-trust-red text-[10px] font-bold">{errors.companyName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_category')}{lang !== 'en' && ' / Primary Industry Category *'}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.category ? 'border-trust-red' : 'border-border-strong'}`}
                  >
                    <option value="">Select category</option>
                    {primaryCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-trust-red text-[10px] font-bold">{errors.category}</p>}
                </div>
              </div>

              {/* Subcategories (Dynamic chips) */}
              {activeCategoryObject && (
                <div className="space-y-2 bg-cream/15 border border-border-default/45 p-3 rounded-lg">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_subcategories')}</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeCategoryObject.subs.map(sub => {
                      const isSelected = formData.subcategories.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleToggleSubcategory(sub)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-navy text-white border-navy'
                              : 'bg-white text-text-secondary border-border-strong hover:bg-cream-secondary'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                  {errors.subcategories && <p className="text-trust-red text-[10px] font-bold">{errors.subcategories}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_gstin')}{lang !== 'en' && ' / Gujarat GSTIN *'}</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="24ABCDE1234F1Z5"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.gstin ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.gstin && <p className="text-trust-red text-[10px] font-bold">{errors.gstin}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">Import Export Code (IEC) (Optional)</label>
                  <input
                    type="text"
                    name="iec"
                    value={formData.iec}
                    onChange={handleChange}
                    placeholder="10-digit Export Code"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.iec ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.iec && <p className="text-trust-red text-[10px] font-bold">{errors.iec}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 2: Location & Address */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs uppercase font-bold text-navy border-b border-border-default pb-1 tracking-wider">{t('gl_sec_2')}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_city')}{lang !== 'en' && ' / City *'}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Ahmedabad, Morbi"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.city ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.city && <p className="text-trust-red text-[10px] font-bold">{errors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_gidc')}{lang !== 'en' && ' / GIDC Industrial Zone'}</label>
                  <input
                    type="text"
                    name="gidcZone"
                    value={formData.gidcZone}
                    onChange={handleChange}
                    placeholder="e.g. Vatva GIDC, Chitra GIDC"
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_address')}{lang !== 'en' && ' / Full Plant Physical Address *'}</label>
                <textarea
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleChange}
                  placeholder="Plot No, Street details, Area, Landmark and PIN code"
                  rows={2}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy resize-none ${errors.fullAddress ? 'border-trust-red' : 'border-border-strong'}`}
                />
                {errors.fullAddress && <p className="text-trust-red text-[10px] font-bold">{errors.fullAddress}</p>}
              </div>
            </div>

            {/* SECTION 3: Contact & Visit Scheduling */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs uppercase font-bold text-navy border-b border-border-default pb-1 tracking-wider">{t('gl_sec_3')}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_contact_name')}{lang !== 'en' && ' / Contact Person Name *'}</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Patel"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.contactName ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.contactName && <p className="text-trust-red text-[10px] font-bold">{errors.contactName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_email')}{lang !== 'en' && ' / Business Email *'}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ramesh@company.com"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.email ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.email && <p className="text-trust-red text-[10px] font-bold leading-normal">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_phone')}{lang !== 'en' && ' / Registered Mobile Number *'}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.phone ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.phone && <p className="text-trust-red text-[10px] font-bold">{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_whatsapp')}{lang !== 'en' && ' / WhatsApp Business Number'}</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="Same as phone or different"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.whatsapp ? 'border-trust-red' : 'border-border-strong'}`}
                  />
                  {errors.whatsapp && <p className="text-trust-red text-[10px] font-bold">{errors.whatsapp}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.sellerType === 'direct_manufacturer' || formData.sellerType === 'contract_manufacturer') && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                      Preferred Auditor Inspection Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="preferredVisitDate"
                      value={formData.preferredVisitDate}
                      onChange={handleChange}
                      className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-navy ${errors.preferredVisitDate ? 'border-trust-red' : 'border-border-strong'}`}
                    />
                    {errors.preferredVisitDate && <p className="text-trust-red text-[10px] font-bold">{errors.preferredVisitDate}</p>}
                    <p className="text-[9px] text-text-secondary">
                      Required only for scheduling premium on-site physical audits.
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">{t('gl_certifications')}</label>
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {availableCertifications.map(cert => {
                      const isSelected = formData.certifications.includes(cert);
                      return (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => handleToggleCert(cert)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-navy text-white border-navy'
                              : 'bg-white text-text-secondary border-border-strong hover:bg-cream-secondary'
                          }`}
                        >
                          {cert}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Verification Media Assets */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs uppercase font-bold text-navy border-b border-border-default pb-1 tracking-wider">{t('gl_sec_4')}</h3>
              
              <LogoUploadField
                companyName={formData.companyName || "Your Factory"}
                logoUrl={logoUrl}
                onChange={setLogoUrl}
                onRemove={() => setLogoUrl('')}
              />

              <ProductImageGallery
                images={galleryImages}
                onChange={setGalleryImages}
              />
            </div>

            {submitError && (
              <div className="bg-trust-red-bg text-trust-red text-xs font-semibold p-3 rounded-lg border border-trust-red/15">
                {submitError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-navy hover:bg-navy-light text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none disabled:opacity-50 text-center">
              {isSubmitting ? t('gl_btn_submitting') : t('gl_btn_submit')}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 bg-trust-green-bg text-trust-green rounded-full flex items-center justify-center mx-auto border border-trust-green/20">
              <CheckCircle size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold uppercase tracking-wider text-text-primary">Application Received</h2>
              {applicationId && (
                <div className="text-xs font-mono text-navy font-bold bg-cream border border-border-default/40 p-2 rounded-lg">
                  Application ID: {applicationId}
                </div>
              )}
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                Thank you! Your business credentials will be verified automatically within 24 hours. You'll receive your Business Verified badge and status updates via WhatsApp.
              </p>
              <div className="bg-trust-green-bg border border-trust-green/20 text-trust-green text-[11px] font-medium p-3 rounded-lg max-w-md mx-auto flex items-center gap-2">
                <span className="text-sm">💬</span>
                <span className="text-left leading-normal">We've sent your application receipt number and onboarding progress timeline to your WhatsApp number <strong>{formData.whatsapp || formData.phone || '+91-XXXX'}</strong>.</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/for-suppliers')}
              className="bg-cream border border-border-strong text-navy px-6 py-2 rounded-lg text-xs font-bold transition-all hover:bg-cream-secondary"
            >
              Back to Portal
            </button>
          </div>
        )}
      </div>

      {/* Support Section */}
      <div className="max-w-2xl mx-auto mt-6 text-center space-y-3">
        <p className="text-[11px] text-text-secondary">
          Having trouble with government registration IDs or certificates?
        </p>
        <div className="flex justify-center">
          <WhatsAppButton
            phoneNumber="+91 72084 32138"
            message="Hi! I am filling out the Supplier Audit form on Aartha and need assistance."
            label="Get Live Support on WhatsApp"
          />
        </div>
      </div>
    </div>
  );
}
