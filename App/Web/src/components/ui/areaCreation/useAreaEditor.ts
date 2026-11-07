import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { notifications } from '@mantine/notifications';
import {
  getAreaById,
  updateAreaComplete,
  createAreaWithActions,
  CreateAreaPayload,
  getServices,
  runAreaById,
  getActionDefinitionById
} from '../../../services/areasService';
import { ServiceState, ServiceData, BackendArea, BackendService, ConnectionData, ActivationConfig, LinkData} from '../../../types';
import { useDraftManager } from './useDraftManager';

const WAIT_NOTIFICATION_TIMEOUT = 500;

let servicesCache: BackendService[] | null = null;
const transformBackendDataToServiceData = async (area: BackendArea): Promise<ServiceData[]> => {
  const serviceData: ServiceData[] = [];
  let serviceIndex = 0;
  const usedIds = new Set<string>();

  if (!servicesCache) {
    try {
      servicesCache = await getServices();
    } catch (error) {
      console.error('Error fetching services:', error);
      servicesCache = [];
    }
  }

  const findServiceInfoByActionDefinitionId = async (actionDefinitionId: string) => {
    try {
      const actionDefinition = await getActionDefinitionById(actionDefinitionId);

      if (actionDefinition && actionDefinition.serviceKey) {
        const service = servicesCache?.find(s => s.key === actionDefinition.serviceKey);

        if (service) {
          return {
            logo: service.iconLightUrl || service.iconDarkUrl || '/file.svg',
            serviceName: service.name,
            serviceKey: service.key,
            serviceId: service.id,
            actionDefinition
          };
        }

        return {
          logo: '/file.svg',
          serviceName: actionDefinition.serviceName,
          serviceKey: actionDefinition.serviceKey,
          serviceId: actionDefinition.serviceId,
          actionDefinition
        };
      }

      if (!servicesCache || servicesCache.length === 0) {
        console.warn('No services available for actionDefinitionId:', actionDefinitionId);
        return {
          logo: '/file.svg',
          serviceName: 'Unknown Service',
          serviceKey: 'unknown',
          serviceId: 'unknown',
          actionDefinition: null
        };
      }

      const defaultService = servicesCache.find(s => s.key === 'github') || servicesCache[0];

      if (defaultService) {
        return {
          logo: defaultService.iconLightUrl || defaultService.iconDarkUrl || '/file.svg',
          serviceName: defaultService.name,
          serviceKey: defaultService.key,
          serviceId: defaultService.id,
          actionDefinition: null
        };
      }

      return {
        logo: '/file.svg',
        serviceName: 'Unknown Service',
        serviceKey: 'unknown',
        serviceId: 'unknown',
        actionDefinition: null
      };
    } catch (error) {
      console.error('Error finding service info for actionDefinitionId:', actionDefinitionId, error);

      if (servicesCache && servicesCache.length > 0) {
        const defaultService = servicesCache.find(s => s.key === 'github') || servicesCache[0];
        if (defaultService) {
          return {
            logo: defaultService.iconLightUrl || defaultService.iconDarkUrl || '/file.svg',
            serviceName: defaultService.name,
            serviceKey: defaultService.key,
            serviceId: defaultService.id,
            actionDefinition: null
          };
        }
      }

      return {
        logo: '/file.svg',
        serviceName: 'Unknown Service',
        serviceKey: 'unknown',
        serviceId: 'unknown',
        actionDefinition: null
      };
    }
  };

  const actionsArray = Array.isArray(area.actions) ? area.actions : [];
  for (const [index, action] of actionsArray.entries()) {
    let actionDefinitionId = '';
    let actionName = 'Unnamed Action';
    let actionParameters = {};
    let actionId = '';
    let activationConfig: ActivationConfig = { type: 'webhook' };
    if ('actionDefinitionId' in action && typeof action.actionDefinitionId === 'string') {
      actionDefinitionId = action.actionDefinitionId;
      actionName = action.name || 'Unnamed Action';
      actionParameters = action.parameters || {};
      activationConfig = action.activationConfig || { type: 'webhook' };
      actionId = action.id;
      if (!actionId && area.links) {
        const linkForThisAction = area.links.find(link => link.sourceActionName === actionName);
        if (linkForThisAction) {
          actionId = linkForThisAction.sourceActionInstanceId;
        }
      }
      if (!actionId || usedIds.has(actionId)) {
        actionId = `action-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      }
      usedIds.add(actionId);
    } else {
      const rawAction = action as unknown as Record<string, unknown>;
      actionDefinitionId = String(rawAction.actionDefinitionId || '');
      actionName = String(rawAction.name || 'Unnamed Action');
      actionParameters = (rawAction.parameters as Record<string, unknown>) || {};
      activationConfig = (rawAction.activationConfig as ActivationConfig) || { type: 'webhook' };
      actionId = String(rawAction.id || '');
      if (!actionId && area.links) {
        const linkForThisAction = area.links.find(link => link.sourceActionName === actionName);
        if (linkForThisAction) {
          actionId = linkForThisAction.sourceActionInstanceId;
        }
      }
      if (!actionId || usedIds.has(actionId)) {
        actionId = `action-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      }
      usedIds.add(actionId);
    }

    if (actionDefinitionId) {
      const serviceInfo = await findServiceInfoByActionDefinitionId(actionDefinitionId);

      serviceData.push({
        id: actionId,
        logo: serviceInfo.logo,
        serviceName: serviceInfo.serviceName,
        serviceKey: serviceInfo.serviceKey,
        event: actionName,
        cardName: actionName,
        state: ServiceState.Success,
        actionId: 0,
        serviceId: serviceInfo.serviceId,
        actionDefinitionId: actionDefinitionId,
        fields: actionParameters,
        activationConfig: activationConfig,
        position: {
          x: 4500 + (serviceIndex % 3) * 320,
          y: 4500 + Math.floor(serviceIndex / 3) * 170
        }
      });
      serviceIndex++;
    } else {
      console.warn(`No actionDefinitionId found for action:`, action);
    }
  }

  const reactionsArray = Array.isArray(area.reactions) ? area.reactions : [];

  for (const [index, reaction] of reactionsArray.entries()) {
    let actionDefinitionId = '';
    let reactionName = 'Unnamed Reaction';
    let reactionParameters = {};
    let reactionId = '';
    let activationConfig: ActivationConfig = { type: 'chain' };

    if ('actionDefinitionId' in reaction && typeof reaction.actionDefinitionId === 'string') {
      actionDefinitionId = reaction.actionDefinitionId;
      reactionName = reaction.name || 'Unnamed Reaction';
      reactionParameters = reaction.parameters || {};
      activationConfig = reaction.activationConfig || { type: 'chain' };
      reactionId = reaction.id;
      if (!reactionId && area.links) {
        const linkForThisReaction = area.links.find(link => link.targetActionName === reactionName);
        if (linkForThisReaction)
          reactionId = linkForThisReaction.targetActionInstanceId;
      }
      if (!reactionId || usedIds.has(reactionId)) {
        reactionId = `reaction-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      }
      usedIds.add(reactionId);
    } else {
      const rawReaction = reaction as unknown as Record<string, unknown>;
      actionDefinitionId = String(rawReaction.actionDefinitionId || '');
      reactionName = String(rawReaction.name || 'Unnamed Reaction');
      reactionParameters = (rawReaction.parameters as Record<string, unknown>) || {};
      activationConfig = (rawReaction.activationConfig as ActivationConfig) || { type: 'chain' };
      reactionId = String(rawReaction.id || '');
      if (!reactionId && area.links) {
        const linkForThisReaction = area.links.find(link => link.targetActionName === reactionName);
        if (linkForThisReaction)
          reactionId = linkForThisReaction.targetActionInstanceId;
      }
      if (!reactionId || usedIds.has(reactionId)) {
        reactionId = `reaction-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      }
      usedIds.add(reactionId);
    }

    if (actionDefinitionId) {
      const serviceInfo = await findServiceInfoByActionDefinitionId(actionDefinitionId);

      serviceData.push({
        id: reactionId,
        logo: serviceInfo.logo,
        serviceName: serviceInfo.serviceName,
        serviceKey: serviceInfo.serviceKey,
        event: reactionName,
        cardName: reactionName,
        state: ServiceState.Success,
        actionId: 0,
        serviceId: serviceInfo.serviceId,
        actionDefinitionId: actionDefinitionId,
        fields: reactionParameters,
        activationConfig: activationConfig,
        position: {
          x: 4500 + (serviceIndex % 3) * 320,
          y: 4500 + Math.floor(serviceIndex / 3) * 170
        }
      });
      serviceIndex++;
    } else {
      console.warn(`DEBUG - No actionDefinitionId found for reaction:`, reaction);
    }
  }

  return serviceData;
};

