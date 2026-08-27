import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getRfqs, getAuditLog, getEnquiries } from '@/lib/storeAdapter';

export async function GET(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized. Buyer access only.' }, { status: 401 });
    }

    const allRfqs = await getRfqs();
    const buyerRfqs = allRfqs.filter((r) => r.email === session.email);
    const activeCount = buyerRfqs.filter((r) => r.status !== 'closed').length;

    // Simulated alerts
    const alerts = [
      { id: '1', type: 'MATCH', message: 'New verified supplier matched for your Cotton Yarns RFQ.', timestamp: new Date().toISOString() },
      { id: '2', type: 'TRUST', message: 'Supplier "Morbi Sanitaryware Ltd" passed physical site audit Shah.', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ];

    // Simulated outcome targets
    const outcomeTracks = {
      targetPriceAccuracy: '94%',
      avgResponseTimeHours: '2.4 hrs',
      deliveryLeadTimeDays: '14.5 days',
      complianceCheckPassRate: '100%'
    };

    return NextResponse.json({
      success: true,
      buyerEmail: session.email,
      metrics: {
        totalRfqs: buyerRfqs.length,
        activeRfqs: activeCount,
        matchesReceived: buyerRfqs.length * 3, // simulated
        unreadMessages: 2,
      },
      alerts,
      outcomes: outcomeTracks,
      lastSync: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
