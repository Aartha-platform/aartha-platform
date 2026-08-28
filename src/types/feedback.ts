import { z } from 'zod';

export const OpenFeedbackSchema = z.object({
  message: z.string().min(5, 'Please share your thoughts (min 5 characters).'),
  userRole: z.enum(['buyer', 'supplier', 'manufacturer', 'other']).default('other'),
  category: z.string().optional().default('general'),
  email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
  name: z.string().optional(),
  source: z.string().default('web_feedback'),
});

export type OpenFeedbackInput = z.infer<typeof OpenFeedbackSchema>;

// Legacy schema compatibility
export const FeedbackSubmissionSchema = z.object({
  userCategory: z.enum(['buyer', 'supplier', 'manufacturer', 'other']).default('other'),
  industry: z.string().optional().default('General'),
  companySize: z.string().optional(),
  problemDescription: z.string().min(5, 'Please describe what happened (min 5 characters)'),
  currentTools: z.string().optional(),
  painPoints: z.array(z.string()).default([]),
  featureRequests: z.string().optional().default(''),
  documentStruggles: z.array(z.string()).default([]),
  missingServices: z.string().optional(),
  urgency: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  willingnessToPay: z.string().optional().default('not_specified'),
  additionalNotes: z.string().optional(),
  contactInfo: z.string().optional(),
  source: z.string().default('web_feedback'),
});

export type FeedbackSubmissionInput = z.infer<typeof FeedbackSubmissionSchema>;

export interface AIFeedbackAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  summary: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issues: Array<{
    problem: string;
    category: string;
    severity: string;
  }>;
  suggested_area?: string;
}

export interface FeedbackSubmission {
  id: string;
  referenceId: string;
  userCategory: string;
  message: string;
  contactInfo?: string;
  submittedAt: string;
  aiAnalysis?: AIFeedbackAnalysis | null;
  metadata: {
    userAgent: string;
    referrer: string;
    ip?: string;
  };
}

export interface FeedbackStats {
  totalCount: number;
  byCategory: Record<string, number>;
  byRole: Record<string, number>;
}
