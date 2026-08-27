import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqById, saveAuditEvent } from '@/lib/storeAdapter';
import { z } from 'zod';

const processRfqSchema = z.object({
  selectedSupplierIds: z.array(z.string()).min(1, 'At least one supplier must be selected.'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 });
    }

    const { id } = await params;
    const rfq = await getRfqById(id);

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found.' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = processRfqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { selectedSupplierIds } = parsed.data;

    rfq.status = 'routed';

    await saveAuditEvent({
      action: 'ADMIN_RFQ_ROUTED',
      details: `Admin routed RFQ ${id} to ${selectedSupplierIds.length} suppliers: [${selectedSupplierIds.join(', ')}]`,
      actorRole: 'admin',
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      rfqId: id,
      newStatus: 'routed',
      routedToCount: selectedSupplierIds.length,
      message: `RFQ georouted successfully to matching audited manufacturers.`,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
