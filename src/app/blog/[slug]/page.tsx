'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowLeft, ShieldCheck, Award } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
    categoryColor: 'bg-trust-amber-bg text-trust-amber border border-trust-amber/20',
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
    categoryColor: 'bg-trust-blue-bg text-trust-blue border border-trust-blue/20',
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
    categoryColor: 'bg-trust-green-bg text-trust-green border border-trust-green/20',
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
    categoryColor: 'bg-trust-red-bg text-trust-red border border-trust-red/20',
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

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { lang } = useTranslation();
  const isGu = lang === 'gu';

  const article = articles.find(a => a.id === slug);

  if (!article) {
    return (
      <div className="bg-cream font-sans min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border border-border-default rounded-2xl p-8 max-w-sm text-center space-y-4 shadow-2xs">
          <div className="text-xl font-bold uppercase tracking-wider text-navy">Article Not Found</div>
          <p className="text-xs text-text-secondary">The requested publication could not be located in our trade archives.</p>
          <Link href="/blog" className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-bold px-6 py-2.5 rounded-lg uppercase tracking-wider no-underline">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen pb-16">
      {/* Blog Hero */}
      <section className="bg-navy text-white py-16 px-4 border-b border-border-default/10 premium-gradient-header relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-75"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${article.categoryColor}`}>
              {article.category}
            </span>
            <div className="text-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-gold/10 px-2 py-0.5 rounded border border-gold/10 shadow-2xs">
              <ShieldCheck size={11} />
              <span>Verified Audit Article</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gold bg-clip-text text-transparent uppercase">
            {article.title}
          </h1>
          <p className="text-white/85 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
            {article.summary}
          </p>
          <div className="flex flex-wrap gap-4 text-[10px] sm:text-xs text-white/50 pt-2 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1"><User size={12} className="text-gold" /> By {article.author} ({article.authorRole})</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar size={12} className="text-gold" /> {article.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-gold" /> {article.readTime}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link href="/blog" className="inline-flex items-center gap-1 text-xs font-black text-navy hover:text-gold uppercase tracking-wider transition-colors no-underline select-none">
            <ArrowLeft size={12} /> {isGu ? 'બ્લોગ પર પાછા જાઓ' : 'Back to Insights'}
          </Link>
        </div>

        <article className="bg-white border border-border-default rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="text-xs text-text-secondary leading-relaxed space-y-4 whitespace-pre-line font-medium">
            {article.content}
          </div>
          
          <div className="pt-6 border-t border-border-default/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-navy text-gold flex items-center justify-center font-black text-sm uppercase shadow-3xs">
                {article.author.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-extrabold text-navy leading-tight">{article.author}</div>
                <div className="text-[10px] text-text-muted font-medium">{article.authorRole}</div>
              </div>
            </div>
            
            <span className="text-[10px] text-text-muted font-bold font-mono">Aartha Trade Research Desk</span>
          </div>
        </article>
      </div>
    </div>
  );
}
