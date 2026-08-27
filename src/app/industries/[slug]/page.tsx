import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categories } from '@/data/categories';
import { suppliers } from '@/data/suppliers';
import SupplierCard from '@/components/SupplierCard';
import { ChevronRight, ArrowRight, ShieldCheck, Landmark, Pill, FlaskConical, Settings, Shirt, Package, Wheat, Home as HomeIcon, Zap, FileText } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

const iconMap: Record<string, any> = {
  Settings,
  Zap,
  FlaskConical,
  Shirt,
  Package,
  Wheat,
  Pill,
  Home: HomeIcon
};

const categoryChecklists: Record<string, string[]> = {
  'pharma-healthcare': [
    'WHO-GMP Compliance & Certification status validation',
    'US FDA / DMF filing numbers verification in ministry logs',
    'Active Pharmaceutical Ingredient (API) purity checks & Certificate of Analysis (CoA) audits',
    'HPLC & cleanroom environmental log reviews by senior auditor Shah',
  ],
  'chemicals-materials': [
    'REACH Registration validity checks for EU export markets',
    'ISO 14001 Environmental management compliance audits',
    'Safety Data Sheet (SDS) verification and hazard rating checks',
    'Gujarat Pollution Control Board (GPCB) active approval audits',
  ],
  'machinery-industrial': [
    'CE marking certification validity checks for European corridors',
    'ISO 9001:2015 Quality management framework logs audit',
    'Raw material test certificates (MTC) verification at the source',
    'CNC precision calibration reports and tolerance logs validation',
  ],
  'textiles-apparel': [
    'Global Organic Textile Standard (GOTS) checks for organic fabrics',
    'OEKO-TEX Standard 100 chemical safety and eco limits validation',
    'GSM fabric weight & shrinkage parameters checks in onsite lab visits',
    'Social compliance & child-labor-free factory records verification',
  ],
};

const defaultChecklist = [
  'GSTIN active status confirmation via Ministry logs',
  'IEC (Import Export Code) validation check via DGFT database',
  'On-site factory visit and physical machinery inventory check',
  'GPS location validation and physical address mapping',
];

const categoryCompliance: Record<string, string> = {
  'pharma-healthcare': 'For pharmaceutical exports to the USA and Europe, FDA registration and WHO-GMP certifications are mandatory. Our auditors verify these numbers directly with Ministry logs.',
  'chemicals-materials': 'Specialty chemical shipments to the EU require valid REACH registration. All listed chemical suppliers undergo active GPCB (Gujarat Pollution Control Board) status audits.',
  'textiles-apparel': 'Textile exports targeting premium retail brands require GOTS (Global Organic Textile Standard) or OEKO-TEX Standard 100 certification. We verify actual lab logs on site.',
  'machinery-industrial': 'CE marking and ISO 9001:2015 logs are verified for engineering and metal castings exporters to confirm tolerances and calibration benchmarks.',
};

const defaultCompliance = 'All export shipments originating from GIDC zones require verified Import Export Codes (IEC) and active GST registrations. Aartha verifies these credentials before routing enquiries.';

const categoryMarketSnippets: Record<string, string> = {
  'pharma-healthcare': 'Ahmedabad and Ankleshwar API clusters are seeing a 14% year-on-year export volume growth. Buyer queries for WHO-GMP generic raw materials remain highly active.',
  'chemicals-materials': 'Specialty solvents and pigment dye pricing indices in Vatva GIDC have stabilized after Q1 fluctuations. Production capacity logs indicate prompt shipment matching ranges.',
  'textiles-apparel': 'Surat synthetic yarn and Ahmedabad organic cotton weaving outputs are operating at 92% capacity. Demand from EU buyers has accelerated GOTS audit requests.',
  'machinery-industrial': 'Rajkot precision brass and casting clusters report stable raw material pricing. CNC machining toolings maintain strong delivery matching metrics to German hubs.',
};

const defaultMarketSnippet = 'Gujarat GIDC export hubs continue to lead India\'s outward trade volumes. Direct port routing from Mundra and Kandla ensures fast supply matches for verified buyers.';

