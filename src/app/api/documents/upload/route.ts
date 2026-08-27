import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent } from '@/lib/storeAdapter';
import { mockDossiers } from '@/lib/documentIntel';
import { parseDocumentWithOCR } from '@/lib/ocrEngine';
import { uploadDocument, getSignedDocumentUrl, validateDocumentUpload } from '@/lib/objectStorage';

export async function POST(request: NextRequest) {
  try {
    const session = getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }

    // Classify document based on name/type (10 types supported)
    let type: 'gst' | 'iec' | 'invoice' | 'packing_list' | 'coo' | 'bill_of_lading' | 'gots' | 'who_gmp' | 'iso_9001' | 'msme' = 'invoice';
    const name = file.name.toLowerCase();

    if (name.includes('gst') || documentType === 'gst') type = 'gst';
    else if (name.includes('iec') || documentType === 'iec') type = 'iec';
    else if (name.includes('packing') || name.includes('pl') || documentType === 'packing_list') type = 'packing_list';
    else if (name.includes('origin') || name.includes('coo') || documentType === 'coo') type = 'coo';
    else if (name.includes('lading') || name.includes('bol') || documentType === 'bill_of_lading') type = 'bill_of_lading';
    else if (name.includes('gots') || documentType === 'gots') type = 'gots';
    else if (name.includes('gmp') || name.includes('who') || documentType === 'who_gmp') type = 'who_gmp';
    else if (name.includes('iso') || documentType === 'iso_9001') type = 'iso_9001';
    else if (name.includes('msme') || name.includes('udyam') || documentType === 'msme') type = 'msme';

    saveAuditEvent({
      action: 'DOCUMENT_UPLOADED',
      details: `Document "${file.name}" uploaded by ${session.email}. Auto-classified as type: ${type}`,
      actorRole: session.role,
      actorId: session.userId,
    });

    const validation = validateDocumentUpload(file.size, file.type || 'application/pdf');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload via Unified Object Storage Adapter
    const uploadResult = await uploadDocument(
      'factory-documents',
      file.name,
      fileBuffer,
      file.type || 'application/pdf',
      { uploadedBy: session.email, role: session.role, classifiedType: type }
    );

    let fileUrl = uploadResult.url || '';
    if (!fileUrl && uploadResult.path) {
      const signed = await getSignedDocumentUrl('factory-documents', uploadResult.path, 86400);
      fileUrl = signed.signedUrl || `/uploads/${uploadResult.path}`;
    }

    const ocrResult = await parseDocumentWithOCR(fileBuffer, file.name, file.type, type);

    if (ocrResult) {
      return NextResponse.json({
        success: true,
        documentId: `doc-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileUrl,
        classifiedType: type,
        uploadedAt: new Date().toISOString(),
        dossier: {
          id: `doc-${Date.now()}`,
          name: file.name,
          fileUrl,
          type,
          ...ocrResult,
        }
      });
    }

    // Fallback: return matched mock dossier with custom filename & fileUrl
    const matchingDossier = mockDossiers.find(d => d.type === type) || mockDossiers[2];

    return NextResponse.json({
      success: true,
      documentId: matchingDossier.id,
      fileName: file.name,
      fileSize: file.size,
      fileUrl,
      classifiedType: type,
      uploadedAt: new Date().toISOString(),
      dossier: {
        ...matchingDossier,
        id: `doc-${Date.now()}`,
        name: file.name,
        fileUrl,
      }
    });
  } catch (error) {
    console.error('[Document Upload API] Error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

