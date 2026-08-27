import { useMemo } from 'react';
import { Supplier, SupplierFilterState } from '../types';

export function filterSuppliers(suppliers: Supplier[], filter: SupplierFilterState, keyword = ''): Supplier[] {
  return suppliers.filter((s) => {
    // 1. Keyword search
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      const nameMatch = s.companyName.toLowerCase().includes(kw);
      const cityMatch = s.location.city.toLowerCase().includes(kw);
      const stateMatch = s.location.state.toLowerCase().includes(kw);
      const locationMatch = s.location.fullAddress.toLowerCase().includes(kw);
      const productMatch = s.products.some((p) => p.toLowerCase().includes(kw));
      
      const matches = nameMatch || cityMatch || stateMatch || locationMatch || productMatch;
      if (!matches) return false;
    }

    // 2. Verified Only filter (based on new multi-tier verificationGateState)
    if (filter.verifiedOnly && !['verified_supplier', 'premium_audited', 'business_verified'].includes(s.verificationGateState)) return false;

    // 3. Location/Country filtering (checks city or state in filter)
    if (filter.countries.length > 0) {
      const locString = `${s.location.city}, ${s.location.state} ${s.category}`.toLowerCase();
      const matched = filter.countries.some(c => locString.includes(c.toLowerCase()));
      if (!matched) return false;
    }

    // 4. Certifications
    if (filter.certifications.length > 0) {
      const hasAllCerts = filter.certifications.every((c) => s.certifications.includes(c));
      if (!hasAllCerts) return false;
    }

    // 5. Response Rate Min
    if (s.responseRate !== undefined && s.responseRate < filter.responseRateMin) return false;

    // 6. On Time Delivery Min
    if (s.onTimeDelivery !== undefined && s.onTimeDelivery < filter.onTimeDeliveryMin) return false;

    // 7. Aartha Protect (can be aligned with premium/standard tier or verified status)
    if (filter.tradeAssurance && !['verified_supplier', 'premium_audited', 'business_verified'].includes(s.verificationGateState)) return false;

    return true;
  });
}

export function useSupplierFilter(
  suppliers: Supplier[],
  filter: SupplierFilterState,
  keyword = ''
): Supplier[] {
  return useMemo(
    () => filterSuppliers(suppliers, filter, keyword),
    [suppliers, filter, keyword]
  );
}

// Verified Only filter is ON by default!
export const defaultFilter: SupplierFilterState = {
  verifiedOnly: true,
  countries: [],
  certifications: [],
  responseRateMin: 0,
  onTimeDeliveryMin: 0,
  moq: '',
  productType: '',
  tradeAssurance: false,
};
