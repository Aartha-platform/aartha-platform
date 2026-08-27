"use client";

import { useState } from 'react';
import { 
  Shield, BookOpen, Calendar, User, ArrowRight, Search, X, 
  CheckCircle, ChevronDown, ChevronUp, Activity, MapPin, 
  TrendingUp, Award, Filter, HelpCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: 'Chemicals' | 'Pharma' | 'Engineering' | 'Textiles';
  categoryColor: string;
  summary: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
}

const articles: Article[] = [
  {
    id: 'gidc-chemicals',
    title: 'Mastering Chemical Procurement in Gujarat: GIDC Hubs Explained',
    category: 'Chemicals',
    categoryColor: 'bg-trust-amber-bg text-trust-amber border-trust-amber/20',
    summary: 'A deep-dive into navigating regulatory compliance, safety protocols, and logistics across Gujarat\'s leading chemical belts like Ankleshwar, Vapi, and Nandesari.',
    content: `Gujarat stands as the petroleum and chemical powerhouse of India, accounting for over 60% of the country's chemical production. For global B2B buyers, sourcing from Gujarat Industrial Development Corporation (GIDC) zones offers unprecedented access to direct manufacturer pricing. However, navigating these clusters requires a rigorous understanding of compliance and logistics.

Key compliance checkpoints include:
1. GPCB (Gujarat Pollution Control Board) consents (CCA - Consolidated Consent and Authorization).
2. REACH Compliance for exports to European markets.
3. PESO licenses for hazardous chemical storage and transport.
4. Logistics routing via Mundra or Hazira ports to ensure smooth customs handling.

Aartha verifies these logs directly at the source, giving buyers certainty that the manufacturing plants are operating within full legal and environmental parameters.`,
    author: 'Amit Patel',
    authorRole: 'Senior Sourcing Analyst',
    date: 'July 12, 2026',
    readTime: '6 min read'
  },
  {
    id: 'pharma-compliance',
    title: 'Ensuring API Grade Quality: Compliance Standards for Global Pharma Buyers',
    category: 'Pharma',
    categoryColor: 'bg-trust-blue-bg text-trust-blue border-trust-blue/20',
    summary: 'Essential audit guidelines for verifying WHO-GMP compliance, active purity logs, and Certificate of Analysis (CoA) records for Vadodara and Ahmedabad manufacturers.',
    content: `Pharmaceutical ingredients require the absolute highest level of auditing and certification verification. When sourcing Active Pharmaceutical Ingredients (APIs) and excipients from major manufacturing clusters in Vadodara and Ahmedabad, global buyers must establish a multi-tier audit protocol.

Critical standards to check:
1. WHO-GMP (Good Manufacturing Practices) certifications.
2. US FDA and European Medicines Agency (EMA) DMF filings.
3. Certificate of Analysis (CoA) traceability logs from batch creation.
4. Material purity testing procedures at quality control labs.

Using our Document Intelligence system, buyers can cross-reference the manufacturer's physical verification records with live regulatory databases. Aartha physically audits these facilities, checking both digital credentials and real-world compliance.`,
    author: 'Dr. Priya Shah',
    authorRole: 'Audit Coordinator',
    date: 'June 28, 2026',
    readTime: '8 min read'
  },
  {
    id: 'jamnagar-brass',
    title: 'The Evolution of Brass Manufacturing in Jamnagar',
    category: 'Engineering',
    categoryColor: 'bg-trust-green-bg text-trust-green border-trust-green/20',
    summary: 'How modern precision machining, CNC capabilities, and digital quality indexes are transforming the traditional brass clusters in India\'s premium hardware hub.',
    content: `Jamnagar is globally recognized as the brass capital of India, housing thousands of small and medium enterprises specializing in precision components, electrical accessories, and sanitary fittings. Recently, these traditional foundries have undergone a significant digital transformation.

Modern manufacturers in Jamnagar have integrated:
1. High-precision CNC and VMC machinery to meet tight tolerance limits (<10 microns).
2. Advanced alloy composition analyzers (Spectrometer testing) to ensure lead-free compliance.
3. Standardized ISO 9001:2015 quality management systems.

When purchasing brass components, buyers should verify the supplier's raw material test certificates (MTC) and quality index score to assure structural integrity and specification compliance.`,
    author: 'Vikram Mehta',
    authorRole: 'Industrial Consultant',
    date: 'June 15, 2026',
    readTime: '5 min read'
  },
  {
    id: 'sustainable-textiles',
    title: 'Sustainable Textile Sourcing: Certifications and Traceability in Gujarat',
    category: 'Textiles',
    categoryColor: 'bg-trust-red-bg text-trust-red border-trust-red/20',
    summary: 'Navigating GOTS, OEKO-TEX, and physical supplier verification in Surat and Ahmedabad - India\'s historic textile capitals.',
    content: `Sourcing textiles requires a strong emphasis on social compliance, environmental sustainability, and yarn quality verification. Gujarat, particularly Ahmedabad and Surat, has long been a global textile node. Today's procurement demands verifiable sustainability.

Essential certifications include:
1. GOTS (Global Organic Textile Standard) for organic fibers.
2. OEKO-TEX Standard 100 confirming the absence of harmful substances.
3. Social audits like BSCI and Sedex (SMETA) verifying fair labor practices.

Aartha tracks these certifications, ensuring that local weavers and large mills are verified physically and not merely presenting borrowed certificates. Physical site visits trace cotton origin logs and wastewater treatment plant viability.`,
    author: 'Neha Sharma',
    authorRole: 'Sustainability Specialist',
    date: 'May 30, 2026',
    readTime: '7 min read'
  }
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // Compliance checker widget state
  const [checkerCategory, setCheckerCategory] = useState<'Chemicals' | 'Pharma' | 'Engineering' | 'Textiles'>('Chemicals');
  const [checkerDestination, setCheckerDestination] = useState<'Europe' | 'USA' | 'Asia'>('Europe');

  const categoriesList = ['All', 'Chemicals', 'Pharma', 'Engineering', 'Textiles'];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedArticleId(expandedArticleId === id ? null : id);
  };

  // Helper to compute dynamic compliance documents based on sector & destination
  const getComplianceChecklist = () => {
    const sector = checkerCategory;
    const dest = checkerDestination;

    if (sector === 'Chemicals') {
      const items = [
        { name: 'GPCB Consolidated Consent (CCA)', type: 'Environmental safety authorization for Gujarat plants', level: 'Critical', source: 'State Board Audits' },
        { name: 'PESO Hazardous Materials License', type: 'Required for chemical handling and logistics corridors', level: 'High', source: 'Central Government Audits' }
      ];
      if (dest === 'Europe') {
        items.unshift({ name: 'REACH Registration & Compliance', type: 'EU safety mandate for chemical importing', level: 'Critical', source: 'International Customs' });
        items.push({ name: 'Explicit Country of Origin Tag ("India")', type: 'EU port entry verification rule', level: 'Medium', source: 'Hamburg Port Customs' });
      } else if (dest === 'USA') {
        items.unshift({ name: 'EPA TSCA Certification', type: 'Toxic Substances Control Act import declaration', level: 'Critical', source: 'US Customs' });
      } else {
        items.push({ name: 'Product MSDS Safety Sheet', type: 'Standard hazard sheet matched for cargo clearing', level: 'High', source: 'Singapore Customs' });
      }
      return items;
    }

    if (sector === 'Pharma') {
      const items = [
        { name: 'WHO-GMP License Validation', type: 'Ensures plant follows Good Manufacturing Practices', level: 'Critical', source: 'FDA Registry' },
        { name: 'Certificate of Analysis (CoA) Batch Trace', type: 'Checks material batch quality indexes in laboratories', level: 'High', source: 'Aartha Local Audit' }
      ];
      if (dest === 'Europe') {
        items.push({ name: 'European Drug Master File (EDMF) Filing', type: 'Active substance registration validation', level: 'Critical', source: 'EMA Registry' });
      } else if (dest === 'USA') {
        items.push({ name: 'US FDA DMF Filing status', type: 'Drug Master File registration with FDA portal', level: 'Critical', source: 'FDA Registry' });
      } else {
        items.push({ name: 'Indian CDSCO NOC Certificate', type: 'No-Objection clearance from medical controllers', level: 'High', source: 'CDSCO Registry' });
      }
      return items;
    }

    if (sector === 'Engineering') {
      return [
        { name: 'ISO 9001:2015 Quality Management', type: 'Verifies plant standard operating procedures and QC', level: 'High', source: 'Global Registry' },
        { name: 'Raw Alloy Material Test Certificate (MTC)', type: 'Verifies metal composition and strength specifications', level: 'Critical', source: 'Foundry Laboratory Audits' },
        { name: 'Lead-Free Component Compliance certificate', type: 'Required for sanitary hardware and fittings exports', level: 'Medium', source: 'EU/US Port Custom Rules' }
      ];
    }

    // Textiles
    return [
      { name: 'GOTS v7.0 Standard organic certificate', type: 'Verifies organic fiber origin and textile processing chain', level: 'Critical', source: 'GOTS Registry check' },
      { name: 'OEKO-TEX Standard 100 certification', type: 'Guarantees fabric is free of harmful chemical dyes', level: 'High', source: 'International Test Labs' },
      { name: 'BSCI or Sedex Social Audit validation', type: 'Verifies fair labor and factory environment standards', level: 'Medium', source: 'Aartha Site Visit Report' }
    ];
  };

  const checklist = getComplianceChecklist();

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary">
      {/* Header / Hero */}
      <section className="bg-navy text-white py-16 px-4 border-b border-border-default/10 premium-gradient-header relative overflow-hidden">
        {/* Glow styling blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-75"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-gold/10 text-gold px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-gold/20 shadow-2xs">
              <BookOpen size={12} className="animate-pulse" />
              <span>Sourcing & Trade Intelligence</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gold bg-clip-text text-transparent uppercase">
              Aartha Sourcing Journal
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
              Real-time compliance digests, policy updates, and expert quality verification guides for Gujarat’s leading chemical, pharma, engineering, and textile clusters.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-md text-xs text-gold font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <Activity size={14} className="animate-pulse text-gold" />
            <span>Updated Weekly with Local Port Audits</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* SECTION 1: Interactive Gujarat Sourcing Indicators Heat-Metrics */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary">
              Gujarat Cluster Sourcing Indicators
            </h3>
            <span className="bg-trust-green-bg text-trust-green text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
              Live State Indicators
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { cluster: 'Ankleshwar GIDC', sector: 'Chemicals', val: '+14.2% MoM', checkVal: '98.4%', label: 'Purity Check Rate', color: 'text-trust-amber', border: 'border-trust-amber/25' },
              { cluster: 'Jamnagar Foundries', sector: 'Engineering/Brass', val: '92% Active', checkVal: '<10μ Limit', label: 'CNC Quality Index', color: 'text-trust-green', border: 'border-trust-green/25' },
              { cluster: 'Vadodara Hub', sector: 'Pharma & CDMO', val: '100% Verified', checkVal: 'Active GMP', label: 'WHO Audit compliance', color: 'text-trust-blue', border: 'border-trust-blue/25' },
              { cluster: 'Surat & Ahmedabad', sector: 'Textiles', val: '+8.6% organic', checkVal: 'GOTS v7.0', label: 'Sustainable rate', color: 'text-trust-red', border: 'border-trust-red/25' }
            ].map((metric) => (
              <div key={metric.cluster} className="bg-white border border-border-default rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between select-none">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] text-text-muted font-extrabold uppercase tracking-wide block">{metric.sector}</span>
                    <strong className="text-xs font-extrabold text-navy truncate block">{metric.cluster}</strong>
                  </div>
                  <span className={`text-[10px] font-mono font-black ${metric.color} bg-cream-secondary/40 px-2 py-0.5 rounded border ${metric.border}`}>
                    {metric.val}
                  </span>
                </div>
                <div className="pt-4 border-t border-border-default/30 mt-3 flex justify-between items-center text-[10px]">
                  <span className="text-text-secondary font-medium">{metric.label}</span>
                  <span className="font-bold text-navy font-mono bg-cream-secondary px-1.5 py-0.5 rounded">{metric.checkVal}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Smart Compliance Checklist Tool (Interactive Checker) */}
        <section className="bg-white border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-primary flex items-center gap-2">
                <ShieldCheck size={18} className="text-gold" />
                <span>Smart Sourcing Compliance Checker</span>
              </h3>
              <p className="text-[11px] text-text-muted font-medium">
                Select your industry category and destination market to instantly view mandatory shipping & compliance certificates.
              </p>
            </div>
            
            {/* Interactive Selectors */}
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 bg-cream px-3 py-1.5 rounded-xl border border-border-default">
                <span className="text-[9px] font-bold text-text-secondary uppercase">Sector:</span>
                <select 
                  value={checkerCategory} 
                  onChange={(e) => setCheckerCategory(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-navy focus:outline-none cursor-pointer"
                >
                  <option value="Chemicals">Chemicals</option>
                  <option value="Pharma">Pharmaceuticals</option>
                  <option value="Engineering">Engineering (Brass/Metal)</option>
                  <option value="Textiles">Textiles & Organic Fibers</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-cream px-3 py-1.5 rounded-xl border border-border-default">
                <span className="text-[9px] font-bold text-text-secondary uppercase">To:</span>
                <select 
                  value={checkerDestination} 
                  onChange={(e) => setCheckerDestination(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-navy focus:outline-none cursor-pointer"
                >
                  <option value="Europe">Europe (Hamburg/Rotterdam)</option>
                  <option value="USA">USA (Houston/New York)</option>
                  <option value="Asia">Asia (Singapore/Shanghai)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Checklist Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklist.map((item, idx) => (
              <div key={idx} className="bg-cream-secondary/15 border border-border-default/45 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-border-strong transition-all duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-black uppercase text-navy bg-navy/5 px-2 py-0.5 rounded border border-navy/10">
                      {item.source}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.level === 'Critical' 
                        ? 'bg-trust-red-bg text-trust-red border border-trust-red/10' 
                        : item.level === 'High' 
                        ? 'bg-trust-amber-bg text-trust-amber border border-trust-amber/10' 
                        : 'bg-trust-blue-bg text-trust-blue border border-trust-blue/10'
                    }`}>
                      {item.level} Required
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-navy leading-snug">{item.name}</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed font-medium">{item.type}</p>
                </div>

                <div className="pt-2 border-t border-border-default/15 flex items-center gap-1.5 text-trust-green text-[9px] font-bold">
                  <CheckCircle size={12} className="flex-shrink-0" />
                  <span>Auditable on Aartha Compliance Scanner</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cream-secondary/25 p-3.5 rounded-xl text-[10px] text-text-secondary leading-normal flex items-start gap-2.5 font-medium border border-border-default/30">
            <HelpCircle size={15} className="text-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> These rules represent active import regulations. Aartha matches and geolocates GPCB licenses, WHO certificates, and GOTS standards automatically within the **Document Intelligence Page**. Click "Submit Sourcing Request" below if you need a custom cluster audit profile.
            </div>
          </div>
        </section>

        {/* SECTION 3: Articles Controls (Search, Filters) and Listing Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border border-border-default bg-white p-4 rounded-2xl shadow-2xs">
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  id={`cat-filter-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none border ${
                    selectedCategory === cat
                      ? 'bg-gold border-gold text-white shadow-3xs'
                      : 'bg-cream-secondary/60 border-border-default text-text-secondary hover:bg-cream-secondary hover:text-navy'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                id="blog-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles and insights..."
                className="w-full bg-cream-secondary/50 border border-border-default rounded-xl pl-9.5 pr-8 py-2.5 text-xs focus:outline-none focus:border-gold focus:bg-white focus:shadow-3xs transition-all duration-200"
              />
              <Search className="absolute left-3 top-3 text-text-muted" size={13} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-3 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 border border-border-default border-dashed rounded-2xl bg-white space-y-3">
              <p className="text-text-muted text-xs font-semibold">No articles matched your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-gold text-xs font-bold hover:underline cursor-pointer"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredArticles.map((article) => {
                const isExpanded = expandedArticleId === article.id;
                return (
                  <article
                    key={article.id}
                    id={`article-card-${article.id}`}
                    className="border border-border-default rounded-2xl bg-white p-6 space-y-4 hover:shadow-xs transition-shadow flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-black border ${article.categoryColor}`}>
                          {article.category}
                        </span>
                        <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                          <Calendar size={11} className="text-gold" />
                          {article.date}
                        </span>
                      </div>

                      <h2 className="text-base font-extrabold text-navy tracking-tight leading-tight group-hover:text-gold transition-colors">
                        {article.title}
                      </h2>

                      <p className="text-text-secondary text-xs leading-relaxed font-medium">
                        {article.summary}
                      </p>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border-default/45 text-xs text-text-secondary leading-relaxed space-y-3.5 whitespace-pre-line bg-cream/35 p-4 rounded-xl animate-fade-in-up border border-border-default/20 font-medium">
                          {article.content}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border-default/50 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-navy text-gold flex items-center justify-center font-black text-xs shadow-3xs uppercase">
                          {article.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[11px] font-extrabold text-navy leading-tight">{article.author}</div>
                          <div className="text-[9px] text-text-muted font-medium">{article.authorRole}</div>
                        </div>
                      </div>

                      <button
                        id={`btn-read-${article.id}`}
                        onClick={() => toggleExpand(article.id)}
                        className="inline-flex items-center gap-1 text-xs font-black text-gold hover:text-gold-hover transition-colors cursor-pointer select-none uppercase tracking-wider"
                      >
                        {isExpanded ? (
                          <>
                            Collapse <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            Read Article <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: Premium bottom CTA Banner with golden sheen */}
        <section className="relative group overflow-hidden bg-navy border border-navy/20 rounded-3xl p-8 text-center space-y-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          <h3 className="text-lg font-extrabold uppercase tracking-wider text-gold">Ready to initiate your verified source?</h3>
          <p className="text-white/70 text-xs max-w-md mx-auto leading-relaxed font-medium">
            Get matched with physically verified manufacturer corridors within 48 hours. Start check-ups for free.
          </p>
          <div className="pt-2">
            <a
              id="blog-cta-rfq"
              href="/rfq"
              className="inline-block relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all duration-200 select-none no-underline shadow-[0_2px_12px_rgba(217,119,6,0.25)] hover:shadow-[0_4px_20px_rgba(217,119,6,0.45)] hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Submit Sourcing Request
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
