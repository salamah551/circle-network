// lib/fetch-with-auth.js
// Shared client-side fetch helper.
// On 401/403 responses it dispatches a custom event so UI can show a reauth banner,
// and redirects to /login after a short delay so the user can re-authenticate.

const REAUTH_EVENT = 'circle:reauth-required';

/**
 * Dispatch a custom reauth event that any mounted ReauthBanner can listen to.
 * @param {number} status - HTTP status code (401 or 403)
 */
function dispatchReauthEvent(status) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REAUTH_EVENT, { detail: { status } }));
  }
}

const REDIRECT_DELAY_MS = 2000;

/**
 * Redirect to /login, preserving the current path as a `next` param.
 */
function redirectToLogin() {
  if (typeof window !== 'undefined') {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?next=${next}`;
  }
}

/**
 * A drop-in wrapper around `fetch` that handles 401/403 responses by:
 *  1. Dispatching a `circle:reauth-required` custom event (for banner display)
 *  2. Redirecting to /login after 2 seconds so the user can re-authenticate
 *
 * All other behaviour is identical to the native `fetch`.
 *
 * @param {string|URL|Request} input
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
export async function fetchWithAuth(input, init) {
  const response = await fetch(input, init);

  if (response.status === 401 || response.status === 403) {
    dispatchReauthEvent(response.status);
    // Redirect after a short delay so any banner has time to render
    setTimeout(redirectToLogin, REDIRECT_DELAY_MS);
  }

  return response;
}

export { REAUTH_EVENT };
