import { DocumentDossier } from '@/lib/documentIntel';

/**
 * 10 Built-in Standard Benchmark Sample Dossiers
 * Isolated mock/sample records used for interactive document verification previews.
 * Marked source: 'sample' — strictly separated from real live user uploads.
 */
export const mockDossiers: DocumentDossier[] = [
  {
    id: 'doc-gst-001',
    name: 'GST_Certificate_Mehta_Indus.pdf',
    type: 'gst',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '240 KB',
    summary: 'GSTIN valid and active in Gujarat corridor. Address matches registered industrial belt with zero tax flags.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'GSTIN', value: '24AAAAM8901D1Z1', confidence: 99, category: 'identity', highlight: true },
      { label: 'Legal Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98, category: 'identity' },
      { label: 'Trade Name', value: 'Mehta Indus-Chemicals', confidence: 98, category: 'identity' },
      { label: 'Address', value: 'Plot No. 4410, Phase IV, GIDC Vatva, Ahmedabad, Gujarat 382445', confidence: 95, category: 'compliance' },
      { label: 'Registration Date', value: '2018-04-12', confidence: 99, category: 'compliance' },
      { label: 'Taxpayer Type', value: 'Regular', confidence: 97, category: 'compliance' },
      { label: 'Status', value: 'Active', confidence: 100, category: 'compliance', highlight: true }
    ],
    assertions: [
      { name: 'GSTIN Structure Check', passed: true, message: 'GSTIN conforms to standard 15-character statutory format with valid state prefix (24 = Gujarat).', hindiHint: 'जीएसटी नंबर सही प्रारूप में है और गुजरात राज्य से मेल खाता है।' },
      { name: 'GIDC Industrial Zone Match', passed: true, message: 'Principal place of business geocodes directly into registered Vatva GIDC Chemical belt.', hindiHint: 'पता स्वीकृत औद्योगिक क्षेत्र में सत्यापित है।' },
      { name: 'Tax Entity Status', passed: true, message: 'Active tax status confirmed against GSTN registry without compliance flags.', hindiHint: 'कर दाता की स्थिति सक्रिय है।' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 98, freight: 95, inspection: 100, overall: 98 }
  },
  {
    id: 'doc-iec-002',
    name: 'IEC_License_Mehta_Indus.pdf',
    type: 'iec',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '1.2 MB',
    summary: 'DGFT Export License verified active. Legal name matches GST and Ministry of Corporate Affairs records.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'IEC Code', value: '0516900421', confidence: 98, category: 'identity', highlight: true },
      { label: 'Entity Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 99, category: 'identity' },
      { label: 'Address', value: 'Plot No. 4410, Phase IV, GIDC Vatva, Ahmedabad, Gujarat 382445', confidence: 94, category: 'compliance' },
      { label: 'Issue Date', value: '2019-02-18', confidence: 99, category: 'compliance' },
      { label: 'DGFT Status', value: 'Active (DEL Clear)', confidence: 100, category: 'compliance', highlight: true }
    ],
    assertions: [
      { name: '10-Digit IEC Format', passed: true, message: 'IEC Code matches standard 10-digit DGFT issuance guidelines.', hindiHint: 'आईईसी कोड 10 अंकों के अनिवार्य मानक पर खरा उतरता है।' },
      { name: 'Corporate Name Match', passed: true, message: 'Licensee matches GST Certificate and PAN registry exactly.', hindiHint: 'कंपनी का नाम अन्य सभी सरकारी दस्तावेजों से पूरी तरह मेल खाता है।' },
      { name: 'Denied Entity List (DEL) Check', passed: true, message: 'Entity is clear of any DGFT trade suspensions or default notices.', hindiHint: 'कोई डिफ़ॉल्ट या व्यापार प्रतिबंध नहीं है।' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 96, freight: 92, inspection: 95, overall: 96 }
  },
  {
    id: 'doc-inv-003',
    name: 'Commercial_Invoice_INV2026_098.pdf',
    type: 'invoice',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '480 KB',
    summary: '2 Compliance anomalies detected: Missing Country of Origin declaration and incomplete 6-digit HS Code.',
    riskRating: 'HIGH',
    extractedFields: [
      { label: 'Invoice No', value: 'INV-2026-098', confidence: 99, category: 'commercial', highlight: true },
      { label: 'Invoice Date', value: '2026-06-25', confidence: 99, category: 'commercial' },
      { label: 'Exporter (Seller)', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98, category: 'identity' },
      { label: 'Importer (Buyer)', value: 'GLOBAL CHEMICAL CORP (GERMANY)', confidence: 97, category: 'identity' },
      { label: 'Product Description', value: 'Paracetamol API, USP Grade', confidence: 96, category: 'commercial' },
      { label: 'Declared HS Code', value: '3004.90', confidence: 94, category: 'compliance', highlight: true },
      { label: 'Incoterm', value: 'FOB Mundra Port', confidence: 95, category: 'logistics' },
      { label: 'Declared Net Weight', value: '5,000 kg', confidence: 96, category: 'logistics' },
      { label: 'Total Value', value: 'USD 17,500', confidence: 98, category: 'commercial', highlight: true }
    ],
    assertions: [
      { name: 'Buyer & Seller Entity Verification', passed: true, message: 'Corporate entities verified with valid cross-border trade jurisdictions.', hindiHint: 'क्रेता और विक्रेता दोनों कंपनियाँ सत्यापित हैं।' },
      { name: 'Harmonized System Code Validity', passed: true, message: 'HS Code 3004.90 correlates with Pharmaceutical API products.', hindiHint: 'एचएस कोड फार्मास्युटिकल श्रेणी से मेल खाता है।' },
      { name: 'Country of Origin Declaration', passed: false, message: 'Mandatory "Country of Origin: India" statement is absent from invoice body.', hindiHint: 'इनवॉइस में "Country of Origin: India" लिखना अनिवार्य है जो गायब है।' }
    ],
    exceptions: [
      {
        id: 'exc-inv-1',
        field: 'Country of Origin',
        message: 'Missing explicit "Country of Origin: India" declaration on commercial invoice.',
        severity: 'high',
        risk: 'Border delay or detention at destination port (Hamburg, Germany). EU customs regulations mandate origin declaration on all chemical invoices.',
        suggestion: 'Add "Country of Origin: India" in invoice header and product description lines.',
        autoFixValue: 'India (Verified Origin)',
        hindiSummary: 'इनवॉइस पर "Country of Origin: India" जोड़ें ताकि यूरोपीय कस्टम्स में माल न रुके।'
      },
      {
        id: 'exc-inv-2',
        field: 'HS Code Precision',
        message: 'HS Code is written as 6-digit "3004.90" instead of full 8-digit tariff code.',
        severity: 'medium',
        risk: 'Incorrect import tariff rate applied by European Customs. 8-digit precision is statutory for pharmaceutical APIs.',
        suggestion: 'Expand to standard 8-digit code "3004.90.99" (Paracetamol API formulations).',
        autoFixValue: '3004.90.99',
        hindiSummary: 'कस्टम ड्यूटी विवाद से बचने के लिए 8-अंकीय एचएस कोड 3004.90.99 दर्ज करें।'
      }
    ],
    scores: { customs: 72, bank: 80, freight: 92, inspection: 85, overall: 82 }
  },
  {
    id: 'doc-coo-005',
    name: 'Certificate_of_Origin_DRAFT.pdf',
    type: 'coo',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '320 KB',
    summary: 'Critical compliance blocker: Unsigned draft certificate lacking official Chamber of Commerce seal.',
    riskRating: 'CRITICAL',
    extractedFields: [
      { label: 'Consignor', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 97, category: 'identity' },
      { label: 'Consignee', value: 'GLOBAL CHEMICAL CORP (GERMANY)', confidence: 96, category: 'identity' },
      { label: 'Origin State', value: 'Gujarat, India', confidence: 98, category: 'compliance' },
      { label: 'Goods Description', value: 'Paracetamol API 5,000 kg', confidence: 95, category: 'commercial' },
      { label: 'Chamber Validation Seal', value: 'PENDING / MISSING', confidence: 99, category: 'compliance', highlight: true }
    ],
    assertions: [
      { name: 'Consignee Correlation', passed: true, message: 'Consignee matches Commercial Invoice INV-2026-098.', hindiHint: 'क्रेता का विवरण इनवॉइस से मेल खाता है।' },
      { name: 'Authorized Chamber Endorsement', passed: false, message: 'Digital or physical Chamber of Commerce validation seal is missing.', hindiHint: 'चैंबर ऑफ कॉमर्स की आधिकारिक मुहर / डिजिटल हस्ताक्षर गायब है।' }
    ],
    exceptions: [
      {
        id: 'exc-coo-1',
        field: 'Chamber Seal & Signature',
        message: 'Draft Certificate of Origin lacks the statutory Chamber of Commerce validation seal.',
        severity: 'critical',
        risk: 'Immediate border rejection and loss of preferential duty tariff under trade agreements.',
        suggestion: 'Submit to Gujarat Chamber of Commerce & Industry (GCCI) or DGFT e-CoO portal for digital validation.',
        autoFixValue: 'Digitally Validated by Gujarat Chamber of Commerce (GCC-2406)',
        hindiSummary: 'चैंबर ऑफ कॉमर्स का आधिकारिक सत्यापन प्राप्त करें।'
      }
    ],
    scores: { customs: 38, bank: 45, freight: 90, inspection: 35, overall: 52 }
  },
  {
    id: 'doc-pl-004',
    name: 'Packing_List_INV2026_098.xlsx',
    type: 'packing_list',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '110 KB',
    summary: 'Packing list synchronized with Invoice INV-2026-098. Packaging units and weights match perfectly.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'Invoice Reference', value: 'INV-2026-098', confidence: 99, category: 'commercial', highlight: true },
      { label: 'Exporter', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98, category: 'identity' },
      { label: 'Total Net Weight', value: '5,000 kg', confidence: 99, category: 'logistics' },
      { label: 'Total Gross Weight', value: '5,210 kg', confidence: 96, category: 'logistics' },
      { label: 'Packaging Units', value: '200 Fiber Drums (25kg net each)', confidence: 95, category: 'logistics', highlight: true },
      { label: 'Pallet Dimensions', value: '1.2m x 1.2m x 1.5m (10 pallets)', confidence: 92, category: 'logistics' }
    ],
    assertions: [
      { name: 'Commercial Invoice Reference Match', passed: true, message: 'Links successfully to Commercial Invoice INV-2026-098.', hindiHint: 'इनवॉइस नंबर से सही मिलान हुआ।' },
      { name: 'Net vs Gross Weight Consistency', passed: true, message: 'Tare weight (210 kg for 200 drums) is mathematically sound.', hindiHint: 'शुद्ध और सकल वजन का हिसाब सही है।' },
      { name: 'Export Packaging Standard', passed: true, message: 'Fiber drums conform to chemical transport safety guidelines.', hindiHint: 'पैकिंग मानक अंतर्राष्ट्रीय सुरक्षा नियमों के अनुरूप हैं।' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 98, freight: 100, inspection: 96, overall: 98 }
  },
  {
    id: 'doc-bol-006',
    name: 'Bill_Of_Lading_MSK98402.pdf',
    type: 'bill_of_lading',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '880 KB',
    summary: 'Ocean Bill of Lading verified with Maersk Lines. Clean On Board endorsement confirmed for Mundra Port.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'BL Number', value: 'MSK-IN-MUN-2026-984', confidence: 99, category: 'logistics', highlight: true },
      { label: 'Ocean Carrier', value: 'Maersk Line A/S', confidence: 98, category: 'identity' },
      { label: 'Shipper', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 97, category: 'identity' },
      { label: 'Port of Loading', value: 'Mundra Port, Gujarat (INMUN)', confidence: 99, category: 'logistics' },
      { label: 'Port of Discharge', value: 'Hamburg Port, Germany (DEHAM)', confidence: 98, category: 'logistics' },
      { label: 'Container No', value: 'MSKU-819203-4 (20ft FCL)', confidence: 96, category: 'logistics' },
      { label: 'Declared Gross Weight', value: '5,210 kg', confidence: 97, category: 'logistics' }
    ],
    assertions: [
      { name: 'Carrier Validation Key', passed: true, message: 'BL number matches Maersk container logistics format.', hindiHint: 'शिपिंग लाइन की डिजिटल रसीद सत्यापित है।' },
      { name: 'Port Corridor Alignment', passed: true, message: 'Mundra to Hamburg maritime route matches export declarations.', hindiHint: 'पोर्ट रूट एक्सपोर्ट डिक्लेरेशन से मेल खाता है।' },
      { name: 'Clean On Board Stamp', passed: true, message: 'Cargo receipt is unflagged without carrier damage notes.', hindiHint: 'माल सुरक्षित लोड होने की पुष्टि है।' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 98, freight: 100, inspection: 95, overall: 98 }
  },
  {
    id: 'doc-who-008',
    name: 'WHO_GMP_Facility_Certificate.pdf',
    type: 'who_gmp',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '1.5 MB',
    summary: 'WHO Good Manufacturing Practice facility certification active and verified with Gujarat FDCA.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'Certificate No', value: 'WHO-GMP-FDCA-GJ-2024-881', confidence: 99, category: 'compliance', highlight: true },
      { label: 'Licensed Facility', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98, category: 'identity' },
      { label: 'Facility Address', value: 'Plot No. 4410, Phase IV, GIDC Vatva, Ahmedabad, Gujarat 382445', confidence: 95, category: 'compliance' },
      { label: 'Scope of Approval', value: 'Active Pharmaceutical Ingredients (API)', confidence: 96, category: 'compliance' },
      { label: 'Valid Through', value: '2028-12-31', confidence: 99, category: 'compliance', highlight: true }
    ],
    assertions: [
      { name: 'State FDCA Authority Sync', passed: true, message: 'Certificate checked active against Gujarat FDCA regulatory registry.', hindiHint: 'एफडीसीए प्राधिकरण द्वारा सक्रिय प्रमाणित।' },
      { name: 'Manufacturing Site Address Consistency', passed: true, message: 'Facility address aligns with GSTIN principal manufacturing location.', hindiHint: 'फैक्ट्री का पता जीएसटी पते से 100% मेल खाता है।' }
    ],
    exceptions: [],
    scores: { customs: 100, bank: 95, freight: 95, inspection: 100, overall: 98 }
  },
  {
    id: 'doc-iso-009',
    name: 'ISO_9001_Quality_System.pdf',
    type: 'iso_9001',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '920 KB',
    summary: 'ISO 9001:2015 Quality Management System verified with IAF accreditation body.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'Certificate No', value: 'ISO-9001-2015-TUV-7741', confidence: 99, category: 'compliance', highlight: true },
      { label: 'Certified Organization', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98, category: 'identity' },
      { label: 'Accreditation Body', value: 'IAF MLA / NABCB Accredited', confidence: 97, category: 'compliance' },
      { label: 'Expiry Date', value: '2027-10-30', confidence: 99, category: 'compliance' }
    ],
    assertions: [
      { name: 'IAF Global Accreditation', passed: true, message: 'Accreditation body is an active signatory to IAF Multilateral Recognition Arrangement.', hindiHint: 'अंतर्राष्ट्रीय गुणवत्ता मानक संस्था द्वारा मान्यता प्राप्त।' }
    ],
    exceptions: [],
    scores: { customs: 95, bank: 95, freight: 95, inspection: 98, overall: 96 }
  },
  {
    id: 'doc-gots-007',
    name: 'GOTS_Scope_Certificate_Mehta.pdf',
    type: 'gots',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '450 KB',
    summary: 'Global Organic Textile Standard Scope Certificate verified active under version 7.0 guidelines.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'Scope Certificate No', value: 'GOTS-CU-884192', confidence: 99, category: 'compliance', highlight: true },
      { label: 'Licensee Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 98, category: 'identity' },
      { label: 'Standard Version', value: 'GOTS Version 7.0', confidence: 99, category: 'compliance' },
      { label: 'Valid Through', value: '2027-05-15', confidence: 98, category: 'compliance' }
    ],
    assertions: [
      { name: 'GOTS Registry Active Check', passed: true, message: 'Certificate verified against GOTS Central Public Database.', hindiHint: 'GOTS डेटाबेस में लाइसेंस सक्रिय है।' }
    ],
    exceptions: [],
    scores: { customs: 95, bank: 92, freight: 95, inspection: 100, overall: 96 }
  },
  {
    id: 'doc-msme-010',
    name: 'MSME_Udyam_Registration.pdf',
    type: 'msme',
    source: 'sample',
    scannedAt: '2026-08-29T10:00:00Z',
    fileSize: '380 KB',
    summary: 'Government MSME Udyam registration verified active. Classification: Medium Manufacturing Enterprise.',
    riskRating: 'LOW',
    extractedFields: [
      { label: 'Udyam Registration No', value: 'UDYAM-GJ-01-0045231', confidence: 99, category: 'identity', highlight: true },
      { label: 'Enterprise Name', value: 'MEHTA INDUS-CHEMICALS LTD', confidence: 99, category: 'identity' },
      { label: 'Enterprise Category', value: 'Medium Enterprise (Manufacturing)', confidence: 98, category: 'compliance' },
      { label: 'Major Activity', value: 'Chemical & Pharma Manufacturing', confidence: 95, category: 'compliance' },
      { label: 'Date of Incorporation', value: '2018-04-12', confidence: 99, category: 'compliance' }
    ],
    assertions: [
      { name: 'Udyam Portal Verification', passed: true, message: 'Registration code verified on Ministry of MSME national portal.', hindiHint: 'उद्यम पोर्टल पर एमएसएमई पंजीकरण सक्रिय रूप से दर्ज है।' }
    ],
    exceptions: [],
    scores: { customs: 95, bank: 98, freight: 95, inspection: 95, overall: 96 }
  }
];
