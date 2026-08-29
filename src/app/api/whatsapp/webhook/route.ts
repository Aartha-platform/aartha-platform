import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookChallenge,
  verifyWebhookSignature,
  parseWebhookPayload,
  parseStatusUpdates,
  upsertContact,
  getOrCreateConversation,
  saveMessage,
  updateMessageStatus,
} from '@/lib/whatsappCloud';

/**
 * GET /api/whatsapp/webhook
 * Meta webhook verification challenge (one-time setup).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const result = verifyWebhookChallenge(mode, token, challenge);

  if (result.valid && result.challenge) {
    // Meta expects the challenge string as plain text response
    return new NextResponse(result.challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  return NextResponse.json({ error: 'Webhook verification failed.' }, { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Receive inbound messages and status updates from WhatsApp Cloud API.
 * Must respond 200 quickly; heavy processing is non-blocking.
 */
export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  // Signature verification (if META_APP_SECRET is configured)
  const signature = request.headers.get('x-hub-signature-256');
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('[WhatsApp Webhook] Signature verification failed.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  // Process inbound messages (non-blocking)
  const messages = parseWebhookPayload(body);
  for (const msg of messages) {
    // Fire-and-forget: do not block the 200 response
    (async () => {
      try {
        const contactId = await upsertContact(msg.from, msg.contactName);
        const conversationId = await getOrCreateConversation(contactId);
        await saveMessage(conversationId, msg.messageId, 'INBOUND', msg.text || `[${msg.type}]`, msg.type);
      } catch (err) {
        console.error('[WhatsApp Webhook] Message processing error:', err);
      }
    })();
  }

  // Process status updates (non-blocking)
  const statuses = parseStatusUpdates(body);
  for (const status of statuses) {
    updateMessageStatus(status.messageId, status.status, status.timestamp).catch(() => {});
  }

  // Always return 200 immediately to Meta
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
