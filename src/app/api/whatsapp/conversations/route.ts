import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import {
  listConversations,
  getConversationMessages,
  updateLeadStage,
  analyzeConversationHeuristic,
  saveFeedbackInsight,
  getProblemClusters,
  LeadStage,
} from '@/lib/whatsappCloud';

/**
 * GET /api/whatsapp/conversations
 * Admin-only: List WhatsApp conversations with lead pipeline status.
 * Query params: ?stage=NEW&limit=50
 */
export async function GET(request: NextRequest) {
  const session = getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('id');
  const action = searchParams.get('action');

  // Get messages for a specific conversation
  if (conversationId && action === 'messages') {
    const messages = await getConversationMessages(conversationId);
    return NextResponse.json({ success: true, messages });
  }

  // Get problem cluster dashboard
  if (action === 'clusters') {
    const clusters = await getProblemClusters();
    return NextResponse.json({ success: true, clusters });
  }

  // List conversations
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const conversations = await listConversations(limit);
  return NextResponse.json({ success: true, conversations });
}

/**
 * POST /api/whatsapp/conversations
 * Admin-only: Update lead stage or trigger conversation analysis.
 */
export async function POST(request: NextRequest) {
  const session = getServerSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { conversationId, action, stage } = body as {
      conversationId: string;
      action: 'update_stage' | 'analyze';
      stage?: LeadStage;
    };

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required.' }, { status: 400 });
    }

    // Update lead stage
    if (action === 'update_stage' && stage) {
      await updateLeadStage(conversationId, stage);
      return NextResponse.json({ success: true, conversationId, newStage: stage });
    }

    // Analyze conversation (human-triggered)
    if (action === 'analyze') {
      const messages = await getConversationMessages(conversationId);
      const inboundTexts = messages
        .filter((m: any) => m.direction === 'INBOUND' && m.content)
        .map((m: any) => m.content);

      if (inboundTexts.length === 0) {
        return NextResponse.json({ error: 'No inbound messages to analyze.' }, { status: 400 });
      }

      const analysis = analyzeConversationHeuristic(inboundTexts);

      const insightId = await saveFeedbackInsight({
        conversationId,
        primaryCategory: analysis.primaryCategory,
        sentiment: analysis.sentiment,
        severity: analysis.severity,
        painPoints: analysis.painPoints,
        competitorsMentioned: analysis.competitorsMentioned,
        rawEvidence: inboundTexts.join('\n---\n'),
        analyzedBy: 'heuristic',
        confidence: 0.7,
      });

      // Auto-advance lead stage to PROBLEM_IDENTIFIED if currently NEW/DISCOVERY
      await updateLeadStage(conversationId, 'PROBLEM_IDENTIFIED');

      return NextResponse.json({
        success: true,
        insightId,
        analysis: {
          type: 'FACT',
          primaryCategory: analysis.primaryCategory,
          sentiment: analysis.sentiment,
          severity: analysis.severity,
          painPoints: analysis.painPoints,
          competitorsMentioned: analysis.competitorsMentioned,
          disclaimer: 'This is a heuristic analysis. Human review is required before acting on these insights.',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('[WA Conversations Route Error]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
