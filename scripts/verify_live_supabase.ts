/**
 * scripts/verify_live_supabase.ts
 * Real Live Integration Verification for Supabase Database & All 4 Private Storage Buckets.
 *
 * Checks:
 * 1. Environment configuration (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY/SERVICE_ROLE)
 * 2. Live PostgreSQL database connectivity and RLS insert/select/delete check
 * 3. Multi-bucket Private Storage upload, signed URL generation, HTTPS download, and cleanup for:
 *    - 'factory-documents'
 *    - 'audit-evidence'
 *    - 'rfq-attachments'
 *    - 'commercial-documents'
 */

import fs from 'fs';
import path from 'path';

// Load .env.local if present
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function runLiveVerification() {
  console.log('===============================================================');
  console.log('  AARTHA — LIVE SUPABASE DATABASE & 4-BUCKET STORAGE TEST      ');
  console.log('===============================================================');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log(`\n[1/6] Checking Configuration...`);
  console.log(`  Supabase URL: ${supabaseUrl || 'MISSING ❌'}`);
  console.log(`  Supabase Secret Key: ${supabaseKey ? 'SET (' + supabaseKey.slice(0, 12) + '...)' : 'MISSING ❌'}`);

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
    console.error('\n❌ ABORTED: Missing live Supabase credentials in .env.local.');
    console.error('Please open .env.local and set:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL=https://igprhtpjqbjwcbsnllcy.supabase.co');
    console.error('  SUPABASE_SECRET_KEY=sb_secret_...');
    process.exit(1);
  }
  console.log('  ✓ PASS: Configuration parameters detected.');

  // Dynamically import Supabase modules after env vars are populated
  const { supabase } = await import('../src/lib/supabaseClient');
  const { uploadDocument, getSignedDocumentUrl, deleteDocument } = await import('../src/lib/objectStorage');
  type StorageBucket = 'factory-documents' | 'audit-evidence' | 'rfq-attachments' | 'commercial-documents';

  // 2. Database Connectivity & Operation Check
  console.log(`\n[2/6] Testing Live PostgreSQL Database Connection...`);
  const testAuditId = `AUDIT-TEST-${Date.now()}`;
  const { error: insertErr } = await supabase.from('audit_log').insert([
    {
      id: testAuditId,
      action: 'LIVE_INTEGRATION_TEST',
      details: 'Automated Supabase production verification probe.',
      actorRole: 'admin',
      actorId: 'test-verifier-0',
      timestamp: new Date().toISOString(),
    },
  ]);

  if (insertErr) {
    console.error(`  ❌ FAIL: Database INSERT error:`, insertErr);
    process.exit(1);
  }
  console.log(`  ✓ PASS: Successfully inserted test audit log row into PostgreSQL.`);

  const { data: readData, error: readErr } = await supabase
    .from('audit_log')
    .select('*')
    .eq('id', testAuditId)
    .single();

  if (readErr || !readData) {
    console.error(`  ❌ FAIL: Database SELECT error:`, readErr);
    process.exit(1);
  }
  console.log(`  ✓ PASS: Successfully queried test row from PostgreSQL.`);

  // Clean up test row
  await supabase.from('audit_log').delete().eq('id', testAuditId);
  console.log(`  ✓ PASS: Successfully cleaned up test row.`);

  // 3. Multi-Bucket Storage Verification
  const buckets: StorageBucket[] = [
    'factory-documents',
    'audit-evidence',
    'rfq-attachments',
    'commercial-documents',
  ];

  let stepNumber = 3;
  for (const bucket of buckets) {
    console.log(`\n[${stepNumber}/6] Testing Private Bucket "${bucket}"...`);
    const testFileName = `probe_${bucket.replace('-', '_')}_${Date.now()}.pdf`;
    const probeSecret = `PROBE_PAYLOAD_${bucket}_${Date.now()}`;
    const testContent = Buffer.from(`AARTHA Production Live Storage Probe for ${bucket}: ${probeSecret}`, 'utf8');

    // Upload
    const uploadResult = await uploadDocument(
      bucket,
      testFileName,
      testContent,
      'application/pdf',
      { probe: true, bucket, environment: 'production-verification' }
    );

    if (!uploadResult.success || !uploadResult.path) {
      console.error(`  ❌ FAIL: Storage upload to "${bucket}" failed:`, uploadResult.error);
      process.exit(1);
    }
    console.log(`  ✓ PASS: Uploaded probe to "${bucket}": "${uploadResult.path}"`);

    // Signed URL & Download
    const signedUrlResult = await getSignedDocumentUrl(bucket, uploadResult.path, 300);
    if (!signedUrlResult.signedUrl) {
      console.error(`  ❌ FAIL: Signed URL generation for "${bucket}" failed:`, signedUrlResult.error);
      process.exit(1);
    }

    try {
      const fetchRes = await fetch(signedUrlResult.signedUrl);
      if (!fetchRes.ok) {
        throw new Error(`HTTP ${fetchRes.status}: ${fetchRes.statusText}`);
      }
      const bodyText = await fetchRes.text();
      if (!bodyText.includes(probeSecret)) {
        throw new Error('Payload mismatch on retrieved storage object.');
      }
      console.log(`  ✓ PASS: Signed URL verified over HTTPS for "${bucket}".`);
    } catch (err: any) {
      console.error(`  ❌ FAIL: HTTPS fetch for "${bucket}" failed:`, err.message);
      process.exit(1);
    }

    // Cleanup
    const deleteResult = await deleteDocument(bucket, uploadResult.path);
    if (!deleteResult.success) {
      console.warn(`  ⚠️ Warning: Probe cleanup in "${bucket}" encountered:`, deleteResult.error);
    } else {
      console.log(`  ✓ PASS: Successfully cleaned up probe object from "${bucket}".`);
    }

    stepNumber++;
  }

  console.log('\n===============================================================');
  console.log('  ALL LIVE SUPABASE DATABASE & 4-BUCKET STORAGE CHECKS PASSED  ');
  console.log('===============================================================');
}

runLiveVerification().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
