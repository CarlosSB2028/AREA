import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { AreaDto, ActionDto, ReactionDto } from '@/types/areas';
import type { CardData } from '@/types/area-detail';
import * as areaService from '@/services/area';

interface SelectedAreaContextValue {
  selectedArea: AreaDto | null;
  cards: CardData[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadArea: (areaId: string) => Promise<void>;
  saveArea: () => Promise<void>;
  updateAreaDetails: (name: string, description: string) => void;
  clearError: () => void;
}

const SelectedAreaContext = createContext<SelectedAreaContextValue | undefined>(undefined);

interface SelectedAreaProviderProps {
  children: ReactNode;
}

export function SelectedAreaProvider({ children }: SelectedAreaProviderProps) {
  const [selectedArea, setSelectedArea] = useState<AreaDto | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    setError(message);
    console.error('SelectedAreaContext error:', err);
  }, []);

  const convertAreaToCards = useCallback((area: AreaDto): CardData[] => {
    const actionCards: CardData[] = area.actions.map((action, index) => ({
      id: action.id,
      type: 'action' as const,
      data: action,
      position: { x: 100, y: 150 + index * 200 },
    }));

    const reactionCards: CardData[] = area.reactions.map((reaction, index) => ({
      id: reaction.id,
      type: 'reaction' as const,
      data: reaction,
      position: { x: 400, y: 150 + index * 200 },
    }));

    return [...actionCards, ...reactionCards];
  }, []);

  const loadArea = useCallback(async (areaId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const area = await areaService.getArea(areaId);
      if (area) {
        setSelectedArea(area);
        const areaCards = convertAreaToCards(area);
        setCards(areaCards);
      } else {
        throw new Error('Area not found');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [convertAreaToCards, handleError]);

  const saveArea = useCallback(async () => {
    if (!selectedArea) return;

    setIsSaving(true);
    setError(null);

    try {
      const actions = cards
        .filter(card => card.type === 'action')
        .map(card => card.data as ActionDto);

      const reactions = cards
        .filter(card => card.type === 'reaction')
        .map(card => card.data as ReactionDto);

      const savedArea = await areaService.updateArea(selectedArea.id, {
        name: selectedArea.name,
        description: selectedArea.description,
        actions,
        reactions,
      });
      setSelectedArea(savedArea);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedArea, cards, handleError]);

  const updateAreaDetails = useCallback((name: string, description: string) => {
    if (!selectedArea) return;
    setSelectedArea(prev => prev ? { ...prev, name, description } : null);
  }, [selectedArea]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<SelectedAreaContextValue>(() => ({
    selectedArea,
    cards,
    isLoading,
    isSaving,
    error,
    loadArea,
    saveArea,
    updateAreaDetails,
    clearError,
  }), [
    selectedArea,
    cards,
    isLoading,
    isSaving,
    error,
    loadArea,
    saveArea,
    updateAreaDetails,
    clearError,
  ]);

  return (
    <SelectedAreaContext.Provider value={value}>
      {children}
    </SelectedAreaContext.Provider>
  );
}

export function useSelectedArea() {
  const context = useContext(SelectedAreaContext);
  if (!context) {
    throw new Error('useSelectedArea must be used within a SelectedAreaProvider');
  }
  return context;
}