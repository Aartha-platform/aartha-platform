/**
 * whatsappCloud.ts
 * Official WhatsApp Cloud API service for Layer 2.
 * Handles: webhook verification, message ingestion, outbound messaging, conversation management.
 * 
 * Environment Variables Required (add to Vercel when ready):
 *   WHATSAPP_ACCESS_TOKEN        - Meta Graph API permanent token
 *   WHATSAPP_PHONE_NUMBER_ID     - Your WABA phone number ID
 *   WHATSAPP_BUSINESS_ACCOUNT_ID - Your WABA ID
 *   META_APP_SECRET              - For webhook signature verification
 *   WHATSAPP_WEBHOOK_VERIFY_TOKEN - Custom string for GET challenge
 */

import crypto from 'crypto';
import { supabase } from './supabaseClient';

// ── Configuration ─────────────────────────────────────────────────────────────
const WHATSAPP_API_BASE = 'https://graph.facebook.com/v20.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const APP_SECRET = process.env.META_APP_SECRET || '';
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'aartha-wa-verify-2026';

// ── Problem Taxonomy (Controlled Categories) ─────────────────────────────────
export const PROBLEM_CATEGORIES = [
  'LEAD_QUALITY',
  'BUYER_VERIFICATION',
  'SUPPLIER_DISCOVERY',
  'TRUST',
  'RFQ_RELEVANCE',
  'PRICE_NEGOTIATION',
  'PAYMENT_RISK',
  'LOGISTICS',
  'EXPORT',
  'CERTIFICATIONS',
  'PRODUCT_VISIBILITY',
  'DIGITAL_SKILLS',
  'PLATFORM_USABILITY',
  'CUSTOMER_SUPPORT',
  'SUBSCRIPTION_PRICING',
  'OTHER',
] as const;

export type ProblemCategory = typeof PROBLEM_CATEGORIES[number];

export type LeadStage =
  | 'NEW'
  | 'DISCOVERY'
  | 'PROBLEM_IDENTIFIED'
  | 'QUALIFIED'
  | 'ACCOUNT_CREATED'
  | 'PROFILE_INCOMPLETE'
  | 'PROFILE_ACTIVE'
  | 'ENGAGED'
  | 'CLOSED'
  | 'OPTED_OUT';

export type ConsentStatus = 'IMPLICIT' | 'CONSENTED' | 'OPTED_OUT';

// ── Webhook Verification (GET challenge from Meta) ────────────────────────────
export function verifyWebhookChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null
): { valid: boolean; challenge?: string } {
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN && challenge) {
    return { valid: true, challenge };
  }
  return { valid: false };
}

// ── Webhook Signature Verification (POST payload authenticity) ────────────────
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!APP_SECRET || !signature) return !APP_SECRET; // Skip if not configured
  const expectedSig = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

// ── Parse Incoming Webhook Event ──────────────────────────────────────────────
export interface ParsedMessage {
  from: string;            // Sender phone (e.g. "917208432138")
  messageId: string;       // WhatsApp message ID (wamid.xxx)
  timestamp: string;       // Unix timestamp
  type: string;            // text, image, document, etc.
  text?: string;           // Text body content
  contactName?: string;    // Profile push name
}

export function parseWebhookPayload(body: any): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  try {
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        if (change?.field !== 'messages') continue;
        const value = change?.value;
        if (!value?.messages) continue;

        const contacts = value.contacts || [];
        const contactMap = new Map<string, string>();
        for (const c of contacts) {
          contactMap.set(c.wa_id, c.profile?.name || '');
        }

        for (const msg of value.messages) {
          messages.push({
            from: msg.from,
            messageId: msg.id,
            timestamp: msg.timestamp,
            type: msg.type || 'text',
            text: msg.text?.body || msg.caption || '',
            contactName: contactMap.get(msg.from) || '',
          });
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Parse error:', err);
  }
  return messages;
}

// ── Status Update Parser ──────────────────────────────────────────────────────
export interface StatusUpdate {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipientId: string;
}

