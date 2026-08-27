import { NextRequest, NextResponse } from 'next/server';
import { FeedbackSubmissionSchema } from '@/types/feedback';
import { saveFeedback } from '@/lib/feedbackStore';
import { saveAuditEvent } from '@/lib/storeAdapter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = FeedbackSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || (request as any).ip || undefined;

    const record = await saveFeedback(parsed.data, userAgent, referrer, ip);

    // Save to global audit log if available
    try {
      saveAuditEvent({
        action: 'FEEDBACK_SUBMITTED',
        details: `Feedback ${record.referenceId} submitted by user category: ${record.userCategory} for industry: ${record.industry}`,
      });
    } catch (auditError) {
      console.error('Failed to save audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      referenceId: record.referenceId,
      submittedAt: record.submittedAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Server error occurred during submission.' }, { status: 500 });
  }
}
