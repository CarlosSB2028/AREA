import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { ActionDto, ReactionDto, BackendService, ActionDefinition } from '@/types/areas';

export interface ConfiguredAction {
  action: ActionDto;
  service: BackendService;
  definition: ActionDefinition;
}

export interface ConfiguredReaction {
  reaction: ReactionDto;
  service: BackendService;
  definition: ActionDefinition;
}

interface AreaEditorContextValue {
  configuredActions: ConfiguredAction[];
  configuredReactions: ConfiguredReaction[];
  addAction: (action: ActionDto, service: BackendService, definition: ActionDefinition) => void;
  updateAction: (index: number, action: ActionDto, service: BackendService, definition: ActionDefinition) => void;
  removeAction: (index: number) => void;
  addReaction: (reaction: ReactionDto, service: BackendService, definition: ActionDefinition) => void;
  updateReaction: (index: number, reaction: ReactionDto, service: BackendService, definition: ActionDefinition) => void;
  removeReaction: (index: number) => void;
  clearAll: () => void;
  initializeWithData: (actions: ConfiguredAction[], reactions: ConfiguredReaction[]) => void;
}

const AreaEditorContext = createContext<AreaEditorContextValue | undefined>(undefined);

interface AreaEditorProviderProps {
  children: ReactNode;
}


export function AreaEditorProvider({ children }: AreaEditorProviderProps) {
  const [configuredActions, setConfiguredActions] = useState<ConfiguredAction[]>([]);
  const [configuredReactions, setConfiguredReactions] = useState<ConfiguredReaction[]>([]);

  const addAction = useCallback((action: ActionDto, service: BackendService, definition: ActionDefinition) => {
    const newConfiguredAction: ConfiguredAction = { action, service, definition };
    setConfiguredActions(prev => [...prev, newConfiguredAction]);
  }, []);

  const updateAction = useCallback((index: number, action: ActionDto, service: BackendService, definition: ActionDefinition) => {
    setConfiguredActions(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { action, service, definition };
      }
      return updated;
    });
  }, []);

  const removeAction = useCallback((index: number) => {
    setConfiguredActions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addReaction = useCallback((reaction: ReactionDto, service: BackendService, definition: ActionDefinition) => {
    const newConfiguredReaction: ConfiguredReaction = { reaction, service, definition };
    setConfiguredReactions(prev => [...prev, newConfiguredReaction]);
  }, []);

  const updateReaction = useCallback((index: number, reaction: ReactionDto, service: BackendService, definition: ActionDefinition) => {
    setConfiguredReactions(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { reaction, service, definition };
      }
      return updated;
    });
  }, []);

  const removeReaction = useCallback((index: number) => {
    setConfiguredReactions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setConfiguredActions([]);
    setConfiguredReactions([]);
  }, []);

  const initializeWithData = useCallback((actions: ConfiguredAction[], reactions: ConfiguredReaction[]) => {
    setConfiguredActions(actions);
    setConfiguredReactions(reactions);
  }, []);

  const value = useMemo<AreaEditorContextValue>(
    () => ({
      configuredActions,
      configuredReactions,
      addAction,
      updateAction,
      removeAction,
      addReaction,
      updateReaction,
      removeReaction,
      clearAll,
      initializeWithData,
    }),
    [
      configuredActions,
      configuredReactions,
      addAction,
      updateAction,
      removeAction,
      addReaction,
      updateReaction,
      removeReaction,
      clearAll,
      initializeWithData,
    ]
  );

  return (
    <AreaEditorContext.Provider value={value}>
      {children}
    </AreaEditorContext.Provider>
  );
}

export function useAreaEditor() {
  const context = useContext(AreaEditorContext);
  if (!context) {
    throw new Error('useAreaEditor must be used within an AreaEditorProvider');
  }
  return context;
}