const extractConnectionsFromServices = (services: ServiceData[]): ConnectionData[] => {
  const connections: ConnectionData[] = [];

  services.forEach(service => {
    const params = service.fields as Record<string, unknown> || {};

    if (params._chainTargets && Array.isArray(params._chainTargets)) {
      params._chainTargets.forEach((targetId: unknown) => {
        if (typeof targetId === 'string') {
          connections.push({
            id: `conn-${service.id}-${targetId}`,
            sourceId: service.id,
            targetId: targetId,
            linkData: {
              type: 'chain',
              mapping: (params._chainMapping as Record<string, string>) || {},
              condition: {},
              order: 0,
            }
          });
        }
      });
    }

    if (params._chainSourceId && typeof params._chainSourceId === 'string') {
      const existingConn = connections.find(
        c => c.sourceId === params._chainSourceId && c.targetId === service.id
      );
      if (!existingConn) {
        connections.push({
          id: `conn-${params._chainSourceId}-${service.id}`,
          sourceId: params._chainSourceId as string,
          targetId: service.id,
          linkData: {
            type: 'chain',
            mapping: (params._chainMapping as Record<string, string>) || {},
            condition: {},
            order: 0,
          }
        });
      }
    }
  });

  return connections;
};

const transformServiceDataToPayload = async (services: ServiceData[], areaName: string, areaDescription: string, connections: ConnectionData[] = []): Promise<CreateAreaPayload> => {
  const actions: Array<{
    actionDefinitionId: string;
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    activationConfig?: Record<string, unknown>;
  }> = [];
  const reactions: Array<{
    actionDefinitionId: string;
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    mapping?: Record<string, unknown>;
    condition?: Record<string, unknown>;
    order?: number;
    activationConfig?: Record<string, unknown>;
  }> = [];
  const links: Array<{
    sourceActionDefinitionId?: string;
    targetActionDefinitionId?: string;
    mapping?: Record<string, string>;
    condition?: Record<string, unknown>;
    order?: number;
  }> = [];
  const connectionsPayload: Array<{
    sourceServiceId?: string;
    targetServiceId?: string;
    linkType?: string;
    mapping?: Record<string, unknown>;
    condition?: Record<string, unknown>;
    order?: number;
  }> = [];

  console.log('Starting transformation with services:', services);

  const serviceIdToTypeMap = new Map<string, 'action' | 'reaction'>();
  const serviceIdToActionIndexMap = new Map<string, number>();
  const serviceIdToReactionIndexMap = new Map<string, number>();

  for (let index = 0; index < services.length; index++) {
    const service = services[index];
    console.log(`Processing service ${index}:`, {
      serviceName: service.serviceName,
      actionDefinitionId: service.actionDefinitionId,
      event: service.event
    });

    let isEvent = false;
    let isReaction = false;
    if (service.actionDefinitionId) {
      try {
        const actionDef = await getActionDefinitionById(service.actionDefinitionId);
        isEvent = actionDef.isEventCapable;
        isReaction = actionDef.isExecutable;
        console.log(`Action ${service.actionDefinitionId}: isEventCapable=${isEvent}, isExecutable=${isReaction}`);
      } catch (error) {
        console.error(`Failed to fetch action definition for ${service.actionDefinitionId}:`, error);
      }
    }

    if (isEvent) {
      let actionActivationConfig = service.activationConfig;
      if (actionActivationConfig?.type === 'chain') {
        actionActivationConfig = { type: 'webhook' };
      }

      const actionIndex = actions.length;
      serviceIdToTypeMap.set(service.id, 'action');
      serviceIdToActionIndexMap.set(service.id, actionIndex);
      console.log(`Mapped service ${service.id} to action_${actionIndex}`);
      const cleanedParameters = { ...(service.fields || {}) };
      delete cleanedParameters._chainTargets;
      delete cleanedParameters._chainSourceId;
      delete cleanedParameters._chainMapping;
      delete cleanedParameters._chainSource;
      delete cleanedParameters._hasChainTarget;

      actions.push({
        actionDefinitionId: service.actionDefinitionId || '',
        name: service.event || service.cardName || 'Unnamed Action',
        description: `Action for ${service.serviceName}`,
        parameters: cleanedParameters,
        activationConfig: actionActivationConfig ? {
          type: actionActivationConfig.type,
          ...(actionActivationConfig.cron_expression && { cron_expression: actionActivationConfig.cron_expression }),
          ...(actionActivationConfig.poll_interval && {
            poll_interval: actionActivationConfig.poll_interval,
            interval_seconds: actionActivationConfig.poll_interval
          }),
          ...(actionActivationConfig.webhook_url && { webhook_url: actionActivationConfig.webhook_url }),
          ...(actionActivationConfig.secret_token && { secret_token: actionActivationConfig.secret_token }),
        } : {
          type: 'webhook'
        }
      });
    } else if (isReaction) {
      let reactionActivationConfig = service.activationConfig || { type: 'chain' };
      if (reactionActivationConfig.type === 'webhook' || reactionActivationConfig.type === 'poll' || reactionActivationConfig.type === 'cron') {
        reactionActivationConfig = { type: 'chain' };
      }

      const reactionIndex = reactions.length;
      serviceIdToTypeMap.set(service.id, 'reaction');
      serviceIdToReactionIndexMap.set(service.id, reactionIndex);
      console.log(`Mapped service ${service.id} to reaction_${reactionIndex}`);

      // Clean internal editor metadata from parameters
      const cleanedParameters = { ...(service.fields || {}) };
      delete cleanedParameters._chainTargets;
      delete cleanedParameters._chainSourceId;
      delete cleanedParameters._chainMapping;
      delete cleanedParameters._chainSource;
      delete cleanedParameters._hasChainTarget;

      reactions.push({
        actionDefinitionId: service.actionDefinitionId || '',
        name: service.event || service.cardName || 'Unnamed Reaction',
        description: `Reaction for ${service.serviceName}`,
        parameters: cleanedParameters,
        mapping: {},
        condition: {},
        order: reactions.length,
        activationConfig: reactionActivationConfig as unknown as Record<string, unknown>
      });
    } else {
      console.warn(`Service at index ${index} is neither event-capable nor executable:`, service);
    }
  }

  const serviceIdToServiceMap = new Map<string, ServiceData>();
  services.forEach(service => {
    serviceIdToServiceMap.set(service.id, service);
  });

  connections.forEach(connection => {
    const sourceService = serviceIdToServiceMap.get(connection.sourceId);
    const targetService = serviceIdToServiceMap.get(connection.targetId);

    if (sourceService && targetService) {
      const sourceType = serviceIdToTypeMap.get(connection.sourceId);
      const targetType = serviceIdToTypeMap.get(connection.targetId);

      if (sourceType && targetType) {
        let sourceServiceId = '';
        let targetServiceId = '';

        if (sourceType === 'action') {
          const actionIndex = serviceIdToActionIndexMap.get(connection.sourceId);
          if (actionIndex !== undefined) {
            sourceServiceId = `action_${actionIndex}`;
          }
        } else {
          const reactionIndex = serviceIdToReactionIndexMap.get(connection.sourceId);
          if (reactionIndex !== undefined) {
            sourceServiceId = `reaction_${reactionIndex}`;
          }
        }

        if (targetType === 'action') {
          const actionIndex = serviceIdToActionIndexMap.get(connection.targetId);
          if (actionIndex !== undefined) {
            targetServiceId = `action_${actionIndex}`;
          }
        } else {
          const reactionIndex = serviceIdToReactionIndexMap.get(connection.targetId);
          if (reactionIndex !== undefined) {
            targetServiceId = `reaction_${reactionIndex}`;
          }
        }

        if (sourceServiceId && targetServiceId) {
          connectionsPayload.push({
            sourceServiceId,
            targetServiceId,
            linkType: connection.linkData?.type || 'chain',
            mapping: connection.linkData?.mapping || {},
            condition: connection.linkData?.condition || {},
            order: connection.linkData?.order || 0
          });

          links.push({
            sourceActionDefinitionId: sourceService.actionDefinitionId,
            targetActionDefinitionId: targetService.actionDefinitionId,
            mapping: connection.linkData?.mapping || {},
            condition: connection.linkData?.condition || {},
            order: connection.linkData?.order || 0
          });
        } else {
          console.warn('Failed to generate service IDs for connection:', {
            connectionId: connection.id,
            sourceServiceId,
            targetServiceId
          });
        }
      } else {
        console.warn('Missing type mapping for connection:', {
          connectionId: connection.id,
          sourceType,
          targetType
        });
      }
    } else {
      console.warn('Missing service for connection:', {
        connectionId: connection.id,
        sourceService: !!sourceService,
        targetService: !!targetService
      });
    }
  });

  const payload = {
    name: areaName || 'Unnamed Area',
    description: areaDescription,
    actions,
    reactions,
    links,
    connections: connectionsPayload
  };

  console.log('Final payload to send:', JSON.stringify(payload, null, 2));

  return payload;
};

