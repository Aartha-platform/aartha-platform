import { Supplier } from '@/types';
import { StructuredQuery } from './matchSchema';

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 512;

/**
 * Builds canonical text representation of a Supplier.
 * Normalizes all unstructured and structured capabilities into a dense semantic document.
 */
export function buildSupplierCanonicalText(supplier: Supplier): string {
  const parts: string[] = [
    `Company: ${supplier.companyName}`,
    `Type: ${supplier.sellerType.replace(/_/g, ' ')}`,
    `Category: ${supplier.category}`,
    `Specialties: ${supplier.subcategories.join(', ')}`,
    `Products: ${supplier.products.join(', ')}`,
  ];

  if (supplier.structuredProducts && supplier.structuredProducts.length > 0) {
    const prodDetails = supplier.structuredProducts.map(p => {
      const specs = Object.entries(p.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('; ');
      return `${p.name} - ${p.description} (${specs}, MOQ: ${p.moq} ${p.moqUnit})`;
    }).join(' | ');
    parts.push(`Detailed Products: ${prodDetails}`);
  }

  if (supplier.certifications && supplier.certifications.length > 0) {
    parts.push(`Certifications: ${supplier.certifications.join(', ')}`);
  }

  parts.push(`Location: ${supplier.location.city}, ${supplier.location.gidcZone || ''}, ${supplier.location.state}, India`);

  if (supplier.exportMarkets && supplier.exportMarkets.length > 0) {
    parts.push(`Export Markets: ${supplier.exportMarkets.join(', ')}`);
  }

  if (supplier.about) {
    parts.push(`Overview: ${supplier.about}`);
  }

  if (supplier.auditRecords && supplier.auditRecords.length > 0) {
    const latest = supplier.auditRecords[0];
    parts.push(`Factory Audit: Grade ${latest.grade} passed on ${latest.auditDate}. Findings: ${latest.findings}`);
  }

  return parts.join('\n');
}

/**
 * Builds canonical text representation of a Buyer Query.
 */
export function buildQueryCanonicalText(query: StructuredQuery): string {
  const parts: string[] = [
    `Requirement: ${query.product}`,
    `Category: ${query.category}`,
  ];

  if (query.subcategory) {
    parts.push(`Focus Area: ${query.subcategory}`);
  }

  if (query.materials && query.materials.length > 0) {
    parts.push(`Materials: ${query.materials.join(', ')}`);
  }

  if (query.certifications && query.certifications.length > 0) {
    parts.push(`Required Certifications: ${query.certifications.join(', ')}`);
  }

  if (query.tolerance) {
    parts.push(`Tolerance: ${query.tolerance}`);
  }

  if (query.preferredGidcZone) {
    parts.push(`Preferred Industrial Zone: ${query.preferredGidcZone}`);
  }

  if (query.rawQuery && query.rawQuery !== query.product) {
    parts.push(`Context: ${query.rawQuery}`);
  }

  return parts.join('\n');
}

/**
 * Computes Cosine Similarity between two L2-normalized or arbitrary vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim));
}

/**
 * High-performance deterministic feature hashing vectorizer (512 dimensions)
 * Used as local fallback for testing, development, and offline environments.
 * Uses character n-grams + MurmurHash-like distribution to guarantee stable embeddings.
 */
export function generateDeterministicEmbedding(text: string, dimensions = EMBEDDING_DIMENSIONS): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 0);

  // 1. Unigrams & Bigrams
  const tokens: string[] = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }

  for (const token of tokens) {
    // 32-bit FNV-1a hash
    let hash = 0x811c9dc5;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    const index = hash % dimensions;
    const sign = (hash & 0x80000000) ? -1 : 1;
    vector[index] += sign * (token.includes('_') ? 1.5 : 1.0);
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  if (norm > 0) {
    const sqrtNorm = Math.sqrt(norm);
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / sqrtNorm;
    }
  }

  return vector;
}

/**
 * Generates an embedding for text using OpenAI text-embedding-3-small (512 dims),
 * falling back gracefully to deterministic feature vectorization if no key is configured.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && !apiKey.includes('your_openai_key') && !apiKey.includes('your_resend_key')) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        signal: AbortSignal.timeout(1000),
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text.substring(0, 8000), // Protect against token limits
          dimensions: EMBEDDING_DIMENSIONS,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].embedding) {
          return data.data[0].embedding as number[];
        }
      } else {
        console.warn(`[EmbeddingService] OpenAI returned status ${response.status}, falling back to local embedder`);
      }
    } catch {
      // Fall through to deterministic fallback immediately
    }
  }

  // Guaranteed fallback
  return generateDeterministicEmbedding(text, EMBEDDING_DIMENSIONS);
}

/**
 * Generates embeddings in batch
 */
export async function getBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && !apiKey.includes('your_openai_key') && !apiKey.includes('your_resend_key')) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        signal: AbortSignal.timeout(1000),
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: texts.map(t => t.substring(0, 8000)),
          dimensions: EMBEDDING_DIMENSIONS,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          return data.data.map((item: any) => item.embedding as number[]);
        }
      }
    } catch (err) {
      console.warn('[EmbeddingService] Batch embedding failed, using local embedder:', err);
    }
  }

  return texts.map(t => generateDeterministicEmbedding(t, EMBEDDING_DIMENSIONS));
}
