'use client';

import React from 'react';
import { Paper, Stack, Text, Badge } from '@mantine/core';
import type { BackendService, Action, ActivationConfig } from '@/types';

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface TriggerData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
  activationConfig?: ActivationConfig;
}

interface LinkData {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: 'chain' | 'conditional' | 'parallel' | 'sequential';
  mapping?: Record<string, string>;
  order: number;
}

interface ResumeStepProps {
  areaName: string;
  areaDescription: string;
  triggers: TriggerData[];
  reactions: ReactionData[];
  links?: LinkData[];
  services: BackendService[];
  actionTriggers: Action[];
  reactionActions: Action[];
}

export function ResumeStep({
  areaName,
  areaDescription,
  triggers,
  reactions,
  links = [],
  services,
  actionTriggers,
  reactionActions,
}: ResumeStepProps) {
  const getLinkTypeColor = (type: string) => {
    switch (type) {
      case 'chain':
        return 'blue';
      case 'conditional':
        return 'orange';
      case 'parallel':
        return 'green';
      case 'sequential':
        return 'violet';
      default:
        return 'gray';
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Stack gap="lg">
        <div>
          <Text size="xl" fw={700} mb="md">
            Summary
          </Text>
          <Text c="dimmed">
            Review the information before creating your AREA
          </Text>
        </div>

        <div>
          <Text fw={600} mb="xs">
            AREA Name
          </Text>
          <Text>{areaName}</Text>
        </div>

        {areaDescription && (
          <div>
            <Text fw={600} mb="xs">
              Description
            </Text>
            <Text>{areaDescription}</Text>
          </div>
        )}

        <div>
          <Text fw={600} mb="xs">
            Triggers ({triggers.length})
          </Text>
          {triggers.map((trigger, index) => {
            const service = services.find((s) => s.key === trigger.service);
            const action = actionTriggers.find((a) => a.id === trigger.actionId);
            return (
              <Paper key={trigger.id} p="sm" withBorder mb="xs">
                <Stack gap="xs">
                  <Text size="sm">
                    {index + 1}. Service: {service?.name} - Event: {action?.name}
                  </Text>
                  {trigger.activationConfig && (
                    <Badge size="sm" color="blue" variant="light">
                      {trigger.activationConfig.type}
                    </Badge>
                  )}
                  {Object.keys(trigger.params).length > 0 && (
                    <Text size="xs" c="dimmed">
                      {Object.keys(trigger.params).length} parameter(s) configured
                    </Text>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </div>

        <div>
          <Text fw={600} mb="xs">
            Reactions ({reactions.length})
          </Text>
          {reactions.map((reaction, index) => {
            const service = services.find((s) => s.key === reaction.service);
            const action = reactionActions.find((a) => a.id === reaction.actionId);
            return (
              <Paper key={reaction.id} p="sm" withBorder mb="xs">
                <Text size="sm">
                  {index + 1}. Service: {service?.name} - Action: {action?.name}
                </Text>
                {Object.keys(reaction.params).length > 0 && (
                  <Text size="xs" c="dimmed">
                    {Object.keys(reaction.params).length} parameter(s) configured
                  </Text>
                )}
              </Paper>
            );
          })}
        </div>

        {links.length > 0 && (
          <div>
            <Text fw={600} mb="xs">
              Links ({links.length})
            </Text>
            {links.map((link, index) => {
              const getSourceName = (sourceId: string) => {
                const triggerIndex = triggers.findIndex(t => t.id === sourceId);
                if (triggerIndex !== -1) {
                  const trigger = triggers[triggerIndex];
                  const action = actionTriggers.find(a => a.id === trigger.actionId);
                  return `Trigger ${triggerIndex + 1}: ${action?.name || 'Unknown'}`;
                }
                if (sourceId === 'trigger' && triggers.length > 0) {
                  const action = actionTriggers.find(a => a.id === triggers[0].actionId);
                  return `Trigger: ${action?.name || 'Unknown'}`;
                }
                const reactionIndex = reactions.findIndex(r => r.id === sourceId);
                const reaction = reactions[reactionIndex];
                if (reaction) {
                  const action = reactionActions.find(a => a.id === reaction.actionId);
                  return `Reaction ${reactionIndex + 1}: ${action?.name || 'Unknown'}`;
                }
                return 'Unknown';
              };

              const getTargetName = (targetId: string) => {
                const reactionIndex = reactions.findIndex(r => r.id === targetId);
                const reaction = reactions[reactionIndex];
                if (reaction) {
                  const action = reactionActions.find(a => a.id === reaction.actionId);
                  return `Reaction ${reactionIndex + 1}: ${action?.name || 'Unknown'}`;
                }
                return 'Unknown';
              };

              return (
                <Paper key={link.id} p="sm" withBorder mb="xs">
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Link {index + 1}
                    </Text>
                    <Text size="xs" c="dimmed">
                      From: {getSourceName(link.sourceId)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      To: {getTargetName(link.targetId)}
                    </Text>
                    <Badge size="sm" color={getLinkTypeColor(link.linkType)}>
                      {link.linkType}
                    </Badge>
                  </Stack>
                </Paper>
              );
            })}
          </div>
        )}
      </Stack>
    </Paper>
  );
}
