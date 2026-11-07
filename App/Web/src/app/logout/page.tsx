'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Title, Text, Loader, Center, Card } from '@mantine/core';
import { logout } from '../../services/authService';

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Logging out...');

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        setStatus('success');
        setMessage('Logout successful! Redirecting to login...');

        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch (error) {
        console.error('Logout error:', error);
        setStatus('error');
        setMessage('Logout failed, but redirecting to login...');

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    };

    performLogout();
  }, [router]);

  return (
    <Container size="sm" py="xl">
      <Center>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Center mb="md">
            <Loader size="lg" />
          </Center>

          <Title order={2} ta="center" mb="md">
            {status === 'processing' && 'Logging out...'}
            {status === 'success' && 'Logout Successful'}
            {status === 'error' && 'Logout Error'}
          </Title>

          <Text ta="center" c="dimmed">
            {message}
          </Text>
        </Card>
      </Center>
    </Container>
  );
}