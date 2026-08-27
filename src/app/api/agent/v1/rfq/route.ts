import { NextRequest, NextResponse } from 'next/server';
import { saveRfq, saveAuditEvent } from '@/lib/storeAdapter';
import { isBusinessEmail } from '@/lib/validation';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const agentRfqSchema = z.object({
  product: z.string().min(3),
  category: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().min(1),
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  country: z.string().min(1),
  targetPrice: z.string().optional(),
  specifications: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Agent APIs validate authorization tokens or run mock checks
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized agent token. Include Bearer token.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = agentRfqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;

    if (!isBusinessEmail(data.email)) {
      return NextResponse.json({ error: 'Please use a corporate business email domain.' }, { status: 400 });
    }

    const record = await saveRfq(data);

    await saveAuditEvent({
      action: 'AGENT_RFQ_SUBMITTED',
      details: `Autonomous Agent submitted RFQ ${record.id} for "${record.product}" from exporter ${record.companyName}`,
      actorRole: 'agent',
    });

    return NextResponse.json({
      success: true,
      agentApiVersion: 'v1',
      rfqId: record.id,
      status: record.status,
      submittedAt: record.submittedAt,
      message: 'RFQ processed and matched in our georouted directory.',
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
