import { StructuredQuery, StructuredQuerySchema } from './matchSchema';

/**
 * Category & Industrial Keyword Mapping for Indian Manufacturing Corridors
 * Supports multilingual industrial terminology (English, Hindi, Gujarati transliterated)
 */
const CATEGORY_TAXONOMY: Record<string, { category: string; subcategories: string[]; defaultMaterials: string[] }> = {
  // Machinery & Engineering
  cnc: { category: 'Machinery & Industrial', subcategories: ['cnc-machines'], defaultMaterials: ['Carbide Steel', 'Cast Iron', 'Aluminium'] },
  lathe: { category: 'Machinery & Industrial', subcategories: ['cnc-machines'], defaultMaterials: ['Cast Iron', 'Alloy Steel'] },
  valve: { category: 'Machinery & Industrial', subcategories: ['pumps-valves'], defaultMaterials: ['Cast Iron', 'Stainless Steel', 'Brass'] },
  pump: { category: 'Machinery & Industrial', subcategories: ['pumps-valves'], defaultMaterials: ['Cast Iron', 'Bronze'] },
  casting: { category: 'Machinery & Industrial', subcategories: ['pumps-valves', 'cnc-machines'], defaultMaterials: ['Grey Cast Iron', 'Ductile Iron'] },
  tooling: { category: 'Machinery & Industrial', subcategories: ['cnc-machines'], defaultMaterials: ['Carbide', 'High Speed Steel'] },
  boring: { category: 'Machinery & Industrial', subcategories: ['cnc-machines'], defaultMaterials: ['Carbide Steel'] },

  // Textiles & Apparel
  cotton: { category: 'Textiles & Apparel', subcategories: ['woven-fabrics'], defaultMaterials: ['Organic Cotton', 'Carded Cotton'] },
  fabric: { category: 'Textiles & Apparel', subcategories: ['woven-fabrics'], defaultMaterials: ['Cotton', 'Rayon', 'Polyester'] },
  textile: { category: 'Textiles & Apparel', subcategories: ['woven-fabrics'], defaultMaterials: ['Cotton', 'Rayon'] },
  rayon: { category: 'Textiles & Apparel', subcategories: ['woven-fabrics'], defaultMaterials: ['Viscose Rayon'] },
  yarn: { category: 'Textiles & Apparel', subcategories: ['woven-fabrics'], defaultMaterials: ['Cotton Blend'] },

  // Chemicals & Materials
  dye: { category: 'Chemicals & Materials', subcategories: ['dyes-pigments'], defaultMaterials: ['Sulfur Dyes', 'Reactive Dyes'] },
  pigment: { category: 'Chemicals & Materials', subcategories: ['dyes-pigments'], defaultMaterials: ['Phthalocyanine Green', 'Organic Pigment'] },
  chemical: { category: 'Chemicals & Materials', subcategories: ['specialty-chemicals'], defaultMaterials: ['Industrial Solvents'] },
  solvent: { category: 'Chemicals & Materials', subcategories: ['specialty-chemicals'], defaultMaterials: ['Organic Solvents'] },

  // Electronics & Electrical
  pcb: { category: 'Electronics & Electrical', subcategories: ['pcb'], defaultMaterials: ['FR4', 'Copper Clad'] },
  sensor: { category: 'Electronics & Electrical', subcategories: ['sensors-iot'], defaultMaterials: ['Silicon', 'SMT Components'] },
  iot: { category: 'Electronics & Electrical', subcategories: ['sensors-iot'], defaultMaterials: ['Wireless Transmitters'] },
  transmitter: { category: 'Electronics & Electrical', subcategories: ['sensors-iot'], defaultMaterials: ['Electronic Sensors'] },

  // Ceramics & Home
  tile: { category: 'Home & Consumer', subcategories: ['ceramics-tiles'], defaultMaterials: ['Vitrified Clay', 'Ceramic'] },
  ceramic: { category: 'Home & Consumer', subcategories: ['ceramics-tiles'], defaultMaterials: ['Glazed Ceramic'] },
  vitrified: { category: 'Home & Consumer', subcategories: ['ceramics-tiles'], defaultMaterials: ['Double Charged Vitrified'] },
  sanitary: { category: 'Home & Consumer', subcategories: ['ceramics-tiles'], defaultMaterials: ['Sanitaryware Porcelain'] },

  // Pharma & Healthcare
  paracetamol: { category: 'Pharma & Healthcare', subcategories: ['api-intermediates', 'generic-formulations'], defaultMaterials: ['API Powder'] },
  api: { category: 'Pharma & Healthcare', subcategories: ['api-intermediates'], defaultMaterials: ['Active Pharmaceutical Ingredient'] },
  pharma: { category: 'Pharma & Healthcare', subcategories: ['generic-formulations', 'api-intermediates'], defaultMaterials: ['USP Grade Compound'] },
  generic: { category: 'Pharma & Healthcare', subcategories: ['generic-formulations'], defaultMaterials: ['Tablets', 'Capsules'] },

  // Food & Agro
  turmeric: { category: 'Food & Agro', subcategories: ['spices-herbs'], defaultMaterials: ['Ground Curcumin Turmeric'] },
  spices: { category: 'Food & Agro', subcategories: ['spices-herbs'], defaultMaterials: ['Red Chilli', 'Turmeric', 'Cumin'] },
  agro: { category: 'Food & Agro', subcategories: ['pulses-grains', 'spices-herbs'], defaultMaterials: ['Agricultural Produce'] },
  chilli: { category: 'Food & Agro', subcategories: ['spices-herbs'], defaultMaterials: ['Dry Red Chilli'] },
};

