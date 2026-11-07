'use client';

import React from 'react';
import {
  Paper,
  Stack,
  Text,
  Select,
  Card,
  Group,
  Badge,
  SimpleGrid,
  Alert,
  Button,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { IconSettings, IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import type { BackendService, Action, FieldData } from '@/types';
import type { ServiceConnectionStatus } from '@/services/serviceConnectionService';

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface ReactionsStepProps {
  services: BackendService[];
  serviceConnectionStatuses: Record<string, ServiceConnectionStatus>;
  reactions: ReactionData[];
  reactionActions: Action[];
  onReactionServiceChange: (reactionId: string, service: string) => void;
  onReactionActionChange: (reactionId: string, actionId: string) => void;
  onReactionParamChange: (reactionId: string, paramName: string, value: unknown) => void;
  onAddReaction: () => void;
  onRemoveReaction: (reactionId: string) => void;
  onConnectService: (serviceKey: string) => void;
  renderParameterField: (
    field: FieldData,
    value: unknown,
    onChange: (value: unknown) => void
  ) => React.ReactNode;
  getActionFields: (actionId: string) => FieldData[];
}

export function ReactionsStep({
  services,
  serviceConnectionStatuses,
  reactions,
  reactionActions,
  onReactionServiceChange,
  onReactionActionChange,
  onReactionParamChange,
  onAddReaction,
  onRemoveReaction,
  onConnectService,
  renderParameterField,
  getActionFields,
}: ReactionsStepProps) {
  const isServiceConnected = (serviceKey: string): boolean => {
    const status = serviceConnectionStatuses[serviceKey];
    return status?.isConnected === true;
  };

  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Stack gap="lg">
        {reactions.map((reaction, index) => {
          const reactionActionsForService = reaction.service
            ? reactionActions.filter((a) => {
                return a.serviceKey === reaction.service && a.isExecutable;
              })
            : [];

          const fields = reaction.actionId ? getActionFields(reaction.actionId) : [];

          return (
            <Paper key={reaction.id} p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={600}>Reaction {index + 1}</Text>
                  {reactions.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => onRemoveReaction(reaction.id)}
                      aria-label={`Remove reaction ${index + 1}`}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  )}
                </Group>

                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Select the service
                  </Text>
                  <Select
                    placeholder="Choose a service"
                    required
                    value={reaction.service}
                    onChange={(val) => {
                      if (val) {
                        onReactionServiceChange(reaction.id, val);
                      }
                    }}
                    data={services.map((s) => ({
                      value: s.key,
                      label: s.name,
                    }))}
                    searchable
                    aria-label={`Service for reaction ${index + 1}`}
                  />
                </div>

                {reaction.service && !isServiceConnected(reaction.service) && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Service not connected"
                    color="yellow"
                  >
                    <Text size="sm" mb="sm">
                      You must connect your{' '}
                      {services.find((s) => s.key === reaction.service)?.name} account to
                      use this action.
                    </Text>
                    <Button
                      size="xs"
                      onClick={() => onConnectService(reaction.service!)}
                    >
                      Connect {services.find((s) => s.key === reaction.service)?.name}
                    </Button>
                  </Alert>
                )}

                {reaction.service && isServiceConnected(reaction.service) && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Choose the action to perform
                    </Text>
                    {reactionActionsForService.length === 0 ? (
                      <Alert color="blue">Loading available actions...</Alert>
                    ) : (
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        {reactionActionsForService.map((action) => {
                          const isSelected = reaction.actionId === action.id;
                          return (
                            <Card
                              key={action.id}
                              padding="md"
                              radius="md"
                              withBorder
                              style={{
                                cursor: 'pointer',
                                borderColor: isSelected ? '#228be6' : undefined,
                                borderWidth: isSelected ? 2 : 1,
                              }}
                              onClick={() => onReactionActionChange(reaction.id, action.id)}
                              role="button"
                              tabIndex={0}
                              aria-label={`Select action ${action.name}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  onReactionActionChange(reaction.id, action.id);
                                }
                              }}
                            >
                              <Group justify="space-between" mb="xs">
                                <Text fw={500}>{action.name}</Text>
                                {isSelected && (
                                  <Badge color="blue">Selected</Badge>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed">
                                {action.description || 'No description'}
                              </Text>
                            </Card>
                          );
                        })}
                      </SimpleGrid>
                    )}
                  </div>
                )}

                {reaction.actionId && fields.length > 0 && (
                  <div>
                    <Divider
                      label={
                        <Group gap="xs">
                          <IconSettings size={16} />
                          <Text size="sm">Parameters</Text>
                        </Group>
                      }
                      labelPosition="left"
                      my="md"
                    />
                    <Stack gap="md">
                      {fields.map((field) => (
                        <div key={field.name}>
                          {renderParameterField(
                            field,
                            reaction.params[field.name],
                            (value) => onReactionParamChange(reaction.id, field.name, value)
                          )}
                        </div>
                      ))}
                    </Stack>
                  </div>
                )}
              </Stack>
            </Paper>
          );
        })}

        <Button
          leftSection={<IconPlus size={18} />}
          variant="light"
          onClick={onAddReaction}
          fullWidth
        >
          Add a reaction
        </Button>
      </Stack>
    </Paper>
  );
}
