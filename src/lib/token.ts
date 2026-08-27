const SESSION_SECRET =
  process.env.ARTHA_SESSION_SECRET ||
  'dev-only-secret-change-before-production-do-not-use';

if (process.env.NODE_ENV === 'production' && !process.env.ARTHA_SESSION_SECRET) {
  throw new Error('[FATAL] ARTHA_SESSION_SECRET environment variable is not defined in production. Application aborted.');
}

// ── Cross-runtime HMAC-SHA256 (Edge & Node compatible without Node crypto module) ──

function sha256Bytes(bytes: number[]): number[] {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const l = bytes.length;
  const b = bytes.slice();
  b.push(0x80);
  while ((b.length % 64) !== 56) b.push(0);
  const bitLen = l * 8;
  b.push(0, 0, 0, 0, (bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff, (bitLen >>> 8) & 0xff, bitLen & 0xff);

  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const W = new Array(64);

  for (let i = 0; i < b.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = (b[i + t * 4] << 24) | (b[i + t * 4 + 1] << 16) | (b[i + t * 4 + 2] << 8) | b[i + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((W[t - 15] >>> 7) | (W[t - 15] << 25)) ^ ((W[t - 15] >>> 18) | (W[t - 15] << 14)) ^ (W[t - 15] >>> 3);
      const s1 = ((W[t - 2] >>> 17) | (W[t - 2] << 15)) ^ ((W[t - 2] >>> 19) | (W[t - 2] << 13)) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let [a, b_, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b_) ^ (a & c) ^ (b_ & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b_; b_ = a; a = (temp1 + temp2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b_) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }

  const result: number[] = [];
  for (let i = 0; i < 8; i++) {
    result.push((H[i] >>> 24) & 0xff, (H[i] >>> 16) & 0xff, (H[i] >>> 8) & 0xff, H[i] & 0xff);
  }
  return result;
}

function stringToUtf8Bytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0xd800 || code >= 0xe000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else {
      i++;
      const code2 = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(0xf0 | (code2 >> 18), 0x80 | ((code2 >> 12) & 0x3f), 0x80 | ((code2 >> 6) & 0x3f), 0x80 | (code2 & 0x3f));
    }
  }
  return bytes;
}

function hmacSha256Hex(keyStr: string, message: string): string {
  let keyBytes = stringToUtf8Bytes(keyStr);
  if (keyBytes.length > 64) {
    keyBytes = sha256Bytes(keyBytes);
  }
  while (keyBytes.length < 64) keyBytes.push(0);

  const oPad = keyBytes.map(b => b ^ 0x5c);
  const iPad = keyBytes.map(b => b ^ 0x36);
  const msgBytes = stringToUtf8Bytes(message);

  const innerBytes = iPad.concat(msgBytes);
  const innerHash = sha256Bytes(innerBytes);

  const outerBytes = oPad.concat(innerHash);
  const outerHash = sha256Bytes(outerBytes);

  return outerHash.map(b => b.toString(16).padStart(2, '0')).join('');
}

function signPayload(payload: string): string {
  return hmacSha256Hex(SESSION_SECRET, payload);
}

export function createToken(payload: any): string {
  const serialized = JSON.stringify(payload);
  const base64Payload = typeof Buffer !== 'undefined'
    ? Buffer.from(serialized).toString('base64')
    : btoa(serialized);
  
  const sig = signPayload(base64Payload);
  return `${base64Payload}.${sig}`;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function verifyToken(token: string): any | null {
  if (!token) return null;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return null;
  
  const base64Payload = token.substring(0, lastDot);
  const sig = token.substring(lastDot + 1);
  const expected = signPayload(base64Payload);

  if (!constantTimeEqual(sig, expected)) return null;

  try {
    const rawPayload = typeof Buffer !== 'undefined'
      ? Buffer.from(base64Payload, 'base64').toString('utf8')
      : atob(base64Payload);
    return JSON.parse(rawPayload);
  } catch {
    return null;
  }
}

