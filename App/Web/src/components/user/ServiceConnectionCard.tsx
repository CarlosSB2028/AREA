import { Card, Text, Menu, ActionIcon, Flex, Avatar, Button, Stack, Badge, Tooltip } from '@mantine/core';
import { IconDotsVertical, IconTrash, IconPlug, IconLock } from '@tabler/icons-react';
import { useState } from 'react';
import { BackendService, ConnectedService } from '../../types';
import { initiateServiceConnection } from '../../services/serviceConnectionService';

interface ServiceConnectionCardProps {
  service: BackendService;
  connectedService?: ConnectedService;
  onDisconnect?: (serviceKey: string) => void;
}

export default function ServiceConnectionCard({
  service,
  connectedService,
  onDisconnect
}: ServiceConnectionCardProps) {
  const [loadingConnection, setLoadingConnection] = useState(false);
  const isConnected = connectedService?.isConnected || false;
  const canDisconnect = connectedService?.canDisconnect === true;
  const iconUrl = service.iconLightUrl || service.iconDarkUrl || '';

  const handleServiceConnection = async () => {
    if (!service.key) return;
    try {
      setLoadingConnection(true);
      await initiateServiceConnection(service.key, window.location.href);
    } catch (error) {
      console.error('Error initiating service connection:', error);
    } finally {
      setLoadingConnection(false);
    }
  };

  return (
    <Card radius="md" withBorder padding="lg" shadow="sm" style={{ minHeight: '120px' }}>
      <Stack gap="md">
        <Flex justify="space-between" align="center">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <Avatar src={iconUrl} alt={service.name} size="lg" radius="md">
              <IconPlug size={24} />
            </Avatar>
            <div style={{ flex: 1 }}>
              <Flex gap="xs" align="center" mb={4}>
                <Text fw={600} size="lg">{service.name}</Text>
                {isConnected && (
                  <Badge size="sm" color="green" variant="light">
                    Connected
                  </Badge>
                )}
              </Flex>
              {isConnected && connectedService?.userEmail && (
                <Text size="sm" c="dimmed" lineClamp={1}>{connectedService.userEmail}</Text>
              )}
              {isConnected && connectedService?.userName && (
                <Text size="sm" c="dimmed" lineClamp={1}>{connectedService.userName}</Text>
              )}
              {!isConnected && (
                <Text size="sm" c="dimmed">Not connected</Text>
              )}
            </div>
          </div>

          {isConnected ? (
            <Menu width={220} withArrow>
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg">
                  <IconDotsVertical size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {onDisconnect && canDisconnect && (
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => onDisconnect(service.key)}
                  >
                    Disconnect
                  </Menu.Item>
                )}
                {onDisconnect && !canDisconnect && (
                  <Tooltip
                    label="Cannot disconnect your primary authentication method"
                    position="left"
                    withArrow
                  >
                    <Menu.Item
                      color="gray"
                      leftSection={<IconLock size={16} />}
                      disabled
                    >
                      Disconnect (Protected)
                    </Menu.Item>
                  </Tooltip>
                )}
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Button
              size="md"
              onClick={handleServiceConnection}
              variant="light"
              loading={loadingConnection}
            >
              Connect
            </Button>
          )}
        </Flex>
      </Stack>
    </Card>
  );
}
