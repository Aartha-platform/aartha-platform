import { NextRequest, NextResponse } from 'next/server';
import { getApplications, saveAuditEvent, updateApplicationStatus, saveSupplier } from '@/lib/storeAdapter';
import { getServerSession } from '@/lib/session';

function requireAdmin(request: NextRequest) {
  const session = getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const applications = await getApplications();
  return NextResponse.json({ applications, total: applications.length });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { applicationId, action, companyName } = body as {
      applicationId: string;
      action: 'approve' | 'reject' | 'schedule';
      companyName?: string;
    };

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'applicationId and action are required.' }, { status: 400 });
    }

    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      schedule: 'scheduled' as const,
    };

    const updated = await updateApplicationStatus(applicationId, statusMap[action]);
    if (!updated) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    if (action === 'approve') {
      // Create active verified supplier profile in store
      const slug = updated.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newSupplier = {
        id: `SUP-${Date.now()}`,
        slug: slug || `supplier-${Date.now()}`,
        companyName: updated.companyName,
        phone: updated.phone,
        isVerified: true,
        verificationTier: 'Business Verified' as const,
        sellerType: (updated.sellerType || 'Manufacturer') as any,
        verifiedDate: new Date().toISOString().split('T')[0],
        category: updated.category,
        subcategories: updated.subcategories || [],
        location: {
          city: updated.city || 'Gujarat',
          state: 'Gujarat',
          country: 'India',
          gidcZone: updated.gidcZone || 'GIDC Cluster',
          fullAddress: updated.fullAddress || '',
        },
        products: updated.subcategories || [updated.category],
        certifications: updated.certifications || ['GSTIN Verified'],
        verificationDetails: {
          gstin: updated.gstin,
          iec: updated.iec,
        },
        qualityScore: {
          verificationScore: 20,
          certificationScore: 15,
          responseScore: 15,
          activityScore: 10,
          reputationScore: 10,
          auditQualityScore: 10,
          total: 80,
        },
        qualityScoreLastComputed: new Date().toISOString(),
        rating: 4.8,
        moq: '500 Units',
        leadTime: '2-3 Weeks',
      };
      await saveSupplier(newSupplier);
    }

    const actionLabel =
      action === 'approve' ? 'APPROVE_DOSSIER' :
      action === 'reject' ? 'REJECT_DOSSIER' : 'SCHEDULE_AUDIT';

    await saveAuditEvent({
      action: actionLabel,
      details: `Admin ${action}d application ${applicationId}${companyName ? ` for ${companyName}` : ''}. Badge set to ${action === 'approve' ? 'business_verified' : 'pending'}.`,
      actorRole: 'admin',
    });

    return NextResponse.json({ success: true, applicationId, action });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

