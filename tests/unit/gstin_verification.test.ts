import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateGSTIN, validateGSTINLive, calculateGSTINChecksum, isValidGSTINChecksum } from '../../src/lib/gstinService';

describe('GSTIN Verification — Truth & Security Hardening', () => {
  it('1. Correctly validates authentic Gujarat GSTIN format and checksum', () => {
    // 24AAAAC1234A1Z1 (Valid structure, state prefix 24 for Gujarat)
    const validGstin = '24AAAAC1234A1Z1';
    const result = validateGSTIN(validGstin);

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.stateCode, '24');
    assert.strictEqual(result.stateName, 'Gujarat');
    assert.strictEqual(result.verificationSource, 'format_checksum');
    assert.strictEqual(result.isLiveVerified, false);
    // Entity name must NOT be fabricated as MOCK ENTERPRISE
    assert.strictEqual(result.entityName, undefined);
  });

  it('2. Checksum validation verifies mathematical check digit', () => {
    assert.strictEqual(isValidGSTINChecksum('24AAAAC1234A1ZS'), true);
    assert.strictEqual(isValidGSTINChecksum('24AAAAC1234A1Z9'), false);
    assert.strictEqual(calculateGSTINChecksum('24AAAAC1234A1Z'), 'S');
  });

  it('3. Rejects invalid state prefix', () => {
    const invalidStateGstin = '99AAAAC1234A1Z1';
    const result = validateGSTIN(invalidStateGstin);

    assert.strictEqual(result.valid, false);
    assert.ok(result.error?.includes('not a valid Indian state'));
  });

  it('4. Live Lookup: reports honest unavailable status when API key is unconfigured', async () => {
    const validGstin = '24AAAAC1234A1Z1';
    const result = await validateGSTINLive(validGstin);

    assert.strictEqual(result.valid, true); // Format valid
    assert.strictEqual(result.isLiveVerified, false);
    assert.strictEqual(result.verificationSource, 'unavailable');
    assert.strictEqual(result.entityName, undefined, 'Must NEVER fabricate mock entity names');
    assert.ok(result.message?.includes('unconfigured'));
  });
});
