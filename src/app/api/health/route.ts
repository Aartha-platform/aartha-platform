import { NextResponse } from 'next/server';
import { getSystemHealth } from '@/lib/observability';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = getSystemHealth();
    const httpStatus = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(
      {
        service: 'Aartha Verified Manufacturing Infrastructure',
        version: '1.0.0',
        ...health,
      },
      { status: httpStatus }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error?.message || 'Health check check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
