import Link from 'next/link';
import { 
  ShieldCheck, Users, Lock, Award, Globe, BarChart2, CheckCircle2, 
  Linkedin, Phone, Mail, Clock, Flag, TrendingUp, FileText, Star, 
  MapPin, MessageSquare, Sparkles, Heart, Building2, ShieldAlert
} from 'lucide-react';

const trustCards = [
  { icon: Users, title: 'Why Buyers Matter', desc: 'Serious B2B trade starts with genuine buyers. We verify purchasing authority to protect supplier operations.', color: 'from-amber-500/10 to-yellow-500/5 text-amber-500' },
  { icon: ShieldCheck, title: 'Why Suppliers Matter', desc: 'Gujarat chemical and industrial corridors represent top manufacturing. We verify their factories physically.', color: 'from-emerald-500/10 to-teal-500/5 text-emerald-500' },
  { icon: Lock, title: 'Why Trust OS is Required', desc: 'Directories rank by payment. We rank by computed compliance and performance evidence.', color: 'from-blue-500/10 to-indigo-500/5 text-blue-500' },
  { icon: Award, title: 'How Trust Is Earned', desc: 'Trust is built through GSTIN/IEC registry verification, transparent bank KYC, and optional onsite GPS audits.', color: 'from-purple-500/10 to-pink-500/5 text-purple-500' },
];

const impactStats = [
  { icon: ShieldCheck, value: '4-Tier', label: 'Verification Depth' },
  { icon: Users, value: 'Early Access', label: 'Buyer Program' },
  { icon: FileText, value: 'Live', label: 'RFQ System' },
  { icon: Globe, value: 'Gujarat', label: 'GIDC Focus Corridors' },
  { icon: BarChart2, value: '6', label: 'Industry Sectors' },
  { icon: Star, value: 'Active', label: 'Response Monitoring' },
];

const journeyMilestones = [
  { year: '2022', icon: Flag, title: 'Founded in Ahmedabad', desc: 'Aartha founded with a mission to eliminate trust friction in Gujarat B2B trade.' },
  { year: '2023', icon: Users, title: 'Supplier Registry Launch', desc: 'Onboarded first verified suppliers across specialty chemical categories.' },
  { year: '2024', icon: Globe, title: 'Cross-Border Enablement', desc: 'Launched cross-border matching for export corridor enablement.' },
  { year: '2025', icon: ShieldCheck, title: 'Registry API Integration', desc: 'Launched direct digital-first verification with government registry logs.' },
  { year: '2026', icon: TrendingUp, title: 'Trade OS Expansion', desc: 'Expanding verification corridor, enabling strict B2B verified trade OS.' },
];

const platformCapabilities = [
  {
    icon: BarChart2,
    title: 'Verified Sourcing Hub',
    desc: 'An integrated Central Sourcing Dashboard monitoring active matches, RFQ stages, and buyer authority validation levels (Domain Checked, Authority Verified, Pro Workspace status).'
  },
  {
    icon: MapPin,
    title: 'Dynamic Registry Audits',
    desc: 'Active GSTIN/IEC validation checks, director screening, bank verification logs, and optional onsite GPS physical coordinate verifications.'
  },
  {
    icon: Lock,
    title: 'Aartha Protect Safeguards',
    desc: 'Secure buyer payment protection and milestone tracking, powered by RBI-authorized payment partners, with transparent inspection and release conditions.'
  },
  {
    icon: Sparkles,
    title: 'AI-Driven Matchmaker Routing',
    desc: 'RFQ specifications matching to exactly 3-5 verified GIDC manufacturers based on capabilities, active certifications (WHO-GMP, ISO, GOTS), and compliance ratings.'
  },
  {
    icon: Globe,
    title: 'Flexible Workspace Billing',
    desc: 'Razorpay INR integrations for Indian manufacturers (quarterly/yearly), and Stripe USD plans supporting corporate Purchase Orders (PO) for international buyers.'
  },
  {
    icon: MessageSquare,
    title: 'Encrypted Sourcing Communication',
    desc: 'An end-to-end encrypted direct workspace communication channel between global sourcing representatives and factory owners.'
  }
];

