'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader, Text, Center, Stack } from '@mantine/core';
import { verifyEmail } from '@/services/authService';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'loading' | 'verified' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStep('error');
        setTimeout(() => {
          router.push('/');
        }, 2500);
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStep('verified');
        setTimeout(() => {
          router.push('/');
        }, 2500);
      } catch (error) {
        console.error('Verification error:', error);
        setStep('error');
      }
    };

    performVerification();
  }, [router, searchParams]);

  return (
    <div>
      <div style={{ height: '130px' }}></div>
      <Center style={{ height: 'calc(100vh - 260px)' }}>
        <Stack align="center" gap="md">
          {step === 'loading' ? (
            <>
              <Loader size="xl" />
              <Text size="lg">Verifying your email...</Text>
            </>
          ) : step === 'verified' ? (
            <>
              <Text size="xl" fw={700} c="green">Email verified successfully!</Text>
              <Text size="md">Redirecting to the home page...</Text>
            </>
          ) : (
            <>
              <Text size="xl" fw={700} c="red">Error: Verification token missing</Text>
              <Text size="md">Please check the link in your email.</Text>
            </>
          )}
        </Stack>
      </Center>
      <div style={{ height: '130px' }}></div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div>
        <div style={{ height: '130px' }}></div>
        <Center style={{ height: 'calc(100vh - 260px)' }}>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text size="lg">Loading...</Text>
          </Stack>
        </Center>
        <div style={{ height: '130px' }}></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
