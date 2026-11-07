'use client';

import React from 'react';
import { Paper, Stack, Text, Card, Group, Button, Select, ActionIcon, Alert, Divider } from '@mantine/core';
import { IconPlus, IconTrash, IconLink, IconAlertCircle } from '@tabler/icons-react';
import type { Action } from '@/types';

interface TriggerData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface LinkData {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: 'chain' | 'conditional' | 'parallel' | 'sequential';
  mapping?: Record<string, string>;
  order: number;
}

interface LinksStepProps {
  triggers: TriggerData[];
  reactions: ReactionData[];
  links: LinkData[];
  actionTriggers: Action[];
  reactionActions: Action[];
  onAddLink: () => void;
  onRemoveLink: (linkId: string) => void;
  onUpdateLink: (linkId: string, updates: Partial<LinkData>) => void;
}

export function LinksStep({ triggers, reactions, links, actionTriggers, reactionActions, onAddLink, onRemoveLink, onUpdateLink }: LinksStepProps) {
  const getSourceOptions = React.useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const seenValues = new Set<string>();
    triggers.forEach((trigger, index) => {
      if (trigger.actionId && !seenValues.has(trigger.id)) {
        const action = actionTriggers.find(a => a.id === trigger.actionId);
        options.push({
          value: trigger.id,
          label: `Trigger ${index + 1}: ${action?.name || 'Unknown'}`,
        });
        seenValues.add(trigger.id);
      }
    });
    reactions.forEach((reaction, index) => {
      if (reaction.actionId && !seenValues.has(reaction.id)) {
        const action = reactionActions.find(a => a.id === reaction.actionId);
        options.push({
          value: reaction.id,
          label: `Reaction ${index + 1}: ${action?.name || 'Unknown'}`,
        });
        seenValues.add(reaction.id);
      }
    });
    return options;
  }, [triggers, reactions, actionTriggers, reactionActions]);

  const getTargetOptions = React.useCallback((sourceId: string) => {
    const seenValues = new Set<string>();
    return reactions
      .filter(r => r.id !== sourceId && r.actionId)
      .map((reaction) => {
        const action = reactionActions.find(a => a.id === reaction.actionId);
        const originalIndex = reactions.findIndex(r => r.id === reaction.id);
        return {
          value: reaction.id,
          label: `Reaction ${originalIndex + 1}: ${action?.name || 'Unknown'}`,
        };
      })
      .filter(option => {
        if (seenValues.has(option.value)) {
          return false;
        }
        seenValues.add(option.value);
        return true;
      });
  }, [reactions, reactionActions]);

  const canAddLink = React.useMemo(() => {
    const configuredTriggers = triggers.filter(t => t.actionId).length;
    const configuredReactions = reactions.filter(r => r.actionId).length;
    return configuredTriggers > 0 && configuredReactions > 0;
  }, [triggers, reactions]);

  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Stack gap="lg">
        <div>
          <Text size="lg" fw={600} mb="xs">
            Configure Links Between Actions
          </Text>
          <Text size="sm" c="dimmed">
            Define how data flows between your trigger and reactions. Links allow you to
            pass data from one action to another or create conditional flows.
          </Text>
        </div>

        {!canAddLink && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Not enough actions"
            color="blue"
          >
            You need at least one configured reaction to create links. Links define how
            data flows between your trigger and reactions.
          </Alert>
        )}

        {links.length === 0 && canAddLink && (
          <Alert icon={<IconLink size={16} />} color="blue">
            No links configured yet. By default, all reactions will execute after the
            trigger. Add links to create custom data flows or conditional logic.
          </Alert>
        )}

        {links.map((link, index) => {
          const sourceOptions = getSourceOptions;
          const targetOptions = link.sourceId ? getTargetOptions(link.sourceId) : [];

          return (
            <Card key={link.id} padding="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconLink size={18} />
                    <Text fw={600}>Link {index + 1}</Text>
                  </Group>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => onRemoveLink(link.id)}
                    aria-label={`Remove link ${index + 1}`}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>

                <Select
                  label="Source"
                  placeholder="Select source action"
                  required
                  value={link.sourceId}
                  onChange={(val) => {
                    if (val) {
                      onUpdateLink(link.id, { sourceId: val, targetId: '' });
                    }
                  }}
                  data={sourceOptions}
                  description="The action that will provide data"
                />

                <Select
                  label="Target"
                  placeholder="Select target action"
                  required
                  value={link.targetId || ''}
                  onChange={(val) => {
                    if (val) {
                      onUpdateLink(link.id, { targetId: val });
                    }
                  }}
                  data={targetOptions}
                  description="The action that will receive data"
                  disabled={!link.sourceId}
                  clearable
                />

                <Select
                  label="Link Type"
                  placeholder="Select link type"
                  required
                  value={link.linkType}
                  onChange={(val) => {
                    if (val) {
                      onUpdateLink(link.id, {
                        linkType: val as 'chain' | 'conditional' | 'parallel' | 'sequential',
                      });
                    }
                  }}
                  data={[
                    {
                      value: 'chain',
                      label: 'Chain - Sequential execution with data passing',
                    },
                    {
                      value: 'conditional',
                      label: 'Conditional - Execute based on conditions',
                    },
                    {
                      value: 'parallel',
                      label: 'Parallel - Execute simultaneously',
                    },
                    {
                      value: 'sequential',
                      label: 'Sequential - Execute in order',
                    },
                  ]}
                  description="How the target action should be triggered"
                />

                {link.linkType && (
                  <div>
                    <Divider
                      label={
                        <Text size="sm" fw={500}>
                          Link Configuration
                        </Text>
                      }
                      labelPosition="left"
                      my="xs"
                    />
                    <Alert color="gray" icon={<IconAlertCircle size={16} />}>
                      <Text size="xs">
                        {link.linkType === 'chain' &&
                          'Data from the source will be passed to the target action.'}
                        {link.linkType === 'conditional' &&
                          'Target will execute only if conditions are met.'}
                        {link.linkType === 'parallel' &&
                          'Target will execute at the same time as the source.'}
                        {link.linkType === 'sequential' &&
                          'Target will execute after the source completes.'}
                      </Text>
                    </Alert>
                  </div>
                )}
              </Stack>
            </Card>
          );
        })}

        <Button
          leftSection={<IconPlus size={18} />}
          variant="light"
          onClick={onAddLink}
          fullWidth
          disabled={!canAddLink}
        >
          Add a Link
        </Button>

        {links.length > 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            <Text fw={500} mb="xs">
              Links Summary
            </Text>
            <Text>
              You have configured {links.length} link{links.length > 1 ? 's' : ''}. These
              define the flow of data and execution order between your actions.
            </Text>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
