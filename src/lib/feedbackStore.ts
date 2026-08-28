import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FeedbackSubmission, OpenFeedbackInput, FeedbackSubmissionInput, FeedbackStats, AIFeedbackAnalysis } from '@/types/feedback';
import { supabase } from './supabaseClient';

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
);

const DATA_DIR = path.join(process.cwd(), 'data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback-store.json');

// In-memory fallback for serverless environments when DB is offline
const memorySubmissions: FeedbackSubmission[] = [];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem (Vercel)
  }
}

export function readFeedbackStore(): FeedbackSubmission[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(FEEDBACK_FILE)) {
      return memorySubmissions;
    }
    const raw = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
    return JSON.parse(raw) as FeedbackSubmission[];
  } catch {
    return memorySubmissions;
  }
}

export function writeFeedbackStore(submissions: FeedbackSubmission[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
  } catch {
    // Serverless read-only filesystem fallback
  }
}

export function generateFeedbackRefId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = crypto.randomInt(1000, 9999);
  return `FB-${year}${month}${day}-${rand}`;
}

/**
 * Intelligent Structured Feedback Analyzer
 * Categorizes raw feedback messages into actionable product issues without altering product autonomously.
 */
export function analyzeFeedbackText(text: string, role: string): AIFeedbackAnalysis {
  const lower = text.toLowerCase();
  
  // Basic heuristic classifier
  let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
  if (lower.includes('great') || lower.includes('easy') || lower.includes('love') || lower.includes('good') || lower.includes('excellent')) {
    sentiment = 'positive';
  }
  if (lower.includes('confused') || lower.includes('broken') || lower.includes('hard') || lower.includes('slow') || lower.includes('bug') || lower.includes('error') || lower.includes('cant') || lower.includes("can't") || lower.includes('failed')) {
    sentiment = sentiment === 'positive' ? 'mixed' : 'negative';
  }

  const issues: Array<{ problem: string; category: string; severity: string }> = [];

  if (lower.includes('verification') || lower.includes('badge') || lower.includes('gst') || lower.includes('iec')) {
    issues.push({
      category: 'supplier_verification',
      problem: 'Verification process or badge status feedback',
      severity: 'medium',
    });
  }
  if (lower.includes('rfq') || lower.includes('quote') || lower.includes('price') || lower.includes('lead')) {
    issues.push({
      category: 'rfq_matching',
      problem: 'RFQ sourcing or quote distribution feedback',
      severity: 'high',
    });
  }
  if (lower.includes('slow') || lower.includes('lag') || lower.includes('mobile') || lower.includes('load')) {
    issues.push({
      category: 'performance_ui',
      problem: 'UI latency or mobile viewport experience',
      severity: 'medium',
    });
  }
  if (lower.includes('login') || lower.includes('otp') || lower.includes('signup') || lower.includes('register')) {
    issues.push({
      category: 'authentication',
      problem: 'Sign-in, registration or OTP receipt feedback',
      severity: 'high',
    });
  }

  const primaryCategory = issues[0]?.category || 'general_feedback';
  const severity = issues.some(i => i.severity === 'high') ? 'high' : 'medium';

  return {
    sentiment,
    summary: text.slice(0, 160),
    category: primaryCategory,
    severity,
    issues,
    suggested_area: primaryCategory,
  };
}

export async function saveFeedback(
  input: OpenFeedbackInput | FeedbackSubmissionInput,
  userAgent: string,
  referrer: string,
  ip?: string
): Promise<FeedbackSubmission> {
  const messageText = 'message' in input ? input.message : (input.problemDescription || '');
  const userRole = 'userRole' in input ? input.userRole : (input.userCategory || 'other');
  const contactInfo = ('contactInfo' in input ? input.contactInfo : 'email' in input ? input.email : '') || '';

  const aiAnalysis = analyzeFeedbackText(messageText, userRole);

  const newSubmission: FeedbackSubmission = {
    id: crypto.randomUUID(),
    referenceId: generateFeedbackRefId(),
    userCategory: userRole,
    message: messageText,
    contactInfo: contactInfo || undefined,
    submittedAt: new Date().toISOString(),
    aiAnalysis,
    metadata: {
      userAgent,
      referrer,
      ip,
    },
  };

  if (isSupabaseEnabled) {
    try {
      await supabase.from('feedback').insert([{
        id: newSubmission.id,
        category: aiAnalysis.category || userRole,
        rating: aiAnalysis.sentiment === 'positive' ? 5 : aiAnalysis.sentiment === 'negative' ? 2 : 4,
        role: userRole,
        problems: aiAnalysis.issues.map(i => i.problem),
        comments: messageText,
        email: contactInfo || null,
        created_at: newSubmission.submittedAt,
      }]);
    } catch (err) {
      console.error('[Feedback] Supabase insert failed:', err);
    }
  } else {
    const submissions = readFeedbackStore();
    submissions.push(newSubmission);
    writeFeedbackStore(submissions);
  }

  memorySubmissions.push(newSubmission);
  return newSubmission;
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
  const stats: FeedbackStats = {
    totalCount: 0,
    byCategory: {},
    byRole: {},
  };

  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase.from('feedback').select('*');
      if (!error && data) {
        stats.totalCount = data.length;
        data.forEach((row: any) => {
          const cat = row.category || 'general';
          const r = row.role || 'other';
          stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
          stats.byRole[r] = (stats.byRole[r] || 0) + 1;
        });
        return stats;
      }
    } catch (err) {
      console.error('[Feedback Stats] Supabase query failed:', err);
    }
  }

  const submissions = readFeedbackStore();
  stats.totalCount = submissions.length;
  submissions.forEach((item) => {
    stats.byCategory[item.aiAnalysis?.category || 'general'] = (stats.byCategory[item.aiAnalysis?.category || 'general'] || 0) + 1;
    stats.byRole[item.userCategory] = (stats.byRole[item.userCategory] || 0) + 1;
  });

  return stats;
}
