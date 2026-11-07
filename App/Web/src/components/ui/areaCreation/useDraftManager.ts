import { useState, useEffect, useCallback } from 'react';
import {
  saveDraft,
  getDraft,
  getUserDrafts,
  getEditDraft,
  deleteDraft,
  AreaDraft,
  AreaDraftResponse
} from '../../../services/areaDraftService';
import { CreateAreaPayload } from '../../../services/areasService';
import { ServiceData, BackendArea, BackendAction, BackendReaction, ConnectionData } from '../../../types';

const DRAFT_AGE_THRESHOLD_MS = 15 * 60 * 1000;

/**
 * Generates a UUID using crypto.randomUUID() with a fallback for environments
 * where it's not available (e.g., older browsers or non-secure contexts).
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface UseDraftManagerProps {
  areaName: string;
  areaDescription: string;
  servicesState: ServiceData[];
  connections: ConnectionData[];
  draftId?: string;
  areaId?: string;
  isNewArea: boolean;
  transformServiceDataToPayload: (services: ServiceData[], name: string, description: string, connections: ConnectionData[]) => Promise<CreateAreaPayload>;
  transformBackendDataToServiceData: (area: BackendArea) => Promise<ServiceData[]>;
  onDraftLoaded: (data: {
    name: string;
    description: string;
    services: ServiceData[];
    connections: ConnectionData[];
    draftId: string;
    savedAt: string;
  }) => void;
  onDraftRejected: () => void;
  onShowDraftModal: (draftData: { draftId: string; name: string; savedAt: string }, onAccept: () => void, onReject: () => void) => void;
}

export function useDraftManager({
  areaName,
  areaDescription,
  servicesState,
  connections,
  draftId,
  areaId,
  isNewArea,
  transformServiceDataToPayload,
  transformBackendDataToServiceData,
  onDraftLoaded,
  onDraftRejected,
  onShowDraftModal,
}: UseDraftManagerProps) {
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId);
  const [draftSavedAt, setDraftSavedAt] = useState<string | undefined>(undefined);
  const [hasShownModal, setHasShownModal] = useState(false);

  const saveDraftManually = useCallback(async () => {
    if (!areaName && servicesState.length === 0) {
      return;
    }

    try {
      const payload = await transformServiceDataToPayload(servicesState, areaName || 'Untitled Draft', areaDescription, connections);

      const actionsCount = payload.actions?.length || 0;

      const serviceIdToIndexMap = new Map<string, number>();
      servicesState.forEach((service, index) => {
        serviceIdToIndexMap.set(service.id, index);
      });

      const transformedConnections = connections.map(conn => {
        const sourceIndex = serviceIdToIndexMap.get(conn.sourceId);
        const targetIndex = serviceIdToIndexMap.get(conn.targetId);

        let sourceServiceId = conn.sourceId;
        let targetServiceId = conn.targetId;

        if (sourceIndex !== undefined && targetIndex !== undefined) {
          if (sourceIndex < actionsCount) {
            sourceServiceId = `action_${sourceIndex}`;
          } else {
            sourceServiceId = `reaction_${sourceIndex - actionsCount}`;
          }

          if (targetIndex < actionsCount) {
            targetServiceId = `action_${targetIndex}`;
          } else {
            targetServiceId = `reaction_${targetIndex - actionsCount}`;
          }
        }

        return {
          id: conn.id,
          sourceServiceId,
          targetServiceId,
          linkType: conn.linkData.type,
          mapping: conn.linkData.mapping || {},
          condition: conn.linkData.condition || {},
          order: conn.linkData.order || 0,
        };
      });

      const actionsWithIds = (payload.actions || []).map((a) => ({
        ...a,
        id: generateUUID(),
        parameters: a.parameters || {},
        activationConfig: (a.activationConfig as unknown as BackendAction['activationConfig']) || { type: 'manual' as const },
      })) as BackendAction[];
      const reactionsWithIds = (payload.reactions || []).map((r) => ({
        ...r,
        id: generateUUID(),
        parameters: r.parameters || {},
        mapping: (r.mapping || {}) as Record<string, string>,
        condition: r.condition as unknown as BackendReaction['condition'],
        order: r.order || 0,
        continue_on_error: false,
        activationConfig: r.activationConfig as unknown as BackendReaction['activationConfig'],
      })) as BackendReaction[];
      const draftPayload: AreaDraft = {
        name: payload.name,
        description: payload.description || '',
        actions: actionsWithIds,
        reactions: reactionsWithIds,
        connections: transformedConnections,
        layoutMode: 'vertical',
        draftId: currentDraftId,
        savedAt: draftSavedAt,
      };
      const savedDraftId = await saveDraft(draftPayload, areaId);
      setCurrentDraftId(savedDraftId);
      return savedDraftId;
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  }, [areaName, areaDescription, servicesState, connections, currentDraftId, draftSavedAt, transformServiceDataToPayload, areaId]);

  const loadDraftFromData = useCallback(async (draft: AreaDraftResponse) => {
    const actionPattern = /^action_(\d+)$/;
    const reactionPattern = /^reaction_(\d+)$/;

    const mockArea: BackendArea = {
      id: draft.draftId,
      name: draft.name,
      description: draft.description,
      enabled: true,
      userId: draft.userId,
      userEmail: '',
      actions: draft.actions,
      reactions: draft.reactions,
      createdAt: draft.savedAt,
      updatedAt: draft.savedAt,
    };

    const transformedServices = await transformBackendDataToServiceData(mockArea);

    const actionsCount = draft.actions?.length || 0;

    const transformedConnections: ConnectionData[] = draft.connections
      ? draft.connections.map((conn) => {
          let sourceId = conn.sourceServiceId;
          let targetId = conn.targetServiceId;

          const sourceActionMatch = conn.sourceServiceId.match(actionPattern);
          const sourceReactionMatch = conn.sourceServiceId.match(reactionPattern);
          const targetActionMatch = conn.targetServiceId.match(actionPattern);
          const targetReactionMatch = conn.targetServiceId.match(reactionPattern);

          if (sourceActionMatch) {
            const index = parseInt(sourceActionMatch[1], 10);
            if (transformedServices[index]) {
              sourceId = transformedServices[index].id;
            }
          } else if (sourceReactionMatch) {
            const index = parseInt(sourceReactionMatch[1], 10);
            const serviceIndex = actionsCount + index;
            if (transformedServices[serviceIndex]) {
              sourceId = transformedServices[serviceIndex].id;
            }
          }

          if (targetActionMatch) {
            const index = parseInt(targetActionMatch[1], 10);
            if (transformedServices[index]) {
              targetId = transformedServices[index].id;
            }
          } else if (targetReactionMatch) {
            const index = parseInt(targetReactionMatch[1], 10);
            const serviceIndex = actionsCount + index;
            if (transformedServices[serviceIndex]) {
              targetId = transformedServices[serviceIndex].id;
            }
          }

          return {
            id: conn.id || generateUUID(),
            sourceId,
            targetId,
            linkData: {
              type: conn.linkType,
              mapping: conn.mapping || {},
              condition: conn.condition || {},
              order: conn.order,
            }
          };
        })
      : [];

    setCurrentDraftId(draft.draftId);
    setDraftSavedAt(draft.savedAt);

    onDraftLoaded({
      name: draft.name,
      description: draft.description,
      services: transformedServices,
      connections: transformedConnections,
      draftId: draft.draftId,
      savedAt: draft.savedAt,
    });
  }, [transformBackendDataToServiceData, onDraftLoaded]);

  useEffect(() => {
    const loadDraftData = async () => {
      if (draftId) {
        try {
          const draft = await getDraft(draftId);
          if (draft) {
            await loadDraftFromData(draft);
          }
        } catch (error) {
          console.error('Error loading draft data:', error);
        }
      } else if (areaId && !isNewArea) {
      } else if (isNewArea && !areaId && !hasShownModal) {
        try {
          const drafts = await getUserDrafts();
          if (drafts && drafts.length > 0) {
            const latestDraft = drafts.sort((a, b) =>
              new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
            )[0];

            setHasShownModal(true);

            const draftAge = Date.now() - new Date(latestDraft.savedAt).getTime();

            if (draftAge > DRAFT_AGE_THRESHOLD_MS) {
              const handleAccept = async () => {
                await loadDraftFromData(latestDraft);
              };

              const handleReject = async () => {
                try {
                  await deleteDraft(latestDraft.draftId);
                  onDraftRejected();
                } catch (error) {
                  console.error('Error deleting draft:', error);
                }
              };

              onShowDraftModal(
                {
                  draftId: latestDraft.draftId,
                  name: latestDraft.name,
                  savedAt: latestDraft.savedAt,
                },
                handleAccept,
                handleReject
              );
            } else {
              await loadDraftFromData(latestDraft);
            }
          }
        } catch (error) {
          console.error('Error loading user drafts:', error);
        }
      }
    };

    loadDraftData();
  }, [draftId, isNewArea, areaId, hasShownModal, loadDraftFromData, onShowDraftModal, onDraftRejected]);

  const handleDeleteDraft = useCallback(async () => {
    if (currentDraftId) {
      try {
        await deleteDraft(currentDraftId);
        setCurrentDraftId(undefined);
        setDraftSavedAt(undefined);
      } catch (error) {
        console.error('Error deleting draft:', error);
      }
    }
  }, [currentDraftId]);

  return {
    currentDraftId,
    setCurrentDraftId,
    draftSavedAt,
    setDraftSavedAt,
    handleDeleteDraft,
    saveDraftManually,
  };
}
