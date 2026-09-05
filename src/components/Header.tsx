"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Menu, X, LogOut, User, Search, ChevronDown, ArrowUpRight, CheckCircle2, FileText } from 'lucide-react';
import { useSession, getDashboardPath, getDashboardLabel } from '@/hooks/useSession';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageToggle from '@/components/LanguageToggle';

const categoryData: Record<string, { title: string; items: Array<{ name: string; desc: string; href: string }> }> = {
  all: {
    title: 'Custom sheet-metal parts',
    items: [
      { name: 'Brackets', desc: 'Angle, support and mounting brackets', href: '/#catalogue' },
      { name: 'Mounting plates', desc: 'Laser-cut bases and drilled patterns', href: '/#catalogue' },
      { name: 'Covers & panels', desc: 'Guards, access panels and caps', href: '/#catalogue' },
      { name: 'Housings', desc: 'Small fabricated equipment shells', href: '/#catalogue' },
      { name: 'Enclosures', desc: 'Simple electrical and hardware enclosures', href: '/#catalogue' },
      { name: 'Prototype runs', desc: 'Small-lot fabrication for design iteration (1-50 pcs)', href: '/rfq' },
    ],
  },
  brackets: {
    title: 'Precision Brackets',
    items: [
      { name: 'Angle brackets', desc: 'L-bends / formed structural supports', href: '/rfq' },
      { name: 'Flat brackets', desc: 'Laser-cut flat gussets and ties', href: '/rfq' },
      { name: 'Slotted brackets', desc: 'Adjustment slots + alignment tabs', href: '/rfq' },
      { name: 'Custom supports', desc: 'Drawing-led complex formed geometry', href: '/rfq' },
      { name: 'Prototype brackets', desc: '1–50 piece rapid qualification runs', href: '/rfq' },
      { name: 'Repeat batches', desc: 'Scheduled runs with dimensional QA report', href: '/rfq' },
    ],
  },
  plates: {
    title: 'Mounting & Base Plates',
    items: [
      { name: 'Base plates', desc: 'Drilled, tapped and counter-bored plates', href: '/rfq' },
      { name: 'Slotted plates', desc: 'Precision adjustment patterns', href: '/rfq' },
      { name: 'Back plates', desc: 'Cabinet, panel and equipment backs', href: '/rfq' },
      { name: 'Adapter plates', desc: 'Interface conversion & motor mount plates', href: '/rfq' },
      { name: 'Laser-cut blanks', desc: 'High-tolerance profile cutouts', href: '/rfq' },
      { name: 'Batch plates', desc: 'Flatness-checked production orders', href: '/rfq' },
    ],
  },
  covers: {
    title: 'Covers & Guard Panels',
    items: [
      { name: 'Top covers', desc: 'Folded machine and unit covers', href: '/rfq' },
      { name: 'Safety guards', desc: 'Operator protection with inspection slots', href: '/rfq' },
      { name: 'Access panels', desc: 'Service doors with mounting holes', href: '/rfq' },
      { name: 'Vent panels', desc: 'Cutout louvers and air-flow panels', href: '/rfq' },
      { name: 'Corner covers', desc: 'Folded corner edge guards', href: '/rfq' },
      { name: 'Custom panels', desc: 'Silk-screen or powder-coat ready panels', href: '/rfq' },
    ],
  },
  housings: {
    title: 'Equipment Housings',
    items: [
      { name: 'Sensor housings', desc: 'Small instrumentation shells', href: '/rfq' },
      { name: 'Controller housings', desc: 'Folded sheet-metal electronics boxes', href: '/rfq' },
      { name: 'Instrument chassis', desc: 'Base + cover two-piece assemblies', href: '/rfq' },
      { name: 'Testing fixtures', desc: 'Fabricated bench testing enclosures', href: '/rfq' },
      { name: 'Bracketed housings', desc: 'Mounting-integrated unit frames', href: '/rfq' },
      { name: 'Prototype chassis', desc: 'Design validation builds', href: '/rfq' },
    ],
  },
  enclosures: {
    title: 'Electrical Enclosures',
    items: [
      { name: 'Electrical boxes', desc: 'Simple control enclosures with seals', href: '/rfq' },
      { name: 'Junction boxes', desc: 'Compact boxes with removable lids', href: '/rfq' },
      { name: 'Wall cabinets', desc: 'Formed sheet-metal industrial boxes', href: '/rfq' },
      { name: 'Control consoles', desc: 'HMI panel and display housings', href: '/rfq' },
      { name: 'Outdoor shells', desc: 'IP-rated weather resistant enclosures', href: '/rfq' },
      { name: 'Custom enclosures', desc: 'Custom cutouts for DIN rails and glands', href: '/rfq' },
    ],
  },
};