export function parseStatusUpdates(body: any): StatusUpdate[] {
  const updates: StatusUpdate[] = [];
  try {
    const entries = body?.entry || [];
    for (const entry of entries) {
      for (const change of entry?.changes || []) {
        if (change?.field !== 'messages') continue;
        for (const status of change?.value?.statuses || []) {
          updates.push({
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp,
            recipientId: status.recipient_id,
          });
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Status parse error:', err);
  }
  return updates;
}

// ── Send Text Message via Cloud API ───────────────────────────────────────────
export async function sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string }> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.warn('[WhatsApp Cloud API] Not configured. Message logged only.');
    return { success: false };
  }

  try {
    const res = await fetch(`${WHATSAPP_API_BASE}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[WhatsApp Send Error]:', data);
      return { success: false };
    }
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    console.error('[WhatsApp Send Exception]:', err);
    return { success: false };
  }
}

// ── Send Template Message (for re-engagement outside 24h window) ──────────────
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components?: any[]
): Promise<{ success: boolean; messageId?: string }> {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.warn('[WhatsApp Cloud API] Not configured for templates.');
    return { success: false };
  }

  try {
    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };
    if (components) payload.template.components = components;

    const res = await fetch(`${WHATSAPP_API_BASE}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[WhatsApp Template Error]:', data);
      return { success: false };
    }
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    console.error('[WhatsApp Template Exception]:', err);
    return { success: false };
  }
}

// ── Database: Upsert Contact ──────────────────────────────────────────────────
export async function upsertContact(
  phone: string,
  name?: string,
  sourcePage?: string
): Promise<string> {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  try {
    const { data: existing } = await supabase
      .from('whatsapp_contacts')
      .select('id')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('whatsapp_contacts')
        .update({ last_seen_at: new Date().toISOString(), display_name: name || undefined })
        .eq('id', existing.id);
      return existing.id;
    }

    const { data: inserted, error } = await supabase
      .from('whatsapp_contacts')
      .insert([{
        phone_number: cleanPhone,
        display_name: name || '',
        source_page: sourcePage || 'whatsapp_direct',
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }])
      .select('id')
      .single();

    if (error) {
      console.warn('[WA Contact Upsert]:', error.message);
      return `wa-${cleanPhone}`;
    }
    return inserted?.id || `wa-${cleanPhone}`;
  } catch (err) {
    console.warn('[WA Contact Upsert Exception]:', err);
    return `wa-${cleanPhone}`;
  }
}

