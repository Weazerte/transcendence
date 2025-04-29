import { getCookie, deleteCookie } from '../utils/cookies.js';

/**
 * Get the access token
 * @returns {string|null} The access token or null if it doesn't exist
 */
export function getAccessToken() {
  return getCookie('access_token');
}

/**
 * Clear the tokens
 */
export function clearTokens() {
  deleteCookie('access_token');
  deleteCookie('refresh_token');
}

/**
 * Attempts to refresh the access token using the refresh token
 * @returns {Promise<string|null>} The new access token or null if refresh failed
 */
export async function refreshToken() {
  try {
    const response = await globalThis.originalFetch('/api/auth/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const { access_token } = await response.json();
    return access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Makes a fetch request with automatic token refresh handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}) {
  const accessToken = getAccessToken();

  console.log('Fetching...', url, options);

  // Add authorization header if access token exists
  if (accessToken) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  // Make the initial request
  let response = await globalThis.originalFetch(url, options);

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log('Refreshing token...');
    const newAccessToken = await refreshToken();

    if (newAccessToken) {
      console.log('New access token...', newAccessToken);
      // Update the authorization header with new token
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      // Retry the original request
      response = await globalThis.originalFetch(url, options);
    } else {
      console.log('Refresh failed...');
      clearTokens();
    }
  }

  return response;
}
