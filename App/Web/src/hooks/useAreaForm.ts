import { useState, useEffect, useCallback, useRef } from 'react';
import { getServices, getActionsByServiceKey } from '@/services/areasService';
import { getServiceConnectionStatus, ServiceConnectionStatus } from '@/services/serviceConnectionService';
import type { BackendService, Action } from '@/types';

export function useAreaForm() {
  const [services, setServices] = useState<BackendService[]>([]);
  const [serviceConnectionStatuses, setServiceConnectionStatuses] = useState<Record<string, ServiceConnectionStatus>>({});
  const [actionTriggers, setActionTriggers] = useState<Action[]>([]);
  const [reactionActions, setReactionActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);

  const loadingServices = useRef(false);
  const loadingTriggers = useRef<Set<string>>(new Set());
  const loadingReactions = useRef<Set<string>>(new Set());
  const loadedTriggerServices = useRef<Set<string>>(new Set());

  const loadServices = useCallback(async () => {
    if (loadingServices.current) return;
    loadingServices.current = true;
    setLoading(true);

    try {
      const servicesData = await getServices();
      setServices(servicesData);

      const statusChecks: Record<string, ServiceConnectionStatus> = {};
      await Promise.all(
        servicesData.map(async (service) => {
          try {
            const status = await getServiceConnectionStatus(service.key);
            statusChecks[service.key] = status;
          } catch {
            statusChecks[service.key] = {
              serviceKey: service.key,
              serviceName: service.name,
              iconUrl: service.iconLightUrl || service.iconDarkUrl || '',
              isConnected: false,
              connectionType: 'NONE',
              userEmail: '',
              userName: '',
            };
          }
        })
      );
      setServiceConnectionStatuses(statusChecks);
    } catch (err) {
      console.error('Failed to load services:', err);
      throw err;
    } finally {
      setLoading(false);
      loadingServices.current = false;
    }
  }, []);

  const loadTriggerActions = useCallback(async (serviceKey: string) => {
    if (loadedTriggerServices.current.has(serviceKey) || loadingTriggers.current.has(serviceKey)) {
      return;
    }
    loadingTriggers.current.add(serviceKey);

    try {
      const actions = await getActionsByServiceKey(serviceKey);
      const newActions = actions.filter(a => a.isEventCapable);
      setActionTriggers(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewActions = newActions.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNewActions];
      });
      loadedTriggerServices.current.add(serviceKey);
    } catch (err) {
      console.error('Failed to load trigger actions:', err);
      throw err;
    } finally {
      loadingTriggers.current.delete(serviceKey);
    }
  }, []);

  const loadReactionActions = useCallback(async (serviceKeys: string[]) => {
    const newKeys = serviceKeys.filter(key => !loadingReactions.current.has(key));
    if (newKeys.length === 0) return;

    newKeys.forEach(key => loadingReactions.current.add(key));

    try {
      const actionsPromises = newKeys.map(async (serviceKey) => {
        try {
          const actions = await getActionsByServiceKey(serviceKey);
          return actions.filter(a => a.isExecutable);
        } catch (err) {
          console.error(`Failed to load actions for ${serviceKey}:`, err);
          return [];
        }
      });

      const actionsArrays = await Promise.all(actionsPromises);
      const allNewActions = actionsArrays.flat();

      setReactionActions(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewActions = allNewActions.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNewActions];
      });
    } finally {
      newKeys.forEach(key => loadingReactions.current.delete(key));
    }
  }, []);

  const refreshConnectionStatuses = useCallback(async () => {
    if (services.length === 0) return;

    const statusChecks: Record<string, ServiceConnectionStatus> = {};
    await Promise.all(
      services.map(async (service) => {
        try {
          const status = await getServiceConnectionStatus(service.key);
          statusChecks[service.key] = status;
        } catch {
          statusChecks[service.key] = {
            serviceKey: service.key,
            serviceName: service.name,
            iconUrl: service.iconLightUrl || service.iconDarkUrl || '',
            isConnected: false,
            connectionType: 'NONE',
            userEmail: '',
            userName: '',
          };
        }
      })
    );
    setServiceConnectionStatuses(statusChecks);
  }, [services]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    window.addEventListener('focus', refreshConnectionStatuses);
    return () => window.removeEventListener('focus', refreshConnectionStatuses);
  }, [refreshConnectionStatuses]);

  return {
    services,
    serviceConnectionStatuses,
    actionTriggers,
    reactionActions,
    loading,
    loadTriggerActions,
    loadReactionActions,
    refreshConnectionStatuses,
  };
}
