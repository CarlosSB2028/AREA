import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '@/services/api.config';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/services/authenticatedFetch';


export default function OAuthCallbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = React.useState('Processing authentication...');
  const hasProcessed = useRef(false);
  const { refreshAuth } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    const processOAuthCallback = async () => {
      hasProcessed.current = true;

      const { success, code, error, error_description, provider, mode } = params;

      if (error) {
        console.error('OAuth error:', error);
        Alert.alert(
          t('oauth.error', 'Authentication Error'),
          (error_description as string) || (error as string) || t('oauth.authFailed', 'Authentication failed'),
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace(mode === 'link' ? '/connected-services' : '/(tabs)/login');
              }
            }
          ]
        );
        return;
      }

      if (success === 'true' && code) {
        try {
          setMessage(t('oauth.exchanging', 'Exchanging authorization code...'));
          const providerName = (provider as string) || 'google';
          const authMode = (mode as string) || 'login';
          const returnPath = (params.return as string) || null;
          const apiUrl = await getApiUrl();
          const isLinkMode = authMode === 'link';
          const endpoint = isLinkMode 
            ? `/api/oauth-link/${providerName}/exchange`
            : `/api/oauth/${providerName}/exchange`;
          let response: Response;
          if (isLinkMode) {
            response = await authenticatedFetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code: code }),
              useBearer: true,
            });
          } else {
            response = await fetch(`${apiUrl}${endpoint}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ code: code }),
            });
          }

          if (response.ok) {
            if (isLinkMode) {
              const data = await response.json();
              console.log('Link mode response:', data);
              setMessage(t('oauth.linkSuccess', 'Account linked successfully!'));
              setTimeout(() => {
                if (returnPath) {
                  router.back();
                } else {
                  router.replace('/connected-services');
                }
              }, 1000);
            } else {
              console.log('OAuth login successful, cookies set by backend');
              setMessage(t('oauth.success', 'Authentication successful!'));
              await new Promise(resolve => setTimeout(resolve, 500));
              await refreshAuth();
              setTimeout(() => {
                router.replace('/(tabs)');
              }, 1000);
            }
          } else {
            const errorText = await response.text();
            console.error('Exchange failed - Status:', response.status);
            console.error('Exchange failed - Response:', errorText);
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }
            throw new Error(errorData.message || `Token exchange failed (${response.status})`);
          }
        } catch (error) {
          console.error('Token exchange error:', error);
          setMessage(t('oauth.error', 'Error'));
          Alert.alert(
            t('oauth.error', 'Error'),
            error instanceof Error ? error.message : t('oauth.exchangeFailed', 'Failed to complete authentication'),
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace(mode === 'link' ? '/connected-services' : '/(tabs)/login');
                }
              }
            ]
          );
        }
      } else {
        console.warn('OAuth callback without code or error');
        Alert.alert(
          t('oauth.error', 'Error'),
          t('oauth.invalidCallback', 'Invalid OAuth callback'),
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)/login');
              }
            }
          ]
        );
      }
    };

    processOAuthCallback();
  }, [params, router, t, refreshAuth]);

  return (
    <View className="flex-1 bg-background-0">
      <Center className="flex-1">
        <VStack space="xl" className="items-center px-6">
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="text-lg text-center text-typography-700">
            {message}
          </Text>
          <Text className="text-sm text-center text-typography-500">
            {t('oauth.pleaseWait', 'Please wait...')}
          </Text>
        </VStack>
      </Center>
    </View>
  );
}
