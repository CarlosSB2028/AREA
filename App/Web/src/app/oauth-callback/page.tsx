"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Title, Text, Loader, Alert } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../config/axios';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      if (hasProcessed) return;
      setHasProcessed(true);

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setMessage(errorDescription || error || 'OAuth authentication failed');

        setTimeout(() => {
          router.push('/login?error=' + encodeURIComponent(error));
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');

        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      try {
        setMessage('Exchanging authorization code...');

        const isLinkMode = localStorage.getItem('oauth_link_mode') === 'true';
        const provider = localStorage.getItem('oauth_provider') || 'github';

        let response;
        if (isLinkMode) {
          response = await axios.post(`/api/oauth-link/${provider}/exchange`, {
            code: code
          });
        } else {
          response = await axios.post(`/api/oauth/${provider}/exchange`, {
            code: code
          });
        }

        console.log('OAuth exchange response:', response);

        if (response.status === 200) {
          setStatus('success');
          localStorage.removeItem('oauth_link_mode');
          localStorage.removeItem('oauth_provider');
          const returnUrl = localStorage.getItem('oauth_return_url') || '/';
          localStorage.removeItem('oauth_return_url');

          if (isLinkMode) {
            setMessage('Account linked successfully! Redirecting...');
            setTimeout(() => {
              window.location.href = returnUrl;
            }, 1500);
          } else {
            setMessage('Authentication successful! Redirecting...');
            setTimeout(() => {
              window.location.href = returnUrl;
            }, 1500);
          }
          setTimeout(() => {
            window.location.reload();
            router.push(returnUrl);
          }, 2000);
        }
    } catch (error: unknown) {
        console.error('OAuth exchange error:', error);
        setStatus('error');

        let errorMessage = 'Authentication failed';
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number; data?: { message?: string; error?: string; suggestion?: string } } };
          console.error('OAuth error details:', axiosError.response);
          if (axiosError.response?.status === 409) {
            const data = axiosError.response.data;
            errorMessage = data?.message || 'This account is already linked to another user';
            if (data?.suggestion) {
              errorMessage += '. ' + data.suggestion;
            }
          } else if (axiosError.response?.status === 400) {
            const data = axiosError.response.data;
            errorMessage = data?.message || 'Invalid request';
            if (data?.suggestion) {
              errorMessage += '. ' + data.suggestion;
            }
          } else if (axiosError.response?.status === 401) {
            errorMessage = 'Invalid or expired authorization code';
          } else if (axiosError.response?.status === 500) {
            errorMessage = 'Server error during authentication';
          } else if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        }

        setMessage(errorMessage);

        const isLinkMode = localStorage.getItem('oauth_link_mode') === 'true';
        localStorage.removeItem('oauth_link_mode');
        localStorage.removeItem('oauth_provider');
        if (isLinkMode) {
          setTimeout(() => {
            const returnUrl = localStorage.getItem('oauth_return_url') || '/';
            localStorage.removeItem('oauth_return_url');
            router.push(returnUrl);
          }, 5000);
        }
      }
    };

    processCallback();
  }, [router, searchParams, refreshAuth, hasProcessed]);

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl" ta="center">
        {status === 'processing' && 'Authentication in progress...'}
        {status === 'success' && 'Authentication successful!'}
        {status === 'error' && 'Authentication error'}
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        {status === 'processing' && <Loader size="lg" />}
      </div>

      {status === 'success' && (
        <Alert color="green" ta="center">
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert color="red" ta="center">
          {message}
        </Alert>
      )}

      {status === 'processing' && (
        <Text ta="center">
          {message}
        </Text>
      )}
    </Container>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <Container size="sm" py="xl">
        <Title order={1} mb="xl" ta="center">
          Loading...
        </Title>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader size="lg" />
        </div>
      </Container>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}