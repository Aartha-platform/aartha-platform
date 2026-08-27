export interface ExtractedField {
  label: string;
  value: string;
  confidence: number; // 0-100
}

export interface ValidationAssertion {
  name: string;
  passed: boolean;
  message: string;
}

export interface DocumentException {
  id: string;
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  risk: string;
  suggestion: string;
}

export interface DocumentDossier {
  id: string;
  name: string;
  type: 'gst' | 'iec' | 'invoice' | 'packing_list' | 'coo' | 'bill_of_lading' | 'gots' | 'who_gmp' | 'iso_9001' | 'msme';
  extractedFields: ExtractedField[];
  assertions: ValidationAssertion[];
  exceptions: DocumentException[];
  scores: {
    customs: number;
    bank: number;
    freight: number;
    inspection: number;
  };
}

export const mockDossiers: DocumentDossier[] = [
  {
    id: 'doc-gst-001',
    name: 'GST_Certificate_Mehta_Indus.pdf',
    type: 'gst',
    extractedFields: [
      { label: 'GSTIN', value: '24AAAAM8901D1Z1', confidence: 99 },
      { label: 'Legal Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Trade Name', value: 'Mehta Indus-Chemicals', confidence: 98 },
      { label: 'Address', value: 'Plot No. 4410, Phase IV, GIDC Vatva, Ahmedabad, Gujarat 382445', confidence: 95 },
      { label: 'Registration Date', value: '2018-04-12', confidence: 99 },
      { label: 'Status', value: 'Active', confidence: 100 }
    ],
    assertions: [
      { name: 'GSTIN Format Valid', passed: true, message: 'GSTIN conforms to the standard 15-character format.' },
      { name: 'State Corridor Match', passed: true, message: 'GSTIN prefix "24" matches Gujarat industrial zone.' },
      { name: 'GIDC Zone Verified', passed: true, message: 'Address geocodes successfully into Vatva GIDC industrial belt.' },
      { name: 'Entity Status Active', passed: true, message: 'GSTIN is flagged active in Ministry of Finance databases.' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 98, freight: 95, inspection: 100 }
  },
  {
    id: 'doc-iec-002',
    name: 'IEC_License_Mehta_Indus.jpg',
    type: 'iec',
    extractedFields: [
      { label: 'IEC Code', value: '0516900421', confidence: 97 },
      { label: 'Company Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Address', value: 'Plot No. 4410, Phase IV, GIDC Vatva, Ahmedabad, Gujarat 382445', confidence: 92 },
      { label: 'Issue Date', value: '2019-02-18', confidence: 99 },
      { label: 'Status', value: 'Active', confidence: 100 }
    ],
    assertions: [
      { name: 'IEC Format Valid', passed: true, message: 'IEC code is exactly 10 digits.' },
      { name: 'Name Consistency Check', passed: true, message: 'Legal name matches registration details on GST.' },
      { name: 'DGFT Status Verification', passed: true, message: 'IEC is certified active on DGFT export licensing portal.' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 95, freight: 90, inspection: 95 }
  },
  {
    id: 'doc-inv-003',
    name: 'Commercial_Invoice_INV2026_098.pdf',
    type: 'invoice',
    extractedFields: [
      { label: 'Invoice No', value: 'INV-2026-098', confidence: 99 },
      { label: 'Invoice Date', value: '2026-06-25', confidence: 99 },
      { label: 'Exporter (Seller)', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Importer (Buyer)', value: 'GLOBAL CHEMICAL CORP (GERMANY)', confidence: 97 },
      { label: 'Product Description', value: 'Paracetamol API, USP Grade', confidence: 96 },
      { label: 'Declared HS Code', value: '3004.90', confidence: 94 },
      { label: 'Total Weight', value: '5,000 kg', confidence: 95 },
      { label: 'Total Value', value: 'USD 17,500', confidence: 98 }
    ],
    assertions: [
      { name: 'HS Code Match', passed: true, message: 'HS Code 3004.90 is consistent with Pharma/API description.' },
      { name: 'Corporate Domain Matches', passed: true, message: 'Buyer and exporter business domains verified.' },
      { name: 'Country of Origin Specified', passed: false, message: 'Country of Origin is missing from the main body.' }
    ],
    exceptions: [
      {
        id: 'exc-inv-1',
        field: 'Country of Origin',
        message: 'Missing explicit "Country of Origin: India" tag in the invoice body.',
        severity: 'high',
        risk: 'Customs clearance delay at Hamburg port. German border inspection regulations mandate explicit origin country declarations.',
        suggestion: 'Add "Country of Origin: India" clearly in the invoice header and line items.'
      },
      {
        id: 'exc-inv-2',
        field: 'HS Code Formatting',
        message: 'HS Code is written as "3004.90" instead of standard "3004.90.99".',
        severity: 'medium',
        risk: 'Incorrect duty tariff application. Customs systems require 8-digit precision for chemical shipments.',
        suggestion: 'Specify the full 8-digit HS Code "3004.90.99" for Paracetamol API exports.'
      }
    ],
    scores: { customs: 72, bank: 80, freight: 95, inspection: 85 }
  },
  {
    id: 'doc-pl-004',
    name: 'Packing_List_INV2026_098.xlsx',
    type: 'packing_list',
    extractedFields: [
      { label: 'Invoice Reference', value: 'INV-2026-098', confidence: 99 },
      { label: 'Exporter', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Total Net Weight', value: '5,000 kg', confidence: 99 },
      { label: 'Total Gross Weight', value: '5,210 kg', confidence: 96 },
      { label: 'Package Type', value: '200 Fiber Drums', confidence: 95 },
      { label: 'Dimensions', value: '1.2m x 1.2m x 1.5m pallets', confidence: 90 }
    ],
    assertions: [
      { name: 'Invoice Reference Match', passed: true, message: 'Links successfully to Commercial Invoice INV-2026-098.' },
      { name: 'Net Weight Consistency', passed: true, message: 'Net weight matches invoice weight of 5,000 kg.' },
      { name: 'Packaging Compliance', passed: true, message: 'Fiber drum count is consistent with product volume.' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 98, freight: 100, inspection: 95 }
  },
  {
    id: 'doc-coo-005',
    name: 'Certificate_of_Origin_DRAFT.pdf',
    type: 'coo',
    extractedFields: [
      { label: 'Consignor', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 97 },
      { label: 'Consignee', value: 'GLOBAL CHEMICAL CORP (GERMANY)', confidence: 96 },
      { label: 'Origin State', value: 'Gujarat', confidence: 98 },
      { label: 'Chamber Signature', value: 'Pending Validation', confidence: 99 }
    ],
    assertions: [
      { name: 'Consignee Correlation', passed: true, message: 'Matches importer on Commercial Invoice.' },
      { name: 'Chamber Validation Signature', passed: false, message: 'Official chamber stamp/seal is missing or blank.' }
    ],
    exceptions: [
      {
        id: 'exc-coo-1',
        field: 'Chamber Signature',
        message: 'Certificate is a draft and lacks the official Chamber of Commerce signature.',
        severity: 'critical',
        risk: 'Immediate border seizure or full tariff penalties. Unsigned certificates of origin are legally invalid.',
        suggestion: 'Submit the document to the local Chamber of Commerce or apply online for digitized CoO validation.'
      }
    ],
    scores: { customs: 40, bank: 50, freight: 90, inspection: 30 }
  },
  {
    id: 'doc-bol-006',
    name: 'Bill_Of_Lading_MSK98402.pdf',
    type: 'bill_of_lading',
    extractedFields: [
      { label: 'Bill of Lading No', value: 'BOL-2026-987', confidence: 99 },
      { label: 'Carrier', value: 'Maersk Line West', confidence: 98 },
      { label: 'Consignor', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 96 },
      { label: 'Port of Loading', value: 'Mundra Port, India', confidence: 98 },
      { label: 'Total Gross Weight', value: '5,210 kg', confidence: 97 }
    ],
    assertions: [
      { name: 'Carrier Signature Verified', passed: true, message: 'Signature matches Maersk validation keys.' },
      { name: 'Port of Loading Validated', passed: true, message: 'Mundra port cargo exit logged in corridor records.' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 98, freight: 98, inspection: 95 }
  },
  {
    id: 'doc-gots-007',
    name: 'GOTS_Scope_Certificate_Mehta.pdf',
    type: 'gots',
    extractedFields: [
      { label: 'Certificate No', value: 'GOTS-TEX-4561', confidence: 99 },
      { label: 'Company Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Valid Until', value: '2027-05-15', confidence: 99 },
      { label: 'Scope', value: 'Organic Spinning & Weaving', confidence: 95 }
    ],
    assertions: [
      { name: 'Standard Compliance Active', passed: true, message: 'GOTS license matches GOTS v7.0 registry database.' },
      { name: 'Scope Aligned', passed: true, message: 'Organic materials match active supplier listings.' }
    ],
    exceptions: [],
    scores: { customs: 95, bank: 90, freight: 95, inspection: 100 }
  },
  {
    id: 'doc-who-008',
    name: 'WHO_GMP_Facility_Certificate.pdf',
    type: 'who_gmp',
    extractedFields: [
      { label: 'Certificate No', value: 'WHO-GMP-API-990', confidence: 99 },
      { label: 'Company Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Valid Until', value: '2028-12-31', confidence: 99 },
      { label: 'Facility Address', value: 'Plot No. 4410, Phase IV, GIDC Vatva, Ahmedabad, Gujarat 382445', confidence: 94 }
    ],
    assertions: [
      { name: 'GMP License Active', passed: true, message: 'WHO GMP status is active in local FDA registries.' },
      { name: 'Address Alignment', passed: true, message: 'GIDC Vatva address matches corporate tax dossier.' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 95, freight: 95, inspection: 100 }
  },
  {
    id: 'doc-iso-009',
    name: 'ISO_9001_Quality_System.jpg',
    type: 'iso_9001',
    extractedFields: [
      { label: 'Certificate No', value: 'ISO-9001-2015-AHM-44', confidence: 99 },
      { label: 'Company Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Valid Until', value: '2027-10-30', confidence: 99 }
    ],
    assertions: [
      { name: 'Registrar Validation', passed: true, message: 'Certificate checked against IAF Quality standards list.' }
    ],
    exceptions: [],
    scores: { customs: 95, bank: 95, freight: 95, inspection: 98 }
  },
  {
    id: 'doc-msme-010',
    name: 'MSME_Udyam_Registration.pdf',
    type: 'msme',
    extractedFields: [
      { label: 'Udyam Registration No', value: 'UDYAM-GJ-01-0045231', confidence: 99 },
      { label: 'Enterprise Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98 },
      { label: 'Enterprise Type', value: 'Medium Enterprise', confidence: 99 },
      { label: 'Date of Incorporation', value: '2018-04-12', confidence: 99 }
    ],
    assertions: [
      { name: 'Udyam ID Verified', passed: true, message: 'Udyam registration code logged active in MSME registry.' }
    ],
    exceptions: [],
    scores: { customs: 95, bank: 98, freight: 95, inspection: 95 }
  }
];

export function runOcrSimulation(type: 'gst' | 'iec' | 'invoice' | 'packing_list' | 'coo' | 'bill_of_lading' | 'gots' | 'who_gmp' | 'iso_9001' | 'msme'): Promise<DocumentDossier> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const match = mockDossiers.find(d => d.type === type);
      if (match) {
        resolve(match);
      } else {
        resolve(mockDossiers[0]);
      }
    }, 1200);
  });
}

export interface ConsistencyCheckResult {
  ruleName: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'high' | 'medium';
}

export function checkCrossDocumentConsistency(dossiers: DocumentDossier[]): ConsistencyCheckResult[] {
  const results: ConsistencyCheckResult[] = [];
  if (dossiers.length < 2) return [];

  // Extract common fields for comparisons
  const names = dossiers.map(d => ({
    type: d.type,
    name: d.extractedFields.find(f => f.label === 'Legal Name' || f.label === 'Company Name' || f.label === 'Exporter' || f.label === 'Exporter (Seller)' || f.label === 'Consignor' || f.label === 'Enterprise Name')?.value
  })).filter(n => n.name);

  const gstins = dossiers.map(d => ({
    type: d.type,
    gstin: d.extractedFields.find(f => f.label === 'GSTIN')?.value
  })).filter(g => g.gstin);

  const weights = dossiers.map(d => ({
    type: d.type,
    weight: d.extractedFields.find(f => f.label === 'Total Weight' || f.label === 'Total Net Weight' || f.label === 'Total Gross Weight')?.value
  })).filter(w => w.weight);

  const invoiceRefs = dossiers.map(d => ({
    type: d.type,
    ref: d.extractedFields.find(f => f.label === 'Invoice Reference' || f.label === 'Invoice No' || f.label === 'Invoice No.')?.value
  })).filter(r => r.ref);

  // 1. Company Name Consistency
  if (names.length > 1) {
    const first = names[0].name?.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const allMatch = names.every(n => n.name?.toLowerCase().trim().replace(/[^a-z0-9]/g, '') === first);
    results.push({
      ruleName: 'Company Name Consistency Check',
      passed: allMatch,
      message: allMatch
        ? 'Legal/Company name matches exactly across all uploaded trade documents.'
        : `Mismatched company name versions detected: ${names.map(n => `"${n.name}" (${n.type})`).join(', ')}.`,
      severity: 'high'
    });
  }

  // 2. GSTIN Consistency
  if (gstins.length > 1) {
    const first = gstins[0].gstin?.trim();
    const allMatch = gstins.every(g => g.gstin?.trim() === first);
    results.push({
      ruleName: 'GSTIN Registry Sync',
      passed: allMatch,
      message: allMatch
        ? 'GSTIN registration matches exactly across your tax and shipping dossiers.'
        : `Discrepancy in GSTIN codes: ${gstins.map(g => `"${g.gstin}" (${g.type})`).join(', ')}.`,
      severity: 'critical'
    });
  }

  // 3. Weight Consistency
  if (weights.length > 1) {
    const firstVal = parseFloat(weights[0].weight?.replace(/[^\d.]/g, '') || '0');
    const allMatch = weights.every(w => {
      const val = parseFloat(w.weight?.replace(/[^\d.]/g, '') || '0');
      return Math.abs(val - firstVal) < 250; // Allow slight margins for gross vs net cargo packaging weight
    });
    results.push({
      ruleName: 'Dossier Weight Validation',
      passed: allMatch,
      message: allMatch
        ? 'Declared weights match within acceptable shipping margins between invoices and cargo manifests.'
        : `Large cargo weight discrepancy found: ${weights.map(w => `"${w.weight}" (${w.type})`).join(' vs ')}.`,
      severity: 'high'
    });
  }

  // 4. Invoice Reference Sync
  if (invoiceRefs.length > 1) {
    const first = invoiceRefs[0].ref?.trim().replace(/[^a-z0-9]/g, '').toLowerCase();
    const allMatch = invoiceRefs.every(r => r.ref?.trim().replace(/[^a-z0-9]/g, '').toLowerCase() === first);
    results.push({
      ruleName: 'Invoice Coding Link',
      passed: allMatch,
      message: allMatch
        ? 'Trade references are correctly synchronized between documents.'
        : `Mismatched invoice coding reference: ${invoiceRefs.map(r => `"${r.ref}" (${r.type})`).join(' vs ')}.`,
      severity: 'high'
    });
  }

  return results;
}
