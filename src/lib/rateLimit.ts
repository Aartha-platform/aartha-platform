import { NextResponse } from 'next/server';

// Global store to survive hot-reloads in local Next.js dev environment
const globalLimitStore = (globalThis as any).rateLimitStore || new Map();
if (!(globalThis as any).rateLimitStore) {
  (globalThis as any).rateLimitStore = globalLimitStore;
}

interface RateLimitConfig {
  limit: number;      // Maximum requests in the window
  windowMs: number;   // Time window size in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export function rateLimit(ip: string, config: RateLimitConfig = { limit: 60, windowMs: 60000 }): RateLimitResult {
  const now = Date.now();
  const key = `${ip}`;

  const record = globalLimitStore.get(key);

  if (!record) {
    const newRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    globalLimitStore.set(key, newRecord);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + config.windowMs;
    globalLimitStore.set(key, record);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  globalLimitStore.set(key, record);

  const remaining = Math.max(0, config.limit - record.count);

  if (record.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining,
    resetTime: record.resetTime,
  };
}

export function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  
  return '127.0.0.1';
}

export function checkRateLimit(request: Request, config?: RateLimitConfig): NextResponse | null {
  const ip = getIp(request);
  const limitRes = rateLimit(ip, config);
  if (!limitRes.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((limitRes.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': limitRes.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitRes.resetTime.toString(),
        }
      }
    );
  }
  return null;
}
