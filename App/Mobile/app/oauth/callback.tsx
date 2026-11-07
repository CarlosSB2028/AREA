/**
 * OAuth Callback Screen
 * Handles deep link callback from OAuth providers with PKCE
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/services/api.config';
import { useTranslation } from 'react-i18next';
import { retrievePKCE, clearPKCE } from '@/utils/pkce';
import * as storage from '@/services/storage';

interface OAuthExchangeBody {
  code: string;
  code_verifier?: string;
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export default function OAuthCallbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { loginWithOAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { code, error, error_description, provider, mode } = params;

      if (error) {
        setStatus('error');
        setMessage(error_description as string || error as string || 'OAuth authentication failed');
        await clearPKCE();

        setTimeout(() => {
          router.replace('/(tabs)/login');
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        await clearPKCE();

        setTimeout(() => {
          router.replace('/(tabs)/login');
        }, 2000);
        return;
      }

      try {
        const isLinkMode = mode === 'link';
        setMessage(isLinkMode ? 'Linking service...' : 'Exchanging authorization code...');

        const providerKey = (provider as string) || 'github';
        const apiUrl = await getApiUrl();

        let codeVerifier: string | undefined;
        try {
          const pkce = await retrievePKCE();
          if (pkce) {
            codeVerifier = pkce.verifier;
          } else {
            console.warn('No PKCE data found - continuing without PKCE');
          }
        } catch (error) {
          console.warn('Failed to retrieve PKCE - continuing without PKCE:', error);
        }

        const body: OAuthExchangeBody = { code: code as string };
        if (codeVerifier) {
          body.code_verifier = codeVerifier;
        }

        const endpoint = isLinkMode
          ? `/api/oauth-link/${providerKey}/exchange`
          : `/api/oauth/${providerKey}/exchange`;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (isLinkMode) {
          const token = await storage.getAccessToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          credentials: 'include',
        });

        console.log('Exchange response status:', response.status);

        if (response.ok) {
          const data = await response.json();

          setStatus('success');
          await clearPKCE();

          if (isLinkMode) {
            if (data.connected && data.serviceName) {
              setMessage(`${data.serviceName} linked successfully! Redirecting...`);
            } else {
              setMessage('Service linked successfully! Redirecting...');
            }

            setTimeout(() => {
              router.replace('/connected-services');
            }, 1500);
          } else {
            setMessage('Authentication successful! Redirecting...');

            if (data.accessToken) {
              await storage.saveAccessToken(data.accessToken);
            } else {
              console.warn('No access token in response - cookies may be used');
            }

            if (data.user) {
              console.log('Calling loginWithOAuth with user:', data.user.email);
              await loginWithOAuth(data.user);
            } else {
              console.warn('No user data in response');
            }

            setTimeout(() => {
              router.replace('/(tabs)');
            }, 1500);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Exchange failed:', errorData);

          let errorMessage = 'Authentication failed';
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (response.status === 401) {
            errorMessage = isLinkMode
              ? 'You must be logged in to link a service'
              : 'Invalid or expired authorization code';
          } else if (response.status === 409) {
            errorMessage = 'This account is already linked to another user';
          } else if (response.status === 400) {
            errorMessage = 'Invalid request';
          }

          throw new Error(errorMessage);
        }
      } catch (error: unknown) {
        console.error('OAuth exchange error:', error);
        setStatus('error');
        setMessage(getErrorMessage(error) || 'Authentication failed');
        await clearPKCE();

        const redirectTarget = (params.mode === 'link') ? '/connected-services' : '/(tabs)/login';
        setTimeout(() => {
          router.replace(redirectTarget);
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [params, loginWithOAuth, router, t]);

  return (
    <Center className="flex-1 bg-background-0 p-4">
      <VStack space="lg" className="items-center">
        {status === 'processing' && (
          <>
            <ActivityIndicator size="large" color="#0066FF" />
            <Text className="text-typography-700 text-center text-lg">
              {message || t('oauth.processing', 'Processing OAuth...')}
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text className="text-success-600 text-center text-xl font-bold">
              ✓ {t('oauth.success', 'Success!')}
            </Text>
            <Text className="text-typography-700 text-center">
              {message}
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text className="text-error-600 text-center text-xl font-bold">
              ✗ {t('oauth.error', 'Error')}
            </Text>
            <Text className="text-typography-700 text-center">
              {message}
            </Text>
            <Text className="text-typography-500 text-center text-sm">
              {t('oauth.redirecting', 'Redirecting to login...')}
            </Text>
          </>
        )}
      </VStack>
    </Center>
  );
}
