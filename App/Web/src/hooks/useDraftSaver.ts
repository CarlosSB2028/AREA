import { useEffect, useRef } from 'react';

interface DraftData {
  [key: string]: unknown;
}

export function useDraftSaver(
  userId: string | null,
  draftKey: string,
  data: DraftData,
  debounceMs: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousDataRef = useRef<string>('');

  useEffect(() => {
    if (!userId) return;

    const currentData = JSON.stringify(data);

    if (currentData === previousDataRef.current) return;
    previousDataRef.current = currentData;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const hasData = Object.values(data).some(value => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return Boolean(value);
    });

    if (hasData) {
      timeoutRef.current = setTimeout(() => {
        try {
          const draft = {
            ...data,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch (err) {
          console.error('Failed to save draft:', err);
        }
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [userId, draftKey, data, debounceMs]);

  const clearDraft = () => {
    if (userId) {
      localStorage.removeItem(draftKey);
      previousDataRef.current = '';
    }
  };

  return { clearDraft };
}
