// lib/auth-redirect.js
// Shared utility for computing email redirect URLs in auth routes

const DEFAULT_PROTOCOL = 'http';
const DEFAULT_HOST = 'localhost:5000';
const PRODUCTION_PROTOCOL = 'https';

/**
 * Compute the redirect origin URL for magic link authentication
 * 
 * Priority order:
 * 1. NEXT_PUBLIC_APP_URL environment variable
 * 2. Request headers (x-forwarded-proto + host)
 * 3. Default fallback (http://localhost:5000)
 * 
 * In production, validates and enforces HTTPS protocol.
 * 
 * @param {Request} request - Next.js request object
 * @returns {string} The redirect origin URL (e.g., "https://example.com")
 */
export function getAuthRedirectOrigin(request) {
  const headers = request.headers;
  let redirectOrigin = process.env.NEXT_PUBLIC_APP_URL;
  
  // If NEXT_PUBLIC_APP_URL is not set, use request origin
  if (!redirectOrigin) {
    const proto = headers.get('x-forwarded-proto') || DEFAULT_PROTOCOL;
    const host = headers.get('host') || DEFAULT_HOST;
    redirectOrigin = `${proto}://${host}`;
  }
  
  // Validate HTTPS in production
  if (process.env.NODE_ENV === 'production' && !redirectOrigin.startsWith('https://')) {
    console.warn('⚠️  Non-HTTPS redirect in production, using request origin');
    const proto = headers.get('x-forwarded-proto') || PRODUCTION_PROTOCOL;
    const host = headers.get('host');
    if (host) {
      redirectOrigin = `${proto}://${host}`;
    }
  }
  
  return redirectOrigin;
}

/**
 * Compute the full email redirect URL for magic link callback
 * 
 * @param {Request} request - Next.js request object
 * @param {string} [path='/auth/callback'] - Callback path
 * @returns {string} Full redirect URL (e.g., "https://example.com/auth/callback")
 */
export function getAuthCallbackUrl(request, path = '/auth/callback') {
  const origin = getAuthRedirectOrigin(request);
  return `${origin}${path}`;
}
