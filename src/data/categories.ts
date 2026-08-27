import { Category } from '../types';

export const categoryChecklists: Record<string, string[]> = {
  'machinery-industrial': [
    'CE marking and ISO 9001 quality management validation',
    'CNC calibration and dimensional tolerance audit report',
    'Physical GIDC manufacturing facility & plant inspection'
  ],
  'electronics-electrical': [
    'ROHS & CE compliance certification check',
    'SMT placement precision & PCB testing protocol',
    'ISO 14001 environmental safety compliance'
  ],
  'chemicals-materials': [
    'REACH & ISO 14001 environmental safety validation',
    'Batch consistency & MSDS document verification',
    'Effluent treatment plant (ETP) GIDC compliance check'
  ],
  'textiles-apparel': [
    'OEKO-TEX & GOTS organic textile certification check',
    'Color fastness and tensile strength audit verification',
    'Factory labor standards & social compliance audit'
  ],
  'packaging-printing': [
    'FSC certified paper & food-grade packaging audit',
    'Bursting strength & drop test protocol verification',
    'Custom printing precision and color matching audit'
  ],
  'food-agro': [
    'FSSAI & US-FDA export food safety registration check',
    'Moisture content and pesticide residue lab test audit',
    'Phytosanitary certificate & APEDA registration check'
  ],
  'pharma-healthcare': [
    'WHO-GMP & US-FDA plant compliance certification',
    'Drug Master File (DMF) & Certificate of Analysis (CoA)',
    'Cleanroom ISO Class 7/8 environmental monitoring check'
  ],
  'home-consumer': [
    'ISO 13006 & BIS ceramic tiles strength testing',
    'Water absorption rate & MOR breaking strength audit',
    'Export packaging and palletization inspection'
  ]
};

