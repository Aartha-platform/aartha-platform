/**
 * scripts/generate_deck.js
 * Generates the Artha PIERC Idea-Selection Pitch Deck PPTX presentation.
 * 
 * Usage:
 *   npx -p pptxgenjs node scripts/generate_deck.js
 */

let pptxgen;
try {
  pptxgen = require('pptxgenjs');
} catch {
  console.error('\n[Artha Deck Generator] pptxgenjs is not in dependencies.');
  console.error('To re-generate the presentation deck, run:');
  console.error('  npm install --no-save pptxgenjs && node scripts/generate_deck.js\n');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');

async function createPitchDeck() {
  const pptx = new pptxgen();

  // Set 16:9 layout
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Artha Corridor';
  pptx.company = 'Parul Innovation & Entrepreneurship Research Centre (PIERC)';
  pptx.title = 'Artha Corridor — PIERC Idea Selection Pitch Deck';

  // Design Tokens
  const C = {
    darkBg: '0B132B',
    darkCard: '1C2541',
    navyText: '0F172A',
    navyBg: 'F8FAFC',
    cardBg: 'FFFFFF',
    cardBorder: 'E2E8F0',
    cardBorderDark: '334155',
    orange: 'EA580C',
    orangeLight: 'FFF7ED',
    orangeDark: 'C2410C',
    amber: 'D97706',
    amberLight: 'FEF3C7',
    blue: '2563EB',
    blueLight: 'EFF6FF',
    green: '059669',
    greenLight: 'ECFDF5',
    red: 'DC2626',
    redLight: 'FEF2F2',
    grayText: '475569',
    grayLight: '64748B',
    grayBorder: 'CBD5E1',
    white: 'FFFFFF'
  };

  const FONT_TITLE = 'Segoe UI';
  const FONT_BODY = 'Segoe UI';

  // Helper: Header Zone for Light Slides
  function addSlideHeader(slide, category, title, subtitle) {
    // Category pill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.4, w: 2.5, h: 0.35,
      rectRadius: 0.15,
      fill: { color: C.orangeLight },
      line: { color: C.orange, width: 1 }
    });
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.4, w: 2.5, h: 0.35,
      fontSize: 10, fontFace: FONT_TITLE, bold: true,
      color: C.orangeDark, align: 'center', valign: 'middle'
    });

    // Title
    slide.addText(title, {
      x: 0.8, y: 0.8, w: 11.5, h: 0.55,
      fontSize: 22, fontFace: FONT_TITLE, bold: true,
      color: C.navyText, valign: 'middle'
    });

    // Subtitle
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 1.35, w: 11.5, h: 0.35,
        fontSize: 12, fontFace: FONT_BODY,
        color: C.grayText, valign: 'middle'
      });
    }
  }

  // =========================================================================
  // SLIDE 1: TITLE SLIDE (Dark Navy Theme)
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.darkBg };

    // Decorative pill
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.2, w: 2.6, h: 0.4,
      rectRadius: 0.2,
      fill: { color: '1E293B' },
      line: { color: C.orange, width: 1.5 }
    });
    s.addText('PIERC IDEA-STAGE PITCH', {
      x: 0.8, y: 1.2, w: 2.6, h: 0.4,
      fontSize: 11, fontFace: FONT_TITLE, bold: true,
      color: C.orange, align: 'center', valign: 'middle'
    });

    // Main Brand Name
    s.addText('ARTHA CORRIDOR', {
      x: 0.8, y: 1.8, w: 11.5, h: 1.1,
      fontSize: 46, fontFace: FONT_TITLE, bold: true,
      color: C.white, valign: 'middle'
    });

    // Tagline / Value Prop
    s.addText('AI-Powered Trust Infrastructure for India’s Manufacturing Export Economy', {
      x: 0.8, y: 2.9, w: 11.0, h: 0.6,
      fontSize: 20, fontFace: FONT_BODY, bold: true,
      color: C.amber, valign: 'middle'
    });

    // Divider
    s.addShape(pptx.ShapeType.line, {
      x: 0.8, y: 3.7, w: 11.5, h: 0,
      line: { color: C.cardBorderDark, width: 1.5 }
    });

    // 3 Highlight Feature Badges
    const badges = [
      { title: 'VERIFY', desc: 'ISO 7064 Checksum + Live Registry APIs' },
      { title: 'SCORE', desc: 'Un-purchasable 100-Point Trust Metric' },
      { title: 'MATCH', desc: 'AI-Powered Sourcing with Evidence Cards' }
    ];

    badges.forEach((b, i) => {
      const bx = 0.8 + i * 3.9;
      s.addShape(pptx.ShapeType.roundRect, {
        x: bx, y: 4.1, w: 3.6, h: 1.2,
        rectRadius: 0.15,
        fill: { color: C.darkCard },
        line: { color: C.cardBorderDark, width: 1 }
      });
      s.addText(b.title, {
        x: bx + 0.3, y: 4.25, w: 3.0, h: 0.35,
        fontSize: 14, fontFace: FONT_TITLE, bold: true,
        color: C.orange, valign: 'middle'
      });
      s.addText(b.desc, {
        x: bx + 0.3, y: 4.65, w: 3.0, h: 0.5,
        fontSize: 11, fontFace: FONT_BODY,
        color: '94A3B8', valign: 'top'
      });
    });

    // Presenter Info Card
    s.addText('Applying for PIERC Idea-Stage Support · Parul Innovation & Entrepreneurship Research Centre (PIERC)\nVadodara, Gujarat · August 2026', {
      x: 0.8, y: 5.9, w: 11.5, h: 0.8,
      fontSize: 12, fontFace: FONT_BODY,
      color: '64748B', valign: 'middle'
    });

    s.addNotes(
      'Good morning panel members. Mera naam [Your Name] hai, aur aaj main aapke saamne pitch kar raha hoon Artha Corridor — India ke 1.84 crore manufacturers aur unhe source karne wale global buyers ke beech mein ek AI-powered trust infrastructure.'
    );
  }

  // =========================================================================
  // SLIDE 2: THE PROBLEM (The Trust Gap)
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'The Critical Problem', '1.84 Crore Manufacturers. Zero Trusted Way to Verify Them.', 'Global buyers executing China+1 mandates hit a wall of unverified brokers, ghost factories, and lead spam.');

    // Top Metric Banner
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 11.7, h: 1.0,
      rectRadius: 0.15,
      fill: { color: C.redLight },
      line: { color: C.red, width: 1.5 }
    });
    s.addText('THE PAIN IN NUMBERS: 60%+ of directory listings are trading middlemen posing as factories · 3 to 6 months & $2K–$5K wasted per supplier vetting cycle.', {
      x: 1.1, y: 1.8, w: 11.1, h: 1.0,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.red, valign: 'middle', align: 'center'
    });

    // 3 Cards: Incumbent Failures
    const cards = [
      {
        title: 'IndiaMART & Opaque Directories',
        badge: '₹1,569 Cr Rev · 220K Paid Suppliers',
        points: [
          'Zero factory ground-truth verification',
          'Revenue comes from listing volume, not quality',
          'Buyers flooded with 40+ spam broker calls per RFQ',
          'Genuine manufacturers drown in SEO bidding wars'
        ],
        border: C.cardBorder
      },
      {
        title: 'Alibaba Gold Supplier',
        badge: 'Paid Badging Model ($2K–$6K/yr)',
        points: [
          'Badges can be purchased without factory audit',
          'Called "false sense of security" by global procurement',
          'China-centric; virtually zero Indian MSME coverage',
          'No continuous verification or data freshness tracking'
        ],
        border: C.cardBorder
      },
      {
        title: 'SGS / TÜV / Physical Audits',
        badge: '$2,000–$5,000 Per Factory Audit',
        points: [
          'Gold standard, but cost-prohibitive for 99% of MSMEs',
          'One-time static snapshot; decays within 6 months',
          'Takes 4–6 weeks per report; impossible to scale',
          'Not integrated into any AI discovery or matching workflow'
        ],
        border: C.cardBorder
      }
    ];

    cards.forEach((c, i) => {
      const cx = 0.8 + i * 4.0;
      s.addShape(pptx.ShapeType.roundRect, {
        x: cx, y: 3.0, w: 3.7, h: 3.6,
        rectRadius: 0.15,
        fill: { color: C.cardBg },
        line: { color: c.border, width: 1.5 }
      });
      s.addText(c.title, {
        x: cx + 0.3, y: 3.2, w: 3.1, h: 0.45,
        fontSize: 13, fontFace: FONT_TITLE, bold: true,
        color: C.navyText, valign: 'top'
      });
      // Pill
      s.addShape(pptx.ShapeType.roundRect, {
        x: cx + 0.3, y: 3.7, w: 3.1, h: 0.3,
        rectRadius: 0.1,
        fill: { color: 'F1F5F9' },
        line: { color: 'CBD5E1', width: 1 }
      });
      s.addText(c.badge, {
        x: cx + 0.3, y: 3.7, w: 3.1, h: 0.3,
        fontSize: 9, fontFace: FONT_BODY, bold: true,
        color: C.grayText, align: 'center', valign: 'middle'
      });

      // Bullets
      const bulletText = c.points.map(p => ({ text: p + '\n', options: { bullet: true, fontSize: 10, color: C.grayText } }));
      s.addText(bulletText, {
        x: cx + 0.3, y: 4.15, w: 3.1, h: 2.3,
        fontFace: FONT_BODY, valign: 'top'
      });
    });

    s.addNotes(
      'Sir, problem yeh hai: jab ek German ya US buyer India se manufacturing sourcing karna chahta hai, toh legacy directories par sirf kachra data milta hai. IndiaMART ka ₹1,569 crore revenue aata hai bina ek bhi factory verify kiye. SGS audit $5,000 lagta hai ek factory ka. Result? 60% se zyada brokers hote hain aur buyers ka 3-6 months waste ho jata hai.'
    );
  }

  // =========================================================================
  // SLIDE 3: WHY NOW (Convergence of Macro Forces)
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'Macro Tailwinds', 'Why Now: Three Powerful Forces Converging', 'Structural shifts in global supply chains make verified Indian manufacturing an urgent priority.');

    const pillars = [
      {
        num: '01',
        title: 'China+1 Is Operational Reality',
        stat: '$81.04 Billion FDI',
        statSub: '+14% YoY in FY25 · Mfg FDI: $19.04B (+18%)',
        points: [
          'Global procurement boards mandated supply chain de-risking',
          'India manufactures ~25% of global iPhones in 2025-26',
          'Buyers actively seeking direct Indian MSME alternatives',
          'Bottleneck is not factory capacity—it is trust verification'
        ],
        accent: C.blue,
        bg: C.blueLight
      },
      {
        num: '02',
        title: 'MSME Export Surge & Policy Push',
        stat: '48.58% of Total Exports',
        statSub: '₹9.52 Lakh Cr (H1 FY26) · 1,73,350 Active Exporters',
        points: [
          '8.7+ crore MSMEs registered on Udyam platform',
          'Govt launched ₹25,060 Cr Export Promotion Mission (FY26–31)',
          'High momentum in electronics, precision engineering & pharma',
          'MSMEs desperately need international direct buyer access'
        ],
        accent: C.orange,
        bg: C.orangeLight
      },
      {
        num: '03',
        title: 'The Missing Digital Trust Layer',
        stat: '$12B+ Global Market',
        statSub: 'Supplier Quality & KYB Verification Market',
        points: [
          '94% of Indian MSMEs are unorganized—traditional D&B fails',
          'Buyers demand "evidence-based sourcing" over lead spam',
          'No India-specialized AI verification platform exists today',
          'First platform to build proprietary GIDC data wins the category'
        ],
        accent: C.green,
        bg: C.greenLight
      }
    ];

    pillars.forEach((p, i) => {
      const px = 0.8 + i * 4.0;
      s.addShape(pptx.ShapeType.roundRect, {
        x: px, y: 1.8, w: 3.7, h: 4.8,
        rectRadius: 0.15,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1.5 }
      });

      s.addText(p.num, {
        x: px + 0.3, y: 2.0, w: 0.8, h: 0.4,
        fontSize: 16, fontFace: FONT_TITLE, bold: true,
        color: p.accent
      });
      s.addText(p.title, {
        x: px + 0.3, y: 2.4, w: 3.1, h: 0.6,
        fontSize: 13, fontFace: FONT_TITLE, bold: true,
        color: C.navyText, valign: 'top'
      });

      s.addShape(pptx.ShapeType.roundRect, {
        x: px + 0.3, y: 3.05, w: 3.1, h: 0.75,
        rectRadius: 0.1,
        fill: { color: p.bg },
        line: { color: p.accent, width: 1 }
      });
      s.addText(p.stat, {
        x: px + 0.3, y: 3.1, w: 3.1, h: 0.38,
        fontSize: 13, fontFace: FONT_TITLE, bold: true,
        color: p.accent, align: 'center', valign: 'middle'
      });
      s.addText(p.statSub, {
        x: px + 0.3, y: 3.48, w: 3.1, h: 0.28,
        fontSize: 8.5, fontFace: FONT_BODY,
        color: C.grayText, align: 'center', valign: 'top'
      });

      const bulletText = p.points.map(pt => ({ text: pt + '\n', options: { bullet: true, fontSize: 10, color: C.grayText } }));
      s.addText(bulletText, {
        x: px + 0.3, y: 3.95, w: 3.1, h: 2.5,
        fontFace: FONT_BODY, valign: 'top'
      });
    });

    s.addNotes(
      'Teen cheezein ek saath ho rahi hain. Pehla: China+1 ab board-level reality hai — India FDI $81 billion tak pahunch chuka hai. Doosra: MSMEs ab India ke 48.58% exports handle karte hain aur govt ne ₹25,000 Cr ka mission diya hai. Teesra: Traditional D&B risk tools fail ho rahe hain kyunki 94% MSMEs unorganized hain. Artha is exact timing window ko capture karta hai.'
    );
  }

  // =========================================================================
  // SLIDE 4: THE SOLUTION (Artha Corridor Architecture)
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'Core Solution', 'Artha: Verify → Score → Match', 'Not a marketplace. Not a directory. An end-to-end AI-powered Trust Infrastructure.');

    const steps = [
      {
        step: 'STEP 1',
        title: 'FACTORY REGISTERS',
        tag: 'Onboarding & Evidence',
        desc: 'Factory enters GSTIN, IEC, machinery capacity, and uploads licenses + factory walkthrough video.',
        color: C.blue,
        bg: C.blueLight
      },
      {
        step: 'STEP 2',
        title: 'ARTHA VERIFIES',
        tag: 'Multi-Layer Validation',
        desc: 'ISO 7064 GSTIN checksum + Live government registry API cross-checks + Physical GPS tag confirmation.',
        color: C.orange,
        bg: C.orangeLight
      },
      {
        step: 'STEP 3',
        title: 'TRUST SCORE COMPUTED',
        tag: 'Un-purchasable Metric',
        desc: 'Deterministic 100-pt algorithm with automatic freshness decay. Badges are earned from data, never bought.',
        color: C.green,
        bg: C.greenLight
      },
      {
        step: 'STEP 4',
        title: 'AI MATCHES TO BUYERS',
        tag: 'Evidence-Backed Shortlist',
        desc: 'Buyer posts RFQ → AI extracts requirements, filters verified suppliers, and outputs ranked shortlist with proof.',
        color: C.amber,
        bg: C.amberLight
      }
    ];

    steps.forEach((st, i) => {
      const sx = 0.8 + i * 3.0;
      s.addShape(pptx.ShapeType.roundRect, {
        x: sx, y: 1.8, w: 2.8, h: 4.8,
        rectRadius: 0.15,
        fill: { color: C.cardBg },
        line: { color: st.color, width: 1.5 }
      });

      s.addShape(pptx.ShapeType.roundRect, {
        x: sx + 0.25, y: 2.0, w: 1.2, h: 0.3,
        rectRadius: 0.1,
        fill: { color: st.bg },
        line: { color: st.color, width: 1 }
      });
      s.addText(st.step, {
        x: sx + 0.25, y: 2.0, w: 1.2, h: 0.3,
        fontSize: 9, fontFace: FONT_TITLE, bold: true,
        color: st.color, align: 'center', valign: 'middle'
      });

      s.addText(st.title, {
        x: sx + 0.25, y: 2.45, w: 2.3, h: 0.6,
        fontSize: 12, fontFace: FONT_TITLE, bold: true,
        color: C.navyText, valign: 'top'
      });

      s.addText(st.tag, {
        x: sx + 0.25, y: 3.1, w: 2.3, h: 0.3,
        fontSize: 9.5, fontFace: FONT_BODY, bold: true,
        color: C.grayLight, valign: 'top'
      });

      s.addShape(pptx.ShapeType.line, {
        x: sx + 0.25, y: 3.45, w: 2.3, h: 0,
        line: { color: C.cardBorder, width: 1 }
      });

      s.addText(st.desc, {
        x: sx + 0.25, y: 3.6, w: 2.3, h: 2.8,
        fontSize: 10.5, fontFace: FONT_BODY,
        color: C.grayText, valign: 'top'
      });
    });

    s.addNotes(
      'Artha teen simple kaam karta hai: Verify, Score, Match. Factory register hoti hai — hum use government registries aur ground data se verify karte hain. Phir ek 100-point trust score compute hota hai jo khareed nahi sakte, sirf data se milta hai. Jab international buyer requirement submit karta hai, humara AI matched factories ko confidence score ke sath rank karta hai.'
    );
  }

  // =========================================================================
  // SLIDE 5: THE AI + TRUST ENGINE (Technical Rigor)
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'Technology Architecture', 'The AI & Trust Engine: Phased & Accountable', 'Transparent multi-attribute ranking with explainability and automatic trust score freshness decay.');

    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.8, h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1.5 }
    });
    s.addText('AI MATCHING ROADMAP', {
      x: 1.1, y: 2.0, w: 5.2, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.orange, valign: 'middle'
    });

    const aiPhases = [
      {
        name: 'PHASE 1: Deterministic + Hybrid LLM (BUILT & OPERATIONAL)',
        desc: '100-point rule-based scorer + hard constraint filter (categories, ISO standards) + GPT-4o fallback for unstructured buyer queries. 0 hallucination risk.'
      },
      {
        name: 'PHASE 2: Semantic Search & Intent Extraction (WITH FUNDING)',
        desc: 'NLP intent parsing on free-text RFQs + pgvector embeddings for deep capability matching beyond exact keyword synonyms.'
      },
      {
        name: 'PHASE 3: Feedback Loops & Anomaly ML (WITH TRANSACTIONS)',
        desc: 'Buyer acceptance/rejection logs adjust ranking weights; predictive fraud detection monitors continuous compliance changes.'
      }
    ];

    aiPhases.forEach((ap, i) => {
      s.addText(ap.name, {
        x: 1.1, y: 2.45 + i * 1.35, w: 5.2, h: 0.35,
        fontSize: 10.5, fontFace: FONT_TITLE, bold: true,
        color: C.navyText, valign: 'top'
      });
      s.addText(ap.desc, {
        x: 1.1, y: 2.8 + i * 1.35, w: 5.2, h: 0.95,
        fontSize: 9.5, fontFace: FONT_BODY,
        color: C.grayText, valign: 'top'
      });
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.9, y: 1.8, w: 5.6, h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1.5 }
    });
    s.addText('100-POINT TRUST SCORE BREAKDOWN', {
      x: 7.2, y: 2.0, w: 5.0, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.blue, valign: 'middle'
    });

    const scoreMetrics = [
      { label: 'Identity & Legal Validity (GSTIN/IEC/PAN)', pts: '25 Pts', color: C.blue },
      { label: 'Reputation & Export History Proof', pts: '20 Pts', color: C.green },
      { label: 'Response Rate & SLA Reliability', pts: '20 Pts', color: C.amber },
      { label: 'Physical Audit Quality & GPS Walkthrough', pts: '15 Pts', color: C.orange },
      { label: 'Platform Engagement & Completeness', pts: '10 Pts', color: C.grayText },
      { label: 'ISO / Quality Certifications Bonus', pts: '10 Pts', color: C.green }
    ];

    scoreMetrics.forEach((sm, i) => {
      s.addText(sm.label, {
        x: 7.2, y: 2.45 + i * 0.45, w: 4.0, h: 0.35,
        fontSize: 10, fontFace: FONT_BODY,
        color: C.navyText, valign: 'middle'
      });
      s.addText(sm.pts, {
        x: 11.2, y: 2.45 + i * 0.45, w: 1.0, h: 0.35,
        fontSize: 10, fontFace: FONT_TITLE, bold: true,
        color: sm.color, align: 'right', valign: 'middle'
      });
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 7.2, y: 5.2, w: 5.0, h: 1.2,
      rectRadius: 0.1,
      fill: { color: C.orangeLight },
      line: { color: C.orange, width: 1 }
    });
    s.addText('AUTOMATIC FRESHNESS DECAY (ANTI-STALE):', {
      x: 7.4, y: 5.25, w: 4.6, h: 0.25,
      fontSize: 9, fontFace: FONT_TITLE, bold: true,
      color: C.orangeDark
    });
    s.addText('• >90 Days: -5% Decay · >180 Days: -15% Decay · >365 Days: -30% (Badge Expired)\nTrust is continuously earned through updated evidence, never permanent.', {
      x: 7.4, y: 5.5, w: 4.6, h: 0.8,
      fontSize: 8.5, fontFace: FONT_BODY,
      color: C.grayText
    });

    s.addNotes(
      'AI vaporware nahi hai. Phase 1 already functional hai codebase mein — deterministic multi-attribute scoring with hard constraints. Funding ke sath Phase 2 add hoga: NLP intent parsing and semantic embeddings. Trust score mein freshness decay hai — agar 180 din se factory ne data update nahi kiya, score 15% drop ho jayega. Trust static nahi, continuous hai.'
    );
  }

  // =========================================================================
  // SLIDE 6: MARKET SIZE + GUJARAT BEACHHEAD
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'Market Opportunity & Beachhead', '₹2,600 Cr SAM. Launching in Makarpura GIDC, Vadodara.', 'Saturating dense manufacturing clusters before scaling pan-India.');

    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.5, h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1.5 }
    });
    s.addText('MARKET SIZE SIZING (VERIFIED DATA)', {
      x: 1.1, y: 2.0, w: 4.9, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.orange, valign: 'middle'
    });

    const marketTiers = [
      {
        tier: 'TAM: $12.0+ BILLION',
        sub: 'Global Supplier Verification, KYB & Sourcing Software Market',
        color: C.blue, bg: C.blueLight
      },
      {
        tier: 'SAM: ₹2,600 CRORE ($310M)',
        sub: '1,73,350 Actively Exporting Indian MSMEs × Avg ₹15K/yr Verification + Buyer Sourcing Subscriptions',
        color: C.green, bg: C.greenLight
      },
      {
        tier: 'SOM: ₹50 LAKH ARR (YEAR 1)',
        sub: '500 Verified Factories in Gujarat + 20 Active International Mid-Market Procurement Desks',
        color: C.orange, bg: C.orangeLight
      }
    ];

    marketTiers.forEach((mt, i) => {
      s.addShape(pptx.ShapeType.roundRect, {
        x: 1.1, y: 2.45 + i * 1.25, w: 4.9, h: 1.1,
        rectRadius: 0.1,
        fill: { color: mt.bg },
        line: { color: mt.color, width: 1 }
      });
      s.addText(mt.tier, {
        x: 1.25, y: 2.5 + i * 1.25, w: 4.6, h: 0.35,
        fontSize: 12, fontFace: FONT_TITLE, bold: true,
        color: mt.color, valign: 'middle'
      });
      s.addText(mt.sub, {
        x: 1.25, y: 2.85 + i * 1.25, w: 4.6, h: 0.6,
        fontSize: 9.5, fontFace: FONT_BODY,
        color: C.grayText, valign: 'top'
      });
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.6, y: 1.8, w: 5.9, h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1.5 }
    });
    s.addText('WHY GUJARAT & MAKARPURA GIDC?', {
      x: 6.9, y: 2.0, w: 5.3, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.navyText, valign: 'middle'
    });

    const gujStats = [
      'Gujarat accounts for 25.6% of India’s total merchandise exports ($110.63B in FY26)',
      '239+ GIDC industrial estates with world-class specialized clusters',
      'Makarpura GIDC (Vadodara) is 40 min from Parul University campus',
      'Target Wedge: Precision Engineering, Electrical Panels, and PCB Assemblies'
    ];

    const bulletG = gujStats.map(g => ({ text: g + '\n', options: { bullet: true, fontSize: 10.5, color: C.grayText } }));
    s.addText(bulletG, {
      x: 6.9, y: 2.45, w: 5.3, h: 2.2,
      fontFace: FONT_BODY, valign: 'top'
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.9, y: 4.7, w: 5.3, h: 1.7,
      rectRadius: 0.1,
      fill: { color: 'F1F5F9' },
      line: { color: 'CBD5E1', width: 1 }
    });
    s.addText('HYPER-LOCAL PILOT EXECUTION:', {
      x: 7.1, y: 4.8, w: 4.9, h: 0.25,
      fontSize: 10, fontFace: FONT_TITLE, bold: true,
      color: C.navyText
    });
    s.addText('Density beats breadth. Sourcing directors prefer 50 verified factories in one specific cluster (Makarpura Electricals) rather than 5 scattered across India. We saturate one cluster, prove the flywheel, then replicate to Ankleshwar (Chemicals) & Rajkot (Machining).', {
      x: 7.1, y: 5.1, w: 4.9, h: 1.2,
      fontSize: 9.5, fontFace: FONT_BODY,
      color: C.grayText
    });

    s.addNotes(
      'Market opportunity verified hai: SAM ₹2,600 crore hai. Hum Year 1 mein ₹50 Lakh ARR target kar rahe hain from 500 factories. Hum start Gujarat ke Makarpura GIDC se kar rahe hain jo Parul campus se 40 min door hai. Marketplace mein density breadth se jeetti hai — hum pehle ek cluster dominate karenge, phir expand karenge.'
    );
  }

  // =========================================================================
  // SLIDE 7: BUSINESS MODEL & ASYMMETRIC PRICING
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'Monetization Strategy', 'Business Model: Asymmetric Verification Pricing', 'Monetizing un-purchasable trust audits, not paid ad positioning.');

    const tiers = [
      {
        name: 'TIER 1: LISTED',
        price: 'FREE',
        sub: 'Self-Declared Directory',
        items: ['Email + Phone OTP check', 'Self-declared capacity', 'Basic discovery listing', 'No trust badge'],
        border: C.cardBorder, color: C.grayLight, bg: 'F8FAFC'
      },
      {
        name: 'TIER 2: BUSINESS',
        price: '₹999 / yr',
        sub: 'Registry Validated',
        items: ['Active GSTIN checksum check', 'IEC export registry match', 'Bank account KYC check', 'Business Verified badge'],
        border: C.blue, color: C.blue, bg: C.blueLight
      },
      {
        name: 'TIER 3: VERIFIED',
        price: '₹9,999 / yr',
        sub: 'Document & Video Audit',
        items: ['License authenticity review', 'Video factory walkthrough', 'Capacity cross-verification', 'Verified Supplier badge'],
        border: C.orange, color: C.orange, bg: C.orangeLight
      },
      {
        name: 'TIER 4: AUDITED',
        price: '₹29,999 / yr',
        sub: 'GPS Physical Audit',
        items: ['On-site physical inspection', 'Machine capacity timestamp', 'Continuous monthly monitor', 'Gold Audited badge'],
        border: C.green, color: C.green, bg: C.greenLight
      }
    ];

    tiers.forEach((t, i) => {
      const tx = 0.8 + i * 3.0;
      s.addShape(pptx.ShapeType.roundRect, {
        x: tx, y: 1.8, w: 2.8, h: 3.7,
        rectRadius: 0.15,
        fill: { color: C.cardBg },
        line: { color: t.border, width: 1.5 }
      });

      s.addText(t.name, {
        x: tx + 0.2, y: 2.0, w: 2.4, h: 0.3,
        fontSize: 10, fontFace: FONT_TITLE, bold: true,
        color: t.color, align: 'center'
      });
      s.addText(t.price, {
        x: tx + 0.2, y: 2.3, w: 2.4, h: 0.4,
        fontSize: 18, fontFace: FONT_TITLE, bold: true,
        color: C.navyText, align: 'center'
      });
      s.addText(t.sub, {
        x: tx + 0.2, y: 2.7, w: 2.4, h: 0.3,
        fontSize: 8.5, fontFace: FONT_BODY,
        color: C.grayLight, align: 'center'
      });

      s.addShape(pptx.ShapeType.line, {
        x: tx + 0.2, y: 3.05, w: 2.4, h: 0,
        line: { color: C.cardBorder, width: 1 }
      });

      const bulletT = t.items.map(it => ({ text: it + '\n', options: { bullet: true, fontSize: 9.5, color: C.grayText } }));
      s.addText(bulletT, {
        x: tx + 0.2, y: 3.15, w: 2.4, h: 2.2,
        fontFace: FONT_BODY, valign: 'top'
      });
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 5.65, w: 11.7, h: 1.05,
      rectRadius: 0.15,
      fill: { color: C.amberLight },
      line: { color: C.amber, width: 1.5 }
    });
    s.addText('⚠️ THE GOLDEN RULE OF ARTHA: You pay for the audit. You CANNOT pay for the ranking.', {
      x: 1.1, y: 5.75, w: 11.1, h: 0.35,
      fontSize: 12, fontFace: FONT_TITLE, bold: true,
      color: C.orangeDark, align: 'center'
    });
    s.addText('MSMEs already spend ₹71,000/yr on IndiaMART for unverified lead spam. Artha’s ₹9,999 Tier is 86% cheaper and opens real international procurement desks.', {
      x: 1.1, y: 6.05, w: 11.1, h: 0.55,
      fontSize: 10.5, fontFace: FONT_BODY,
      color: C.grayText, align: 'center'
    });

    s.addNotes(
      'Primary revenue: supplier verification fees. Free se lekar ₹29,999/yr tak — jo SGS ke $5,000 se 90% sasta hai. Sabse important rule: aap audit ka fee dete hain, ranking ka nahi. MSMEs already IndiaMART ko ₹71,000/yr dete hain spam leads ke liye. Artha unhe 86% less cost mein international exposure deta hai.'
    );
  }

  // =========================================================================
  // SLIDE 8: COMPETITIVE ADVANTAGE & THE STRUCTURAL MOAT
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'Defensibility & Moat', 'Why Artha Wins: The Structural Advantage', 'Incumbents are trapped by their own revenue models. Artha’s incentives are aligned with truth.');

    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.red, width: 1.5 }
    });
    s.addText('INDIAMART’S STRUCTURAL TRAP', {
      x: 1.1, y: 2.0, w: 5.1, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.red, valign: 'middle'
    });

    const imTraps = [
      { t: 'Revenue Model = Listing Volume', d: 'Earns ₹1,569 Cr by charging 220K suppliers for lead visibility.' },
      { t: 'Verification Kills Their Cash Flow', d: 'Enforcing strict factory audits would disqualify >60% of their paying user base (brokers & traders).' },
      { t: 'The Vicious Incentives Cycle', d: 'They are financially incentivized to maximize supplier volume, which guarantees lead spam and degrades buyer trust.' },
      { t: 'Cannot Pivot', d: 'They cannot copy Artha’s un-purchasable trust badge without cannibalizing their core revenue.' }
    ];

    imTraps.forEach((tr, i) => {
      s.addText('❌ ' + tr.t, {
        x: 1.1, y: 2.45 + i * 1.0, w: 5.1, h: 0.3,
        fontSize: 11, fontFace: FONT_TITLE, bold: true,
        color: C.navyText, valign: 'top'
      });
      s.addText(tr.d, {
        x: 1.4, y: 2.75 + i * 1.0, w: 4.8, h: 0.65,
        fontSize: 9.5, fontFace: FONT_BODY,
        color: C.grayText, valign: 'top'
      });
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.green, width: 1.5 }
    });
    s.addText('ARTHA’S COMPOUNDING DATA FLYWHEEL', {
      x: 7.1, y: 2.0, w: 5.1, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.green, valign: 'middle'
    });

    const arthaFlywheel = [
      { t: 'Revenue Aligned with Verification Quality', d: 'We only monetize when data is verifiable and trusted by procurement.' },
      { t: 'Proprietary Field & Registry Intelligence', d: 'GPS-tagged walkthroughs, ISO 7064 checksums, and machinery audits cannot be scraped from the web.' },
      { t: 'Outcome-Driven Matching Improvement', d: 'Every closed transaction feeds back into AI ranking weights, creating a compounding accuracy moat.' },
      { t: 'Un-purchasable Integrity Moat', d: 'Because badges cannot be bought, high-quality export factories proactively seek Artha verification to stand out.' }
    ];

    arthaFlywheel.forEach((af, i) => {
      s.addText('✓ ' + af.t, {
        x: 7.1, y: 2.45 + i * 1.0, w: 5.1, h: 0.3,
        fontSize: 11, fontFace: FONT_TITLE, bold: true,
        color: C.green, valign: 'top'
      });
      s.addText(af.d, {
        x: 7.4, y: 2.75 + i * 1.0, w: 4.8, h: 0.65,
        fontSize: 9.5, fontFace: FONT_BODY,
        color: C.grayText, valign: 'top'
      });
    });

    s.addNotes(
      'IndiaMART verification kyun nahi karta? Kyunki unka ₹1,569 Cr revenue volume pe chalta hai. Agar unhone verification mandatory kiya, 60% paying subscribers disqualify ho jayenge. Yeh feature gap nahi hai, yeh business model trap hai. Artha ka revenue trust quality se aligned hai, aur humara real data moat field operations se build hota hai.'
    );
  }

  // =========================================================================
  // SLIDE 9: MVP STATUS & EXECUTION PROOF
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.navyBg };
    addSlideHeader(s, 'Current Traction & Proof', 'What Is Already Built: Solo Founder Execution', 'Demonstrable, production-grade Next.js codebase built to institutional standards.');

    const statusCols = [
      {
        title: 'BUILT & OPERATIONAL (LIVE)',
        badge: 'Zero TypeScript Errors',
        color: C.green, bg: C.greenLight,
        items: [
          '95 production routes (27 UI pages + 66 API endpoints)',
          '47 React 19 UI components + 32 backend modules',
          '7-State verification state machine in code',
          '100-Point quality score with freshness decay',
          'ISO 7064 GSTIN checksum validator (offline active)',
          'Hybrid AI matching engine (rule-based + GPT-4o fallback)',
          '8-Layer security (CSRF, scrypt hashing, OTP, rate limits)'
        ]
      },
      {
        title: 'CONFIGURED & READY (API LINK)',
        badge: 'Infrastructure Scaffolded',
        color: C.blue, bg: C.blueLight,
        items: [
          'Dual-mode database adapter (Offline JSON ⇄ Supabase PostgreSQL)',
          'Sandbox.co.in GSTIN & IEC live lookup module',
          'Resend transactional email notification pipeline',
          'Razorpay payment gateway order creation flow',
          'Document type classifier (10 Indian export document formats)'
        ]
      },
      {
        title: 'NEXT WITH PIERC SUPPORT',
        badge: 'Field Ops & Liquidity',
        color: C.orange, bg: C.orangeLight,
        items: [
          'Onboard 50 verified factories in Makarpura GIDC',
          'Activate production Supabase DB & live GSP API keys',
          'LinkedIn outreach to 200 European/US procurement managers',
          'Execute first 5 real RFQs matched to verified factories',
          'Hire 2 Parul University developer interns'
        ]
      }
    ];

    statusCols.forEach((sc, i) => {
      const scx = 0.8 + i * 4.0;
      s.addShape(pptx.ShapeType.roundRect, {
        x: scx, y: 1.8, w: 3.7, h: 4.8,
        rectRadius: 0.15,
        fill: { color: C.cardBg },
        line: { color: sc.color, width: 1.5 }
      });

      s.addText(sc.title, {
        x: scx + 0.25, y: 2.0, w: 3.2, h: 0.35,
        fontSize: 11, fontFace: FONT_TITLE, bold: true,
        color: sc.color, valign: 'top'
      });

      s.addShape(pptx.ShapeType.roundRect, {
        x: scx + 0.25, y: 2.4, w: 3.2, h: 0.3,
        rectRadius: 0.1,
        fill: { color: sc.bg },
        line: { color: sc.color, width: 1 }
      });
      s.addText(sc.badge, {
        x: scx + 0.25, y: 2.4, w: 3.2, h: 0.3,
        fontSize: 9, fontFace: FONT_BODY, bold: true,
        color: sc.color, align: 'center', valign: 'middle'
      });

      const bulletSc = sc.items.map(it => ({ text: it + '\n', options: { bullet: true, fontSize: 9.5, color: C.grayText } }));
      s.addText(bulletSc, {
        x: scx + 0.25, y: 2.85, w: 3.2, h: 3.6,
        fontFace: FONT_BODY, valign: 'top'
      });
    });

    s.addNotes(
      'Main ne akele poora technical foundation build kiya hai — 95 routes, 47 components, 7-state verification machine, ISO 7064 GST checksum, AI matching — sab production-grade TypeScript mein with zero errors. Yeh MVP proves ki founder build kar sakta hai. PIERC ke support se hum is architecture ko real GIDC factory data se connect karenge.'
    );
  }

  // =========================================================================
  // SLIDE 10: THE ASK & PIERC ALIGNMENT (Conclusion)
  // =========================================================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.darkBg };

    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.4, w: 2.4, h: 0.35,
      rectRadius: 0.15,
      fill: { color: '1E293B' },
      line: { color: C.orange, width: 1 }
    });
    s.addText('THE PROPOSAL & ASK', {
      x: 0.8, y: 0.4, w: 2.4, h: 0.35,
      fontSize: 10, fontFace: FONT_TITLE, bold: true,
      color: C.orange, align: 'center', valign: 'middle'
    });

    s.addText('The Ask: PIERC Idea-Stage Incubation & ₹10L Grant Support', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.55,
      fontSize: 22, fontFace: FONT_TITLE, bold: true,
      color: C.white, valign: 'middle'
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.5, w: 5.6, h: 4.2,
      rectRadius: 0.15,
      fill: { color: C.darkCard },
      line: { color: C.cardBorderDark, width: 1 }
    });
    s.addText('PIERC 3-STAGE PROGRESSION ROADMAP', {
      x: 1.1, y: 1.7, w: 5.0, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.orange, valign: 'middle'
    });

    const piercStages = [
      { st: 'IDEA STAGE (WEEKS 1–2)', d: 'Conduct ground surveys with 30 Makarpura GIDC factories via PIERC market research programs to refine 4-tier verification protocol.' },
      { st: 'PROTOTYPE STAGE (MONTHS 2–4)', d: 'Deploy live Supabase backend, integrate MasterIndia GSTIN API, and complete corporate incorporation + IPR filing via PIERC legal support.' },
      { st: 'GROWTH STAGE (MONTHS 5–12)', d: 'Execute LinkedIn outbound to 200 global buyers, generate first 5 verified RFQs, achieve ₹50L ARR run-rate, and prepare for Seed Round.' }
    ];

    piercStages.forEach((ps, i) => {
      s.addText('📍 ' + ps.st, {
        x: 1.1, y: 2.15 + i * 1.1, w: 5.0, h: 0.3,
        fontSize: 10.5, fontFace: FONT_TITLE, bold: true,
        color: C.white, valign: 'top'
      });
      s.addText(ps.d, {
        x: 1.4, y: 2.45 + i * 1.1, w: 4.7, h: 0.75,
        fontSize: 9.5, fontFace: FONT_BODY,
        color: '94A3B8', valign: 'top'
      });
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: 1.5, w: 5.7, h: 4.2,
      rectRadius: 0.15,
      fill: { color: C.darkCard },
      line: { color: C.cardBorderDark, width: 1 }
    });
    s.addText('UTILIZATION OF ₹10 LAKHS FUNDING SUPPORT', {
      x: 7.1, y: 1.7, w: 5.1, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.amber, valign: 'middle'
    });

    const budget = [
      { item: 'GIDC Field Operations & Factory Cataloging', amt: '₹2.5 Lakhs', desc: '50 on-site factory video audits in Makarpura/Vatva' },
      { item: 'Parul Student Tech Talent Hire', amt: '₹3.0 Lakhs', desc: '2 technical student developer interns (6 months)' },
      { item: 'Production API & Cloud Infrastructure', amt: '₹1.5 Lakhs', desc: 'Live GSP GSTIN check APIs, Supabase & Resend servers' },
      { item: 'Legal, IPR & Company Incorporation', amt: '₹1.0 Lakh', desc: 'Trademark, compliance, and custom trade escrow model' },
      { item: 'Working Capital & Contingency Runway', amt: '₹2.0 Lakhs', desc: 'Zero-paid-ad operational runway for 12 months' }
    ];

    budget.forEach((b, i) => {
      s.addText(b.item, {
        x: 7.1, y: 2.15 + i * 0.68, w: 3.7, h: 0.25,
        fontSize: 9.5, fontFace: FONT_TITLE, bold: true,
        color: C.white, valign: 'top'
      });
      s.addText(b.amt, {
        x: 10.8, y: 2.15 + i * 0.68, w: 1.4, h: 0.25,
        fontSize: 9.5, fontFace: FONT_TITLE, bold: true,
        color: C.amber, align: 'right', valign: 'top'
      });
      s.addText(b.desc, {
        x: 7.1, y: 2.4 + i * 0.68, w: 5.1, h: 0.38,
        fontSize: 8.5, fontFace: FONT_BODY,
        color: '94A3B8', valign: 'top'
      });
    });

    s.addText('Artha Corridor: Building India’s Manufacturing Trust Infrastructure · Thank You · Q&A', {
      x: 0.8, y: 5.9, w: 11.7, h: 0.6,
      fontSize: 13, fontFace: FONT_TITLE, bold: true,
      color: C.white, align: 'center', valign: 'middle'
    });

    s.addNotes(
      'Meri request hai: PIERC Idea Stage cohort mein selection. Hum PIERC ke 3-stage program ke saath perfectly align kar rahe hain — Idea Stage mein local Makarpura validation, Prototype mein live deployment and IPR support, aur Growth stage mein international buyer matchmaking. Up to ₹10 Lakhs ka support Parul ke developers ko hire karne, field operations run karne aur production APIs link karne mein strictly use hoga. Thank you, ab aapke koi questions ho toh please poochiye.'
    );
  }

  // Output paths
  const outDirWorkspace = path.join('c:', 'Users', 'rajat', 'Desktop', 'new world', 'docs');
  const outDirDownloads = path.join('c:', 'Users', 'rajat', 'Downloads');

  if (!fs.existsSync(outDirWorkspace)) {
    fs.mkdirSync(outDirWorkspace, { recursive: true });
  }

  const fileWorkspace = path.join(outDirWorkspace, 'Artha_Corridor_PIERC_Pitch_Deck.pptx');
  const fileDownloads = path.join(outDirDownloads, 'Artha_Corridor_PIERC_Pitch_Deck.pptx');

  await pptx.writeFile({ fileName: fileWorkspace });
  console.log(`Successfully generated workspace pitch deck: ${fileWorkspace}`);

  try {
    await pptx.writeFile({ fileName: fileDownloads });
    console.log(`Successfully generated Downloads pitch deck: ${fileDownloads}`);
  } catch (err) {
    console.warn(`Could not write to downloads directly: ${err.message}`);
  }
}

createPitchDeck().catch(console.error);
