"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, GitCompare } from 'lucide-react';
import SupplierCard from '@/components/SupplierCard';
import SlideOutPanel from '@/components/SlideOutPanel';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { SupplierCardSkeleton } from '@/components/SkeletonLoader';
import { useSupplierFilter, defaultFilter } from '@/hooks/useSupplierFilter';
import { suppliers } from '@/data/suppliers';
import { Supplier, SupplierFilterState, SupplierTab } from '@/types';
import Checkbox from '@/components/ui/Checkbox';

const ITEMS_PER_PAGE = 24;

const getSubcategories = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('chem')) {
    return ['All', 'Solvents', 'Intermediates', 'Catalysts', 'Polymers', 'Acids'];
  }
  if (normalized.includes('pharma') || normalized.includes('health')) {
    return ['All', 'APIs', 'Excipients', 'Formulations', 'Granules'];
  }
  if (normalized.includes('textile') || normalized.includes('apparel')) {
    return ['All', 'Woven Cotton', 'Polyester Yarns', 'Denim Fabrics', 'Knitted Fabric'];
  }
  if (normalized.includes('brass') || normalized.includes('engineering') || normalized.includes('machine')) {
    return ['All', 'CNC Parts', 'Brass Fittings', 'Valves', 'Castings', 'Fasteners'];
  }
  if (normalized.includes('ceramic') || normalized.includes('tile')) {
    return ['All', 'Vitrified Tiles', 'Sanitaryware', 'Porcelain', 'Wall Tiles'];
  }
  return [];
};

function SuppliersDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const searchParamQuery = searchParams?.get('search') || '';
  const categoryParamQuery = searchParams?.get('category') || '';

  const [keyword, setKeyword] = useState(searchParamQuery);
  const [appliedKeyword, setAppliedKeyword] = useState(searchParamQuery);
  const [filterState, setFilterState] = useState<SupplierFilterState>({
    ...defaultFilter,
    verifiedOnly: true, // Default ON!
    countries: categoryParamQuery ? [categoryParamQuery] : [],
  });
  const [appliedFilter, setAppliedFilter] = useState<SupplierFilterState>({
    ...defaultFilter,
    verifiedOnly: true, // Default ON!
    countries: categoryParamQuery ? [categoryParamQuery] : [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [slideOutOpen, setSlideOutOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<SupplierTab>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  useEffect(() => {
    setSelectedSubcategory('All');
  }, [categoryParamQuery, searchParamQuery]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [appliedFilter, appliedKeyword]);

  // Sync with search queries
  useEffect(() => {
    setKeyword(searchParamQuery);
    setAppliedKeyword(searchParamQuery);
    if (categoryParamQuery) {
      setFilterState(prev => ({ ...prev, countries: [categoryParamQuery] }));
      setAppliedFilter(prev => ({ ...prev, countries: [categoryParamQuery] }));
    }
  }, [searchParamQuery, categoryParamQuery]);

  const filteredSuppliers = useSupplierFilter(suppliers, appliedFilter, appliedKeyword);
  
  // ═══════════════════════════════════════════════════════════════════
  // PERMANENT RULE (AARTHA Architecture Directive):
  // Sort NEVER includes subscription tier, payment amount, or ad spend.
  // Quality Score formula: identity(25) + reputation(20) + certifications(25)
  // + behavior(20) + auditBonus(10) = 100
  // This is a STRUCTURAL decision, not a temporary choice.
  // ═══════════════════════════════════════════════════════════════════
  // Sort by Dynamic Quality Score (Default sort rule!)
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => b.qualityScore.total - a.qualityScore.total);

  const subcategoryFiltered = selectedSubcategory === 'All'
    ? sortedSuppliers
    : sortedSuppliers.filter(s => 
        s.products.some(p => p.toLowerCase().includes(selectedSubcategory.toLowerCase())) ||
        (s.about || '').toLowerCase().includes(selectedSubcategory.toLowerCase())
      );

  const totalPages = Math.ceil(subcategoryFiltered.length / ITEMS_PER_PAGE);
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = Math.min(pageStart + ITEMS_PER_PAGE, subcategoryFiltered.length);
  const paginated = subcategoryFiltered.slice(pageStart, pageEnd);

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleApplyFilters = () => {
    setAppliedFilter({ ...filterState });
    setAppliedKeyword(keyword);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  const handleSearchSubmit = (query: string) => {
    setKeyword(query);
    setAppliedKeyword(query);
    setCurrentPage(1);
  };

  const updateFilter = (patch: Partial<SupplierFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  };

  const handleEnquireClick = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setActiveTab('overview');
    setSlideOutOpen(true);
  };

  const compareSuppliers = suppliers.filter(s => compareList.includes(s.id));

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary">
      {/* Search & Header Section */}
      <section className="bg-navy text-white py-10 px-4 border-b border-border-default/15">
        <div className="max-w-7xl mx-auto space-y-5">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-wide">
              Verified Gujarat Manufacturers Directory
            </h1>
            <p className="text-white/70 text-xs mt-1 leading-relaxed">
              Physically visited, GPS inspected, WHO-GMP & ISO certified chemical and engineering corridor plants.
            </p>
          </div>
          <div className="max-w-3xl">
            <SearchBar
              placeholder="Search by products or companies (e.g. Paracetamol, Mehta Tools)..."
              onSearch={handleSearchSubmit}
              initialQuery={keyword}
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compare Toolbar */}
        {compareList.length > 0 && (
          <div className="mb-4 bg-navy text-white px-4 py-3 rounded-xl flex items-center justify-between border border-border-default/10 shadow-md">
            <div className="flex items-center gap-2">
              <GitCompare size={16} className="text-gold" />
              <span className="text-xs font-bold uppercase tracking-wider">Compare Active List ({compareList.length}/3 selected)</span>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setCompareList([])}
                className="text-xs text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-gold hover:bg-gold-hover text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Compare Side-by-Side
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex justify-between items-center bg-white p-3 rounded-lg border border-border-default">
            <span className="text-xs font-bold text-text-secondary">Filter Matches</span>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-1.5 bg-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              <SlidersHorizontal size={12} />
              <span>Filters</span>
            </button>
          </div>

          {/* Desktop Filter Panel (Left sidebar) */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white border border-border-default rounded-xl p-4 sticky top-20 space-y-5 shadow-2xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-2 pb-2 border-b border-border-default/50">
                <SlidersHorizontal size={14} className="text-gold" /> Filter Matches
              </h3>

              <div className="space-y-4 text-xs font-medium text-text-secondary">
                <Checkbox
                  checked={filterState.verifiedOnly}
                  onChange={(e) => updateFilter({ verifiedOnly: e.target.checked })}
                  label="Verified Only (Strict)"
                />

                <Checkbox
                  checked={filterState.tradeAssurance}
                  onChange={(e) => updateFilter({ tradeAssurance: e.target.checked })}
                  label="Aartha Protect Active"
                />

                <div className="space-y-1">
                  <label className="block text-text-muted text-[10px] uppercase font-bold tracking-wider">Industrial GIDC Cluster</label>
                  <select
                    className="w-full bg-white border border-border-strong rounded-lg px-2.5 py-2 text-xs focus:border-navy focus:outline-none cursor-pointer font-semibold"
                    value={filterState.countries[0] || ''}
                    onChange={(e) => updateFilter({ countries: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Zones</option>
                    <option value="Vatva GIDC">Vatva GIDC</option>
                    <option value="Nandesari GIDC">Nandesari GIDC</option>
                    <option value="Ankleshwar GIDC">Ankleshwar GIDC</option>
                    <option value="Panoli GIDC">Panoli GIDC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-text-muted text-[10px] uppercase font-bold tracking-wider">Certifications</label>
                  <select
                    className="w-full bg-white border border-border-strong rounded-lg px-2.5 py-2 text-xs focus:border-navy focus:outline-none cursor-pointer font-semibold"
                    value={filterState.certifications[0] || ''}
                    onChange={(e) => updateFilter({ certifications: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">Any</option>
                    <option value="WHO-GMP">WHO-GMP (Pharma)</option>
                    <option value="US FDA">US FDA</option>
                    <option value="ISO 9001">ISO 9001</option>
                    <option value="CE">CE Approved</option>
                    <option value="GOTS">GOTS Certified</option>
                  </select>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-border-default/50">
                  <label className="block text-text-muted text-[10px] uppercase font-bold tracking-wider flex justify-between">
                    <span>Response Rate</span>
                    <span className="font-mono text-navy font-bold">{filterState.responseRateMin}%+</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={10}
                    value={filterState.responseRateMin}
                    onChange={(e) => updateFilter({ responseRateMin: Number(e.target.value) })}
                    className="w-full accent-navy cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleApplyFilters}
                  className="w-full bg-navy hover:bg-navy-light text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none text-center"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Supplier Directory Listings */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2 text-xs text-text-secondary border-b border-border-default pb-3">
              <p className="text-sm font-semibold text-text-primary">
                Showing <strong className="text-navy">{subcategoryFiltered.length}</strong> verified suppliers{categoryParamQuery ? ` in ${categoryParamQuery.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}
              </p>
              <span className="text-[10px] text-text-muted bg-white border border-border-default px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider select-none">
                Default: Quality Score sorted
              </span>
            </div>

            {/* Subcategory Chips Row */}
            {(() => {
              const activeCategory = appliedFilter.countries[0] || categoryParamQuery || '';
              const activeSubcategories = getSubcategories(activeCategory);
              if (activeSubcategories.length === 0) return null;
              return (
                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider whitespace-nowrap">Subcategories:</span>
                  <div className="flex gap-1.5">
                    {activeSubcategories.map((sub) => {
                      const isSelected = selectedSubcategory === sub;
                      return (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedSubcategory(sub);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap select-none ${
                            isSelected
                              ? 'bg-gold text-white shadow-xs'
                              : 'bg-white text-text-secondary border border-border-strong hover:bg-cream-secondary'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {isLoading ? (
              <div className="space-y-3.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SupplierCardSkeleton key={i} variant="list" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState
                title="No matching suppliers found"
                description="We couldn't find any verified Gujarat manufacturers matching your exact search criteria. Try resetting filters or submit a sourcing request to have our trade desk locate verified factories for you."
                illustrationType="search"
                primaryActionLabel="Post Sourcing Request (RFQ)"
                primaryActionTo="/rfq"
                secondaryActionLabel="Reset Filters"
                secondaryActionOnClick={() => {
                  setFilterState({
                    ...defaultFilter,
                    verifiedOnly: true,
                  });
                  setAppliedFilter({
                    ...defaultFilter,
                    verifiedOnly: true,
                  });
                  setKeyword('');
                  setAppliedKeyword('');
                }}
              />
            ) : (
              <div className="space-y-3.5">
                {paginated.map((s) => (
                  <SupplierCard
                    key={s.id}
                    supplier={s}
                    variant="list"
                    showCheckbox={true}
                    isCompareSelected={compareList.includes(s.id)}
                    onCompareToggle={toggleCompare}
                    onEnquireClick={handleEnquireClick}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 font-sans">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-border-strong rounded-lg disabled:opacity-40 hover:bg-cream-secondary transition-colors cursor-pointer bg-white"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-navy text-white'
                        : 'border border-border-strong bg-white hover:bg-cream-secondary text-text-secondary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-border-strong rounded-lg disabled:opacity-40 hover:bg-cream-secondary transition-colors cursor-pointer bg-white"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-5 pb-8 space-y-4 max-h-[85vh] overflow-y-auto font-sans animate-slide-up">
            <div className="w-12 h-1 bg-border-strong/60 rounded-full mx-auto mb-1 select-none"></div>
            <div className="flex justify-between items-center border-b border-border-default pb-3">
              <span className="font-bold text-sm text-text-primary uppercase tracking-wider">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="cursor-pointer">
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            
            <div className="space-y-4 text-xs font-medium text-text-secondary">
              <Checkbox
                checked={filterState.verifiedOnly}
                onChange={(e) => updateFilter({ verifiedOnly: e.target.checked })}
                label="Verified Only (Strict)"
              />

              <Checkbox
                checked={filterState.tradeAssurance}
                onChange={(e) => updateFilter({ tradeAssurance: e.target.checked })}
                label="Aartha Protect Active"
              />

              <div className="space-y-1">
                <label className="block text-text-muted text-[10px] uppercase font-bold tracking-wider">Industrial GIDC Cluster</label>
                <select
                  className="w-full bg-white border border-border-strong rounded-lg px-2.5 py-2 text-xs focus:border-navy focus:outline-none"
                  value={filterState.countries[0] || ''}
                  onChange={(e) => updateFilter({ countries: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">All Zones</option>
                  <option value="Vatva GIDC">Vatva GIDC</option>
                  <option value="Nandesari GIDC">Nandesari GIDC</option>
                  <option value="Ankleshwar GIDC">Ankleshwar GIDC</option>
                </select>
              </div>

              <div className="space-y-1 border-t border-border-default/50 pt-3">
                <label className="block text-text-muted text-[10px] uppercase font-bold tracking-wider flex justify-between">
                  <span>Response Rate ({filterState.responseRateMin}%+)</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={10}
                  value={filterState.responseRateMin}
                  onChange={(e) => updateFilter({ responseRateMin: Number(e.target.value) })}
                  className="w-full accent-navy"
                />
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full bg-navy text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Side-by-Side Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-6 relative overflow-hidden max-h-[90vh] flex flex-col font-sans">
            <button onClick={() => setShowCompareModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X size={20} />
            </button>
            
            <div className="border-b border-border-default pb-3">
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">Supplier Quotation Comparison Matrix</h3>
              <p className="text-xs text-text-secondary mt-0.5">Compare key verification metrics and factory parameters</p>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border-default bg-cream-secondary">
                    <th className="p-3 text-[10px] text-text-muted uppercase font-bold tracking-wider w-1/4">Metric</th>
                    {compareSuppliers.map(s => (
                      <th key={s.id} className="p-3 font-bold text-navy text-center w-1/4">{s.companyName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/50">
                  <tr>
                    <td className="p-3 text-text-muted font-semibold">Quality Score</td>
                    {compareSuppliers.map(s => (
                      <td key={s.id} className="p-3 text-center font-bold text-navy">{s.qualityScore.total}/100</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-muted font-semibold">GIDC Zone Location</td>
                    {compareSuppliers.map(s => (
                      <td key={s.id} className="p-3 text-center font-bold text-text-secondary">{s.location.city} ({s.location.gidcZone || 'N/A'})</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-muted font-semibold">Min Order Qty (MOQ)</td>
                    {compareSuppliers.map(s => (
                      <td key={s.id} className="p-3 text-center font-bold text-text-secondary">{s.moq}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-muted font-semibold">Certifications</td>
                    {compareSuppliers.map(s => (
                      <td key={s.id} className="p-3 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {s.certifications.map(c => (
                            <span key={c} className="bg-cream-secondary border border-border-default/45 px-1.5 py-0.5 rounded text-[9px] font-bold">{c}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-text-muted font-semibold">Response Speed</td>
                    {compareSuppliers.map(s => (
                      <td key={s.id} className="p-3 text-center font-bold text-trust-green">
                        {s.avgResponseTimeHours ? `<${Math.ceil(s.avgResponseTimeHours)} hrs avg` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end gap-3 border-t border-border-default pt-4">
              <button
                onClick={() => setShowCompareModal(false)}
                className="bg-cream border border-border-strong text-text-secondary px-6 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCompareModal(false);
                  router.push('/rfq');
                }}
                className="bg-navy hover:bg-navy-light text-white px-6 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                Request Quotes From Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side SlideOut Panel */}
      <SlideOutPanel
        supplier={selectedSupplier}
        isOpen={slideOutOpen}
        onClose={() => setSlideOutOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy"></div>
      </div>
    }>
      <SuppliersDirectoryContent />
    </Suspense>
  );
}
