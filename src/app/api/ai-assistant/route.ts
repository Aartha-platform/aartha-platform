import { NextRequest, NextResponse } from 'next/server';
import { generateLLMReply } from '@/lib/assistantModes';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { mode, input } = await request.json();
    if (!mode || !input) {
      return NextResponse.json({ error: 'mode and input are required.' }, { status: 400 });
    }

    const response = await generateLLMReply(mode, input);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
