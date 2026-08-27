import { z } from 'zod';

export const FeedbackSubmissionSchema = z.object({
  userCategory: z.enum(['buyer', 'supplier', 'manufacturer', 'other']),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().optional(),
  
  problemDescription: z.string().min(10, 'Please describe your problem in more detail (min 10 characters)'),
  currentTools: z.string().optional(),
  painPoints: z.array(z.string()).default([]),
  
  featureRequests: z.string().min(5, 'Please describe what solution or feature you expect (min 5 characters)'),
  documentStruggles: z.array(z.string()).default([]),
  missingServices: z.string().optional(),
  
  urgency: z.enum(['critical', 'high', 'medium', 'low']),
  willingnessToPay: z.string().min(1, 'Willingness to pay selection is required'),
  additionalNotes: z.string().optional(),
  contactInfo: z.string().optional(),
  
  source: z.string().default('direct_link'),
});

export type FeedbackSubmissionInput = z.infer<typeof FeedbackSubmissionSchema>;

export interface FeedbackSubmission extends FeedbackSubmissionInput {
  id: string;
  referenceId: string;
  submittedAt: string;
  metadata: {
    userAgent: string;
    referrer: string;
    ip?: string;
  };
}

export interface FeedbackStats {
  totalCount: number;
  byCategory: Record<string, number>;
  byIndustry: Record<string, number>;
  byUrgency: Record<string, number>;
}
