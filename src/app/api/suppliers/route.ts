import { NextRequest, NextResponse } from 'next/server';
import { getSuppliers, getApplications } from '@/lib/storeAdapter';
import { checkRateLimit } from '@/lib/rateLimit';
import { calculateGateState } from '@/lib/gateEnforcement';

// GET /api/suppliers — returns suppliers from store adapter + application counts
export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const suppliersList = await getSuppliers();

  // Run dynamic badge lifecycle checks
  const now = new Date();
  suppliersList.forEach((s: any) => {
    if (s.verificationExpiryDate) {
      const expiry = new Date(s.verificationExpiryDate);
      if (expiry < now && s.isVerified) {
        s.isVerified = false;
        s.badgeLifecycleState = 'expired';
        
        // Recalculate gate state dynamically
        s.verificationGateState = calculateGateState({
          emailVerified: true,
          gstVerified: (s.qualityScore?.reputationScore ?? 0) > 5,
          iecVerified: (s.qualityScore?.auditQualityScore ?? 0) > 5,
          bankVerified: s.verificationDetails?.bankVerified ?? true,
          videoWalkthroughPassed: !!s.facilityVideoUrl,
          documentsReviewed: true,
          physicalVisitDate: s.verifiedDate,
          fraudRiskScore: 0
        });
      }
    }
  });

  const applications = await getApplications();
  const approvedApps = applications.filter((a: any) => a.status === 'approved');

  return NextResponse.json({
    suppliers: suppliersList,
    pendingApplicationsCount: applications.filter((a: any) => a.status === 'pending').length,
    approvedApplicationsCount: approvedApps.length,
  });
}

