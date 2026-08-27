/**
 * factoryService.ts
 * Factory Intelligence Service.
 * Decomposes Supplier profiles into LegalEntity, FactorySite, Capability, and Machine models.
 */

import { Supplier } from '@/types';
import { LegalEntity, FactorySite, Capability, Machine } from '@/types/factory';
import { Evidence } from '@/types/evidence';

export function extractLegalEntity(supplier: Supplier): LegalEntity {
  return {
    id: `le-${supplier.id}`,
    supplierId: supplier.id,
    gstin: supplier.verificationDetails?.gstin || '24UNSET00000000',
    legalName: supplier.companyName,
    tradeName: supplier.companyName,
    iec: supplier.verificationDetails?.iec,
    udyamNumber: supplier.verificationDetails?.udyamNumber,
    registeredAddress: supplier.location.fullAddress,
    status: supplier.isVerified ? 'active' : 'inactive',
    source: 'gst_registry',
    checkedAt: supplier.verifiedDate || new Date().toISOString(),
    createdAt: supplier.verifiedDate || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function extractFactorySite(supplier: Supplier): FactorySite {
  return {
    id: `site-${supplier.id}-1`,
    supplierId: supplier.id,
    address: supplier.location.fullAddress,
    city: supplier.location.city,
    state: supplier.location.state,
    country: supplier.location.country,
    gps: supplier.location.gpsCoordinates,
    gidcZone: supplier.location.gidcZone,
    siteType: 'manufacturing',
    operatingStatus: 'active',
    createdAt: supplier.verifiedDate || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function extractCapabilities(supplier: Supplier): Capability[] {
  return supplier.subcategories.map((sub, idx) => ({
    id: `cap-${supplier.id}-${idx + 1}`,
    factorySiteId: `site-${supplier.id}-1`,
    supplierId: supplier.id,
    process: sub.replace(/-/g, ' ').toUpperCase(),
    productFamily: supplier.category,
    moq: supplier.moq ? parseInt(supplier.moq.replace(/\D/g, '')) || 50 : 50,
    leadTimeWeeks: supplier.leadTime ? parseInt(supplier.leadTime.replace(/\D/g, '')) || 2 : 2,
    evidenceId: `ev-${supplier.id}-cap-${idx + 1}`,
    createdAt: supplier.verifiedDate || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function extractEvidenceRecords(supplier: Supplier): Evidence[] {
  const records: Evidence[] = [];
  const capturedAt = supplier.verifiedDate || new Date().toISOString();

  // 1. Legal Entity / GSTIN Evidence
  if (supplier.verificationDetails?.gstin) {
    records.push({
      id: `ev-${supplier.id}-gstin`,
      entityType: 'supplier',
      entityId: supplier.id,
      claim: `Government GSTIN (${supplier.verificationDetails.gstin}) active and verified`,
      evidenceType: 'registry_api',
      source: 'gst_registry',
      capturedAt,
      verifiedAt: capturedAt,
      verifiedBy: 'system:gst_validator',
      confidence: 100,
      status: 'verified',
      createdAt: capturedAt,
      updatedAt: capturedAt,
    });
  }

  // 2. Physical Audit Evidence
  if (supplier.auditRecords && supplier.auditRecords.length > 0) {
    const audit = supplier.auditRecords[0];
    records.push({
      id: `ev-${supplier.id}-audit`,
      entityType: 'factory_site',
      entityId: `site-${supplier.id}-1`,
      claim: `Physical on-site plant audit passed with Grade ${audit.grade}. ${audit.findings}`,
      evidenceType: 'physical_audit',
      source: 'physical_audit',
      capturedAt: audit.auditDate,
      verifiedAt: audit.auditDate,
      verifiedBy: audit.auditorName,
      confidence: 95,
      status: audit.passed ? 'verified' : 'suspended',
      createdAt: audit.auditDate,
      updatedAt: audit.auditDate,
    });
  }

  // 3. Certifications Evidence
  for (const cert of supplier.certifications || []) {
    records.push({
      id: `ev-${supplier.id}-cert-${cert.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      entityType: 'certification',
      entityId: supplier.id,
      claim: `Verified industrial certification: ${cert}`,
      evidenceType: 'document',
      source: 'certification_registry',
      capturedAt,
      verifiedAt: capturedAt,
      verifiedBy: 'system:doc_reviewer',
      confidence: 95,
      status: 'verified',
      createdAt: capturedAt,
      updatedAt: capturedAt,
    });
  }

  return records;
}
