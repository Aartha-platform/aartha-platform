import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent } from '@/lib/storeAdapter';
import { z } from 'zod';

const buyerVerifySchema = z.object({
  companyWebsite: z.string().url(),
  authorityDeclaration: z.string().min(10, 'Declaration must be at least 10 characters.'),
  sourcingBand: z.enum(['under_50k', '50k_500k', 'above_500k']),
});

export async function POST(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = buyerVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { companyWebsite, authorityDeclaration, sourcingBand } = parsed.data;

    await saveAuditEvent({
      action: 'BUYER_VERIFICATION_INIT',
      details: `Buyer ${session.email} submitted verification. Website: ${companyWebsite}, Band: ${sourcingBand}`,
      actorRole: 'buyer',
      actorId: session.userId,
    });

    // Simulated immediate upgrade to Tier 3 if valid business domain
    const tier = sourcingBand === 'above_500k' ? 'Tier 4: Corridor Approved' : 'Tier 3: Authority Verified';

    return NextResponse.json({
      success: true,
      status: 'pending_review',
      assignedTierSimulated: tier,
      message: 'Buyer verification files received. Artha desk will check registry databases under 4 hours.',
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
