'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, Center, Stack, Text } from '@mantine/core';
import { getCurrentUser } from '@/services/authService';
import { createAreaWithActions, CreateAreaPayload } from '@/services/areasService';
import { SimpleAreaForm } from '@/components/ui/area-simple-steps';
import type { ActivationConfig } from '@/types';

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

interface SimpleDraft {
  areaName: string;
  areaDescription: string;
  triggers: TriggerData[];
  reactions: ReactionData[];
  links: LinkData[];
  activeStep: number;
  savedAt: string;
}

const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

const getDraftKey = (userId: string) => `simple-area-draft-${userId}`;

export default function CreateSimpleAreaPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<{
    areaName: string;
    areaDescription: string;
    triggers: TriggerData[];
    reactions: ReactionData[];
    links: LinkData[];
  } | undefined>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setCurrentUserId(user.id);
        try {
          const draftKey = getDraftKey(user.id);
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            const draft: SimpleDraft = JSON.parse(savedDraft);
            const savedAt = new Date(draft.savedAt);
            const now = new Date();
            if (now.getTime() - savedAt.getTime() < DRAFT_EXPIRY_MS) {
              const migratedLinks = (draft.links || []).map((link, index) => ({
                ...link,
                order: link.order !== undefined ? link.order : index,
              }));
              setInitialData({
                areaName: draft.areaName,
                areaDescription: draft.areaDescription,
                triggers: draft.triggers || [
                  { id: 'trigger-initial', service: null, actionId: null, params: {}, activationConfig: { type: 'webhook' } }
                ],
                reactions: draft.reactions || [
                  { id: 'reaction-initial', service: null, actionId: null, params: {} }
                ],
                links: migratedLinks,
              });
            } else {
              localStorage.removeItem(draftKey);
            }
          }
        } catch (err) {
          console.error('Failed to load draft:', err);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting current user:', error);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (payload: CreateAreaPayload) => {
    await createAreaWithActions(payload);
    if (currentUserId) {
      localStorage.removeItem(getDraftKey(currentUserId));
    }
  };

  const handleClearDraft = () => {
    if (currentUserId) {
      localStorage.removeItem(getDraftKey(currentUserId));
      setInitialData({
        areaName: '',
        areaDescription: '',
        triggers: [
          { id: 'trigger-initial', service: null, actionId: null, params: {}, activationConfig: { type: 'webhook' } }
        ],
        reactions: [
          { id: 'reaction-initial', service: null, actionId: null, params: {} }
        ],
        links: [],
      });
    }
  };

  const hasDraft = useMemo(() => {
    return Boolean(
      initialData?.areaName ||
      initialData?.areaDescription ||
      initialData?.triggers.some(t => t.service)
    );
  }, [initialData]);

  if (isLoading) {
    return (
      <Center style={{ minHeight: '400px' }}>
        <Stack align="center" gap="md">
          <Loader size="xl" />
          <Text>Loading...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <SimpleAreaForm
      mode="create"
      initialData={initialData}
      onSubmit={handleSubmit}
      onClearDraft={handleClearDraft}
      hasDraft={hasDraft}
      currentUserId={currentUserId}
      draftKey={currentUserId ? getDraftKey(currentUserId) : undefined}
    />
  );
}
