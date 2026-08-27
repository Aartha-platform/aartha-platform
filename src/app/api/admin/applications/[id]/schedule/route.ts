import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent, updateApplicationStatus } from '@/lib/storeAdapter';
import { z } from 'zod';

const scheduleSchema = z.object({
  visitDate: z.string().min(1, 'Audit date is required.'),
  assignedAuditor: z.string().min(2, 'Auditor name is required.'),
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
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { visitDate, assignedAuditor } = parsed.data;

    const updated = updateApplicationStatus(id, 'scheduled', {
      preferredVisitDate: visitDate,
      status: 'scheduled'
    });

    if (!updated) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    saveAuditEvent({
      action: 'ADMIN_AUDIT_SCHEDULED',
      details: `Admin scheduled plant visit for Application ${id} on ${visitDate}. Auditor: ${assignedAuditor}`,
      actorRole: 'admin',
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      applicationId: id,
      status: 'scheduled',
      scheduledDate: visitDate,
      auditor: assignedAuditor,
      message: 'On-site GIDC audit visit scheduled successfully.',
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
