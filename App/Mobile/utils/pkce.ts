import * as Crypto from 'expo-crypto';

let currentPKCE: { verifier: string; challenge: string; timestamp: number } | null = null;

export function generateCodeVerifier(): string {
  const randomBytes = Crypto.getRandomBytes(32);
  return base64URLEncode(randomBytes);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier
  );
  return base64URLEncode(hexToBytes(digest));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Base64URL encode (RFC 4648 § 5)
 * Base64 with URL-safe characters and no padding
 */
function base64URLEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Store PKCE values in memory for the current OAuth flow
 * NOTE: In-memory storage - will be cleared if app is terminated
 * For production, replace with AsyncStorage or expo-secure-store
 */
export async function storePKCE(verifier: string, challenge: string): Promise<void> {
  try {
    currentPKCE = { verifier, challenge, timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to store PKCE:', error);
    throw error;
  }
}

/**
 * Retrieve PKCE values from memory storage
 * Returns null if not found or expired (> 10 minutes old)
 */
export async function retrievePKCE(): Promise<{ verifier: string; challenge: string } | null> {
  try {
    if (!currentPKCE) {
      console.log('No PKCE data found in memory');
      return null;
    }
    const age = Date.now() - currentPKCE.timestamp;
    if (age > 10 * 60 * 1000) {
      console.log('PKCE data expired, clearing');
      await clearPKCE();
      return null;
    }
    console.log('PKCE retrieved successfully');
    return { verifier: currentPKCE.verifier, challenge: currentPKCE.challenge };
  } catch (error) {
    console.error('Failed to retrieve PKCE:', error);
    return null;
  }
}

/**
 * Clear PKCE values from memory storage
 */
export async function clearPKCE(): Promise<void> {
  try {
    currentPKCE = null;
    console.log('PKCE cleared successfully');
  } catch (error) {
    console.error('Failed to clear PKCE:', error);
  }
}
