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
    console.warn('⚠️ Non-HTTPS redirect in production, using request origin');
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
 * @returns {{ url: string, origin: string }} Object with full URL and origin
 */
export function getAuthCallbackUrl(request, path = '/auth/callback') {
  const origin = getAuthRedirectOrigin(request);
  return {
    url: `${origin}${path}`,
    origin
  };
}

/**
 * Format a Supabase auth error for user-friendly display
 * 
 * @param {Object} error - Supabase error object
 * @param {string} origin - Redirect origin URL
 * @returns {{ message: string, statusCode: number }} Formatted error with status code
 */
export function formatAuthError(error, origin) {
  let errorMessage = 'Failed to send magic link';
  let statusCode = 500;
  
  // Handle specific Supabase error cases
  // Check for redirect-related errors (URL not in allowlist)
  const errorMsg = error.message?.toLowerCase() || '';
  const errorCode = error.code || error.status;
  
  if (errorMsg.includes('redirect') || errorMsg.includes('url') && errorMsg.includes('allow')) {
    errorMessage = `Email redirect URL not allowed by Supabase Auth. Please add ${origin}/** to your Supabase Auth Redirect URLs allowlist.`;
    statusCode = 400;
  } else if (errorCode === 400 || errorCode === '400') {
    // Generic bad request - likely configuration issue
    errorMessage = `Authentication configuration error. Please check your Supabase Auth settings.`;
    statusCode = 400;
  } else if (error.message) {
    // For other errors, provide generic message (details logged server-side)
    errorMessage = 'Failed to send magic link. Please try again or contact support.';
    statusCode = 500;
  }
  
  return { message: errorMessage, statusCode };
}
