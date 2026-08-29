import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { saveAuditEvent } from '@/lib/storeAdapter';
import { analyzeDocumentContent, DocumentType, DOCUMENT_TYPES_METADATA } from '@/lib/documentIntel';
import { parseDocumentWithOCR } from '@/lib/ocrEngine';
import { uploadDocument, getSignedDocumentUrl, validateDocumentUpload } from '@/lib/objectStorage';

export async function POST(request: NextRequest) {
  try {
    const session = getServerSession(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestedType = (formData.get('type') as string) as DocumentType | undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided for scanning.' }, { status: 400 });
    }

    const validation = validateDocumentUpload(file.size, file.type || 'application/pdf');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Try reading file text for PDF/text uploads if feasible
    let extractedText = '';
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    try {
      // Basic text extraction from buffer (for plain text / basic text streams in PDFs)
      const rawString = fileBuffer.toString('utf-8');
      if (rawString.length > 50 && rawString.length < 500000) {
        extractedText = rawString;
      }
    } catch {
      // ignore buffer string conversion errors
    }

    // Classify / Analyze via Rule-Based Smart Engine
    const ruleBasedDossier = analyzeDocumentContent(file.name, extractedText, requestedType);

    // If session exists, record audit log
    if (session) {
      saveAuditEvent({
        action: 'DOCUMENT_UPLOADED',
        details: `Document "${file.name}" scanned. Type: ${ruleBasedDossier.type}, Score: ${ruleBasedDossier.scores.overall}%`,
        actorRole: session.role,
        actorId: session.userId,
      });
    }

    // Optional Vision OCR if API key is active
    let finalDossier = ruleBasedDossier;
    let ocrUsed = false;

    if (process.env.OPENAI_API_KEY) {
      try {
        const ocrResult = await parseDocumentWithOCR(fileBuffer, file.name, file.type || 'application/pdf', ruleBasedDossier.type);
        if (ocrResult && ocrResult.extractedFields && ocrResult.extractedFields.length > 0) {
          ocrUsed = true;
          finalDossier = {
            ...ruleBasedDossier,
            extractedFields: ocrResult.extractedFields,
            assertions: ocrResult.assertions || ruleBasedDossier.assertions,
            exceptions: ocrResult.exceptions || ruleBasedDossier.exceptions,
            scores: {
              ...ocrResult.scores,
              overall: Math.round(
                (ocrResult.scores.customs + ocrResult.scores.bank + ocrResult.scores.freight + ocrResult.scores.inspection) / 4
              )
            }
          };
        }
      } catch (err) {
        console.warn('[Doc Upload] Vision OCR skipped, using rule-based analysis', err);
      }
    }

    return NextResponse.json({
      success: true,
      documentId: finalDossier.id,
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024)} KB`,
      classifiedType: finalDossier.type,
      analysisSource: ocrUsed ? 'ai-vision-ocr' : 'rule-based-engine',
      uploadedAt: new Date().toISOString(),
      dossier: finalDossier
    });
  } catch (error) {
    console.error('[Document Upload API] Error:', error);
    return NextResponse.json({ error: 'Failed to process document. Please try again.' }, { status: 500 });
  }
}
