'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/ui/auth/ResetPasswordForm';
import { Loader, Center } from '@mantine/core';

function ResetPasswordContent() {
  return (
    <div>
      <div style={{ height: '130px' }}></div>
      <ResetPasswordForm />
      <div style={{ height: '130px' }}></div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

