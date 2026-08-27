import { ExtractedField, DocumentException, ValidationAssertion } from './documentIntel';

export interface OCRResult {
  extractedFields: ExtractedField[];
  assertions: ValidationAssertion[];
  exceptions: DocumentException[];
  scores: {
    customs: number;
    bank: number;
    freight: number;
    inspection: number;
  };
}

export async function parseDocumentWithOCR(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  classifiedType: string
): Promise<OCRResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null; // fallback to simulation
  }

  // Convert buffer to base64 for Vision API
  const base64Data = fileBuffer.toString('base64');
  
  // Vision payload system prompt
  const systemPrompt = `You are a precision B2B trade document OCR parser for Artha. 
Analyze the image of the uploaded trade document (${classifiedType}) and extract all key fields.
Also perform verification checks (format validation, state match, entity active).
Identify any compliance exceptions (missing fields, signatures, mismatching rules).
Score the document readiness for Customs, Bank, Freight, and Inspection (each out of 100).

Return ONLY a JSON object matching this TypeScript interface:
interface OCRResult {
  extractedFields: Array<{ label: string; value: string; confidence: number }>;
  assertions: Array<{ name: string; passed: boolean; message: string }>;
  exceptions: Array<{ id: string; field: string; message: string; severity: 'critical' | 'high' | 'medium' | 'low'; risk: string; suggestion: string }>;
  scores: { customs: number; bank: number; freight: number; inspection: number };
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: [
            { type: 'text', text: `Here is the uploaded file name: ${fileName}. Please extract data.` },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ] }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('[OCR Engine] Vision API call failed', response.statusText);
      return null;
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as OCRResult;
  } catch (error) {
    console.error('[OCR Engine] Exception in vision OCR parsing', error);
    return null;
  }
}
