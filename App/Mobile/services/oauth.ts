/**
 * OAuth Service
 * Handles OAuth provider loading and initiation with PKCE
 */

import { getApiUrl } from './api.config';
import { generateCodeVerifier, generateCodeChallenge, storePKCE } from '../utils/pkce';

export interface OAuthProvider {
  providerKey: string;
  providerLabel: string;
  providerLogoUrl: string;
  userAuthUrl?: string;
  clientId?: string;
}

/**
 * Get available OAuth providers from backend
 */
export async function getOAuthProviders(): Promise<OAuthProvider[]> {
  try {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/api/oauth/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OAuth providers');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching OAuth providers:', error);
    return [];
  }
}

/**
 * Get OAuth authorization URL for a provider with PKCE
 * Generates code_verifier and code_challenge for secure OAuth flow
 * @param providerKey - The OAuth provider key (github, discord, etc.)
 * @param isLinkMode - If true, indicates service linking (not login)
 */
export async function getOAuthUrl(providerKey: string, isLinkMode: boolean = false): Promise<string> {
  const apiUrl = await getApiUrl();
  
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  await storePKCE(codeVerifier, codeChallenge);
  
  const params = new URLSearchParams({
    origin: 'mobile',
    mode: isLinkMode ? 'link' : 'login',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  
  return `${apiUrl}/api/oauth/${providerKey.toLowerCase()}/authorize?${params.toString()}`;
}