export const categories: Category[] = [
  {
    id: 'machinery-industrial',
    name: 'Machinery & Industrial',
    icon: 'Settings',
    supplierCount: 1240,
    subCategories: [
      { id: 'cnc-machines', name: 'CNC Machines', description: 'High-precision CNC machines and machining centers for automotive and aerospace industries.', supplierCount: 234, activeBuyers: 178, rfqsThisMonth: 89, avgResponseTime: '4 hours', image: '' },
      { id: 'pumps-valves', name: 'Pumps & Valves', description: 'Industrial pumps, control valves, and flow management equipment for oil, gas, and water sectors.', supplierCount: 187, activeBuyers: 142, rfqsThisMonth: 67, avgResponseTime: '6 hours', image: '' },
      { id: 'compressors', name: 'Compressors', description: 'Air and gas compressors for manufacturing, refrigeration, and process industries.', supplierCount: 145, activeBuyers: 98, rfqsThisMonth: 45, avgResponseTime: '5 hours', image: '' },
      { id: 'material-handling', name: 'Material Handling', description: 'Conveyors, hoists, forklifts, and automated material handling systems.', supplierCount: 198, activeBuyers: 156, rfqsThisMonth: 72, avgResponseTime: '3 hours', image: '' },
    ],
  },
  {
    id: 'electronics-electrical',
    name: 'Electronics & Electrical',
    icon: 'Zap',
    supplierCount: 980,
    subCategories: [
      { id: 'pcb', name: 'PCB & Components', description: 'Printed circuit boards, electronic components, and SMT assemblies.', supplierCount: 312, activeBuyers: 267, rfqsThisMonth: 134, avgResponseTime: '2 hours', image: '' },
      { id: 'power-electronics', name: 'Power Electronics', description: 'Inverters, UPS systems, transformers, and power conversion equipment.', supplierCount: 156, activeBuyers: 123, rfqsThisMonth: 56, avgResponseTime: '4 hours', image: '' },
      { id: 'sensors-iot', name: 'Sensors & IoT', description: 'Industrial sensors, IoT modules, and automation electronics.', supplierCount: 98, activeBuyers: 87, rfqsThisMonth: 43, avgResponseTime: '3 hours', image: '' },
    ],
  },
  {
    id: 'chemicals-materials',
    name: 'Chemicals & Materials',
    icon: 'FlaskConical',
    supplierCount: 756,
    subCategories: [
      { id: 'dyes-pigments', name: 'Dyes & Pigments', description: 'Textile dyes, industrial pigments, and colorants for plastics and coatings.', supplierCount: 189, activeBuyers: 145, rfqsThisMonth: 78, avgResponseTime: '5 hours', image: '' },
      { id: 'specialty-chemicals', name: 'Specialty Chemicals', description: 'Surfactants, adhesives, solvents, and process chemicals.', supplierCount: 234, activeBuyers: 178, rfqsThisMonth: 91, avgResponseTime: '4 hours', image: '' },
    ],
  },
  {
    id: 'textiles-apparel',
    name: 'Textiles & Apparel',
    icon: 'Shirt',
    supplierCount: 1450,
    subCategories: [
      { id: 'woven-fabrics', name: 'Woven Fabrics', description: 'Cotton, polyester, silk, and blended woven fabrics for garment manufacturing.', supplierCount: 456, activeBuyers: 389, rfqsThisMonth: 198, avgResponseTime: '3 hours', image: '' },
      { id: 'technical-textiles', name: 'Technical Textiles', description: 'Non-woven fabrics, geotextiles, and industrial textile applications.', supplierCount: 178, activeBuyers: 134, rfqsThisMonth: 67, avgResponseTime: '6 hours', image: '' },
    ],
  },
  {
    id: 'packaging-printing',
    name: 'Packaging & Printing',
    icon: 'Package',
    supplierCount: 620,
    subCategories: [
      { id: 'corrugated-boxes', name: 'Corrugated Boxes', description: 'Custom corrugated packaging solutions for e-commerce, FMCG, and industrial use.', supplierCount: 234, activeBuyers: 198, rfqsThisMonth: 89, avgResponseTime: '4 hours', image: '' },
      { id: 'flexible-packaging', name: 'Flexible Packaging', description: 'Flexible pouches, laminates, and wrapping films for food and pharmaceutical.', supplierCount: 187, activeBuyers: 145, rfqsThisMonth: 72, avgResponseTime: '5 hours', image: '' },
    ],
  },
  {
    id: 'food-agro',
    name: 'Food & Agro',
    icon: 'Wheat',
    supplierCount: 890,
    subCategories: [
      { id: 'spices-herbs', name: 'Spices & Herbs', description: 'Whole and ground spices, dried herbs, and seasoning blends for food industry.', supplierCount: 312, activeBuyers: 267, rfqsThisMonth: 134, avgResponseTime: '3 hours', image: '' },
      { id: 'pulses-grains', name: 'Pulses & Grains', description: 'Premium quality pulses, cereals, and grains for domestic and export markets.', supplierCount: 245, activeBuyers: 198, rfqsThisMonth: 98, avgResponseTime: '4 hours', image: '' },
    ],
  },
  {
    id: 'pharma-healthcare',
    name: 'Pharma & Healthcare',
    icon: 'Pill',
    supplierCount: 445,
    subCategories: [
      { id: 'generic-formulations', name: 'Generic Formulations', description: 'WHO-GMP certified generic medicines, tablets, capsules, and injectables.', supplierCount: 189, activeBuyers: 145, rfqsThisMonth: 67, avgResponseTime: '8 hours', image: '' },
      { id: 'api-intermediates', name: 'API & Intermediates', description: 'Active pharmaceutical ingredients and chemical intermediates for drug synthesis.', supplierCount: 134, activeBuyers: 98, rfqsThisMonth: 45, avgResponseTime: '10 hours', image: '' },
    ],
  },
  {
    id: 'home-consumer',
    name: 'Home & Consumer',
    icon: 'Home',
    supplierCount: 780,
    subCategories: [
      { id: 'ceramics-tiles', name: 'Ceramics & Tiles', description: 'Floor tiles, wall tiles, vitrified tiles, and sanitaryware from Morbi manufacturers.', supplierCount: 345, activeBuyers: 289, rfqsThisMonth: 145, avgResponseTime: '4 hours', image: '' },
      { id: 'furniture-decor', name: 'Furniture & Decor', description: 'Wooden, metal, and upholstered furniture along with home décor accessories.', supplierCount: 198, activeBuyers: 156, rfqsThisMonth: 78, avgResponseTime: '5 hours', image: '' },
    ],
  },
];