/**
 * Standard Certification Patterns to extract
 */
const KNOWN_CERTIFICATIONS = [
  'ISO 9001',
  'ISO 14001',
  'ISO 22000',
  'CE',
  'BIS',
  'GOTS',
  'OEKO-TEX',
  'REACH',
  'WHO-GMP',
  'US FDA',
  'FSSAI',
  'HACCP',
  'RoHS',
];

/**
 * Gujarat Corridor Zones
 */
const KNOWN_GIDC_ZONES = [
  'Vatva GIDC',
  'Naroda GIDC',
  'Pandesara GIDC',
  'Sachin GIDC',
  'Aji GIDC',
  'Metoda GIDC',
  'Nandesari GIDC',
  'Makarpura GIDC',
  'Chitra GIDC',
  'Lakhdhirpur GIDC',
  'GIFT City Area',
];

/**
 * Deterministic Intent Extractor (Rule-based & Multilingual Industrial Taxonomy)
 * Parses buyer requirements with high reliability and zero hallucination risk.
 */
export function extractStructuredQueryDeterministic(input: string | Partial<StructuredQuery>): StructuredQuery {
  if (typeof input === 'object' && input.product && input.category) {
    const parsed = StructuredQuerySchema.safeParse(input);
    if (parsed.success) return parsed.data;
  }

  const rawText = typeof input === 'string' ? input : (input.rawQuery || input.product || '');
  const lower = rawText.toLowerCase();

  // 1. Detect Category & Subcategories
  let detectedCategory = 'Machinery & Industrial';
  let detectedSubcategory: string | undefined = undefined;
  const materialsFound: string[] = [];

  for (const [kw, tax] of Object.entries(CATEGORY_TAXONOMY)) {
    if (lower.includes(kw)) {
      detectedCategory = tax.category;
      detectedSubcategory = tax.subcategories[0];
      materialsFound.push(...tax.defaultMaterials);
      break;
    }
  }

  // Override if provided in object
  if (typeof input === 'object' && input.category) {
    detectedCategory = input.category;
  }
  if (typeof input === 'object' && input.subcategory) {
    detectedSubcategory = input.subcategory;
  }

  // 2. Extract Certifications
  const certsFound: string[] = [];
  const mandatoryCerts: string[] = [];
  for (const cert of KNOWN_CERTIFICATIONS) {
    if (lower.includes(cert.toLowerCase()) || lower.includes(cert.toLowerCase().replace(/[\s-]/g, ''))) {
      certsFound.push(cert);
      if (lower.includes('must have ' + cert.toLowerCase()) || lower.includes('mandatory ' + cert.toLowerCase())) {
        mandatoryCerts.push(cert);
      }
    }
  }

  // 3. Extract GIDC Zone or City
  let preferredGidc: string | undefined = undefined;
  for (const zone of KNOWN_GIDC_ZONES) {
    if (lower.includes(zone.toLowerCase()) || lower.includes(zone.split(' ')[0].toLowerCase())) {
      preferredGidc = zone;
      break;
    }
  }

  // 4. Extract Quantity and MOQ
  let quantity: number | undefined = undefined;
  let maxMoq: number | undefined = undefined;
  const qtyMatch = lower.match(/(?:qty|quantity|need|order|amount)?\s*:?\s*(\d[\d,]*)\s*(units|pcs|pieces|kg|mt|meters|sqm|tons)?/i);
  if (qtyMatch && qtyMatch[1]) {
    const parsedQty = parseInt(qtyMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(parsedQty) && parsedQty > 0) {
      quantity = parsedQty;
    }
  }

  const moqMatch = lower.match(/moq\s*(?:under|less than|max|<=|<)?\s*(\d[\d,]*)/i);
  if (moqMatch && moqMatch[1]) {
    const parsedMoq = parseInt(moqMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(parsedMoq) && parsedMoq > 0) {
      maxMoq = parsedMoq;
    }
  }

  // 5. Extract Tolerance if any
  let tolerance: string | undefined = undefined;
  const tolMatch = lower.match(/(?:±|\+\/-)?\s*(0\.\d+)\s*(?:mm|microns|µm)/i);
  if (tolMatch) {
    tolerance = tolMatch[0];
  }

  // Build clean StructuredQuery object
  const structuredData: StructuredQuery = {
    rawQuery: rawText,
    product: typeof input === 'object' && input.product ? input.product : (rawText.length > 60 ? rawText.substring(0, 60) : rawText || 'Industrial Requirement'),
    category: detectedCategory,
    subcategory: detectedSubcategory,
    materials: materialsFound.slice(0, 3),
    technicalSpecs: tolerance ? { tolerance } : {},
    quantity,
    quantityUnit: 'units',
    currency: 'INR',
    maxMoq,
    certifications: certsFound,
    mandatoryCertifications: mandatoryCerts,
    tolerance,
    destinationCountry: 'India',
    preferredGidcZone: preferredGidc,
    preferredState: 'Gujarat',
    directManufacturerOnly: true,
  };

  return StructuredQuerySchema.parse(structuredData);
}

