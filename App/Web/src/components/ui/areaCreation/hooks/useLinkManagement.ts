import { useState, useCallback } from 'react';
import { LinkingState } from '../types';
import { ServiceData, ConnectionData, ServiceState } from '../../../../types';

export function useLinkManagement(
  services: ServiceData[],
  onCreateConnection: (connection: ConnectionData) => void
) {
  const [linkingState, setLinkingState] = useState<LinkingState>({
    isLinking: false,
    sourceId: null,
    targetId: null,
  });

  const [linkModalOpened, setLinkModalOpened] = useState(false);
  const [tempConnection, setTempConnection] = useState<Partial<ConnectionData> | null>(null);

  const isServiceConfigured = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return false;
    return service.state === ServiceState.Success ||
            !!(service.actionDefinitionId &&
            service.serviceName &&
            service.event);
  }, [services]);

  const handleServiceClick = useCallback((serviceId: string) => {
    if (!linkingState.isLinking)
      return;
    if (!isServiceConfigured(serviceId)) {
      console.warn('Cannot create link: Service is not properly configured');
      return;
    }
    if (!linkingState.sourceId) {
      setLinkingState(prev => ({ ...prev, sourceId: serviceId }));
    } else if (linkingState.sourceId !== serviceId) {
      if (!isServiceConfigured(linkingState.sourceId)) {
        console.warn('Cannot create link: Source service is not properly configured');
        setLinkingState(prev => ({ ...prev, sourceId: serviceId }));
        return;
      }

      setLinkingState(prev => ({ ...prev, targetId: serviceId }));
      setTempConnection({
        id: `link-${Date.now()}`,
        sourceId: linkingState.sourceId,
        targetId: serviceId,
        linkData: {
          type: 'chain',
          mapping: {},
          condition: {},
          order: 0,
        },
      });
      setLinkModalOpened(true);
    }
  }, [linkingState, isServiceConfigured]);

  const startLinking = useCallback(() => {
    const configuredServices = services.filter(service => isServiceConfigured(service.id));

    if (configuredServices.length < 2) {
      console.warn('Cannot start linking: Need at least 2 configured services');
      return;
    }

    setLinkingState({
      isLinking: true,
      sourceId: null,
      targetId: null,
    });
  }, [services, isServiceConfigured]);

  const cancelLinking = useCallback(() => {
    setLinkingState({
      isLinking: false,
      sourceId: null,
      targetId: null,
    });
  }, []);

  const confirmLink = useCallback(() => {
    if (tempConnection && tempConnection.sourceId && tempConnection.targetId) {
      onCreateConnection(tempConnection as ConnectionData);
    }

    setLinkModalOpened(false);
    setTempConnection(null);
    cancelLinking();
  }, [tempConnection, onCreateConnection, cancelLinking]);

  const canStartLinking = services.filter(service => isServiceConfigured(service.id)).length >= 2;

  return {
    linkingState,
    linkModalOpened,
    tempConnection,
    isServiceConfigured,
    handleServiceClick,
    startLinking,
    cancelLinking,
    confirmLink,
    canStartLinking,
    setLinkModalOpened,
    setTempConnection,
  };
}
