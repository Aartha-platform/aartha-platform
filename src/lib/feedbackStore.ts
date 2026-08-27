import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FeedbackSubmission, FeedbackSubmissionInput, FeedbackStats } from '@/types/feedback';
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

export async function saveFeedback(
  input: FeedbackSubmissionInput,
  userAgent: string,
  referrer: string,
  ip?: string
): Promise<FeedbackSubmission> {
  const newSubmission: FeedbackSubmission = {
    ...input,
    id: crypto.randomUUID(),
    referenceId: generateFeedbackRefId(),
    submittedAt: new Date().toISOString(),
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
        category: newSubmission.userCategory,
        rating: newSubmission.urgency === 'critical' ? 5 : newSubmission.urgency === 'high' ? 4 : 3,
        role: newSubmission.userCategory,
        problems: newSubmission.painPoints,
        comments: newSubmission.problemDescription,
        email: newSubmission.contactInfo || null,
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
    byIndustry: {},
    byUrgency: {},
  };

  let submissions: FeedbackSubmission[] = [];

  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase.from('feedback').select('*');
      if (!error && data) {
        stats.totalCount = data.length;
        data.forEach((row: any) => {
          const cat = row.category || 'other';
          stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
        });
        return stats;
      }
    } catch (err) {
      console.error('[Feedback Stats] Supabase query failed:', err);
    }
  }

  submissions = readFeedbackStore();
  stats.totalCount = submissions.length;
  submissions.forEach((item) => {
    stats.byCategory[item.userCategory] = (stats.byCategory[item.userCategory] || 0) + 1;
    stats.byIndustry[item.industry] = (stats.byIndustry[item.industry] || 0) + 1;
    stats.byUrgency[item.urgency] = (stats.byUrgency[item.urgency] || 0) + 1;
  });

  return stats;
}

