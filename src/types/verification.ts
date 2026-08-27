export type SellerType =
  | 'direct_manufacturer'
  | 'contract_manufacturer'
  | 'brand_owner'
  | 'authorized_distributor'
  | 'trading_company'
  | 'wholesaler';

export type VerificationTier =
  | 'listed'
  | 'business_verified'
  | 'verified_supplier'
  | 'premium_audited';

export interface GSTINValidationResult {
  valid: boolean;
  entityName?: string;
  stateCode?: string;
  stateName?: string;
  registrationType?: 'Manufacturer' | 'Trader' | 'Services' | 'Unknown';
  status?: 'Active' | 'Inactive' | 'Cancelled' | 'Suspended';
  error?: string;
  message?: string;
}

export interface GateInputs {
  emailVerified: boolean;
  gstVerified: boolean;
  iecVerified: boolean;
  videoWalkthroughPassed: boolean;
  documentsReviewed: boolean;
  physicalVisitDate?: string;
  fraudRiskScore: number;
}
