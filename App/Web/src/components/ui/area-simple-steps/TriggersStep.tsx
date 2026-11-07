'use client';

import React from 'react';
import { Paper, Stack, Text, Select, Card, Group, Badge, SimpleGrid, Alert, Button, ActionIcon, Divider } from '@mantine/core';
import { IconSettings, IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import type { BackendService, Action, FieldData, ActivationConfig } from '@/types';
import type { ServiceConnectionStatus } from '@/services/serviceConnectionService';

interface TriggerData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
  activationConfig?: ActivationConfig;
}

interface TriggersStepProps {
  services: BackendService[];
  serviceConnectionStatuses: Record<string, ServiceConnectionStatus>;
  triggers: TriggerData[];
  actionTriggers: Action[];
  onTriggerServiceChange: (triggerId: string, service: string) => void;
  onTriggerActionChange: (triggerId: string, actionId: string) => void;
  onTriggerParamChange: (triggerId: string, paramName: string, value: unknown) => void;
  onTriggerActivationConfigChange: (triggerId: string, config: ActivationConfig) => void;
  onAddTrigger: () => void;
  onRemoveTrigger: (triggerId: string) => void;
  onConnectService: (serviceKey: string) => void;
  renderParameterField: (
    field: FieldData,
    value: unknown,
    onChange: (value: unknown) => void
  ) => React.ReactNode;
  getActionFields: (actionId: string) => FieldData[];
}

