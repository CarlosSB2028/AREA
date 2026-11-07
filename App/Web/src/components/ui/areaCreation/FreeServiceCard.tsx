import React from 'react';
import { Card, Group, Text, Badge, ActionIcon, Image } from '@mantine/core';
import { IconTrash, IconEdit, IconGripVertical } from '@tabler/icons-react';
import { ServiceState } from '../../../types';

interface FreeServiceCardProps {
  logo: string;
  serviceName: string;
  cardName: string;
  event?: string;
  state: ServiceState;
  onRemove: () => void;
  onEdit: () => void;
}

export default function FreeServiceCard({
  logo,
  serviceName,
  cardName,
  event,
  state,
  onRemove,
  onEdit,
}: FreeServiceCardProps) {
  const getStateColor = (state: ServiceState) => {
    switch (state) {
      case ServiceState.Success:
        return 'green';
      case ServiceState.Failed:
        return 'red';
      case ServiceState.InProgress:
        return 'yellow';
      case ServiceState.Configuration:
      default:
        return 'blue';
    }
  };

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder style={{ width: '300px', minHeight: '150px' }}>
      <Group gap="xs" justify="space-between">
        <Group gap="xs">
          <Image src={logo} alt={serviceName} style={{ width: 24, height: 24 }} />
          <Text size="sm" fw={500}>
            {serviceName}
          </Text>
        </Group>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={onEdit}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={onRemove}>
            <IconTrash size={16} />
          </ActionIcon>
          <IconGripVertical size={16} style={{ cursor: 'grab' }} />
        </Group>
      </Group>

      <Text size="lg" fw={600} mt="sm">
        {cardName}
      </Text>

      {event && (
        <Text size="sm" c="dimmed" mt="xs">
          {event}
        </Text>
      )}

      <Badge
        color={getStateColor(state)}
        variant="light"
        size="sm"
        mt="sm"
      >
        {state}
      </Badge>
    </Card>
  );
}