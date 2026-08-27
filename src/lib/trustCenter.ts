import { suppliers as seedSuppliers } from '@/data/suppliers';
import { Supplier, AuditRecord } from '@/types';

export interface TrustRegistryRecord {
  companyName: string;
  slug: string;
  verificationTier: 'listed' | 'business_verified' | 'verified_supplier' | 'premium_audited';
  verifiedDate: string;
  verificationExpiryDate: string;
  gstin: string;
  iec: string;
  auditorName: string;
  gpsCoordinates: string;
  city: string;
  gidcZone: string;
  auditDetails: AuditRecord;
  documentsVerified: string[];
  isVerified: boolean;
  lifecycleState: 'active' | 'expired' | 'suspended' | 'revoked';
}

function mapSupplierToTrustRecord(matchedSupplier: any): TrustRegistryRecord {
  const defaultAudit: AuditRecord = {
    id: `AUDIT-${(matchedSupplier.id || '01').toUpperCase()}-01`,
    auditorName: 'Rajesh Shah',
    auditDate: matchedSupplier.verifiedDate || '2026-04-30',
    gpsCoordinates: matchedSupplier.location?.gpsCoordinates || '22.9567°N, 72.6148°E',
    documentsVerified: ['GST Registration', 'IEC License', 'ISO 9001 Certificate'],
    findings: `Clean manufacturing facility geocoded inside ${matchedSupplier.location?.gidcZone || 'Gujarat corridor'}. Employee logs and machine output records reviewed and approved.`,
    grade: 'A',
    passed: matchedSupplier.isVerified,
  };

  const audit = matchedSupplier.auditRecords?.[0] || defaultAudit;

  return {
    companyName: matchedSupplier.companyName,
    slug: matchedSupplier.slug,
    verificationTier: matchedSupplier.verificationTier,
    verifiedDate: matchedSupplier.verifiedDate || '2026-04-30',
    verificationExpiryDate: matchedSupplier.verificationExpiryDate || '2027-04-30',
    gstin: matchedSupplier.verificationDetails?.gstin || 'N/A',
    iec: matchedSupplier.verificationDetails?.iec || 'N/A',
    auditorName: audit.auditorName,
    gpsCoordinates: audit.gpsCoordinates,
    city: matchedSupplier.location?.city || 'Gujarat',
    gidcZone: matchedSupplier.location?.gidcZone || 'N/A',
    auditDetails: audit,
    documentsVerified: audit.documentsVerified || defaultAudit.documentsVerified,
    isVerified: matchedSupplier.isVerified,
    lifecycleState: (matchedSupplier.badgeLifecycleState || 'active') as any,
  };
}

export function lookupTrustRegistry(query: string, customSuppliers?: any[]): TrustRegistryRecord | null {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  const supplierList = customSuppliers && customSuppliers.length > 0 ? customSuppliers : seedSuppliers;

  const matchedSupplier = supplierList.find((s: any) => {
    const sGstin = s.verificationDetails?.gstin?.toLowerCase() || '';
    const sIec = s.verificationDetails?.iec?.toLowerCase() || '';
    const sAuditId = s.auditRecords?.[0]?.id?.toLowerCase() || '';
    const sName = (s.companyName || '').toLowerCase();
    
    return sGstin.includes(normalizedQuery) ||
           sIec.includes(normalizedQuery) ||
           sAuditId.includes(normalizedQuery) ||
           sName.includes(normalizedQuery);
  });

  if (!matchedSupplier) return null;
  return mapSupplierToTrustRecord(matchedSupplier);
}


