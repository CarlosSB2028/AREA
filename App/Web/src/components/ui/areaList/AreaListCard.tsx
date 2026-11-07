import React, { useMemo } from 'react';
import { Card, Text, Badge, Group, Stack, Anchor } from '@mantine/core';
import { Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconPlayerPlay, IconTrash, IconActivity } from '@tabler/icons-react';
import Image from 'next/image';
import { AreaListCardProps, BackendArea, Area } from '../../../types';
import { useRouter } from 'next/navigation';
export default function AreaListCard({ areas, services, onDelete, onRun, onEnableDisable }: AreaListCardProps) {
  const servicesMap = useMemo(() => {
    return new Map(services.map(s => [s.id, s]));
  }, [services]);

  const router = useRouter();

  const isBackendArea = (area: Area | BackendArea): area is BackendArea => {
    return 'actions' in area && 'reactions' in area;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAreaServices = (area: Area | BackendArea): string[] => {
    if (isBackendArea(area)) {
      return [];
    }
    return area.services;
  };

  const getAreaStatus = (area: Area | BackendArea): string => {
    if (isBackendArea(area)) {
      return area.enabled ? 'active' : 'inactive';
    }
    return area.status;
  };

  const formatLastRun = (lastRun: string | Date | null): string => {
    if (!lastRun) return 'Never';
    const date = new Date(lastRun);
    return date.toLocaleDateString();
  };

  const getLastRun = (area: Area | BackendArea): string => {
    if (isBackendArea(area)) {
      return formatLastRun(area.updatedAt);
    }
    return area.lastRun || 'Never';
  };
  return (
    <Stack>
      {areas.map((area) => (
          <Card key={area.id} shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: 'pointer' }}>
            <Group justify="space-between" mb="xs">
              <Anchor href={`/areas/${area.id}`} style={{ textDecoration: 'none' }}>
                <Text fw={500}>{area.name}</Text>
              </Anchor>
              <Group>
              <Badge color={
                getStatusColor(getAreaStatus(area))
              } variant="light">
                {getAreaStatus(area)}
              </Badge>
                <Menu
                  transitionProps={{ transition: 'pop' }}
                  withArrow
                  position="right-start"
                  offset={20}
                  withinPortal
                >
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical size={16} stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconPlayerPlay size={16} stroke={1.5} />} color='blue' onClick={() => onRun?.(area.id)}>
                      Run area
                    </Menu.Item>
                    <Menu.Item leftSection={<IconEdit size={16} stroke={1.5} />} onClick={() => router.push(`/areas/${area.id}`)}>
                      Edit area
                    </Menu.Item>
                    <Menu.Item leftSection={<IconActivity size={16} stroke={1.5} />} onClick={() => onEnableDisable?.(area.id, getAreaStatus(area) === 'inactive')}>
                      Enable/Disable area
                    </Menu.Item>
                    <Menu.Item leftSection={<IconTrash size={16} stroke={1.5} />} color="red" onClick={() => onDelete?.(area.id)}>
                      Delete area
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            <Text size="sm" c="dimmed" mb="xs">
              {area.description}
            </Text>

            <Group justify="space-between">
              <Text size="sm">Last run: {getLastRun(area)}</Text>
              <Group gap="xs">
                {getAreaServices(area).map((serviceId: string) => {
                  const service = servicesMap.get(serviceId);
                  return service ? (
                    <Badge key={service.id} color="blue" variant="light">
                      <Group gap="xs" align="center">
                        {service.logo && <Image src={service.logo} alt={service.name} width={12} height={12} />}
                        {service.name}
                      </Group>
                    </Badge>
                  ) : null;
                })}
              </Group>
            </Group>
          </Card>
      ))}
    </Stack>
  );
}
