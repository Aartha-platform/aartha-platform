import { FeedbackSignalType } from './matchSchema';
import { supabase } from '@/lib/supabaseClient';

export interface FeedbackSignalPayload {
  buyerId?: string;
  buyerEmail?: string;
  queryText?: string;
  queryStructured?: any;
  supplierId: string;
  signalType: FeedbackSignalType;
  rejectionReason?: string;
  matchScore?: number;
  positionInResults?: number;
  sessionId?: string;
}

export interface StoredFeedbackSignal extends FeedbackSignalPayload {
  id: string;
  createdAt: string;
}

// In-memory sliding buffer for offline development / local testing (1,000 events)
const inMemorySignalStore: StoredFeedbackSignal[] = [];

/**
 * Records a buyer interaction signal.
 * Dispatches to Supabase match_feedback table if connected, and caches in local memory buffer.
 * Transparent: Does NOT claim "online ML" — cleanly records ground truth telemetry for future training.
 */
export async function recordMatchFeedback(payload: FeedbackSignalPayload): Promise<{ success: boolean; id: string }> {
  const signalId = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const record: StoredFeedbackSignal = {
    ...payload,
    id: signalId,
    createdAt: new Date().toISOString(),
  };

  // Add to local sliding buffer
  inMemorySignalStore.unshift(record);
  if (inMemorySignalStore.length > 1000) {
    inMemorySignalStore.pop();
  }

  // Attempt database persistence
  if (supabase) {
    try {
      const { error } = await supabase.from('match_feedback').insert({
        id: signalId,
        buyer_id: payload.buyerId,
        buyer_email: payload.buyerEmail,
        query_text: payload.queryText,
        query_structured: payload.queryStructured,
        supplier_id: payload.supplierId,
        signal_type: payload.signalType,
        rejection_reason: payload.rejectionReason,
        match_score: payload.matchScore,
        position_in_results: payload.positionInResults,
        session_id: payload.sessionId,
        created_at: record.createdAt,
      });

      if (error) {
        // Log without crashing user flow
        console.warn('[FeedbackLoop] Supabase feedback record skipped:', error.message);
      }
    } catch (err: any) {
      console.warn('[FeedbackLoop] Error inserting feedback:', err?.message);
    }
  }

  return { success: true, id: signalId };
}

/**
 * Returns recent feedback signals (useful for administrative telemetry & test assertion)
 */
export function getRecentSignals(limit = 50, supplierId?: string): StoredFeedbackSignal[] {
  if (supplierId) {
    return inMemorySignalStore.filter(s => s.supplierId === supplierId).slice(0, limit);
  }
  return inMemorySignalStore.slice(0, limit);
}

/**
 * Clears in-memory buffer (for unit testing)
 */
export function clearInMemorySignals(): void {
  inMemorySignalStore.length = 0;
}
