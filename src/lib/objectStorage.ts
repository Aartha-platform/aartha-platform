/**
 * objectStorage.ts
 * Unified Production & Local Object Storage Service Adapter.
 * Manages factory documents, audit evidence, RFQ technical attachments, and commercial assets.
 * Production: Uses Supabase Storage (S3-compatible bucket infrastructure with signed URLs).
 * Dev Mode: Stores securely in local filesystem (`data/uploads/`) with path protection.
 */

import { supabase } from './supabaseClient';
import fs from 'fs';
import path from 'path';

export type StorageBucket =
  | 'factory-documents'
  | 'audit-evidence'
  | 'rfq-attachments'
  | 'commercial-documents';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream', // CAD / STEP files
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

const isSupabaseEnabled = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LOCAL_STORAGE_ROOT = path.join(process.cwd(), 'data', 'uploads');

function ensureLocalStorageDir(bucket: StorageBucket) {
  const dir = path.join(LOCAL_STORAGE_ROOT, bucket);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Validates file constraints before upload.
 */
export function validateDocumentUpload(
  sizeBytes: number,
  mimeType: string
): { valid: boolean; error?: string } {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 15MB limit (provided: ${(sizeBytes / 1024 / 1024).toFixed(2)}MB).`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file format: ${mimeType}. Allowed formats: PDF, PNG, JPG, WEBP, ZIP, CAD/STEP.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a document buffer to designated storage bucket.
 */
export async function uploadDocument(
  bucket: StorageBucket,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; path: string; url?: string; error?: string }> {
  // Sanitize path to prevent directory traversal
  const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${Date.now()}_${sanitizedFileName}`;

  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: false,
          metadata,
        });

      if (error) throw error;

      return {
        success: true,
        path: data.path,
      };
    } catch (err: any) {
      console.error(`[ObjectStorage Error] Failed to upload to Supabase bucket "${bucket}":`, err);
      return { success: false, path: '', error: err?.message || 'Storage upload failed' };
    }
  }

  // Local Dev Storage Fallback
  try {
    const bucketDir = ensureLocalStorageDir(bucket);
    const localFilePath = path.join(bucketDir, storagePath);
    fs.writeFileSync(localFilePath, fileBuffer);

    return {
      success: true,
      path: `${bucket}/${storagePath}`,
      url: `/data/uploads/${bucket}/${storagePath}`,
    };
  } catch (err: any) {
    console.error(`[ObjectStorage Error] Failed local disk write:`, err);
    return { success: false, path: '', error: 'Local file write failed' };
  }
}

/**
 * Generates a temporary signed access URL with time-bound expiry.
 */
export async function getSignedDocumentUrl(
  bucket: StorageBucket,
  storagePath: string,
  expiresInSeconds = 3600 // 1-hour expiry
): Promise<{ signedUrl?: string; error?: string }> {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresInSeconds);

      if (error) throw error;
      return { signedUrl: data.signedUrl };
    } catch (err: any) {
      console.error(`[ObjectStorage Error] Failed to create signed URL for "${storagePath}":`, err);
      return { error: err?.message || 'Failed to generate signed URL' };
    }
  }

  // Local Dev URL simulation
  return {
    signedUrl: `/api/documents/preview?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(storagePath)}`,
  };
}

/**
 * Deletes a document from storage.
 */
export async function deleteDocument(
  bucket: StorageBucket,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseEnabled) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([storagePath]);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  try {
    const filePath = path.join(LOCAL_STORAGE_ROOT, bucket, path.basename(storagePath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
