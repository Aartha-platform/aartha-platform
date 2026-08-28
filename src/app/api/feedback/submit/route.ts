import { NextRequest, NextResponse } from 'next/server';
import { OpenFeedbackSchema, FeedbackSubmissionSchema } from '@/types/feedback';
import { saveFeedback } from '@/lib/feedbackStore';
import { saveAuditEvent } from '@/lib/storeAdapter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support open feedback format first, fallback to structured legacy format
    const openParsed = OpenFeedbackSchema.safeParse(body);
    const legacyParsed = FeedbackSubmissionSchema.safeParse(body);

    if (!openParsed.success && !legacyParsed.success) {
      return NextResponse.json(
        { 
          error: 'Please provide a message describing your experience.',
          details: openParsed.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const payload = openParsed.success ? openParsed.data : legacyParsed.data!;

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || (request as any).ip || undefined;

    const record = await saveFeedback(payload, userAgent, referrer, ip);

    // Save to global audit log safely
    try {
      await saveAuditEvent({
        action: 'FEEDBACK_SUBMITTED',
        details: `Feedback ${record.referenceId} submitted (${record.userCategory}): "${record.message.slice(0, 80)}"`,
      });
    } catch (auditError) {
      console.error('Failed to save audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      referenceId: record.referenceId,
      submittedAt: record.submittedAt,
      aiAnalysis: record.aiAnalysis,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: error?.message || 'Server error occurred during submission.' }, { status: 500 });
  }
}
