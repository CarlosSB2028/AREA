'use client';

import { useState, useEffect } from 'react';
import { Stack, Text, Loader, Alert, SimpleGrid, TextInput, Group } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import ServiceConnectionCard from './ServiceConnectionCard';
import { getConnectedServices, getAllServices } from '../../services/userService';
import { disconnectService } from '../../services/serviceConnectionService';
import { BackendService, ConnectedService } from '../../types';

export default function ServicesTabProfile() {
  const [allServices, setAllServices] = useState<BackendService[]>([]);
  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [services, connected] = await Promise.all([
        getAllServices(),
        getConnectedServices()
      ]);
      const validServices = Array.isArray(services) ? services : [];
      const validConnected = Array.isArray(connected) ? connected : [];
      setAllServices(validServices);
      setConnectedServices(validConnected);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Failed to load services. Please try again.');
      setAllServices([]);
      setConnectedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (serviceKey: string) => {
    try {
      await disconnectService(serviceKey);
      await loadServices();
    } catch (err) {
      console.error('Failed to disconnect service:', err);
      setError('Failed to disconnect service. Please try again.');
    }
  };

  const mergedServices = [...allServices];
  connectedServices.forEach(connectedService => {
    const existsInAll = allServices.some(s => s.key === connectedService.serviceKey);
    if (!existsInAll) {
      mergedServices.push({
        id: connectedService.serviceKey,
        key: connectedService.serviceKey,
        name: connectedService.serviceName,
        auth: connectedService.connectionType as 'OAUTH2' | 'APIKEY' | 'NONE',
        isActive: true,
        iconLightUrl: connectedService.iconUrl,
        iconDarkUrl: connectedService.iconUrl
      });
    }
  });
  const filteredServices = mergedServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" />
        <Text c="dimmed">Loading services...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {error && (
        <Alert color="red" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Stack gap="sm">
        <TextInput
          placeholder="Search services..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          size="md"
        />
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {mergedServices.length} service{mergedServices.length !== 1 ? 's' : ''} available
            {connectedServices.length > 0 && ` · ${connectedServices.length} connected`}
          </Text>
        </Group>
      </Stack>

      {filteredServices.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {searchQuery ? 'No services found matching your search.' : 'No services available.'}
        </Text>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 1, md: 2 }}
          spacing="lg"
        >
          {filteredServices.map(service => {
            const connectedService = connectedServices.find(cs => cs.serviceKey === service.key);
            return (
              <ServiceConnectionCard
                key={service.id}
                service={service}
                connectedService={connectedService}
                onDisconnect={handleDisconnect}
              />
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
