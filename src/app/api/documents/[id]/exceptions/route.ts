import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { mockDossiers } from '@/lib/documentIntel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const matched = mockDossiers.find((d) => d.id === id);

    if (!matched) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      documentId: id,
      exceptions: matched.exceptions,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
