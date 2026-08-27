"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, CheckCircle, Shield, Factory, Layers } from 'lucide-react';
import { categories, categoryChecklists } from '@/data/categories';
import { suppliers } from '@/data/suppliers';
import SupplierCard from '@/components/SupplierCard';
import { useTranslation } from '@/hooks/useTranslation';

export default function CategoriesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0].id);
  const [selectedSubCatId, setSelectedSubCatId] = useState<string>(categories[0].subCategories[0]?.id || '');

  const activeCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];
  const activeSubCat = activeCategory.subCategories.find(sc => sc.id === selectedSubCatId) || activeCategory.subCategories[0];

  const displaySuppliers = suppliers.filter(s => {
    if (s.category === activeCategory.name || s.category === activeCategory.id) return true;
    if (activeSubCat && s.subcategories?.includes(activeSubCat.id)) return true;
    return false;
  }).slice(0, 8);

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary pb-16">
      {/* Header Banner */}
      <section className="bg-navy text-white py-12 px-4 border-b border-border-default/10">
        <div className="max-w-7xl mx-auto space-y-2 text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gold border border-white/10">
            <Shield size={14} />
            <span>Gujarat Industrial Cluster Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">
            Specialty Export Categories & Clusters
          </h1>
          <p className="text-white/70 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Browse verified Gujarat manufacturers organized by industry verticals, WHO-GMP & GOTS compliance standards, and GIDC industrial zones.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Category & Subcategory Explorer */}
        <section className="space-y-6">
          <div className="space-y-1 text-left border-b border-border-default pb-3">
            <h2 className="text-xl font-bold uppercase tracking-wider text-text-primary">Industry Verticals</h2>
            <p className="text-xs text-text-secondary">Select an industry to explore verified GIDC clusters and compliance standards.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Category Selector Tabs */}
            <div className="lg:col-span-4 space-y-2">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedSubCatId(cat.subCategories[0]?.id || '');
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white border-gold shadow-xs text-navy font-bold'
                        : 'bg-white/60 border-border-default hover:border-gold/30 text-text-primary'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs uppercase tracking-wider font-bold">{cat.name}</div>
                      <div className="text-[10px] text-text-muted">{cat.subCategories.length} Subcategories • {cat.supplierCount} Verified Suppliers</div>
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-gold' : 'opacity-40'} />
                  </button>
                );
              })}
            </div>

            {/* Subcategory & Cluster Intel Details */}
            <div className="lg:col-span-8 bg-white border border-border-default rounded-2xl p-6 shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">Subcategory Vertical Explorer</span>
                <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">{activeCategory.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">Verified GIDC manufacturing clusters & production verticals.</p>
              </div>

              {/* Subcategory Pills */}
              <div className="flex flex-wrap gap-2 border-t border-border-default/50 pt-4">
                {activeCategory.subCategories.map((sc) => {
                  const isSelected = sc.id === selectedSubCatId;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedSubCatId(sc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gold text-white shadow-xs'
                          : 'bg-cream-secondary text-text-secondary hover:bg-cream-secondary/80'
                      }`}
                    >
                      {sc.name}
                    </button>
                  );
                })}
              </div>

              {activeSubCat ? (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">{activeSubCat.name}</h3>
                    <p className="text-text-secondary text-xs leading-relaxed">{activeSubCat.description}</p>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-cream-secondary border border-border-default rounded-xl p-3 text-center">
                      <div className="text-gold font-bold text-base">{activeSubCat.supplierCount}</div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Total Suppliers</div>
                    </div>
                    <div className="bg-cream-secondary border border-border-default rounded-xl p-3 text-center">
                      <div className="text-gold font-bold text-base">{activeSubCat.activeBuyers}</div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Active Buyers</div>
                    </div>
                    <div className="bg-cream-secondary border border-border-default rounded-xl p-3 text-center">
                      <div className="text-gold font-bold text-base">{activeSubCat.rfqsThisMonth}</div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">RFQs This Month</div>
                    </div>
                  </div>

                  {/* Trust Verification Checklist */}
                  <div className="space-y-3 border-t border-border-default/50 pt-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <span>🛡</span>
                      <span>Corridor Quality Audit Checklist</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                      {(categoryChecklists[selectedCategoryId] || [
                        'GST registration validation and compliance check',
                        'IEC export license registration verification',
                        'Physical factory visit and geo-tag validation'
                      ]).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-trust-green font-bold flex-shrink-0">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-cream-secondary border border-border-default rounded-xl p-3 flex items-center justify-center text-text-muted text-[10px] uppercase font-bold tracking-wider">
                    Corridor Sourcing Target: Gujarat Cluster to Europe & USA Markets
                  </div>
                </div>
              ) : (
                <div className="text-text-muted text-center py-12 text-xs font-bold uppercase tracking-wider">Select a sub-category to view details</div>
              )}
            </div>
          </div>
        </section>

        {/* Top Suppliers in Category (ONLY GRID CONTAINER UPDATED) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary uppercase tracking-wide">Top Suppliers in Category</h2>
          {displaySuppliers.length === 0 ? (
            <div className="border border-border-default rounded-xl p-12 text-center text-text-muted bg-white">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-xs">No verified suppliers match your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displaySuppliers.map((s) => <SupplierCard key={s.id} supplier={s} variant="grid" />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
