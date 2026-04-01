import { logger } from '../utils/logger.js';

const THREADS_API_BASE = 'https://graph.threads.net';

/**
 * Refresh a Threads long-lived access token.
 * Threads long-lived tokens expire after 60 days and must be refreshed
 * while still valid (and at least 24 hours old).
 *
 * @returns The new access token string
 */
export async function refreshThreadsToken(currentToken: string): Promise<string> {
  const url = `${THREADS_API_BASE}/refresh_access_token?` +
    `grant_type=th_refresh_token&access_token=${encodeURIComponent(currentToken)}`;

  logger.info('Refreshing Threads long-lived token...');

  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to refresh Threads token: ${response.status} ${body}`);
  }

  const data = await response.json() as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  const expiresInDays = Math.round(data.expires_in / 86400);
  logger.success(`Threads token refreshed. New expiry: ${expiresInDays} days`);

  return data.access_token;
}

/**
 * Check if a Threads token is still valid by making a lightweight API call.
 * Returns token debug info if valid, null if expired.
 */
export async function checkThreadsTokenValidity(
  token: string,
  userId: string
): Promise<{ valid: boolean; expiresIn?: number }> {
  try {
    // Use the debug_token endpoint or a lightweight profile fetch
    const url = `${THREADS_API_BASE}/v1.0/${userId}?fields=id&access_token=${encodeURIComponent(token)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return { valid: false };
    }

    return { valid: true };
  } catch {
    return { valid: false };
  }
}
