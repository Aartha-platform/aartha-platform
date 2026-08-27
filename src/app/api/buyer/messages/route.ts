import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const threads = [
      {
        id: 'thread-1',
        supplierId: 's4',
        supplierName: 'Vadodara Chemicals Ltd.',
        lastMessage: 'We have updated our export capacity sheets. Please review.',
        lastActive: new Date().toISOString(),
        messages: [
          { sender: 'buyer', text: 'What is your lead time for 5 MT WHO-GMP grade API?', time: '2026-07-10T10:00:00.000Z' },
          { sender: 'supplier', text: 'Usually 7 days to Mundra port. Active certifications verified.', time: '2026-07-10T10:15:00.000Z' },
          { sender: 'supplier', text: 'We have updated our export capacity sheets. Please review.', time: '2026-07-10T10:20:00.000Z' },
        ]
      },
      {
        id: 'thread-2',
        supplierId: 's1',
        supplierName: 'Ahmedabad Precision Tools Pvt. Ltd.',
        lastMessage: 'Understood. We will email the CAD calibration sheets.',
        lastActive: new Date(Date.now() - 7200000).toISOString(),
        messages: [
          { sender: 'buyer', text: 'Do you have CE compliance records on site?', time: '2026-07-09T08:00:00.000Z' },
          { sender: 'supplier', text: 'Yes, certified by TÜV Rheinland. Understood. We will email the CAD calibration sheets.', time: '2026-07-09T08:30:00.000Z' },
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