/**
 * Full Query Understanding Pipeline
 * Uses LLM if available and configured, with guaranteed fallback to deterministic parser.
 * Always validates against StructuredQuerySchema.
 */
export async function understandBuyerQuery(
  rawInput: string | Partial<StructuredQuery>
): Promise<StructuredQuery> {
  // If already structured and valid, bypass
  if (typeof rawInput === 'object' && rawInput.product && rawInput.category) {
    const result = StructuredQuerySchema.safeParse(rawInput);
    if (result.success) return result.data;
  }

  const queryText = typeof rawInput === 'string' ? rawInput : (rawInput.rawQuery || rawInput.product || '');
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && !apiKey.includes('your_openai_key') && !apiKey.includes('your_resend_key')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(1000),
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an expert B2B manufacturing procurement specification extractor.
Extract the buyer's requirement into a JSON object matching this schema:
{
  "product": string,
  "category": "Machinery & Industrial" | "Textiles & Apparel" | "Chemicals & Materials" | "Electronics & Electrical" | "Home & Consumer" | "Pharma & Healthcare" | "Food & Agro",
  "subcategory": string (optional),
  "materials": string[],
  "technicalSpecs": { [key: string]: string },
  "quantity": number (optional),
  "quantityUnit": string,
  "maxMoq": number (optional),
  "certifications": string[],
  "mandatoryCertifications": string[],
  "tolerance": string (optional),
  "preferredGidcZone": string (optional),
  "preferredState": "Gujarat",
  "directManufacturerOnly": true
}
Never invent certifications or tolerances not requested by the user.`
            },
            {
              role: 'user',
              content: `Extract structured sourcing requirement from: "${queryText}"`
            }
          ],
          temperature: 0.0,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        const content = payload.choices?.[0]?.message?.content;
        if (content) {
          const parsedJson = JSON.parse(content);
          parsedJson.rawQuery = queryText;
          const validated = StructuredQuerySchema.safeParse(parsedJson);
          if (validated.success) {
            return validated.data;
          }
        }
      }
    } catch (err) {
      console.warn('[QueryUnderstanding] LLM extraction failed, using deterministic extractor:', err);
    }
  }

  // Deterministic fallback
  return extractStructuredQueryDeterministic(rawInput);
}
