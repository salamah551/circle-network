// lib/unsubscribe-token.js
// HMAC-signed token helpers for one-click unsubscribe links.
// The secret used to sign tokens is CRON_SECRET (or UNSUBSCRIBE_SECRET if set).

import crypto from 'crypto';

/**
 * Returns the secret used to sign/verify unsubscribe tokens.
 * Prefers UNSUBSCRIBE_SECRET; falls back to CRON_SECRET.
 * Throws when neither is set so callers can surface a 503.
 */
function getSecret() {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    throw new Error('UNSUBSCRIBE_SECRET (or CRON_SECRET) is not configured');
  }
  return secret;
}

/**
 * Generate an HMAC-SHA256 signature for a recipient ID.
 * @param {string} recipientId
 * @returns {string} hex signature
 */
export function signUnsubscribeId(recipientId) {
  const secret = getSecret();
  return crypto.createHmac('sha256', secret).update(String(recipientId)).digest('hex');
}

/**
 * Verify the signature for a recipient ID.
 * @param {string} recipientId
 * @param {string} sig - hex signature from query string
 * @returns {boolean}
 */
export function verifyUnsubscribeSignature(recipientId, sig) {
  if (!sig) return false;
  try {
    const expected = signUnsubscribeId(recipientId);
    // Use timingSafeEqual to prevent timing attacks
    const expectedBuf = Buffer.from(expected, 'hex');
    const sigBuf = Buffer.from(sig, 'hex');
    if (expectedBuf.length !== sigBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}

/**
 * Build a signed one-click unsubscribe URL.
 * @param {string} recipientId - bulk_invites row ID
 * @returns {string} full URL including signature
 */
export function buildUnsubscribeUrl(recipientId) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const sig = signUnsubscribeId(recipientId);
  return `${appUrl}/api/unsubscribe/${encodeURIComponent(recipientId)}?sig=${sig}`;
}
