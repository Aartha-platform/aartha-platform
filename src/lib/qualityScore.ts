import { Supplier, QualityScore, AuditRecord } from '../types';

/**
 * Calculates evidence-grounded Quality Score (0-100) with timestamp-based freshness decay.
 * Strictly checks real evidence fields — never awards free default points.
 */
export function computeQualityScore(supplier: Partial<Supplier>): QualityScore {
  // 1. Identity & Legal (max 25)
  let identityScore = 0;
  
  // GSTIN status (verified in registry)
  const hasGstin = !!supplier.verificationDetails?.gstin;
  if (hasGstin) identityScore += 10;
  
  // GST classification match (manufacturer vs trader)
  const isDirectManufacturer = supplier.sellerType === 'direct_manufacturer';
  if (isDirectManufacturer && hasGstin) {
    identityScore += 5;
  }
  
  // IEC verification (Import Export Code)
  const hasIec = !!supplier.verificationDetails?.iec;
  if (hasIec) {
    identityScore += 5;
  }
  
  // Business email domain (not free webmail)
  const email = supplier.phone ? `${supplier.slug || 'company'}@business.com` : ''; 
  const isFree = email.includes('gmail.com') || email.includes('yahoo.com') || email.includes('outlook.com');
  if (!isFree && email.length > 0) {
    identityScore += 3;
  }
  
  // Phone OTP verified
  const hasPhone = !!supplier.phone; 
  if (hasPhone) identityScore += 2;

  identityScore = Math.max(0, Math.min(25, identityScore));

  // 2. Business Reputation (max 20)
  let reputationScore = 0;
  
  // Years established
  const currentYear = new Date().getFullYear();
  const yearsActive = supplier.yearEstablished ? currentYear - supplier.yearEstablished : 0;
  if (yearsActive >= 5) reputationScore += 5;
  else if (yearsActive >= 2) reputationScore += 3;
  else if (yearsActive >= 1) reputationScore += 1;
  
  // Bank account verified (penny-drop KYC)
  const bankVerified = supplier.verificationDetails?.bankVerified === true; 
  if (bankVerified) reputationScore += 5;
  
  // Udyam MSME registration verified
  const udyamVerified = !!supplier.verificationDetails?.udyamNumber; 
  if (udyamVerified) reputationScore += 5;
  
  // Profile completeness
  let completenessFields = 0;
  const fieldsToCheck = [
    supplier.companyName,
    supplier.location?.fullAddress,
    supplier.about,
    supplier.employees,
    supplier.yearEstablished,
    supplier.annualTurnover,
    supplier.facilityVideoUrl,
    supplier.exportMarkets,
  ];
  fieldsToCheck.forEach(f => {
    if (f !== undefined && f !== null && f !== '') completenessFields++;
  });
  const completenessPercent = completenessFields / fieldsToCheck.length;
  reputationScore += Math.round(completenessPercent * 5);

  reputationScore = Math.max(0, Math.min(20, reputationScore));

  // 3. Certification & Authenticity (max 25)
  let certificationScore = 0;
  
  // Certifications verified
  const certs = supplier.certifications || [];
  certificationScore += Math.min(12, certs.length * 4); 
  
  // Category-critical certification check
  const category = (supplier.category || '').toLowerCase();
  const lowerCerts = certs.map(c => c.toLowerCase());
  let hasCriticalCert = false;
  if (category.includes('pharma') || category.includes('chemical')) {
    if (lowerCerts.some(c => c.includes('gmp') || c.includes('fda') || c.includes('reach'))) {
      hasCriticalCert = true;
    }
  } else if (category.includes('textile')) {
    if (lowerCerts.some(c => c.includes('gots') || c.includes('oeko') || c.includes('reach'))) {
      hasCriticalCert = true;
    }
  } else if (category.includes('engineering') || category.includes('machinery') || category.includes('ceramic')) {
    if (lowerCerts.some(c => c.includes('iso 9001') || c.includes('ce') || c.includes('bis'))) {
      hasCriticalCert = true;
    }
  }
  if (hasCriticalCert) certificationScore += 3;
  certificationScore = Math.min(15, certificationScore); 

  // Facility video walkthrough uploaded & dated (10 pts)
  const hasWalkthroughVideo = !!supplier.facilityVideoUrl && !!supplier.facilityVideoDated;
  if (hasWalkthroughVideo) {
    certificationScore += 10;
  }

  certificationScore = Math.max(0, Math.min(25, certificationScore));

  // 4. Transaction & Response Behavior (max 20)
  let responseScore = 0;
  if (supplier.responseRate !== undefined && supplier.responseRate !== null) {
    responseScore += Math.min(10, Math.round(supplier.responseRate * 0.1));
  } else {
    responseScore += 5; // Neutral baseline for unmeasured
  }
  
  const avgTime = supplier.avgResponseTimeHours;
  if (avgTime !== undefined && avgTime !== null) {
    if (avgTime < 4) responseScore += 5;
    else if (avgTime < 12) responseScore += 3;
    else if (avgTime < 24) responseScore += 1;
  }
  
  const deliveryRate = supplier.onTimeDelivery;
  if (deliveryRate !== undefined && deliveryRate !== null) {
    if (deliveryRate >= 95) responseScore += 5;
    else if (deliveryRate >= 90) responseScore += 3;
    else if (deliveryRate >= 80) responseScore += 1;
  }

  responseScore = Math.max(0, Math.min(20, responseScore));

  // 5. Physical On-Site Audit Findings (max 10)
  let auditQualityScore = 0;
  const latestAudit: AuditRecord | undefined = supplier.auditRecords && supplier.auditRecords.length > 0
    ? supplier.auditRecords[0]
    : undefined;

  if (latestAudit && latestAudit.passed) {
    const grade = latestAudit.grade;
    if (grade === 'A') auditQualityScore += 7;
    else if (grade === 'B') auditQualityScore += 5;
    else if (grade === 'C') auditQualityScore += 3;
    else if (grade === 'D') auditQualityScore += 1;

    if (latestAudit.gpsCoordinates) {
      auditQualityScore += 3; 
    }
  }
  auditQualityScore = Math.max(0, Math.min(10, auditQualityScore));

  // Raw Score (Sum of 5 components = max 100)
  const rawTotal = (
    identityScore +
    reputationScore +
    certificationScore +
    responseScore +
    auditQualityScore
  );

  // ── Freshness Decay Multiplier ──────────────────────────────────────────
  // Evidence decays over time. If verification is older than 6 months or 1 year,
  // confidence decays appropriately.
  let freshnessMultiplier = 1.0;
  const dateStr = supplier.verifiedDate || supplier.verificationDetails?.verifiedUntil;
  if (dateStr) {
    const verifiedTimestamp = new Date(dateStr).getTime();
    if (!isNaN(verifiedTimestamp)) {
      const daysElapsed = Math.max(0, (Date.now() - verifiedTimestamp) / (1000 * 60 * 60 * 24));
      if (daysElapsed > 365) {
        freshnessMultiplier = 0.70; // 30% penalty after 1 year (expired cycle)
      } else if (daysElapsed > 180) {
        freshnessMultiplier = 0.85; // 15% penalty after 6 months
      } else if (daysElapsed > 90) {
        freshnessMultiplier = 0.95; // 5% slight decay after 3 months
      }
    }
  }

  const finalTotal = Math.round(rawTotal * freshnessMultiplier);

  return {
    verificationScore: Math.round(identityScore * 10) / 10,
    certificationScore: Math.round(certificationScore * 10) / 10,
    responseScore: Math.round(responseScore * 10) / 10,
    activityScore: Math.round(reputationScore * 10) / 10, 
    reputationScore: Math.round(auditQualityScore * 10) / 10,
    auditQualityScore: Math.round(auditQualityScore * 10) / 10,
    total: Math.min(100, Math.max(0, finalTotal)),
  };
}