export function useAreaEditor(areaId?: string, draftId?: string) {
  const isNewArea = areaId === undefined;
  const router = useRouter();

  const [servicesState, setServicesState] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{ draftId: string; name: string; savedAt: string } | null>(null);
  const [draftModalActions, setDraftModalActions] = useState<{ onAccept: () => void; onReject: () => void } | null>(null);
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState<number>(0);

  const [connections, setConnections] = useState<ConnectionData[]>([]);

  const handleDraftLoaded = useCallback((data: {
    name: string;
    description: string;
    services: ServiceData[];
    connections: ConnectionData[];
    draftId: string;
    savedAt: string;
  }) => {
    setAreaName(data.name);
    setAreaDescription(data.description);
    setServicesState(data.services);
    setConnections(data.connections);
  }, []);

  const handleDraftRejected = useCallback(() => {
    setAreaName('');
    setAreaDescription('');
    setServicesState([]);
    setConnections([]);
  }, []);

  const handleShowDraftModal = useCallback((
    draftData: { draftId: string; name: string; savedAt: string },
    onAccept: () => void,
    onReject: () => void
  ) => {
    setPendingDraft(draftData);
    setDraftModalActions({ onAccept, onReject });
    setShowDraftModal(true);
  }, []);

  const triggerAutoSave = useCallback(() => {
    setLastChangeTimestamp(Date.now());
  }, []);
  const {
    currentDraftId,
    handleDeleteDraft,
    saveDraftManually,
  } = useDraftManager({
    areaName,
    areaDescription,
    servicesState,
    connections,
    draftId,
    areaId,
    isNewArea,
    transformServiceDataToPayload,
    transformBackendDataToServiceData,
    onDraftLoaded: handleDraftLoaded,
    onDraftRejected: handleDraftRejected,
    onShowDraftModal: handleShowDraftModal,
  });

  useEffect(() => {
    if (lastChangeTimestamp === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (areaName || areaDescription || servicesState.length > 0) {
        saveDraftManually().catch(error => {
          console.error('Error saving draft after changes:', error);
        });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [lastChangeTimestamp, areaName, areaDescription, servicesState, saveDraftManually]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (servicesState.length > 0 || connections.length > 0) {
        saveDraftManually().catch(error => {
          console.error('Error saving draft after services/connections change:', error);
        });
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [servicesState, connections, saveDraftManually]);

  useEffect(() => {
    const loadData = async () => {
      if (areaId !== undefined) {
        try {
          const area = await getAreaById(areaId);

          if (area) {
            setAreaName(area.name);
            setAreaDescription(area.description);
            const transformedServices = await transformBackendDataToServiceData(area);
            if (area.links && area.links.length > 0) {
              const transformedConnections: ConnectionData[] = [];
              const serviceTargets = new Map<string, string[]>(); // sourceId -> targetIds[]
              area.links.forEach((link, index) => {
                const sourceService = transformedServices.find(s => s.id === link.sourceActionInstanceId);
                const targetService = transformedServices.find(s => s.id === link.targetActionInstanceId);
                if (sourceService && targetService) {
                  const mappingConverted: Record<string, string> = {};
                  if (link.mapping) {
                    Object.entries(link.mapping).forEach(([key, value]) => {
                      mappingConverted[key] = String(value);
                    });
                  }

                  const connection = {
                    id: `link-${link.sourceActionInstanceId}-${link.targetActionInstanceId}-${index}`,
                    sourceId: link.sourceActionInstanceId,
                    targetId: link.targetActionInstanceId,
                    linkData: {
                      type: (link.linkType as LinkData['type']) || 'chain',
                      mapping: mappingConverted,
                      condition: link.condition || {},
                      order: link.order || 0,
                    }
                  };

                  transformedConnections.push(connection);
                  if (!serviceTargets.has(link.sourceActionInstanceId)) {
                    serviceTargets.set(link.sourceActionInstanceId, []);
                  }
                  serviceTargets.get(link.sourceActionInstanceId)!.push(link.targetActionInstanceId);
                } else {
                  console.warn('Could not find services for link:', link);
                }
              });
              transformedServices.forEach(service => {
                const targets = serviceTargets.get(service.id);
                if (targets && targets.length > 0) {
                  const fields = service.fields as Record<string, unknown>;
                  fields._chainTargets = targets;
                  fields._hasChainTarget = true;
                }
              });
              setConnections(transformedConnections);
            } else {
              console.log('No links found in area data');
              transformedServices.forEach(service => {
                const fields = service.fields as Record<string, unknown>;
                delete fields._chainTargets;
                delete fields._hasChainTarget;
              });
              setConnections([]);
            }
            setServicesState(transformedServices);
          }
        } catch (error) {
          console.error('Error loading area data:', error);
        }
      }
    };
    loadData();
  }, [areaId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setServicesState((services) => {
      const oldIndex = services.findIndex((service) => service.id === active.id);
      const newIndex = services.findIndex((service) => service.id === over.id);
      return arrayMove(services, oldIndex, newIndex);
    });
    triggerAutoSave();
  };

  const handleCommit = async () => {
    try {
      if (isCommitting) {
        return;
      }

      if (!areaName || areaName.trim() === '') {
        notifications.show({
          title: 'Error',
          message: 'AREA name is required',
          color: 'red',
        });
        return;
      }

      if (servicesState.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'At least one service is required',
          color: 'red',
        });
        return;
      }

      setIsCommitting(true);

      await saveDraftManually();

      const payload = await transformServiceDataToPayload(servicesState, areaName, areaDescription, connections);

      if (isNewArea) {
        await createAreaWithActions(payload);
        await handleDeleteDraft();
        notifications.show({
          title: 'Success',
          message: `AREA "${areaName}" was created successfully!`,
          color: 'green',
        });
        setTimeout(() => router.push('/areas'), WAIT_NOTIFICATION_TIMEOUT);
      } else {
        await updateAreaComplete(areaId!, payload);
        await handleDeleteDraft();

        notifications.show({
          title: 'Success',
          message: `AREA "${areaName}" was updated successfully!`,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error committing area:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({
        title: 'Error',
        message: `Failed to save AREA: ${errorMessage}`,
        color: 'red',
      });
    } finally {
      setIsCommitting(false);
    }
  };

    const handleRun = async () => {
      if (!areaId) {
        notifications.show({
          title: 'Error',
          message: 'Unable to run AREA: missing ID',
          color: 'red',
        });
        return;
      }

      try {
        await runAreaById(areaId);
        console.log('Area executed successfully');

        notifications.show({
          title: 'Success',
          message: `AREA "${areaName}" was executed successfully!`,
          color: 'green',
        });
      } catch (error) {
        console.error('Error running area:', error);

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        notifications.show({
          title: 'Error',
          message: `Failed to execute AREA: ${errorMessage}`,
          color: 'red',
        });
      }
  };

  const addNewServiceBelow = () => {
    const newId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newService: ServiceData = {
      id: newId,
      logo: '',
      serviceName: '',
      event: '',
      cardName: '',
      state: ServiceState.Configuration,
      actionId: 0,
      serviceId: '',
      activationConfig: {
        type: 'chain'
      }
    };
    setServicesState(prev => [...prev, newService]);
    triggerAutoSave();
  };

  const removeService = (id: string) => {
    setServicesState((prev) => prev.filter((s) => s.id !== id));
    triggerAutoSave();
  };

  const editService = (service: ServiceData) => {
    setSelectedService(service);
    setModalOpened(true);
  };

  const updateService = (updatedService: ServiceData) => {
    setServicesState(prev => prev.map(s => {
      if (s.id === updatedService.id) {
        const preservedActionDefinitionId = updatedService.actionDefinitionId || s.actionDefinitionId;
        return {
          ...updatedService,
          actionDefinitionId: preservedActionDefinitionId
        };
      }
      return s;
    }));

    if (selectedService && selectedService.id === updatedService.id) {
      const preservedActionDefinitionId = updatedService.actionDefinitionId || selectedService.actionDefinitionId;
      setSelectedService({
        ...updatedService,
        actionDefinitionId: preservedActionDefinitionId
      });
    }
    triggerAutoSave();
  };

  const moveServiceUp = (id: string) => {
    setServicesState(prev => {
      const index = prev.findIndex(service => service.id === id);
      if (index <= 0)
        return prev;

      return arrayMove(prev, index, index - 1);
    });
    triggerAutoSave();
  };

  const moveServiceDown = (id: string) => {
    setServicesState(prev => {
      const index = prev.findIndex(service => service.id === id);
      if (index < 0 || index >= prev.length - 1)
        return prev;

      return arrayMove(prev, index, index + 1);
    });
    triggerAutoSave();
  };

  const duplicateService = (id: string) => {
    setServicesState(prev => {
      const serviceToDuplicate = prev.find(service => service.id === id);
      if (!serviceToDuplicate)
        return prev;
      const newId = `duplicate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const cleanFields = { ...serviceToDuplicate.fields };
      delete cleanFields._chainSource;
      delete cleanFields._chainSourceId;
      delete cleanFields._chainMapping;
      delete cleanFields._conditionalSource;
      delete cleanFields._conditionalSourceId;
      delete cleanFields._conditions;
      delete cleanFields._parallelWith;
      delete cleanFields._parallelSourceId;
      delete cleanFields._parallelTargetId;
      delete cleanFields._synchronizedExecution;
      delete cleanFields._sequentialSource;
      delete cleanFields._sequentialSourceId;
      delete cleanFields._waitForCompletion;
      delete cleanFields._dataMapping;
      delete cleanFields._hasChainTarget;
      delete cleanFields._chainTargets;

      const duplicatedService = {
        ...serviceToDuplicate,
        id: newId,
        fields: cleanFields,
        position: { x: (serviceToDuplicate.position?.x || 0) + 50, y: (serviceToDuplicate.position?.y || 0) + 50 }
      };
      const index = prev.findIndex(service => service.id === id);
      const newServices = [...prev];
      newServices.splice(index + 1, 0, duplicatedService);
      return newServices;
    });
    triggerAutoSave();
  };

  const createConnection = (connection: ConnectionData) => {
    setConnections(prev => [...prev, connection]);
    applyLinkEffect(connection);
  };

  const applyLinkEffect = (connection: ConnectionData) => {
    const sourceService = servicesState.find(s => s.id === connection.sourceId);
    const targetService = servicesState.find(s => s.id === connection.targetId);

    if (!sourceService || !targetService) return;

    const { type } = connection.linkData;

    switch (type) {
      case 'chain':
        updateService({
          ...targetService,
          activationConfig: {
            type: 'chain',
          },
          fields: {
            ...targetService.fields,
            _chainSource: sourceService.serviceName,
            _chainSourceId: sourceService.id,
            _chainMapping: connection.linkData.mapping || {},
          }
        });

        updateService({
          ...sourceService,
          fields: {
            ...sourceService.fields,
            _hasChainTarget: true,
            _chainTargets: [...(sourceService.fields?._chainTargets as string[] || []), targetService.id]
          }
        });
        break;

      case 'conditional':
        updateService({
          ...targetService,
          activationConfig: {
            type: 'webhook',
            events: ['conditional_trigger']
          },
          fields: {
            ...targetService.fields,
            _conditionalSource: sourceService.serviceName,
            _conditionalSourceId: sourceService.id,
            _conditions: connection.linkData.condition || {},
          }
        });
        break;

      case 'parallel':
        updateService({
          ...targetService,
          fields: {
            ...targetService.fields,
            _parallelWith: sourceService.serviceName,
            _parallelSourceId: sourceService.id,
            _synchronizedExecution: true
          }
        });

        updateService({
          ...sourceService,
          fields: {
            ...sourceService.fields,
            _parallelWith: targetService.serviceName,
            _parallelTargetId: targetService.id,
            _synchronizedExecution: true
          }
        });
        break;

      case 'sequential':
        updateService({
          ...targetService,
          activationConfig: {
            type: 'chain',
          },
          fields: {
            ...targetService.fields,
            _sequentialSource: sourceService.serviceName,
            _sequentialSourceId: sourceService.id,
            _waitForCompletion: true,
            _dataMapping: connection.linkData.mapping || {},
          }
        });
        break;

      default:
        updateService({
          ...targetService,
          activationConfig: {
            type: 'chain',
          }
        });
        break;
    }
  };

  const removeConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);

    setConnections(prev => prev.filter(c => c.id !== connectionId));

    if (connection) {
      const targetService = servicesState.find(s => s.id === connection.targetId);
      const sourceService = servicesState.find(s => s.id === connection.sourceId);

      if (targetService) {
        const hasOtherConnections = connections.some(c =>
          c.id !== connectionId && c.targetId === connection.targetId
        );

        if (!hasOtherConnections) {
          const cleanFields = { ...targetService.fields };

          delete cleanFields._chainSource;
          delete cleanFields._chainSourceId;
          delete cleanFields._chainMapping;
          delete cleanFields._conditionalSource;
          delete cleanFields._conditionalSourceId;
          delete cleanFields._conditions;
          delete cleanFields._parallelWith;
          delete cleanFields._parallelSourceId;
          delete cleanFields._synchronizedExecution;
          delete cleanFields._sequentialSource;
          delete cleanFields._sequentialSourceId;
          delete cleanFields._waitForCompletion;
          delete cleanFields._dataMapping;

          updateService({
            ...targetService,
            activationConfig: {
              type: 'cron',
              cron_expression: '0 */30 * * * *'
            },
            fields: cleanFields
          });
        }
      }

      if (sourceService && connection.linkData.type === 'chain') {
        const cleanSourceFields = { ...sourceService.fields };
        const chainTargets = (cleanSourceFields._chainTargets as string[] || []).filter(
          targetId => targetId !== connection.targetId
        );

        if (chainTargets.length === 0) {
          delete cleanSourceFields._hasChainTarget;
          delete cleanSourceFields._chainTargets;
        } else {
          cleanSourceFields._chainTargets = chainTargets;
        }

        updateService({
          ...sourceService,
          fields: cleanSourceFields
        });
      }

      if (sourceService && connection.linkData.type === 'parallel') {
        const cleanSourceFields = { ...sourceService.fields };
        delete cleanSourceFields._parallelWith;
        delete cleanSourceFields._parallelTargetId;
        delete cleanSourceFields._synchronizedExecution;

        updateService({
          ...sourceService,
          fields: cleanSourceFields
        });
      }
    }
    triggerAutoSave();
  };

  const updateConnection = (connection: ConnectionData) => {
    setConnections(prev => prev.map(c => c.id === connection.id ? connection : c));
    triggerAutoSave();
  };

  const handleAreaNameChange = (name: string) => {
    setAreaName(name);
    triggerAutoSave();
  };

  const handleAreaDescriptionChange = (description: string) => {
    setAreaDescription(description);
    triggerAutoSave();
  };

  return {
    servicesState,
    selectedService,
    modalOpened,
    setModalOpened,
    isDragging,
    setIsDragging,
    areaName,
    setAreaName: handleAreaNameChange,
    areaDescription,
    setAreaDescription: handleAreaDescriptionChange,
    currentDraftId,
    isCommitting,
    showDraftModal,
    setShowDraftModal,
    pendingDraft,
    draftModalActions,
    handleDragEnd,
    handleCommit,
    handleRun,
    handleDeleteDraft,
    addNewServiceBelow,
    removeService,
    editService,
    updateService,
    moveServiceUp,
    moveServiceDown,
    duplicateService,
    connections,
    createConnection,
    removeConnection,
    updateConnection,
  };
}