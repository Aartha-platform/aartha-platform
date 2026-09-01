import { z } from 'zod';
import { ExtractedField, DocumentException, ValidationAssertion } from './documentIntel';

export const OCRResultSchema = z.object({
  extractedFields: z.array(z.object({
    label: z.string(),
    value: z.string(),
    confidence: z.number().default(90),
    category: z.enum(['identity', 'commercial', 'logistics', 'compliance']).optional(),
    highlight: z.boolean().optional(),
    status: z.enum(['EXTRACTED', 'VALIDATED', 'VERIFIED']).default('EXTRACTED'),
  })),
  assertions: z.array(z.object({
    name: z.string(),
    passed: z.boolean(),
    message: z.string(),
    hindiHint: z.string().optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  })),
  exceptions: z.array(z.object({
    id: z.string(),
    field: z.string(),
    message: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    risk: z.string(),
    suggestion: z.string(),
    autoFixValue: z.string().optional(),
    hindiSummary: z.string().optional(),
  })),
  scores: z.object({
    customs: z.number(),
    bank: z.number(),
    freight: z.number(),
    inspection: z.number(),
  }),
});

export type OCRResult = z.infer<typeof OCRResultSchema>;

export async function parseDocumentWithOCR(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  classifiedType: string
): Promise<OCRResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your_openai_key') || apiKey.includes('your_resend_key')) {
    return null; // fallback to deterministic rule-based analysis
  }

  // Convert buffer to base64 for Vision API
  const base64Data = fileBuffer.toString('base64');
  
  // Vision payload system prompt
  const systemPrompt = `You are a precision B2B trade document OCR parser for Artha. 
Analyze the image of the uploaded trade document (${classifiedType}) and extract all key fields.
Also perform verification checks (format validation, state match, entity active).
Identify any compliance exceptions (missing fields, signatures, mismatching rules).
Score the document readiness for Customs, Bank, Freight, and Inspection (each out of 100).

Return ONLY a JSON object matching this schema:
{
  "extractedFields": [{ "label": string, "value": string, "confidence": number, "status": "EXTRACTED" }],
  "assertions": [{ "name": string, "passed": boolean, "message": string }],
  "exceptions": [{ "id": string, "field": string, "message": string, "severity": "critical"|"high"|"medium"|"low", "risk": string, "suggestion": string }],
  "scores": { "customs": number, "bank": number, "freight": number, "inspection": number }
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: [
            { type: 'text', text: `Here is the uploaded file name: ${fileName}. Please extract data.` },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ] }
        ],
        temperature: 0.0,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.warn('[OCR Engine] Vision API call failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    const parsedJson = JSON.parse(rawContent);
    const validated = OCRResultSchema.safeParse(parsedJson);

    if (validated.success) {
      return validated.data;
    } else {
      console.warn('[OCR Engine] Output failed schema validation:', validated.error.issues);
      return null;
    }
  } catch (error) {
    console.error('[OCR Engine] Exception in vision OCR parsing:', error);
    return null;
  }
}