// ── Database: Get or Create Active Conversation ───────────────────────────────
export async function getOrCreateConversation(
  contactId: string,
  sourcePage?: string
): Promise<string> {
  try {
    // Find active (non-closed) conversation for this contact
    const { data: existing } = await supabase
      .from('whatsapp_conversations')
      .select('id')
      .eq('contact_id', contactId)
      .not('lead_stage', 'in', '("CLOSED","OPTED_OUT")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: inserted, error } = await supabase
      .from('whatsapp_conversations')
      .insert([{
        contact_id: contactId,
        lead_stage: 'NEW',
        source_page: sourcePage || 'whatsapp_direct',
        opened_at: new Date().toISOString(),
      }])
      .select('id')
      .single();

    if (error) {
      console.warn('[WA Conversation Create]:', error.message);
      return `conv-${Date.now()}`;
    }
    return inserted?.id || `conv-${Date.now()}`;
  } catch (err) {
    console.warn('[WA Conversation Create Exception]:', err);
    return `conv-${Date.now()}`;
  }
}

// ── Database: Save Message ────────────────────────────────────────────────────
export async function saveMessage(
  conversationId: string,
  providerMessageId: string,
  direction: 'INBOUND' | 'OUTBOUND',
  content: string,
  messageType: string = 'text'
): Promise<void> {
  const fallbackMsgId = `msg-${Date.now()}-${crypto.randomInt(1000, 9999)}`;
  try {
    // Idempotency: skip if provider message ID already exists
    if (providerMessageId) {
      const { data: existing } = await supabase
        .from('whatsapp_messages')
        .select('id')
        .eq('provider_message_id', providerMessageId)
        .maybeSingle();
      if (existing) return; // Already stored
    }

    await supabase.from('whatsapp_messages').insert([{
      conversation_id: conversationId,
      provider_message_id: providerMessageId || fallbackMsgId,
      direction,
      message_type: messageType,
      content,
      status: direction === 'INBOUND' ? 'received' : 'sent',
      sent_at: new Date().toISOString(),
    }]);

    // Update conversation counters
    const updates: any = { updated_at: new Date().toISOString() };
    if (direction === 'INBOUND') {
      updates.last_customer_message_at = new Date().toISOString();
    }
    await supabase.from('whatsapp_conversations')
      .update(updates)
      .eq('id', conversationId);
  } catch (err) {
    console.warn('[WA Message Save]:', err);
  }
}

// ── Database: Update Message Status ───────────────────────────────────────────
export async function updateMessageStatus(
  providerMessageId: string,
  status: string,
  timestamp?: string
): Promise<void> {
  try {
    const updates: any = { status };
    if (status === 'delivered') updates.delivered_at = timestamp ? new Date(parseInt(timestamp) * 1000).toISOString() : new Date().toISOString();
    if (status === 'read') updates.read_at = timestamp ? new Date(parseInt(timestamp) * 1000).toISOString() : new Date().toISOString();

    await supabase.from('whatsapp_messages')
      .update(updates)
      .eq('provider_message_id', providerMessageId);
  } catch (err) {
    console.warn('[WA Status Update]:', err);
  }
}

// ── Database: Update Lead Stage ───────────────────────────────────────────────
export async function updateLeadStage(
  conversationId: string,
  stage: LeadStage
): Promise<void> {
  try {
    await supabase.from('whatsapp_conversations')
      .update({ lead_stage: stage, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (err) {
    console.warn('[WA Lead Stage Update]:', err);
  }
}

// ── Database: Save Feedback Insight ───────────────────────────────────────────
export async function saveFeedbackInsight(insight: {
  conversationId?: string;
  feedbackId?: string;
  primaryCategory: ProblemCategory;
  secondaryCategories?: string[];
  sentiment?: string;
  severity?: string;
  summary?: string;
  confidence?: number;
  painPoints?: string[];
  competitorsMentioned?: string[];
  featureRequests?: string[];
  rawEvidence?: string;
  suggestedOpportunity?: string;
  analyzedBy?: string;
}): Promise<string> {
  try {
    const { data: inserted, error } = await supabase.from('feedback_insights').insert([{
      conversation_id: insight.conversationId || null,
      feedback_id: insight.feedbackId || null,
      primary_category: insight.primaryCategory,
      secondary_categories: insight.secondaryCategories || [],
      sentiment: insight.sentiment || 'neutral',
      severity: insight.severity || 'medium',
      summary: insight.summary || '',
      confidence: insight.confidence || 0,
      user_pain_points: insight.painPoints || [],
      competitors_mentioned: insight.competitorsMentioned || [],
      feature_requests: insight.featureRequests || [],
      raw_evidence: insight.rawEvidence || '',
      suggested_product_opportunity: insight.suggestedOpportunity || '',
      analyzed_by: insight.analyzedBy || 'heuristic',
    }]).select('id').single();

    if (error) {
      console.warn('[Feedback Insight Save]:', error.message);
      return `fi-${Date.now()}`;
    }
    return inserted?.id || `fi-${Date.now()}`;
  } catch (err) {
    console.warn('[Feedback Insight Save]:', err);
    return `fi-${Date.now()}`;
  }
}

// ── Heuristic Conversation Analyzer (No OpenAI dependency) ────────────────────
export function analyzeConversationHeuristic(messages: string[]): {
  primaryCategory: ProblemCategory;
  severity: string;
  sentiment: string;
  painPoints: string[];
  competitorsMentioned: string[];
} {
  const combined = messages.join(' ').toLowerCase();

  // Competitor detection
  const competitors: string[] = [];
  if (combined.includes('indiamart')) competitors.push('IndiaMART');
  if (combined.includes('alibaba')) competitors.push('Alibaba');
  if (combined.includes('tradeindia')) competitors.push('TradeIndia');
  if (combined.includes('exportersindia')) competitors.push('ExportersIndia');
  if (combined.includes('justdial')) competitors.push('JustDial');

  // Problem category detection with keyword matching
  const painPoints: string[] = [];
  let primaryCategory: ProblemCategory = 'OTHER';

  const rules: [RegExp, ProblemCategory, string][] = [
    [/fake\s*(enquir|lead|buyer)|spam|junk|irrelevant|random\s*enquir/i, 'LEAD_QUALITY', 'Receives irrelevant or fake enquiries'],
    [/buyer.*disappear|no\s*reply|ghost|quotation.*reply.*nahi/i, 'LEAD_QUALITY', 'Buyers disappear after quotation'],
    [/verify|genuine|real\s*buyer|serious\s*buyer|trust/i, 'BUYER_VERIFICATION', 'Cannot verify buyer seriousness'],
    [/visibility|find\s*me|search.*result|discover/i, 'PRODUCT_VISIBILITY', 'Poor product/supplier visibility'],
    [/price\s*war|race.*bottom|competitor.*sasta|undercutting/i, 'PRICE_NEGOTIATION', 'Price war from too many competing suppliers'],
    [/payment.*risk|credit.*risk|advance|udhaar|payment.*stuck/i, 'PAYMENT_RISK', 'Payment risk with new buyers'],
    [/export|customs|shipping|international|foreign\s*buyer/i, 'EXPORT', 'Export/international trade challenges'],
    [/certifi|iso|quality|compliance|standard/i, 'CERTIFICATIONS', 'Certification/compliance requirements'],
    [/rfq|requirement|enquiry.*quality/i, 'RFQ_RELEVANCE', 'RFQ quality or relevance issues'],
    [/logistics|delivery|transport|freight/i, 'LOGISTICS', 'Logistics and delivery challenges'],
    [/difficult|confus|problem|issue|broken|not\s*work/i, 'PLATFORM_USABILITY', 'Platform usability issues'],
  ];

  for (const [regex, category, point] of rules) {
    if (regex.test(combined)) {
      if (primaryCategory === 'OTHER') primaryCategory = category;
      painPoints.push(point);
    }
  }

  // Sentiment detection
  let sentiment = 'neutral';
  const negativeSignals = (combined.match(/problem|issue|bad|worst|terrible|fraud|scam|waste|angry|frustrated|disappointed/g) || []).length;
  const positiveSignals = (combined.match(/good|great|helpful|excellent|love|amazing|useful|thank/g) || []).length;
  if (negativeSignals > positiveSignals + 1) sentiment = 'negative';
  else if (positiveSignals > negativeSignals + 1) sentiment = 'positive';
  else if (negativeSignals > 0 && positiveSignals > 0) sentiment = 'mixed';

  // Severity
  const severity = painPoints.length >= 3 ? 'high' : painPoints.length >= 1 ? 'medium' : 'low';

  return { primaryCategory, severity, sentiment, painPoints, competitorsMentioned: competitors };
}

// ── Admin: List Conversations ─────────────────────────────────────────────────
export async function listConversations(limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .select('*, whatsapp_contacts(phone_number, display_name, user_type, city, industry)')
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('[WA List Conversations]:', error.message);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

// ── Admin: Get Conversation Messages ──────────────────────────────────────────
export async function getConversationMessages(conversationId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('[WA Get Messages]:', error.message);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

// ── Admin: Get Problem Cluster Dashboard ──────────────────────────────────────
export async function getProblemClusters(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('feedback_insights')
      .select('primary_category, severity, sentiment')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return [];

    // Aggregate by category
    const clusters = new Map<string, { count: number; highSeverity: number; negatives: number }>();
    for (const row of data || []) {
      const cat = row.primary_category;
      const existing = clusters.get(cat) || { count: 0, highSeverity: 0, negatives: 0 };
      existing.count++;
      if (row.severity === 'high' || row.severity === 'critical') existing.highSeverity++;
      if (row.sentiment === 'negative') existing.negatives++;
      clusters.set(cat, existing);
    }

    return Array.from(clusters.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}
