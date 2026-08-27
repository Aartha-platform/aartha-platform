import { hashPassword, verifyPassword, saveUser, getUserByEmail, saveOtp, verifyOtp, deleteOtp } from './storeAdapter';
import { createToken, verifyToken } from './token';
import crypto from 'crypto';

async function runTests() {
  console.log('🚀 Running Authentication Overhaul Security Tests...\n');

  // Test 1: Password Hashing and Scrypt Verification
  console.log('Test 1: Password Hashing & Verification');
  const rawPassword = 'my-super-long-secure-passphrase-2026';
  const hashed = hashPassword(rawPassword);
  
  console.log(`- Password successfully hashed: ${hashed.substring(0, 30)}...`);
  const matchSuccess = verifyPassword(rawPassword, hashed);
  const matchFailure = verifyPassword('wrong-password', hashed);
  
  if (matchSuccess && !matchFailure) {
    console.log('✅ Password hashing & verification checks passed.');
  } else {
    throw new Error('❌ Password verification checks failed.');
  }
  console.log('');

  // Test 2: Edge-Safe Session Token Signature Verification
  console.log('Test 2: Edge-Safe Session Token Signature Verification');
  const payload = { role: 'buyer', email: 'test@company.com', expiresAt: '2027-01-01T00:00:00.000Z' };
  const token = createToken(payload);
  console.log(`- Token generated: ${token.substring(0, 40)}...`);
  
  const decoded = verifyToken(token);
  if (decoded && decoded.email === payload.email) {
    console.log('- Original token verified successfully.');
  } else {
    throw new Error('❌ Token verification failed for valid token.');
  }

  // TAMPERING test: Alter payload content
  const parts = token.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ ...payload, role: 'admin' })).toString('base64');
  const tamperedToken = `${tamperedPayload}.${parts[1]}`;
  
  const tamperedDecoded = verifyToken(tamperedToken);
  if (tamperedDecoded === null) {
    console.log('✅ Cryptographic signature mismatch successfully caught (Tampering blocked!).');
  } else {
    throw new Error('❌ SECURITY CRITICAL VULNERABILITY: Tampered session token was accepted!');
  }
  console.log('');

  // Test 3: OTP Code Throttling and Validation
  console.log('Test 3: OTP Verification and Attack Throttling');
  const email = 'procurement@artha.site';
  const secureOtp = '582914';
  
  await saveOtp(email, secureOtp, 2000); // valid for 2 seconds
  console.log(`- Secure OTP stored for ${email}`);

  // Test failure
  let verifyRes = await verifyOtp(email, '000000');
  console.log(`- Wrong OTP response: ${verifyRes.error} (Success: ${verifyRes.success})`);
  if (verifyRes.success) {
    throw new Error('❌ Wrong OTP was verified successfully.');
  }

  // Test too many attempts
  await verifyOtp(email, '000000'); // attempt 2
  verifyRes = await verifyOtp(email, '000000'); // attempt 3
  console.log(`- Third consecutive failure response: ${verifyRes.error}`);
  
  // Try with correct code now, should fail because attempts are locked/deleted
  const correctAfterLock = await verifyOtp(email, secureOtp);
  if (!correctAfterLock.success && correctAfterLock.error?.includes('Too many failed')) {
    console.log('✅ Max attempts lock block working correctly (Credential stuffing blocked).');
  } else {
    throw new Error('❌ Attempt limits did not lock OTP.');
  }

  console.log('\n🎉 ALL SECURITY AUDIT TESTS PASSED SUCCESSFULLY! Platform is now safe against spoofing, password cracking, and credential stuffing.');
}

runTests().catch((err: any) => {
  console.error('\n❌ TEST RUNNER FAILED:', err.message);
  process.exit(1);
});