export default function AboutPage() {
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aartha",
    "url": "https://aartha.site",
    "logo": "https://aartha.site/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-72084-32138",
      "contactType": "customer support",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi", "gu"]
    },
    "sameAs": [
      "https://twitter.com/aarthasourcing",
      "https://www.linkedin.com/company/aarthasourcing"
    ]
  };

  return (
    <div className="bg-transparent font-sans text-text-primary dark:text-slate-100 min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      
      {/* Premium Gradient Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-[#0c1a30] to-navy-dark text-white py-24 px-4 border-b border-white/10 shadow-premium-lg">
        {/* Decorative Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
              <Sparkles size={14} className="animate-pulse" />
              <span>Sourcing Reimagined</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[1.1] max-w-2xl">
              About <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Aartha</span>
            </h1>
            
            <p className="text-amber-300 text-lg font-bold tracking-tight">
              Managed Manufacturing Execution Layer for Custom Precision Parts
            </p>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              In Sanskrit, <strong className="text-white border-b border-amber-500/30 pb-0.5">Aartha</strong> represents purpose, meaning, and true value. We built Aartha because the hardest part of manufacturing is not finding a factory — it is getting the part made correctly. Aartha acts as the single accountable concierge between hardware teams and audited Gujarat fabrication clusters.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/rfq" 
                className="btn-amber text-xs font-extrabold uppercase tracking-wider px-8 py-3.5 shadow-lg rounded-xl"
              >
                Send an RFQ ↗
              </Link>
              <Link 
                href="/how-it-works" 
                className="border-[1.5px] border-white/20 text-white hover:bg-white hover:text-navy hover:border-white text-xs font-extrabold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0 w-full lg:w-96">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <MapPin size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Gujarat Cluster HQ</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Ahmedabad, India</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Positioned in the heart of India's manufacturing corridor, auditing GIDC clusters across Vatva, Sachin, Ankleshwar, and Naroda.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {['Vatva', 'Sachin', 'Ankleshwar', 'Naroda'].map((gidc) => (
                  <span key={gidc} className="bg-white/10 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded border border-white/5">
                    {gidc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Core Brand Narrative */}
        <section id="narrative" className="relative bg-white dark:bg-navy-light border border-black/10 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-premium hover:shadow-premium-lg transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Heart size={10} />
                <span>The Sanskrit Roots of Prosperity</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-navy dark:text-white leading-tight">
                On Aartha: Meaning & Wealth Are Not Separate
              </h2>
              
              <div className="text-xs sm:text-sm text-text-secondary dark:text-slate-300 leading-relaxed space-y-4 max-w-4xl font-normal">
                <p>
                  In Sanskrit, the word <strong className="text-navy dark:text-white font-extrabold">Aartha (आर्थ)</strong> stands for meaning, purpose, wealth, substance, and goal — all at once. For centuries, our heritage understood that material flourishing and deep meaning were never separate. Purpose and prosperity are woven together, parts of the same living system.
                </p>
                <p>
                  When wealth is severed from meaning, what we call "prosperity" becomes a drought in disguise. Profits become short-term, leading to artificial booms and busts. But when material wealth flows to nourish a meaningful life, and meaningful life becomes the true wealth, businesses create durable value.
                </p>
                <p>
                  Aartha is built on this core alignment. We believe that global B2B trade should not be about anonymous clicks, trading agent spam, and fake trust certificates. It should be built on the stepwell philosophy: creating places of beauty, safety, relatedness, and shared nourishment. By bringing absolute transparency, physical audit verification, and regional trust signals to Gujarat's manufacturing corridors, we align material prosperity with purpose.
                </p>
              </div>
            </div>

            {/* Official Brand Monogram Emblem Card */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs text-center">
              <div className="w-28 h-28 rounded-full bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-200/90 dark:border-white/15 shadow-md flex items-center justify-center overflow-hidden mb-3 transition-transform duration-300 hover:scale-105">
                <img
                  src="/brand/aartha-logo.png"
                  alt="Aartha Monogram"
                  className="w-full h-full object-contain block dark:hidden drop-shadow-sm"
                />
                <img
                  src="/brand/aartha-logo-white.png"
                  alt="Aartha Monogram"
                  className="w-full h-full object-contain hidden dark:block drop-shadow-sm"
                />
              </div>
              <span className="font-extrabold text-xs tracking-wider uppercase text-navy dark:text-white">AARTHA SEAL</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Trust & Assurance Ring</span>
            </div>
          </div>
        </section>

        {/* Dynamic Timeline section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Our Journey
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-primary dark:text-white">
              Aartha Milestones
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {journeyMilestones.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={m.year} className="bg-white dark:bg-navy-light border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-amber-500">{m.year}</span>
                    <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                      <Icon size={16} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">{m.title}</h3>
                    <p className="text-[11px] text-text-secondary dark:text-slate-300 leading-normal">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust Philosophy */}
        <section className="space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-xl font-black text-text-primary dark:text-white uppercase tracking-tight">Our Trust Philosophy</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">The core principles guiding the Aartha verification standard.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustCards.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="border border-black/10 dark:border-white/10 rounded-2xl p-6 bg-white dark:bg-navy-light hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">{title}</h3>
                  <p className="text-text-secondary dark:text-slate-300 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Core Capabilities */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text-primary dark:text-white uppercase tracking-tight">Platform Infrastructure</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">Core operational and digital layers active on the Aartha Network.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformCapabilities.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-black/10 dark:border-white/10 bg-white dark:bg-navy-light rounded-2xl p-6 space-y-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/10">
                  <Icon size={20} />
                </div>
                <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">{title}</h3>
                <p className="text-text-secondary dark:text-slate-300 text-[11px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-navy-light rounded-2xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-primary dark:text-white border-b border-black/5 dark:border-white/10 pb-2">Our Sourcing Mission</h3>
            <p className="text-text-secondary dark:text-slate-300 text-xs leading-relaxed">
              To eliminate trust friction in B2B cross-border sourcing by digitizing verification dossiers, enforcing transparent geotagged site audits, and empowering buyers with absolute evidence-backed performance metrics. We bridge the gap between global standards and local manufacturing clusters.
            </p>
          </div>
          <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-navy-light rounded-2xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-primary dark:text-white border-b border-black/5 dark:border-white/10 pb-2">Our Industrial Vision</h3>
            <p className="text-text-secondary dark:text-slate-300 text-xs leading-relaxed">
              To become the global infrastructure layer for industrial procurement verification, starting with Gujarat's premier chemical and engineering zones. We envision a world where every cross-border match is backed by instantaneous digital audit validation.
            </p>
          </div>
        </section>

        {/* Audit Leadership */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-text-primary dark:text-white uppercase tracking-tight">Audit & Operations Leadership</h2>
          <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-navy-light rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-navy text-gold flex items-center justify-center font-bold text-lg flex-shrink-0 border border-white/10 shadow-inner">
              RS
            </div>
            <div className="space-y-3 text-xs flex-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-xs text-text-primary dark:text-white uppercase tracking-wider">Rajesh Shah</h3>
                <span className="bg-gold/15 text-gold text-[9px] font-bold px-2 py-0.5 rounded border border-gold/10 uppercase tracking-wider">Senior Auditor & Head of Verification</span>
              </div>
              <p className="text-text-secondary dark:text-slate-300 leading-relaxed">
                With over 22 years of field experience auditing chemical, bulk drugs, and brass manufacturing plants across Vatva GIDC, Sachin GIDC Surat, and Ankleshwar clusters, Rajesh leads the Aartha field inspection operations. He oversees standard-compliance geocoded visit audits and physical coordinate validations.
              </p>
              <div className="flex gap-4 text-text-muted font-mono text-[9px]">
                <span>Certification: ISO 9001 Lead Auditor</span>
                <span>•</span>
                <span>Active Inspections: 350+ Factories</span>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="bg-navy rounded-3xl p-10 space-y-8 text-white border border-white/10 shadow-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy-dark opacity-80"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-xl font-extrabold text-center uppercase tracking-wider">Verified Platform Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {impactStats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center space-y-2 hover:scale-105 transition-transform duration-200">
                  <div className="p-3 bg-white/5 rounded-2xl w-fit mx-auto border border-white/10">
                    <Icon size={20} className="text-amber-400" />
                  </div>
                  <div className="text-amber-400 font-black text-2xl tracking-tight">{value}</div>
                  <div className="text-white/60 text-[9px] uppercase font-bold tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support & Contact */}
        <section id="contact" className="space-y-4">
          <h2 className="text-xl font-black text-text-primary dark:text-white uppercase tracking-tight">Support & Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-text-secondary dark:text-slate-300 font-medium">
            <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-navy-light rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-text-primary dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/10">
                <Phone size={14} className="text-amber-500" /> Customer Support
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-amber-500" /> 
                  <a href="mailto:support@aartha.site" className="hover:text-amber-500 transition-colors">support@aartha.site</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-amber-500" /> 
                  <a href="tel:+917208432138" className="hover:text-amber-500 transition-colors">+91 72084 32138</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-amber-500" /> 
                  <span>Mon–Sat: 9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>
            
            <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-navy-light rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-text-primary dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/10">
                <Building2 size={14} className="text-amber-500" /> Registered Office
              </h3>
              <p className="leading-relaxed text-[11px] text-text-secondary dark:text-slate-300">
                Aartha Enterprise Sourcing<br />
                5th Floor, Mondeal Heights,<br />
                SG Highway, Ahmedabad — 380015<br />
                Gujarat, India
              </p>
            </div>
          </div>
        </section>

        {/* Footer Tagline */}
        <section className="bg-navy rounded-3xl p-12 text-center space-y-6 text-white border border-white/10 shadow-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy-dark opacity-60"></div>
          <div className="relative z-10 space-y-6">
            <blockquote className="text-2xl lg:text-3xl font-black text-amber-400">
              "Trust is not a claim. It is our system."
            </blockquote>
            <div className="flex flex-wrap justify-center gap-3">
              {['ISO 27001 Certified', 'Secure Verification', 'Privacy Protected', 'Registry Audited'].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 bg-white/15 text-white px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10">
                  <CheckCircle2 size={13} className="text-amber-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Aartha',
            url: 'https://aartha.site',
            logo: 'https://aartha.site/logo.png',
            description: 'Verified Trade Operating System for India-Export Corridor, connecting global B2B procurement teams with verified Gujarat manufacturers.',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '5th Floor, Mondeal Heights, SG Highway',
              addressLocality: 'Ahmedabad',
              addressRegion: 'Gujarat',
              postalCode: '380015',
              addressCountry: 'IN'
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+91-72084-32138',
              contactType: 'customer support',
              email: 'support@aartha.site'
            }
          })
        }}
      />
    </div>
  );
}