const searchableItems = [
  { name: 'Brackets (Angle / Flat / Slotted)', sub: 'Laser cut & press brake bent', link: '/#catalogue' },
  { name: 'Mounting Plates (Drilled / Slotted)', sub: 'Custom baseplates & blanks', link: '/#catalogue' },
  { name: 'Covers & Access Panels', sub: 'Machine guards & top covers', link: '/#catalogue' },
  { name: 'Housings & Small Chassis', sub: 'Instrument & electronics shells', link: '/#catalogue' },
  { name: 'Enclosures & Cabinets', sub: 'Electrical junction & control boxes', link: '/#catalogue' },
  { name: 'SS304 / SS316 Stainless Steel', sub: 'Corrosion-resistant precision parts', link: '/rfq?material=SS304' },
  { name: 'Mild Steel (CRCA / HR)', sub: 'Economical structural fabrication', link: '/rfq?material=MS' },
  { name: 'Aluminum 5052 / 6061', sub: 'Lightweight laser cutting & bending', link: '/rfq?material=AL' },
  { name: 'Laser Cutting (Fiber 0.5 - 20mm)', sub: 'Tight tolerance Gujarat manufacturing', link: '/how-it-works' },
  { name: 'CNC Press Brake Bending', sub: 'Precision angles & consistent bends', link: '/how-it-works' },
  { name: 'Suppliers Directory', sub: 'Explore audited Gujarat production clusters', link: '/suppliers' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useSession();
  const { t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = !loading && user?.authenticated;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
        setAboutOpen(false);
        setSearchResultsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSearchResults = searchQuery.trim()
    ? searchableItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sub.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchResultClick = (link: string) => {
    setSearchResultsOpen(false);
    setSearchQuery('');
    router.push(link);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-[#dfe4f8]/85 dark:bg-[#0a1020]/90 backdrop-blur-xl border-b border-[#27187e]/12 dark:border-white/10 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[74px] flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group no-underline"
            onClick={() => {
              setCategoriesOpen(false);
              setAboutOpen(false);
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 overflow-hidden shadow-xs">
              <img
                src="/brand/aartha-logo.png"
                alt="Aartha Logo"
                className="w-full h-full object-contain block dark:hidden"
              />
              <img
                src="/brand/aartha-logo-white.png"
                alt="Aartha Logo"
                className="w-full h-full object-contain hidden dark:block"
              />
            </div>
            <div>
              <div className="text-[#0a1020] dark:text-white font-black text-xl leading-none tracking-tight">
                Aartha
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff685c] mt-0.5">
                Managed Sourcing
              </div>
            </div>
          </Link>

          {/* Interactive Nav Search (V3 Commerce-Inspired) */}
          <div className="relative hidden md:flex items-center flex-1 max-w-[440px] mx-2">
            <div className="relative w-full flex items-center bg-white/85 dark:bg-[#142035]/85 border border-[#27187e]/14 dark:border-white/10 rounded-full py-1.5 pl-4 pr-1.5 shadow-[0_10px_25px_rgba(39,24,126,0.06)] focus-within:border-[#27187e] dark:focus-within:border-[#ff685c] transition-all">
              <Search size={16} className="text-[#5a6480] dark:text-slate-400 mr-2.5 flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchResultsOpen(true);
                }}
                onFocus={() => setSearchResultsOpen(true)}
                placeholder="Search parts, materials, processes..."
                className="w-full bg-transparent text-xs font-semibold text-[#0a1020] dark:text-white placeholder:text-[#7a84a1] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Popover */}
            {searchResultsOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-[52px] bg-white dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 rounded-2xl p-2 shadow-[0_25px_60px_rgba(39,24,126,0.18)] z-50 animate-fadeIn">
                <div className="text-[10px] font-black tracking-wider uppercase text-[#5a6480] px-3 py-1.5">
                  Suggested Matches
                </div>
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.slice(0, 5).map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSearchResultClick(res.link)}
                      className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-[#eff2ff] dark:hover:bg-white/5 transition-colors cursor-pointer text-xs"
                    >
                      <div>
                        <b className="font-bold text-[#0a1020] dark:text-white block">{res.name}</b>
                        <span className="text-[11px] text-[#5a6480] dark:text-slate-400">{res.sub}</span>
                      </div>
                      <ArrowUpRight size={14} className="text-[#27187e] dark:text-[#ff685c]" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[#5a6480] dark:text-slate-400">
                    No matching parts found. Send your drawing for review!
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 mt-1 px-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#7a84a1]">Drawing-led custom jobs</span>
                  <Link
                    href="/rfq"
                    onClick={() => setSearchResultsOpen(false)}
                    className="text-[11px] font-extrabold text-[#27187e] dark:text-[#ff685c] hover:underline"
                  >
                    Upload Drawing →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Categories Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCategoriesOpen(!categoriesOpen);
                  setAboutOpen(false);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  categoriesOpen
                    ? 'text-[#27187e] dark:text-[#ff685c] bg-white/70 dark:bg-white/10'
                    : 'text-[#48506b] dark:text-slate-300 hover:text-[#27187e] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span>Categories</span>
                <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* About Aartha Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAboutOpen(!aboutOpen);
                  setCategoriesOpen(false);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  aboutOpen
                    ? 'text-[#27187e] dark:text-[#ff685c] bg-white/70 dark:bg-white/10'
                    : 'text-[#48506b] dark:text-slate-300 hover:text-[#27187e] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span>About Aartha</span>
                <ChevronDown size={14} className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Direct Link to Verified Suppliers (Secondary Directory) */}
            <Link
              href="/suppliers"
              className="text-xs font-bold text-[#48506b] dark:text-slate-300 hover:text-[#27187e] dark:hover:text-white px-3 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-all"
            >
              Factory Network
            </Link>

            {/* How It Works Link */}
            <Link
              href="/how-it-works"
              className="text-xs font-bold text-[#48506b] dark:text-slate-300 hover:text-[#27187e] dark:hover:text-white px-3 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-all"
            >
              How It Works
            </Link>

            {/* Language Selector */}
            <LanguageToggle />

            {/* Authenticated User / Sign In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-2">
                <Link
                  href={getDashboardPath(user?.role)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/80 dark:bg-white/10 border border-[#27187e]/20 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 text-[#0a1020] dark:text-white transition-all shadow-xs"
                >
                  {user?.role === 'admin' ? (
                    <Shield size={13} className="text-[#ff685c]" />
                  ) : (
                    <User size={13} className="text-[#27187e] dark:text-[#82aaff]" />
                  )}
                  <span className="max-w-[100px] truncate">{getDashboardLabel(user)}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-full text-[#5a6480] hover:text-red-600 hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                className="text-xs font-extrabold text-[#0a1020] dark:text-white px-3 py-1.5 rounded-full hover:bg-white/60 dark:hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Primary Action Button: Send an RFQ */}
            <Link
              href="/rfq"
              className="pill pill-ink ml-1 shadow-md hover:shadow-lg transition-transform"
            >
              <span>Send an RFQ</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/rfq"
              className="pill pill-ink py-2 px-3 text-xs"
            >
              RFQ ↗
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0a1020] dark:text-white hover:bg-white/50 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu: Category Explorer */}
      {categoriesOpen && (
        <div className="absolute left-0 right-0 top-[74px] bg-white dark:bg-[#0e1524] border-b border-[#27187e]/15 dark:border-white/10 shadow-[0_35px_80px_rgba(10,16,32,0.18)] z-40 animate-fadeIn">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 bg-[#fafbff] dark:bg-[#142035] rounded-3xl border border-[#27187e]/10 dark:border-white/10 p-4 sm:p-6">
              
              {/* Sidebar Tabs */}
              <aside className="border-b md:border-b-0 md:border-r border-[#27187e]/10 dark:border-white/10 pb-4 md:pb-0 md:pr-4 flex md:flex-col gap-1 overflow-x-auto">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#7a84a1] px-3 py-2 hidden md:block">
                  Part Families
                </div>
                {[
                  { id: 'all', label: 'All sheet metal' },
                  { id: 'brackets', label: '01 Brackets' },
                  { id: 'plates', label: '02 Mounting plates' },
                  { id: 'covers', label: '03 Covers & panels' },
                  { id: 'housings', label: '04 Housings' },
                  { id: 'enclosures', label: '05 Enclosures' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryTab(cat.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeCategoryTab === cat.id
                        ? 'bg-white dark:bg-[#0e1524] text-[#27187e] dark:text-[#82aaff] shadow-xs border-l-4 border-[#27187e] dark:border-[#82aaff]'
                        : 'text-[#48506b] dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </aside>

              {/* Content Grid */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27187e]/10 dark:border-white/10">
                  <div>
                    <span className="micro">Aartha / Precision Catalogue</span>
                    <h3 className="text-xl font-bold text-[#0a1020] dark:text-white mt-0.5">
                      {categoryData[activeCategoryTab]?.title || 'Custom sheet-metal parts'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoriesOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(categoryData[activeCategoryTab]?.items || categoryData.all.items).map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setCategoriesOpen(false)}
                      className="group p-3.5 rounded-2xl bg-white dark:bg-[#0e1524] border border-[#27187e]/10 dark:border-white/10 hover:border-[#27187e]/30 dark:hover:border-[#ff685c]/40 hover:-translate-y-0.5 transition-all shadow-3xs"
                    >
                      <strong className="block text-xs font-bold text-[#0a1020] dark:text-white group-hover:text-[#27187e] dark:group-hover:text-[#ff685c]">
                        {item.name}
                      </strong>
                      <span className="block text-[11px] text-[#5a6480] dark:text-slate-400 mt-1 line-clamp-2">
                        {item.desc}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-[#27187e]/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#5a6480] dark:text-slate-400">
                  <span>Starting commercial wedge: Laser cutting + CNC press brake bending</span>
                  <Link
                    href="/rfq"
                    onClick={() => setCategoriesOpen(false)}
                    className="font-black text-[#27187e] dark:text-[#ff685c] hover:underline inline-flex items-center gap-1"
                  >
                    Start with a drawing →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popover: About Aartha */}
      {aboutOpen && (
        <div className="absolute right-4 sm:right-8 lg:right-24 top-[74px] w-[360px] bg-white dark:bg-[#0e1524] border border-[#27187e]/15 dark:border-white/10 rounded-3xl p-4 shadow-[0_35px_80px_rgba(10,16,32,0.18)] z-40 animate-fadeIn">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-white/10">
            <span className="micro">Aartha / Managed Model</span>
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="py-2 space-y-1">
            {[
              { title: 'Why Aartha', desc: 'The problem is not finding a factory. It is getting the part right.', href: '/about' },
              { title: 'How It Works', desc: '6-step managed workflow from CAD to delivered batch.', href: '/how-it-works' },
              { title: 'Quality Assurance', desc: 'Pre-dispatch dimensional inspection & photo evidence.', href: '/verified' },
              { title: 'Supplier Network', desc: 'Audited Gujarat precision fabrication clusters.', href: '/suppliers' },
              { title: 'Commercial Model', desc: 'Order-first, contribution-based, inventory-free.', href: '/about#model' },
            ].map((menuItem, i) => (
              <Link
                key={i}
                href={menuItem.href}
                onClick={() => setAboutOpen(false)}
                className="block p-2.5 rounded-xl hover:bg-[#eff2ff] dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-[#0a1020] dark:text-white group-hover:text-[#27187e] dark:group-hover:text-[#ff685c]">
                    {menuItem.title}
                  </strong>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-[#27187e]" />
                </div>
                <small className="text-[11px] text-[#5a6480] dark:text-slate-400 block mt-0.5">
                  {menuItem.desc}
                </small>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[74px] left-0 right-0 bg-white/95 dark:bg-[#0a1020]/95 backdrop-blur-xl border-b border-[#27187e]/15 dark:border-white/10 shadow-2xl p-5 z-40 animate-fadeIn">
          <div className="space-y-2">
            <Link
              href="/#catalogue"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-xs font-extrabold text-[#0a1020] dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Part Catalogue (Brackets, Plates, Covers)
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-xs font-extrabold text-[#0a1020] dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              How It Works (6-Step Workflow)
            </Link>
            <Link
              href="/suppliers"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-xs font-extrabold text-[#0a1020] dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Supplier Network Directory
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-xs font-extrabold text-[#0a1020] dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Why Aartha & Quality Model
            </Link>
            <Link
              href="/verified"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-xs font-extrabold text-[#0a1020] dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Trust Center & Verification
            </Link>
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardPath(user?.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-[#0a1020] dark:text-white"
                  >
                    Dashboard ({getDashboardLabel(user)})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-bold text-red-600 hover:underline"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 text-[#0a1020] dark:text-white"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/rfq"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-3 px-4 rounded-xl text-xs font-extrabold bg-[#0a1020] text-white"
              >
                Send an RFQ ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
