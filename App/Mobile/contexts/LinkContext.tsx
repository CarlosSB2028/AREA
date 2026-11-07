import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface LinkConfig {
  sourceIndex: number;
  targetIndex: number;
  sourceType: 'action' | 'reaction';
  targetType: 'action' | 'reaction';
  linkType: 'chain' | 'conditional' | 'parallel' | 'sequential';
  order: number;
  mapping?: Record<string, string>;
  condition?: Record<string, unknown>;
}

interface LinkContextValue {
  links: LinkConfig[];
  addLink: (link: LinkConfig) => void;
  updateLink: (index: number, link: LinkConfig) => void;
  removeLink: (index: number) => void;
  removeLinkByIndex: (index: number) => void;
  clearLinks: () => void;
  initializeLinks: (links: LinkConfig[]) => void;
  getLinkBetween: (sourceIndex: number, targetIndex: number, sourceType: 'action' | 'reaction', targetType: 'action' | 'reaction') => LinkConfig | undefined;
}

const LinkContext = createContext<LinkContextValue | undefined>(undefined);

interface LinkProviderProps {
  children: ReactNode;
}

export function LinkProvider({ children }: LinkProviderProps) {
  const [links, setLinks] = useState<LinkConfig[]>([]);

  const addLink = useCallback((link: LinkConfig) => {
    setLinks(prev => [...prev, link]);
  }, []);

  const updateLink = useCallback((index: number, link: LinkConfig) => {
    setLinks(prev => {
      const newLinks = [...prev];
      if (newLinks[index]) {
        newLinks[index] = link;
      }
      return newLinks;
    });
  }, []);

  const removeLink = useCallback((index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeLinkByIndex = useCallback((index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearLinks = useCallback(() => {
    setLinks([]);
  }, []);

  const initializeLinks = useCallback((newLinks: LinkConfig[]) => {
    setLinks(newLinks);
  }, []);

  const getLinkBetween = useCallback((
    sourceIndex: number,
    targetIndex: number,
    sourceType: 'action' | 'reaction',
    targetType: 'action' | 'reaction'
  ) => {
    return links.find(
      link =>
        link.sourceIndex === sourceIndex &&
        link.targetIndex === targetIndex &&
        link.sourceType === sourceType &&
        link.targetType === targetType
    );
  }, [links]);

  return (
    <LinkContext.Provider
      value={{ links, addLink, updateLink, removeLink, removeLinkByIndex, clearLinks, initializeLinks, getLinkBetween }}
    >
      {children}
    </LinkContext.Provider>
  );
}

export function useLinks() {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error('useLinks must be used within a LinkProvider');
  }
  return context;
}
