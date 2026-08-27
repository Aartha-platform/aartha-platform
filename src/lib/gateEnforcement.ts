export type GateState =
  | 'unverified'
  | 'listed'
  | 'business_verified'
  | 'verified_supplier'
  | 'premium_audited'
  | 'expired'
  | 'suspended';

export function enforceGateTransition(current: GateState, target: GateState): boolean {
  const VALID_TRANSITIONS: Record<GateState, GateState[]> = {
    'unverified': ['listed', 'suspended'],
    'listed': ['business_verified', 'suspended', 'unverified'],
    'business_verified': ['verified_supplier', 'suspended', 'unverified'],
    'verified_supplier': ['premium_audited', 'expired', 'suspended', 'unverified'],
    'premium_audited': ['expired', 'suspended', 'unverified'],
    'expired': ['business_verified', 'verified_supplier', 'premium_audited', 'suspended'],
    'suspended': ['listed', 'unverified'],
  };
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}

export function calculateGateState(supplier: { 
  emailVerified: boolean; 
  gstVerified: boolean; 
  iecVerified: boolean; 
  bankVerified: boolean;
  videoWalkthroughPassed: boolean;
  documentsReviewed: boolean;
  physicalVisitDate?: string;
  fraudRiskScore: number;
}): GateState {
  if (supplier.fraudRiskScore > 60) return 'suspended';
  if (!supplier.emailVerified) return 'unverified';
  
  // If only email/phone verified, they are Tier 0 "listed"
  if (!supplier.gstVerified || !supplier.bankVerified) return 'listed';
  
  // If GST and bank verified, but not documents or video walkthrough
  if (!supplier.videoWalkthroughPassed || !supplier.documentsReviewed) return 'business_verified';
  
  // If documents and video walkthrough are passed, they are at least verified_supplier
  if (!supplier.physicalVisitDate) return 'verified_supplier';
  
  // Check expiry (1 year cycle) for physical audit
  const visitDate = new Date(supplier.physicalVisitDate);
  const oneYearAgo = new Date(); 
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (visitDate < oneYearAgo) return 'expired';
  
  return 'premium_audited';
}

