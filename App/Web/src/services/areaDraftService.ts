import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { BackendAction, BackendReaction } from '../types';

export interface DraftConnection {
  id?: string;
  sourceServiceId: string;
  targetServiceId: string;
  linkType: 'chain' | 'conditional' | 'parallel' | 'sequential';
  mapping?: Record<string, string>;
  condition?: Record<string, unknown>;
  order: number;
}

export interface AreaDraft {
  name: string;
  description: string;
  actions: BackendAction[];
  reactions: BackendReaction[];
  connections: DraftConnection[];
  layoutMode: string;
  draftId?: string;
  savedAt?: string;
}

export interface AreaDraftResponse {
  draftId: string;
  name: string;
  description: string;
  userId: string;
  actions: BackendAction[];
  reactions: BackendReaction[];
  connections: DraftConnection[];
  layoutMode: string;
  savedAt: string;
  ttlSeconds: number;
}

export interface CommitDraftResponse {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId: string;
  userEmail: string;
  actions: Record<string, unknown>[];
  reactions: Record<string, unknown>[];
  links?: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

export const saveDraft = async (draft: AreaDraft, areaId?: string): Promise<string> => {
  try {
    const url = areaId
      ? `${API_CONFIG.endpoints.areas.list}/drafts?areaId=${areaId}`
      : `${API_CONFIG.endpoints.areas.list}/drafts`;

    const response = await axios.post(url, draft);
    return response.data.draftId;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const getEditDraft = async (areaId: string): Promise<AreaDraftResponse | null> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.endpoints.areas.list}/drafts/edit/${areaId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error('Error getting edit draft:', error);
    throw error;
  }
};

export const getDraft = async (draftId: string): Promise<AreaDraftResponse> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting draft:', error);
    throw error;
  }
};

export const getUserDrafts = async (): Promise<AreaDraftResponse[]> => {
  try {
    const url = `${API_CONFIG.endpoints.areas.list}/drafts`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting user drafts:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

export const commitDraft = async (draftId: string): Promise<CommitDraftResponse> => {
  try {
    const response = await axios.post<CommitDraftResponse>(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}/commit`
    );
    return response.data;
  } catch (error) {
    console.error('Error committing draft:', error);
    throw error;
  }
};

export const deleteDraft = async (draftId: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}`
    );
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

export const extendDraftTTL = async (draftId: string): Promise<void> => {
  try {
    await axios.patch(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}/extend`
    );
  } catch (error) {
    console.error('Error extending draft TTL:', error);
    throw error;
  }
};
