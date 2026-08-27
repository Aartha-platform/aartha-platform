import { suppliers } from '@/data/suppliers';

export interface CopilotResponse {
  mode: 'sourcing' | 'document' | 'rfq' | 'market' | 'risk';
  reply: string;
  suggestedPrompts: string[];
}

export function generateAssistantReply(mode: string, input: string): CopilotResponse {
  const query = input.toLowerCase();

  if (mode === 'sourcing') {
    if (query.includes('paracetamol') || query.includes('pharma') || query.includes('api')) {
      const match = suppliers.find(s => s.id === 's4') || suppliers[0];
      return {
        mode: 'sourcing',
        reply: `### Pharma Corridor Match Result
I found a high-quality match for Paracetamol API sourcing:
- **Supplier:** ${match.companyName}
- **Location:** ${match.location.city} (${match.location.gidcZone || 'GIDC zone'})
- **Trust Score:** **${match.qualityScore.total}/100** (Premium Audit Tier)
- **Top Certifications:** ${match.certifications.join(', ')}

**Recommended Next Step:** Click "Send Enquiry" to contact this manufacturer directly or request a sample bulk quotation.`,
        suggestedPrompts: [
          'Verify WHO-GMP certification validity for Vadodara Chemicals.',
          'Post a Pharma API sourcing RFQ now.'
        ]
      };
    } else if (query.includes('textile') || query.includes('cotton') || query.includes('fabric')) {
      const match = suppliers.find(s => s.id === 's2') || suppliers[0];
      return {
        mode: 'sourcing',
        reply: `### Textile Corridor Match Result
For apparel and woven fabrics, here is the leading verified manufacturer:
- **Supplier:** ${match.companyName}
- **Location:** ${match.location.city} (${match.location.gidcZone || 'GIDC zone'})
- **Trust Score:** **${match.qualityScore.total}/100**
- **MOQ:** ${match.moq || 'Contact for MOQ'}
- **Compliance standard:** GOTS Organic Certified

**Recommended Next Step:** Open chat with this supplier to request swatches or verify yarn export shipping records.`,
        suggestedPrompts: [
          'Show Surat Textile physical audit findings.',
          'Draft a woven cotton RFQ.'
        ]
      };
    } else {
      const best = suppliers.find(s => s.isVerified) || suppliers[0];
      return {
        mode: 'sourcing',
        reply: `I searched the verified Gujarat manufacturer database. The most active factory matches:
- **Manufacturer:** ${best.companyName} (Category: ${best.category})
- **Location:** ${best.location.city} · ${best.location.gidcZone || 'Industrial Cluster'}
- **Dynamic Quality Score:** **${best.qualityScore.total}/100**

What specific product parameters or certifications (e.g. FDA, ISO, CE) are required for your matching criteria?`,
        suggestedPrompts: [
          'Search for precision engineering factories in Vatva GIDC.',
          'Explain how dynamic quality scoring works.'
        ]
      };
    }
  }

  if (mode === 'document') {
    if (query.includes('invoice') || query.includes('commercial')) {
      return {
        mode: 'document',
        reply: `### Document Validation Scan: Commercial Invoice
OCR scanner extracted key parameters:
- **Exporter:** MEHTA INDUS-CHEMICALS LTD
- **Importer:** GLOBAL CHEMICAL CORP (GERMANY)
- **Invoice Ref:** INV-2026-098
- **Validation Assertions:**
  - Exporter Legal Entity: GST active
  - Destination Hamburg Port: German customs rules loaded
  - Country of Origin: **MISSING** ⚠️ (High Severity Risk)

**AI Advice:** Customs authorities at EU border entry points will hold cargo if the "Country of Origin: India" tag is missing in the line-item header. Modify invoice draft before final container sealing.`,
        suggestedPrompts: [
          'Verify packing list weight consistency.',
          'Review Certificate of Origin draft specifications.'
        ]
      };
    } else if (query.includes('origin') || query.includes('coo')) {
      return {
        mode: 'document',
        reply: `### Document Validation Scan: Certificate of Origin (CoO)
OCR scanner check complete:
- **Draft Status:** Unsigned ⚠️ (Critical Severity Risk)
- **Consignor / Consignee:** Matches Invoice INV-2026-098

**AI Advice:** Unsigned draft certificates of origin will result in immediate customs seizure at importing ports. Ensure document is submitted to the Gujarat Chamber of Commerce for electronic stamp validation.`,
        suggestedPrompts: [
          'View list of standard trade documents.',
          'Show document exception severity levels.'
        ]
      };
    } else {
      return {
        mode: 'document',
        reply: `Ready to validate trade dossiers (GST Certificate, IEC License, Commercial Invoice, Packing List, Certificate of Origin). Drop a file in the scanner or ask me to check a draft.`,
        suggestedPrompts: [
          'Scan my GST certificate.',
          'Check my commercial invoice for German export regulations.'
        ]
      };
    }
  }

  if (mode === 'rfq') {
    return {
      mode: 'rfq',
      reply: `### Sourcing RFQ Drafting Guide
I can generate a professional, machine-readable RFQ optimized for GIDC manufacturer routing:
1. **Product Name:** Paracetamol API, USP Grade
2. **Moq Unit:** 5,000 kg (in 25kg bulk drums)
3. **Required Compliance:** WHO-GMP, FDA DMF
4. **Target Destination:** Newark Port, USA
5. **Timeline:** Standard (4-8 weeks)

Would you like to auto-populate the Multi-Step RFQ form with these specs? [Click to Auto-fill RFQ]`,
      suggestedPrompts: [
        'Draft an RFQ for Morbi ceramic tiles.',
        'What details do suppliers need in a textile RFQ?'
      ]
    };
  }

  if (mode === 'market') {
    return {
      mode: 'market',
      reply: `### Gujarat Export Corridor Intelligence (Q2 2026)
- **Specialty Chemicals (Ankleshwar GIDC):** Raw material prices are stabilizing, but freight container booking lead times to EU have increased by 12%. Lock in contract terms early.
- **Pharma APIs (Ahmedabad/Vadodara):** WHO-GMP clean room inspection logs show 94% compliance rates. Sourcing benchmarks for Paracetamol range between **USD 3.20 - 3.80/kg** for bulk enterprise purchases.
- **Precision Engineering (Rajkot):** Steel machining capacities remain high. MOQ targets are flexible for first-time importers.`,
      suggestedPrompts: [
        'Show Morbi ceramic tiles pricing trends.',
        'Are freight container rates to Germany rising?'
      ]
    };
  }

  if (mode === 'risk') {
    if (query.includes('5 days') || query.includes('urgency') || query.includes('fast')) {
      return {
        mode: 'risk',
        reply: `### Sourcing Risk Scan
- **Anomaly Flagged:** 5-day dispatch commitment.
- **Severity:** High Risk
- **Analysis:** Standard manufacturing and certification validation lead time for GMP-grade chemicals in our database is **4-6 weeks**. A 5-day dispatch offer on first orders strongly suggests a secondary trader or unverified stockpile, creating purity and audit trail risks.
- **AI Recommendation:** Request batch testing certificates (CoA) signed by a certified laboratory and double-check their geocoded plant capacity metrics before wiring payment.`,
        suggestedPrompts: [
          'Check supplier risk for Ahmedabad Precision Tools.',
          'What geographic signals indicate account fraud?'
        ]
      };
    } else {
      return {
        mode: 'risk',
        reply: `### Account Compliance Check
Our system scans four signal categories to detect risk:
1. **Identity:** Unverified domains vs official business records.
2. **Behavior:** Automated posting frequency.
3. **Content:** Missing parameter specifications.
4. **Geography:** Auditor GPS location mismatching declared GIDC areas.

Any abnormalities will trigger account limits to protect trade routing.`,
        suggestedPrompts: [
          'What does standard geocoding check mean?',
          'Verify a supplier GSTIN code safety.'
        ]
      };
    }
  }

  return {
    mode: 'sourcing',
    reply: `I am the Sourcing AI Assistant. Please choose a mode (Sourcing, Document Intel, RFQ Copilot, Market Intel, Risk Check) to begin.`,
    suggestedPrompts: ['Show verified suppliers directory.', 'How to check document readiness scores?']
  };
}

