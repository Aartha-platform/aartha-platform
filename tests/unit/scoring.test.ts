/**
 * tests/unit/scoring.test.ts
 * Unit tests for Quality Scoring, Freshness Decay, GSTIN Validation, and Gate State Machine.
 */

import { computeQualityScore } from '@/lib/qualityScore';
import { validateGSTIN } from '@/lib/gstinService';
import { enforceGateTransition } from '@/lib/gateEnforcement';
import { calculateEvidenceFreshness } from '@/lib/evidenceService';
import assert from 'assert';

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`, err);
    throw err;
  }
}

export function runUnitTests() {
  console.log('\n--- Running Unit Tests: Core Trust & Verification Engines ---');

  // 1. GSTIN Checksum & Verification Tests
  test('GSTIN checksum calculation and validation', () => {
    const validGstin = '24AAAAC1234A1Z1';
    const validation = validateGSTIN(validGstin);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.stateCode, '24');
    assert.strictEqual(validation.stateName, 'Gujarat');
  });

  test('Invalid GSTIN format rejection', () => {
    const invalidGstin = 'INVALID_GSTIN_123';
    const validation = validateGSTIN(invalidGstin);
    assert.strictEqual(validation.valid, false);
  });

  // 2. Gate State Transitions
  test('Verification gate state transitions enforce correct sequence', () => {
    assert.strictEqual(enforceGateTransition('unverified', 'listed'), true);
    assert.strictEqual(enforceGateTransition('listed', 'business_verified'), true);
    assert.strictEqual(enforceGateTransition('business_verified', 'verified_supplier'), true);
    assert.strictEqual(enforceGateTransition('verified_supplier', 'premium_audited'), true);
    // Invalid jump without intermediate checks
    assert.strictEqual(enforceGateTransition('unverified', 'premium_audited'), false);
  });

  // 3. Evidence Freshness Decay
  test('Evidence freshness decay applies correct multipliers', () => {
    const freshEvidence: any = {
      source: 'gst_registry',
      capturedAt: new Date().toISOString(),
    };
    const freshResult = calculateEvidenceFreshness(freshEvidence);
    assert.strictEqual(freshResult.isStale, false);
    assert.strictEqual(freshResult.freshnessMultiplier, 1.0);

    const oldDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
    const staleEvidence: any = {
      source: 'gst_registry',
      capturedAt: oldDate,
    };
    const staleResult = calculateEvidenceFreshness(staleEvidence);
    assert.strictEqual(staleResult.isStale, true);
    assert.ok(staleResult.freshnessMultiplier < 1.0);
  });

  // 4. Quality Scoring with Evidence
  test('Quality score computation correctly awards evidence-backed points', () => {
    const mockSupplier: any = {
      companyName: 'Test Precision Engineering',
      sellerType: 'direct_manufacturer',
      isVerified: true,
      category: 'Machinery & Industrial',
      certifications: ['ISO 9001', 'CE'],
      yearEstablished: 2018,
      phone: '9876543210',
      slug: 'test-precision',
      location: {
        fullAddress: 'Plot 44, GIDC Vatva, Ahmedabad, Gujarat',
        city: 'Ahmedabad',
        state: 'Gujarat',
      },
      about: 'Precision CNC tooling and components manufacturer.',
      verificationDetails: {
        gstin: '24AAAAC1234A1Z1',
        iec: '0305012345',
        udyamNumber: 'UDYAM-GJ-01-0012345',
        bankVerified: true,
      },
      facilityVideoUrl: 'https://example.com/video.mp4',
      facilityVideoDated: new Date().toISOString(),
      auditRecords: [
        {
          id: 'AUD-01',
          auditorName: 'Senior Auditor',
          auditDate: new Date().toISOString(),
          grade: 'A',
          passed: true,
          gpsCoordinates: '22.9567°N, 72.6148°E',
        },
      ],
      responseRate: 95,
      avgResponseTimeHours: 2,
      onTimeDelivery: 98,
      verifiedDate: new Date().toISOString(),
    };

    const score = computeQualityScore(mockSupplier);
    assert.ok(score.total >= 75);
    assert.ok(score.verificationScore > 0);
    assert.ok(score.auditQualityScore > 0);
  });

  console.log('--- All Unit Tests Passed Successfully ---\n');
}

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runUnitTests();
}
