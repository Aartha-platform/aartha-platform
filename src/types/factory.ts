/**
 * factory.ts
 * Factory Intelligence Domain Models: LegalEntity, FactorySite, Capability, and Machine.
 * Decomposes monolithic Supplier objects into modular, queryable relational entities.
 */

export interface LegalEntity {
  id: string;
  supplierId: string;
  gstin: string;
  legalName: string;
  tradeName?: string;
  cin?: string;
  iec?: string;
  udyamNumber?: string;
  registeredAddress: string;
  status: 'active' | 'inactive' | 'suspended';
  source: string;
  checkedAt: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export interface FactorySite {
  id: string;
  supplierId: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gps?: string;
  gidcZone?: string;
  siteType: 'manufacturing' | 'warehouse' | 'office';
  floorAreaSqFt?: number;
  operatingStatus: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Capability {
  id: string;
  factorySiteId: string;
  supplierId: string;
  process: string; // e.g., 'CNC Machining', 'Investment Casting', 'Forging'
  material?: string; // e.g., 'Stainless Steel 316L', 'Brass IS 319'
  productFamily?: string;
  tolerance?: string; // e.g., '±0.01mm'
  dimensions?: string;
  capacityPerMonth?: number;
  moq?: number;
  leadTimeWeeks?: number;
  evidenceId?: string; // Links to verified Evidence record
  createdAt: string;
  updatedAt: string;
}

export interface Machine {
  id: string;
  factorySiteId: string;
  supplierId: string;
  name: string; // e.g., '5-Axis CNC Milling Center'
  model?: string; // e.g., 'Haas VF-2'
  count: number;
  precisionTolerance?: string;
  yearInstalled?: number;
  status: 'operational' | 'maintenance' | 'offline';
  createdAt: string;
}
