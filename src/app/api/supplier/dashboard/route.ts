import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'supplier') {
      return NextResponse.json({ error: 'Unauthorized. Supplier access only.' }, { status: 401 });
    }

    // Simulated dashboard metrics for the supplier
    return NextResponse.json({
      success: true,
      supplierId: session.supplierId,
      companyName: session.companyName,
      metrics: {
        profileViews: 142,
        activeMatchingRfqs: 5,
        responseRate: 98, // %
        avgResponseTimeHours: 1.8,
        auditScore: 92, // out of 100
      },
      warningLogs: [
        { id: 'w1', severity: 'info', message: 'Verification badge is valid until May 2027. Review audit visit logs.', timestamp: new Date().toISOString() }
      ],
      lastSync: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
