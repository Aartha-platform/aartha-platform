import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import {
  sendTextMessage,
  sendTemplateMessage,
  saveMessage,
  getOrCreateConversation,
  upsertContact,
} from '@/lib/whatsappCloud';

/**
 * POST /api/whatsapp/send
 * Admin-only: Send a WhatsApp message to a contact via Cloud API.
 */
export async function POST(request: NextRequest) {
  const session = getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { to, message, templateName, languageCode } = body as {
      to?: string;
      message?: string;
      templateName?: string;
      languageCode?: string;
    };

    if (!to) {
      return NextResponse.json({ error: 'Recipient phone number is required.' }, { status: 400 });
    }

    const cleanTo = to.replace(/[^\d]/g, '');

    let result;
    if (templateName) {
      // Template message (for outside 24h window)
      result = await sendTemplateMessage(cleanTo, templateName, languageCode || 'en');
    } else if (message) {
      // Free-form text (within 24h customer service window)
      result = await sendTextMessage(cleanTo, message);
    } else {
      return NextResponse.json({ error: 'Either message or templateName is required.' }, { status: 400 });
    }

    // Log outbound message in database
    if (result.success && result.messageId) {
      const contactId = await upsertContact(cleanTo);
      const conversationId = await getOrCreateConversation(contactId);
      await saveMessage(conversationId, result.messageId, 'OUTBOUND', message || `[template:${templateName}]`);
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
    }, { status: result.success ? 200 : 502 });
  } catch (err) {
    console.error('[WhatsApp Send Route Error]:', err);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