export async function generateStaticParams() {
  return categories.map((cat) => ({
    slug: cat.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);
  
  if (!category) {
    return {
      title: 'Industry Cluster Not Found | Aartha',
    };
  }

  return {
    title: `${category.name} Industry Cluster — Verified Gujarat Manufacturers | Aartha`,
    description: `Browse physically audited and verified manufacturers in the ${category.name} export corridor of Gujarat. Verify GIDC plant output capacities and certs.`,
  };
}

export default async function IndustrySlugPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);

  if (!category) {
    notFound();
  }

  const Icon = iconMap[category.icon] || Settings;
  const checklist = categoryChecklists[category.id] || defaultChecklist;
  const complianceContext = categoryCompliance[category.id] || defaultCompliance;
  const marketSnippet = categoryMarketSnippets[category.id] || defaultMarketSnippet;

  // Filter 3 suppliers matching this category
  const categorySuppliers = suppliers
    .filter((s) => s.category.toLowerCase().includes(category.name.split(' ')[0].toLowerCase()))
    .slice(0, 3);

  // Fallback to featured verified suppliers if none match specific category name
  const displaySuppliers = categorySuppliers.length > 0 
    ? categorySuppliers 
    : suppliers.filter(s => s.isVerified).slice(0, 3);

  // Filters specific to the category slug
  const specFilters = category.id === 'pharma-healthcare'
    ? ['WHO-GMP Certified', 'US FDA Approved', 'Drug Master File (DMF)', 'API Grade']
    : category.id === 'textiles-apparel'
    ? ['GOTS Standard', 'OEKO-TEX 100', '100% Organic Cotton', 'GSM 150-300']
    : category.id === 'chemicals-materials'
    ? ['REACH Registered', 'ISO 14001', 'Hazard Class 3', 'GPCB Approved']
    : ['ISO 9001:2015', 'CE Marking', 'BIS Quality Standard', 'MTC Cert Verified'];

  return (
    <div className="bg-cream font-sans min-h-screen text-text-primary">
      {/* Breadcrumb */}
      <div className="bg-cream-secondary border-b border-border-default px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-navy no-underline">Home</Link>
          <ChevronRight size={12} className="text-text-muted" />
          <Link href="/categories" className="hover:text-navy no-underline">Categories</Link>
          <ChevronRight size={12} className="text-text-muted" />
          <span className="text-navy font-bold">{category.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-navy text-white py-14 px-4 border-b border-border-default/15 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-60"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gold border border-white/10">
              <Icon size={14} />
              <span>Gujarat Verified Export Corridor</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wide leading-tight">
              {category.name} Manufacturers
            </h1>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              Find physically visited and GPS-audited manufacturers in Surat, Ahmedabad, and Ankleshwar clusters. Access verified machinery assets and compliance logs directly.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full md:w-64 space-y-2 text-center backdrop-blur-xs">
            <div className="text-2xl font-bold text-gold">{category.supplierCount.toLocaleString()}</div>
            <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Verified GIDC Exporters Listed</div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Sub-categories Card Grid */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-text-primary">Sub-Category Verticals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.subCategories.slice(0, 8).map((sub) => (
                  <div key={sub.id} className="bg-white border border-border-default rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all group">
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-navy group-hover:text-gold transition-colors">{sub.name}</h3>
                      <p className="text-text-secondary text-xs leading-relaxed">{sub.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-default/45 mt-3 text-[10px]">
                      <span className="text-trust-green font-bold bg-trust-green-bg px-2 py-0.5 rounded-full border border-trust-green/10">
                        {sub.supplierCount} Verified Plants
                      </span>
                      <span className="text-text-muted">Response: <strong className="text-text-secondary">{sub.avgResponseTime}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Manufacturers */}
            <section className="space-y-4">
              <div className="flex justify-between items-end border-b border-border-default pb-3">
                <h2 className="text-lg font-bold uppercase tracking-wider text-text-primary">Featured Exporters</h2>
                <Link href={`/suppliers?category=${category.id}`} className="text-xs font-bold text-gold hover:underline flex items-center gap-1 uppercase">
                  View All in Directory <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displaySuppliers.map((supplier) => (
                  <SupplierCard 
                    key={supplier.id} 
                    supplier={supplier} 
                    variant="grid"
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Compliance & Market Intelligence */}
          <aside className="space-y-6">
            {/* Spec Filter Simulator */}
            <div className="bg-white border border-border-default rounded-2xl p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2 flex items-center gap-1.5">
                <span>🔧</span> Corridor Spec Filters
              </h4>
              <p className="text-[10px] text-text-secondary">Procurement criteria applied during georouting matches:</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specFilters.map((filter) => (
                  <span key={filter} className="bg-cream-secondary text-text-secondary text-[10px] font-semibold px-2.5 py-1 rounded-full border border-border-default/45">
                    {filter}
                  </span>
                ))}
              </div>
            </div>

            {/* Compliance Context */}
            <div className="bg-white border border-border-default rounded-2xl p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2 flex items-center gap-1.5">
                <Landmark size={14} className="text-gold" /> Compliance Context
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                {complianceContext}
              </p>
              <div className="bg-trust-green-bg text-trust-green border border-trust-green/20 rounded-xl p-3 flex gap-2 text-[11px] leading-relaxed">
                <ShieldCheck size={16} className="text-trust-green flex-shrink-0 mt-0.5" />
                <span>Aartha audit team verifies actual registration logs before onboarding.</span>
              </div>
            </div>

            {/* Market Intelligence Snippet */}
            <div className="bg-white border border-border-default rounded-2xl p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-navy border-b border-border-default pb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-gold" /> Corridor Market Intelligence
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed italic">
                "{marketSnippet}"
              </p>
            </div>

            {/* Actions Panel */}
            <div className="bg-navy text-white rounded-2xl p-5 space-y-4 border border-border-default/15 text-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gold">Ready to source from this cluster?</h4>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Post an RFQ in 3 minutes. Our trade desk matches you with verified GIDC manufacturers within 48 hours.
              </p>
              <Link href="/rfq" className="w-full block bg-gold hover:bg-gold-hover text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors no-underline">
                Submit RFQ Request
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
