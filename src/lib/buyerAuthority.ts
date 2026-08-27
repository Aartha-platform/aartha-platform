export interface BuyerAuthorityDeclaration {
  companyName: string;
  representativeName: string;
  designation: string;
  businessEmail: string;
  authorityBand: 'Micro (<$10K)' | 'SME ($10K-$50K)' | 'Mid-Market ($50K-$500K)' | 'Enterprise ($500K+)';
  declarationSigned: boolean;
  signedAt: string;
}

const LOCAL_STORAGE_KEY = 'artha_buyer_authority';

export function getSavedAuthorityDeclaration(): BuyerAuthorityDeclaration | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BuyerAuthorityDeclaration;
  } catch {
    return null;
  }
}

export function saveAuthorityDeclaration(decl: BuyerAuthorityDeclaration): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decl));
}

export function clearAuthorityDeclaration(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
