import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { router } from 'expo-router';
import type { AreaDto } from '@/types/areas';
import * as areaService from '@/services/area';
import { useAuth } from './AuthContext';

interface AreaContextValue {
  areas: AreaDto[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchAreas: () => Promise<void>;
  refreshAreas: () => Promise<void>;
  createArea: (payload: areaService.CreateAreaPayload) => Promise<AreaDto>;
  updateArea: (id: string, updates: areaService.UpdateAreaPayload) => Promise<AreaDto>;
  deleteArea: (id: string) => Promise<void>;
  toggleArea: (id: string, enabled: boolean) => Promise<AreaDto>;
  clearError: () => void;
}

const AreaContext = createContext<AreaContextValue | undefined>(undefined);

interface AreaProviderProps {
  children: ReactNode;
}

export function AreaProvider({ children }: AreaProviderProps) {
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    setError(message);
    console.error('AreaContext error:', err);
  }, []);

  const checkAuthentication = useCallback(() => {
    if (!isAuthenticated) {
      InteractionManager.runAfterInteractions(() => {
        try {
          router.replace('/login');
        } catch (err) {
          console.error('Navigation error while redirecting to login:', err);
        }
      });
      return false;
    }
    return true;
  }, [isAuthenticated]);

  const loadAreas = useCallback(async (useRefreshingState: boolean) => {
    if (!checkAuthentication()) return;

    if (useRefreshingState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const result = await areaService.getUserAreas(user?.id || 'null');
      setAreas(result);
      setHasFetched(true);
    } catch (err) {
      handleError(err);
    } finally {
      if (useRefreshingState) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [checkAuthentication, user?.id, handleError, isAuthenticated, user?.email]);

  const fetchAreas = useCallback(async () => {
    await loadAreas(false);
  }, [loadAreas]);

  const refreshAreas = useCallback(async () => {
    await loadAreas(true);
  }, [loadAreas]);

  const createArea = useCallback(async (payload: areaService.CreateAreaPayload) => {
    if (!checkAuthentication()) throw new Error('Not authenticated');

    setError(null);
    try {
      const created = await areaService.createArea(payload);
      setAreas(prev => [created, ...prev]);
      return created;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [checkAuthentication, handleError]);

  const updateArea = useCallback(async (id: string, updates: areaService.UpdateAreaPayload) => {
    if (!checkAuthentication()) throw new Error('Not authenticated');

    setError(null);
    try {
      const updated = await areaService.updateArea(id, updates);
      setAreas(prev => prev.map(area => (area.id === id ? updated : area)));
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [checkAuthentication, handleError]);

  const deleteArea = useCallback(async (id: string) => {
    if (!checkAuthentication()) throw new Error('Not authenticated');

    setError(null);
    try {
      await areaService.deleteArea(id);
      setAreas(prev => prev.filter(area => area.id !== id));
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [checkAuthentication, handleError]);

  const toggleArea = useCallback(async (id: string, enabled: boolean) => {
    if (!checkAuthentication()) throw new Error('Not authenticated');

    setError(null);
    try {
      const updated = await areaService.toggleArea(id, enabled);
      setAreas(prev => prev.map(area => (area.id === id ? updated : area)));
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [checkAuthentication, handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AreaContextValue>(() => ({
    areas,
    isLoading,
    isRefreshing,
    error,
    fetchAreas,
    hasFetched,
    refreshAreas,
    createArea,
    updateArea,
    deleteArea,
    toggleArea,
    clearError,
  }), [areas, isLoading, isRefreshing, error, fetchAreas, hasFetched, refreshAreas, createArea, updateArea, deleteArea, toggleArea, clearError]);

  return (
    <AreaContext.Provider value={value}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  const context = useContext(AreaContext);
  if (!context) {
    throw new Error('useArea must be used within an AreaProvider');
  }
  return context;
}
