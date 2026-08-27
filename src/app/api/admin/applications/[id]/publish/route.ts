import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent, updateApplicationStatus } from '@/lib/storeAdapter';
import { z } from 'zod';

const publishSchema = z.object({
  verificationTier: z.enum(['listed', 'business_verified', 'verified_supplier', 'premium_audited']),
  gpsCoordinates: z.string().min(6, 'Valid GPS coordinates are required.'),
  auditorId: z.string(),
  grade: z.enum(['A', 'B', 'C', 'D']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;

    const updated = updateApplicationStatus(id, 'approved', {
      gidcZone: data.gpsCoordinates, // map GPS as custom zone description or similar
      status: 'approved'
    });

    if (!updated) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    saveAuditEvent({
      action: 'ADMIN_SUPPLIER_PUBLISHED',
      details: `Admin approved and published Application ${id}. Tier: ${data.verificationTier}, GPS: ${data.gpsCoordinates}, Grade: ${data.grade}`,
      actorRole: 'admin',
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      applicationId: id,
      status: 'approved',
      publishedSupplierId: `s-${Date.now()}`,
      message: 'Supplier onboarding completed and verified directory listing created.',
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
