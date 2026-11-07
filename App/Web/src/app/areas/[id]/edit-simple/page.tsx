'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader, Center, Stack, Text, Container } from '@mantine/core';
import { getCurrentUser } from '@/services/authService';
import {
  updateAreaComplete,
  CreateAreaPayload,
  getAreaById,
} from '@/services/areasService';
import { SimpleAreaForm } from '@/components/ui/area-simple-steps';
import type { ActivationConfig } from '@/types';

interface TriggerData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
  activationConfig?: ActivationConfig;
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

export default function EditSimpleAreaPage() {
  const router = useRouter();
  const params = useParams();
  const areaId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<{
    areaName: string;
    areaDescription: string;
    triggers: TriggerData[];
    reactions: ReactionData[];
    links: LinkData[];
  } | undefined>();

  useEffect(() => {
    const checkAuthAndLoadArea = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const area = await getAreaById(areaId);
        if (!area) {
          router.push('/areas');
          return;
        }
        if (area.userId !== user.id) {
          router.push('/areas');
          return;
        }

        const loadedTriggers: TriggerData[] = [];
        if (area.actions && area.actions.length > 0) {
          for (const [index, action] of area.actions.entries()) {
            loadedTriggers.push({
              id: action.id || `trigger-${index}`,
              service: action.serviceKey || null,
              actionId: action.actionDefinitionId,
              params: action.parameters || {},
              activationConfig: action.activationConfig || { type: 'webhook' },
            });
          }
        }

        if (loadedTriggers.length === 0) {
          loadedTriggers.push({
            id: 'trigger-initial',
            service: null,
            actionId: null,
            params: {},
            activationConfig: { type: 'webhook' }
          });
        }

        const loadedReactions: ReactionData[] = [];
        if (area.reactions && area.reactions.length > 0) {
          for (const [index, reaction] of area.reactions.entries()) {
            loadedReactions.push({
              id: reaction.id || `reaction-${index}`,
              service: reaction.serviceKey || null,
              actionId: reaction.actionDefinitionId,
              params: reaction.parameters || {},
            });
          }
        }

        if (loadedReactions.length === 0) {
          loadedReactions.push({
            id: 'reaction-initial',
            service: null,
            actionId: null,
            params: {}
          });
        }

        const loadedLinks: LinkData[] = [];
        if (area.links && area.links.length > 0) {
          area.links.forEach((link, index) => {
            loadedLinks.push({
              id: `link-${link.sourceActionInstanceId}-${link.targetActionInstanceId}-${index}`,
              sourceId: link.sourceActionInstanceId,
              targetId: link.targetActionInstanceId,
              linkType: (link.linkType as 'chain' | 'conditional' | 'parallel' | 'sequential') || 'chain',
              mapping: link.mapping as Record<string, string> | undefined,
              order: link.order || index,
            });
          });
        }

        setInitialData({
          areaName: area.name,
          areaDescription: area.description || '',
          triggers: loadedTriggers,
          reactions: loadedReactions,
          links: loadedLinks,
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load area:', err);
        router.push('/areas');
      }
    };

    if (areaId) {
      checkAuthAndLoadArea();
    }
  }, [areaId, router]);

  const handleSubmit = async (payload: CreateAreaPayload) => {
    await updateAreaComplete(areaId, payload);
  };

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Center style={{ minHeight: '400px' }}>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text>Loading area details...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <SimpleAreaForm
      mode="edit"
      areaId={areaId}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}
