'use client';

import { Tabs, Container, Divider } from '@mantine/core';
import { IconUser, IconMap, IconSettings } from '@tabler/icons-react';
import { UsersTab } from '../../components/ui/dashboard/UsersTab';
import { AreasTab } from '../../components/ui/dashboard/AreasTab';
import { ServicesTab } from '../../components/ui/dashboard/ServicesTab';
import { useEffect } from 'react';
import { getCurrentUser } from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.isAdmin) {
          await router.replace('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        await router.replace('/login');
      }
    };
    checkLogin();
  }, [router]);
  return (
    <Container size="xl" py="md">
    <Tabs variant="pills" radius="lg" defaultValue="users">
      <Tabs.List justify="center" mb="md">
        <Tabs.Tab value="users" leftSection={<IconUser size={16} />}>
            Users
        </Tabs.Tab>
        <Tabs.Tab value="areas" leftSection={<IconMap size={16} />}>
            Areas
        </Tabs.Tab>
        <Tabs.Tab value="services" leftSection={<IconSettings size={16} />}>
            Services
        </Tabs.Tab>
      </Tabs.List>

        <Divider my="lg" />

        <Tabs.Panel value="users" pt="md">
          <UsersTab />
        </Tabs.Panel>

        <Tabs.Panel value="areas" pt="md">
          <AreasTab />
        </Tabs.Panel>

        <Tabs.Panel value="services" pt="md">
          <ServicesTab />
        </Tabs.Panel>

      </Tabs>
    </Container>
  );
}