export async function generateLLMReply(
  mode: string,
  input: string
): Promise<CopilotResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateAssistantReply(mode, input);
  }

  const modePrompts: Record<string, string> = {
    sourcing: 'You are a B2B sourcing copilot for verified Indian manufacturers. Match the buyer query to real suppliers from the database provided. Always cite trust scores and certifications. Use markdown format.',
    document: 'You are a trade document validation copilot. Analyze the user query about export/import documents and provide specific field-level advice with customs rules for the destination country. Use markdown format.',
    rfq: 'You are an RFQ drafting assistant. Help the buyer write a professional, complete sourcing request. Ask clarifying questions if needed. Use markdown format.',
    market: 'You are a market intelligence copilot for B2B India-export trade. Provide pricing ranges, demand signals, and supply trends based on platform data. Use markdown format.',
    risk: 'You are a trade risk assessment copilot. Evaluate supplier claims, lead times, and pricing against known industry benchmarks. Flag anything unusual. Use markdown format.',
  };

  const supplierContext = suppliers.slice(0, 10).map(s => ({
    id: s.id,
    name: s.companyName,
    category: s.category,
    city: s.location.city,
    certifications: s.certifications,
    qualityScore: s.qualityScore.total,
    responseRate: s.responseRate,
    moq: s.moq,
    exportMarkets: s.exportMarkets
  }));

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `${modePrompts[mode] || modePrompts.sourcing}\n\nVerified Supplier Database Context:\n${JSON.stringify(supplierContext)}` },
          { role: 'user', content: input }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.warn('[AI Assistant] OpenAI API failed, falling back');
      return generateAssistantReply(mode, input);
    }

    const data = await response.json();
    const replyText = data.choices[0].message.content || '';
    
    // Simple heuristic for follow-up prompts
    let suggestedPrompts = ['Ask a follow-up question', 'Request a quote'];
    if (mode === 'sourcing') {
      suggestedPrompts = ['Verify WHO-GMP certification validity', 'Sourcing RFQ form'];
    } else if (mode === 'document') {
      suggestedPrompts = ['Scan a document now', 'View document validation rules'];
    } else if (mode === 'rfq') {
      suggestedPrompts = ['Draft Morbi ceramic tiles RFQ', 'Export specifications guide'];
    } else if (mode === 'market') {
      suggestedPrompts = ['Morbi tiles pricing trends', 'Freight rates to Germany'];
    } else if (mode === 'risk') {
      suggestedPrompts = ['Check supplier risk scorecard', 'GSTIN registry verify'];
    }

    return {
      mode: mode as CopilotResponse['mode'],
      reply: replyText,
      suggestedPrompts
    };
  } catch (error) {
    console.error('[AI Assistant] Error calling OpenAI, falling back', error);
    return generateAssistantReply(mode, input);
  }
}
