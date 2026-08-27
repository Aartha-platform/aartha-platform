/**
 * observability.ts
 * Structured Request Logging & Business Event Observability.
 */

export interface RequestLogContext {
  requestId: string;
  userId?: string;
  orgId?: string;
  route: string;
  method: string;
  durationMs: number;
  statusCode: number;
  error?: string;
  timestamp: string;
}

export type BusinessEventType =
  | 'rfq.created'
  | 'rfq.qualified'
  | 'rfq.matched'
  | 'quote.submitted'
  | 'deal.created'
  | 'order.created'
  | 'payment.secured'
  | 'shipment.dispatched'
  | 'delivery.confirmed'
  | 'outcome.recorded';

export interface BusinessEvent {
  id: string;
  eventType: BusinessEventType;
  entityId: string;
  actorId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const memoryLogs: RequestLogContext[] = [];
const businessEvents: BusinessEvent[] = [];

import fs from 'fs';
import path from 'path';

const SERVER_START_TIME = Date.now();
const DATA_DIR = path.join(process.cwd(), 'data');
const ERROR_LOG_FILE = path.join(DATA_DIR, 'errors.jsonl');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function writeErrorLog(errorContext: {
  route?: string;
  method?: string;
  error: string;
  stack?: string;
  statusCode?: number;
  userId?: string;
  orgId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    ensureDataDir();
    const entry = {
      id: `ERR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      ...errorContext,
    };
    fs.appendFileSync(ERROR_LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
  } catch (e) {
    console.error('[OBSERVABILITY ERROR] Failed to write error log to disk:', e);
  }
}

export function logRequest(log: RequestLogContext) {
  memoryLogs.unshift(log);
  if (memoryLogs.length > 500) memoryLogs.pop(); // Keep sliding window of 500 logs

  if (log.statusCode >= 500 || log.error) {
    console.error(`[REQUEST ERROR] [${log.method}] ${log.route} ${log.statusCode} (${log.durationMs}ms):`, log.error);
    writeErrorLog({
      route: log.route,
      method: log.method,
      error: log.error || `HTTP ${log.statusCode}`,
      statusCode: log.statusCode,
      userId: log.userId,
      orgId: log.orgId,
    });
  } else {
    console.log(`[REQUEST] [${log.method}] ${log.route} ${log.statusCode} (${log.durationMs}ms)`);
  }
}

export function trackBusinessEvent(
  eventType: BusinessEventType,
  entityId: string,
  actorId: string,
  metadata?: Record<string, any>
): BusinessEvent {
  const event: BusinessEvent = {
    id: `BEV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    eventType,
    entityId,
    actorId,
    metadata,
    timestamp: new Date().toISOString(),
  };

  businessEvents.unshift(event);
  if (businessEvents.length > 1000) businessEvents.pop();

  console.log(`[BUSINESS EVENT] [${eventType}] on ${entityId} by ${actorId}`);
  return event;
}

export function getRecentLogs(limit = 50): RequestLogContext[] {
  return memoryLogs.slice(0, limit);
}

export function getBusinessEvents(limit = 100): BusinessEvent[] {
  return businessEvents.slice(0, limit);
}

export function getSystemHealth(): {
  status: 'healthy' | 'degraded';
  uptimeSeconds: number;
  totalRequestsTracked: number;
  recentErrors: number;
  databaseMode: string;
  timestamp: string;
} {
  const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
  const recentLogs = memoryLogs.slice(0, 100);
  const errorCount = recentLogs.filter((l) => l.statusCode >= 500 || !!l.error).length;

  const isSupabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
  );

  const status = errorCount > 20 ? 'degraded' : 'healthy';

  return {
    status,
    uptimeSeconds,
    totalRequestsTracked: memoryLogs.length,
    recentErrors: errorCount,
    databaseMode: isSupabaseEnabled ? 'postgresql_supabase' : 'local_json_adapter',
    timestamp: new Date().toISOString(),
  };
}
