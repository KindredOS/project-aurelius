// src/utils/encryptionLoginHelper.js

// Backend expects strings that start with "pbkdf2"
export const PBKDF2_PREFIX = 'pbkdf2';
const HASH = 'SHA-256';
const ITERATIONS = 200_000;
const KEYLEN_BITS = 256;

function enc(str) { return new TextEncoder().encode(str); }
function b64(buf)  { return btoa(String.fromCharCode(...new Uint8Array(buf))); } // fixed spread bug
function b64ToBytes(b64str) { return Uint8Array.from(atob(b64str), c => c.charCodeAt(0)); }

export function isAlreadyPBKDF2(password) {
  return typeof password === 'string' && password.trim().toLowerCase().startsWith(PBKDF2_PREFIX);
}

export function isAlphaGenericPassword(pw) {
  const list = ['password','password1','password123','changeme','letmein','123456','qwerty','admin'];
  const normalized = (pw || '').trim().toLowerCase();
  return list.includes(normalized);
}

export async function pbkdf2Hash(password, saltBytes, iterations = ITERATIONS) {
  const keyMaterial = await crypto.subtle.importKey('raw', enc(password), 'PBKDF2', false, ['deriveBits']);
  const params = { name: 'PBKDF2', hash: HASH, salt: saltBytes, iterations };
  const bits = await crypto.subtle.deriveBits(params, keyMaterial, KEYLEN_BITS);
  return new Uint8Array(bits);
}

// Deterministic 16‑byte salt from email if a server salt isn't provided
async function deriveEmailSalt(email) {
  const digest = await crypto.subtle.digest('SHA-256', enc((email || '').toLowerCase()));
  return new Uint8Array(digest).slice(0, 16);
}

/**
 * Produce the client-hash format the backend accepts.
 * Format: pbkdf2$sha256$<iterations>$<salt_b64>$<hash_b64>
 */
export async function pbkdf2ClientHash(email, password, saltBase64) {
  const saltBytes = saltBase64 ? b64ToBytes(saltBase64) : await deriveEmailSalt(email);
  const hashBytes = await pbkdf2Hash(password, saltBytes);
  return `${PBKDF2_PREFIX}$sha256$${ITERATIONS}$${b64(saltBytes)}$${b64(hashBytes)}`;
}

/**
 * Login helper: try hashed first.
 * Returns { passwordToSend, isLegacyAlpha }
 */
export async function preparePasswordForLogin({ email, password, saltBase64 } = {}) {
  if (isAlreadyPBKDF2(password)) {
    return { passwordToSend: password, isLegacyAlpha: false };
  }
  const clientHash = await pbkdf2ClientHash(email, password, saltBase64);
  return { passwordToSend: clientHash, isLegacyAlpha: isAlphaGenericPassword(password) };
}
