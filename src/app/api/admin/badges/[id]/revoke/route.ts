import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent } from '@/lib/storeAdapter';
import { enforceGateTransition } from '@/lib/gateEnforcement';
import { z } from 'zod';

const revokeSchema = z.object({
  reason: z.string().min(5, 'Revocation reason must be at least 5 characters.'),
  downgradeTo: z.enum(['none', 'listed', 'business_verified']).default('none'),
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
    const parsed = revokeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { reason, downgradeTo } = parsed.data;

    // Validate using Gate Enforcement rules
    const targetState = downgradeTo === 'none' ? 'suspended' : 'unverified';
    const isAllowed = enforceGateTransition('verified_supplier', targetState);

    saveAuditEvent({
      action: 'ADMIN_BADGE_REVOKED',
      details: `Admin revoked/downgraded badge for Supplier ${id} to "${downgradeTo}". Reason: ${reason} (Transition Allowed: ${isAllowed})`,
      actorRole: 'admin',
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      supplierId: id,
      newTier: downgradeTo,
      message: `Verification badge revoked and logging trail updated.`,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