export function TriggersStep({ services, serviceConnectionStatuses, triggers, actionTriggers, onTriggerServiceChange, onTriggerActionChange, onTriggerParamChange, onTriggerActivationConfigChange, onAddTrigger, onRemoveTrigger, onConnectService, renderParameterField, getActionFields }: TriggersStepProps) {
  const isServiceConnected = (serviceKey: string): boolean => {
    const status = serviceConnectionStatuses[serviceKey];
    return status?.isConnected === true;
  };

  const renderActivationConfigEditor = (trigger: TriggerData) => {
    const config = trigger.activationConfig || { type: 'webhook' };

    return (
      <div>
        <Text size="sm" fw={500} mb="xs">
          Activation Type
        </Text>
        <Select
          value={config.type}
          onChange={(val) => {
            if (val) {
              onTriggerActivationConfigChange(trigger.id, {
                type: val as ActivationConfig['type']
              });
            }
          }}
          data={[
            { value: 'webhook', label: 'Webhook - Triggered by external events' },
            { value: 'poll', label: 'Poll - Check periodically for changes' },
          ]}
        />
        {config.type === 'cron' && (
          <div style={{ marginTop: '12px' }}>
            <Text size="sm" fw={500} mb="xs">
              Cron Expression
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              Example: */5 * * * * (every 5 minutes)
            </Text>
            {renderParameterField(
              {
                name: 'cron_expression',
                mandatory: true,
                type: 'text',
                description: 'Cron expression for scheduling',
                placeholder: '*/5 * * * *',
              },
              config.cron_expression || '',
              (value) => {
                onTriggerActivationConfigChange(trigger.id, {
                  ...config,
                  cron_expression: value as string,
                });
              }
            )}
          </div>
        )}

        {config.type === 'poll' && (
          <div style={{ marginTop: '12px' }}>
            <Text size="sm" fw={500} mb="xs">
              Poll Interval (seconds)
            </Text>
            {renderParameterField(
              {
                name: 'poll_interval',
                mandatory: true,
                type: 'number',
                description: 'How often to check for changes',
                placeholder: '60',
                minimum: 30,
              },
              config.poll_interval || 60,
              (value) => {
                onTriggerActivationConfigChange(trigger.id, {
                  ...config,
                  poll_interval: value as number,
                });
              }
            )}
          </div>
        )}

        {config.type === 'webhook' && (
          <Alert color="blue" mt="xs">
            <Text size="sm">
              A webhook URL will be generated after creating the AREA. You can use it to
              trigger this action from external services.
            </Text>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Stack gap="lg">
        <div>
          <Text size="lg" fw={600} mb="xs">
            Configure Triggers
          </Text>
          <Text size="sm" c="dimmed">
            Add one or more triggers. Your AREA will execute when any of these triggers
            activate.
          </Text>
        </div>

        {triggers.map((trigger, index) => {
          const triggerActionsForService = trigger.service
            ? actionTriggers.filter((a) => {
                return a.serviceKey === trigger.service && a.isEventCapable;
              })
            : [];

          const fields = trigger.actionId ? getActionFields(trigger.actionId) : [];

          return (
            <Paper key={trigger.id} p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text fw={600}>Trigger {index + 1}</Text>
                    {trigger.activationConfig && (
                      <Badge size="sm" color="blue" variant="light">
                        {trigger.activationConfig.type}
                      </Badge>
                    )}
                  </Group>
                  {triggers.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => onRemoveTrigger(trigger.id)}
                      aria-label={`Remove trigger ${index + 1}`}
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
                    placeholder="Choose a service for the trigger"
                    required
                    value={trigger.service}
                    onChange={(val) => {
                      if (val) {
                        onTriggerServiceChange(trigger.id, val);
                      }
                    }}
                    data={services.map((s) => ({
                      value: s.key,
                      label: s.name,
                    }))}
                    searchable
                    aria-label={`Service for trigger ${index + 1}`}
                  />
                </div>

                {trigger.service && !isServiceConnected(trigger.service) && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Service not connected"
                    color="yellow"
                  >
                    <Text size="sm" mb="sm">
                      You must connect your{' '}
                      {services.find((s) => s.key === trigger.service)?.name} account to
                      use this trigger.
                    </Text>
                    <Button
                      size="xs"
                      onClick={() => onConnectService(trigger.service!)}
                    >
                      Connect {services.find((s) => s.key === trigger.service)?.name}
                    </Button>
                  </Alert>
                )}

                {trigger.service && isServiceConnected(trigger.service) && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Choose an event to trigger your AREA
                    </Text>
                    {triggerActionsForService.length === 0 ? (
                      <Alert color="blue">Loading available triggers...</Alert>
                    ) : (
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        {triggerActionsForService.map((triggerAction) => {
                          const isSelected = trigger.actionId === triggerAction.id;
                          return (
                            <Card
                              key={triggerAction.id}
                              padding="md"
                              radius="md"
                              withBorder
                              style={{
                                cursor: 'pointer',
                                borderColor: isSelected ? '#228be6' : undefined,
                                borderWidth: isSelected ? 2 : 1,
                              }}
                              onClick={() => onTriggerActionChange(trigger.id, triggerAction.id)}
                              role="button"
                              tabIndex={0}
                              aria-label={`Select trigger ${triggerAction.name}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  onTriggerActionChange(trigger.id, triggerAction.id);
                                }
                              }}
                            >
                              <Group justify="space-between" mb="xs">
                                <Text fw={500}>{triggerAction.name}</Text>
                                {isSelected && (
                                  <Badge color="blue">Selected</Badge>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed">
                                {triggerAction.description || 'No description'}
                              </Text>
                            </Card>
                          );
                        })}
                      </SimpleGrid>
                    )}
                  </div>
                )}

                {trigger.actionId && (
                  <>
                    <Divider
                      label={
                        <Group gap="xs">
                          <IconSettings size={16} />
                          <Text size="sm">Activation Configuration</Text>
                        </Group>
                      }
                      labelPosition="left"
                      my="md"
                    />
                    {renderActivationConfigEditor(trigger)}
                  </>
                )}

                {trigger.actionId && fields.length > 0 && (
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
                            trigger.params[field.name],
                            (value) => onTriggerParamChange(trigger.id, field.name, value)
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
          onClick={onAddTrigger}
          fullWidth
        >
          Add another trigger
        </Button>

        {triggers.length > 1 && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            <Text size="sm">
              You have {triggers.length} triggers configured. Your AREA will execute when
              <strong> any</strong> of these triggers activate.
            </Text>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
