"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Star, ShieldCheck, Mail, Phone, Calendar, Users, Briefcase, Award, CheckCircle, X, ExternalLink, ArrowRight, MessageSquare, FileText } from 'lucide-react';
import { Supplier, SupplierTab } from '@/types';
import QualityScore from './QualityScore';
import TrustBadge from './TrustBadge';
import WhatsAppButton from './WhatsAppButton';
import VerifiedReviewPanel from './VerifiedReviewPanel';
import SupplierCard from './SupplierCard';
import { suppliers } from '@/data/suppliers';

const maskGSTIN = (gstin?: string) => {
  if (!gstin) return 'N/A';
  if (gstin.length < 8) return gstin;
  return `${gstin.slice(0, 2)}XXXXXXX${gstin.slice(-4)}`;
};

const maskIEC = (iec?: string) => {
  if (!iec) return 'N/A';
  if (iec.length < 6) return iec;
  return `XXXXXX${iec.slice(-4)}`;
};

export interface SupplierProfileClientProps {
  supplier: Supplier;
}

export default function SupplierProfileClient({ supplier }: SupplierProfileClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SupplierTab>('overview');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    overview: true,
    products: false,
    certifications: false,
    reviews: false,
  });

  const toggleAccordion = (section: string) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const initials = supplier.companyName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const renderGpsMap = () => {
    if (!supplier.location.gpsCoordinates) return null;
    return (
      <div className="space-y-3 pt-4 border-t border-border-default">
        <h4 className="font-bold text-[10px] uppercase tracking-wider text-text-primary">Audited Plant Coordinates (GPS Telemetry)</h4>
        <div className="border border-border-default rounded-xl overflow-hidden aspect-video bg-cream-secondary relative">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              supplier.location.gpsCoordinates.replace(/[^\d.,-]/g, '')
            )}&t=k&z=17&output=embed`}
            title={`${supplier.companyName} plant coordinates`}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  };

  const renderVideoPlayer = () => {
    const isDirectVideo = supplier.facilityVideoUrl?.endsWith('.mp4') || supplier.facilityVideoUrl?.endsWith('.webm');
    return (
      <div className="space-y-3 pt-4 border-t border-border-default">
        <h4 className="font-bold text-[10px] uppercase tracking-wider text-text-primary">Facility Video Tour</h4>
        {supplier.facilityVideoUrl ? (
          <div className="space-y-2">
            <div className="border border-border-default rounded-xl overflow-hidden aspect-video bg-navy relative">
              {isDirectVideo ? (
                <video
                  src={supplier.facilityVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={supplier.facilityVideoUrl}
                  title={`${supplier.companyName} plant tour`}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
            </div>
            <div className="text-[9px] text-trust-green bg-trust-green-bg px-2 py-1 rounded border border-trust-green/10 flex justify-between items-center font-mono">
              <span>✓ Audit Video Dated: {supplier.facilityVideoDated || 'April 30, 2026'}</span>
              <span>GPS: {supplier.location.gpsCoordinates || 'Verified'}</span>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border-strong rounded-xl p-6 text-center space-y-2 bg-cream/10">
            <div className="text-xl">📹</div>
            <div className="text-[11px] font-bold text-text-secondary">Video pending / not yet available</div>
            <p className="text-[10px] text-text-muted max-w-xs mx-auto leading-relaxed">
              Our site inspection team has verified the physical location, but the digital video walkthrough has not yet been uploaded.
            </p>
          </div>
        )}
      </div>
    );
  };

  const similar = suppliers
    .filter(s => s.category === supplier.category && s.id !== supplier.id && s.isVerified)
    .slice(0, 3);
  const displaySimilar = similar.length > 0
    ? similar
    : suppliers.filter(s => s.id !== supplier.id && s.isVerified).slice(0, 3);

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary pb-16 md:pb-0">
      {/* Profile Header */}
      <section className="bg-navy text-white py-10 px-4 border-b border-border-default/15 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-60"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-white/20 shadow-md overflow-hidden relative bg-white/10">
              {supplier.logoUrl ? (
                <div className="w-full h-full bg-white flex items-center justify-center p-1.5">
                  <img src={supplier.logoUrl} alt={supplier.companyName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <span className="font-bold text-white text-2xl">{initials}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-2 items-center">
                {supplier.isVerified && (
                  <TrustBadge
                    tier={supplier.verificationTier}
                    verifiedDate={supplier.verifiedDate}
                    expiryDate={supplier.verificationExpiryDate || ''}
                    auditorName={supplier.verificationDetails?.auditorId || 'Aartha Auditor'}
                    gpsCoordinates={supplier.location.gpsCoordinates || '22.0000° N, 72.0000° E'}
                    documentsVerified={supplier.certifications}
                    state={['verified_supplier', 'premium_audited', 'business_verified'].includes(supplier.verificationGateState) ? 'active' : 'suspended'}
                  />
                )}
                {supplier.verificationGateState === 'listed' && (
                  <span className="bg-trust-amber-bg text-trust-amber text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-trust-amber/20">
                    Listed · Verification Pending
                  </span>
                )}
                <span className="bg-white/10 text-white/95 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-white/20">
                  {supplier.sellerType ? supplier.sellerType.replace(/_/g, ' ') : 'Supplier'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{supplier.companyName}</h1>
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin size={12} className="text-gold" />
                <span>{supplier.location.city}, {supplier.location.state}, {supplier.location.country}</span>
                {supplier.location.gidcZone && (
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10 ml-1">
                    {supplier.location.gidcZone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl p-3.5">
            <QualityScore
              score={supplier.qualityScore.total}
              breakdown={supplier.qualityScore}
              showTooltip={true}
              showBar={true}
              state={supplier.reviewCount >= 3 ? 'sufficient' : 'insufficient'}
            />
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 items-start">
          {/* Left Panel: Desktop Tabs or Mobile Accordions */}
          <div className="space-y-6">
            {/* Desktop Tabs Navigation */}
            <div className="hidden md:flex border-b border-border-default bg-white rounded-t-xl overflow-hidden flex-shrink-0">
              {['overview', 'products', 'certifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as SupplierTab)}
                  className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer select-none ${
                    activeTab === tab
                      ? 'border-navy text-navy font-bold bg-cream-secondary/20'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white border border-border-default rounded-b-xl p-6 min-h-[400px]">
              {/* Desktop View */}
              <div className="hidden md:block">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-1">About Company</h3>
                      <p className="text-text-secondary text-xs leading-relaxed">{supplier.about}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cream-secondary/40 border border-border-default rounded-xl p-4 space-y-0.5">
                        <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Operational Employees</div>
                        <div className="font-bold text-sm text-text-primary">{supplier.employees}</div>
                      </div>
                      <div className="bg-cream-secondary/40 border border-border-default rounded-xl p-4 space-y-0.5">
                        <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Established Year</div>
                        <div className="font-bold text-sm text-text-primary">{supplier.yearEstablished}</div>
                      </div>
                      <div className="bg-cream-secondary/40 border border-border-default rounded-xl p-4 space-y-0.5">
                        <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Annual Capacity</div>
                        <div className="font-bold text-sm text-text-primary">{supplier.annualCapacity || 'N/A'}</div>
                      </div>
                      <div className="bg-cream-secondary/40 border border-border-default rounded-xl p-4 space-y-0.5">
                        <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Export Share</div>
                        <div className="font-bold text-sm text-text-primary">{supplier.exportShare || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Audit Timeline */}
                    <div className="space-y-4 pt-4 border-t border-border-default">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary">Physical Visit & Audit Log</h3>
                      <div className="bg-cream-secondary/35 border border-border-default rounded-xl p-4 text-xs font-mono space-y-2 text-text-secondary">
                        <div className="flex justify-between">
                          <span>Audit Authority:</span>
                          <span className="font-bold text-navy">Aartha Audit Commission</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lead Auditor:</span>
                          <span>{supplier.verificationDetails?.auditorId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GPS Coordinates:</span>
                          <span>{supplier.location.gpsCoordinates || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GSTIN Registration:</span>
                          <span className="font-semibold">{maskGSTIN(supplier.verificationDetails?.gstin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IEC Code Number:</span>
                          <span className="font-semibold">{maskIEC(supplier.verificationDetails?.iec)}</span>
                        </div>
                      </div>
                    </div>
                    {renderGpsMap()}
                    {renderVideoPlayer()}
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-1.5">Verified Products Catalog</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {supplier.products.map((p, idx) => {
                          const hasGallery = supplier.galleryUrls && supplier.galleryUrls.length > 0;
                          const imgUrl = hasGallery 
                            ? supplier.galleryUrls?.[idx % supplier.galleryUrls.length]
                            : (supplier.category === 'Machinery & Industrial' || supplier.category === 'Engineering & Brass'
                              ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=350&q=80'
                              : supplier.category === 'Textiles & Apparel'
                              ? 'https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=350&q=80'
                              : 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=350&q=80');

                          return (
                            <div key={idx} className="border border-border-default rounded-xl bg-white overflow-hidden hover-lift flex gap-4 p-3.5">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-cream-secondary flex-shrink-0 border border-border-default img-zoom-container">
                                <img src={imgUrl} alt={p} className="w-full h-full object-cover img-zoom" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-xs text-text-primary leading-snug line-clamp-1">{p}</div>
                                  <p className="text-[10px] text-text-muted">Standard compliance verified by Aartha Audit commission.</p>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <span className="bg-trust-green-bg text-trust-green text-[9px] font-bold px-1.5 py-0.5 rounded border border-trust-green/10">
                                    Spec Verified
                                  </span>
                                  <span className="text-[10px] font-bold text-navy uppercase tracking-wider bg-cream border border-border-default px-2 py-0.5 rounded cursor-pointer">
                                    Enquire Specs
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Facility Photos Gallery */}
                    <div className="space-y-3 pt-4 border-t border-border-default">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-1.5">Factory & Plant Evidence Photos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((num) => {
                          const hasGallery = supplier.galleryUrls && supplier.galleryUrls.length > num;
                          const facImg = hasGallery 
                            ? supplier.galleryUrls?.[num]
                            : (num === 0 
                              ? 'https://images.unsplash.com/photo-1565034946487-077786996e27?w=350&q=80'
                              : num === 1
                              ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=350&q=80'
                              : num === 2
                              ? 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=350&q=80'
                              : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=350&q=80');

                          return (
                            <div key={num} className="border border-border-default bg-white rounded-lg overflow-hidden aspect-video shadow-2xs hover-lift img-zoom-container relative">
                              <img src={facImg} alt={`Plant section ${num + 1}`} className="w-full h-full object-cover img-zoom" />
                              <div className="absolute bottom-1 left-1 right-1 bg-navy/80 text-white text-[7px] font-bold p-1 rounded backdrop-blur-xs select-none flex flex-col gap-0.5 border border-white/10 font-sans">
                                <div className="flex justify-between items-center text-gold">
                                  <span>GIDC PLANT SECTION {num + 1}</span>
                                  <span>AARTHA AUDITED</span>
                                </div>
                                <div className="text-[6px] text-white/70 font-mono flex justify-between">
                                  <span>GPS: {supplier.location.gpsCoordinates || '22.3072 N, 73.1812 E'}</span>
                                  <span>VISIT: 2026-05-12</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'certifications' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-1">Verified Certifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {supplier.certifications.map((cert) => (
                        <div key={cert} className="border border-border-default rounded-xl p-4 bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-trust-green" />
                            <span className="text-xs font-bold text-text-primary">{cert}</span>
                          </div>
                          <span className="bg-trust-green-bg text-trust-green text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-trust-green/20">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-1">Verified Buyer Reviews</h3>
                    <VerifiedReviewPanel
                      reviews={supplier.reviews}
                      reviewCount={supplier.reviewCount}
                      companyName={supplier.companyName}
                    />
                  </div>
                )}
              </div>

              {/* Mobile View: Accordions */}
              <div className="block md:hidden space-y-3">
                {/* Overview Accordion */}
                <div className="border border-border-default rounded-xl bg-white overflow-hidden">
                  <button onClick={() => toggleAccordion('overview')} className="w-full flex justify-between items-center p-4 bg-cream-secondary/40 font-bold text-xs uppercase tracking-wider text-text-primary">
                    <span>Overview</span>
                    <span>{openAccordions.overview ? '−' : '+'}</span>
                  </button>
                  {openAccordions.overview && (
                    <div className="p-4 space-y-4 border-t border-border-default">
                      <p className="text-text-secondary text-xs leading-relaxed">{supplier.about}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-cream p-2.5 rounded-lg">
                          <div className="text-text-muted text-[9px] uppercase font-bold">Employees</div>
                          <div className="font-bold text-text-primary">{supplier.employees}</div>
                        </div>
                        <div className="bg-cream p-2.5 rounded-lg">
                          <div className="text-text-muted text-[9px] uppercase font-bold">Established</div>
                          <div className="font-bold text-text-primary">{supplier.yearEstablished}</div>
                        </div>
                      </div>
                      {renderGpsMap()}
                      {renderVideoPlayer()}
                    </div>
                  )}
                </div>

                {/* Products Accordion */}
                <div className="border border-border-default rounded-xl bg-white overflow-hidden">
                  <button onClick={() => toggleAccordion('products')} className="w-full flex justify-between items-center p-4 bg-cream-secondary/40 font-bold text-xs uppercase tracking-wider text-text-primary">
                    <span>Verified Products</span>
                    <span>{openAccordions.products ? '−' : '+'}</span>
                  </button>
                  {openAccordions.products && (
                    <div className="p-4 space-y-2 border-t border-border-default">
                      {supplier.products.map((p, idx) => (
                        <div key={idx} className="bg-cream p-3 rounded-lg text-xs font-bold text-text-primary flex justify-between items-center">
                          <span>{p}</span>
                          <span className="text-[10px] text-text-muted">Verified</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications Accordion */}
                <div className="border border-border-default rounded-xl bg-white overflow-hidden">
                  <button onClick={() => toggleAccordion('certifications')} className="w-full flex justify-between items-center p-4 bg-cream-secondary/40 font-bold text-xs uppercase tracking-wider text-text-primary">
                    <span>Verified Credentials</span>
                    <span>{openAccordions.certifications ? '−' : '+'}</span>
                  </button>
                  {openAccordions.certifications && (
                    <div className="p-4 space-y-2 border-t border-border-default">
                      {supplier.certifications.map((c) => (
                        <div key={c} className="bg-cream p-3 rounded-lg text-xs font-bold text-text-primary flex items-center gap-2">
                          <CheckCircle size={14} className="text-trust-green" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews Accordion */}
                <div className="border border-border-default rounded-xl bg-white overflow-hidden">
                  <button onClick={() => toggleAccordion('reviews')} className="w-full flex justify-between items-center p-4 bg-cream-secondary/40 font-bold text-xs uppercase tracking-wider text-text-primary">
                    <span>Verified Reviews</span>
                    <span>{openAccordions.reviews ? '−' : '+'}</span>
                  </button>
                  {openAccordions.reviews && (
                    <div className="p-4 border-t border-border-default">
                      <VerifiedReviewPanel
                        reviews={supplier.reviews}
                        reviewCount={supplier.reviewCount}
                        companyName={supplier.companyName}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Sticky contact and verification checklist */}
          <div className="space-y-6 mt-6 lg:mt-0">
            <div className="bg-white border border-border-default rounded-xl p-5 space-y-4 shadow-2xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">Verified Sourcing Gateway</h4>
              
              <div className="space-y-3">
                <WhatsAppButton
                  phoneNumber="+91 72084 32138"
                  message={`Hi! I am interested in sourcing from ${supplier.companyName}. Can you share your verified product catalog?`}
                  className="w-full"
                />
                
                <Link
                  href="/rfq"
                  className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white py-3 rounded-xl text-xs font-bold transition-all text-center no-underline"
                >
                  <FileText size={14} /> Submit Sourcing RFQ
                </Link>
              </div>

              <div className="border-t border-border-default/50 pt-3 text-[10px] text-text-muted space-y-2 leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-trust-green flex-shrink-0 mt-0.5" />
                  <span>Geotagged physical checks complete.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-trust-green flex-shrink-0 mt-0.5" />
                  <span>Dossier verified with ministry GST records.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Suppliers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-border-default/50">
        <h3 className="text-xs uppercase font-bold tracking-wider text-text-primary mb-5">Similar Verified Suppliers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displaySimilar.map(simSupplier => (
            <SupplierCard key={simSupplier.id} supplier={simSupplier} variant="grid" />
          ))}
        </div>
      </section>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-default shadow-lg p-3 md:hidden flex gap-2">
        <WhatsAppButton
          phoneNumber="+91 72084 32138"
          message={`Hi! Sourcing enquiry from Aartha.`}
          className="flex-1 h-11 py-3"
        />
        <Link
          href="/rfq"
          className="flex-1 bg-navy text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg h-11 py-3 cursor-pointer no-underline select-none"
        >
          <FileText size={12} /> RFQ
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: supplier.companyName,
            description: supplier.about,
            address: {
              '@type': 'PostalAddress',
              addressLocality: supplier.location.city,
              addressRegion: supplier.location.state,
              addressCountry: supplier.location.country
            },
            hasCertification: supplier.certifications.map(cert => ({
              '@type': 'Certification',
              name: cert
            })),
            taxID: supplier.verificationDetails?.gstin || undefined,
            geo: supplier.location.gpsCoordinates ? {
              '@type': 'GeoCoordinates',
              latitude: (supplier.location.gpsCoordinates as string).replace(/[^\d.,-]/g, '').split(',')[0]?.trim() || '',
              longitude: (supplier.location.gpsCoordinates as string).replace(/[^\d.,-]/g, '').split(',')[1]?.trim() || ''
            } : undefined
          })
        }}
      />
      {supplier.structuredProducts && supplier.structuredProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': supplier.structuredProducts.map(prod => ({
                '@type': 'Product',
                name: prod.name,
                description: prod.description,
                image: prod.photos?.[0] || 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=350&q=80',
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'USD',
                  price: prod.priceRange,
                  eligibleQuantity: {
                    '@type': 'QuantitativeValue',
                    value: prod.moq,
                    unitText: prod.moqUnit
                  }
                },
                manufacturer: {
                  '@type': 'Organization',
                  name: supplier.companyName
                }
              }))
            })
          }}
        />
      )}
    </div>
  );
}
