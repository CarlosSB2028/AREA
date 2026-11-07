import axios from 'axios';
import {
  saveDraft,
  getEditDraft,
  getDraft,
  getUserDrafts,
  commitDraft,
  deleteDraft,
  extendDraftTTL,
  type AreaDraft,
  type AreaDraftResponse,
} from '../../src/services/areaDraftService';
import { API_CONFIG } from '../../src/config/api';

jest.mock('axios');

describe('areaDraftService', () => {
  const mockDraft: AreaDraft = {
    name: 'Test Area',
    description: 'Test Description',
    actions: [],
    reactions: [],
    connections: [],
    layoutMode: 'simple',
  };

  const mockDraftResponse: AreaDraftResponse = {
    draftId: 'draft-123',
    name: 'Test Area',
    description: 'Test Description',
    userId: 'user-123',
    actions: [],
    reactions: [],
    connections: [],
    layoutMode: 'simple',
    savedAt: '2025-10-28T12:00:00Z',
    ttlSeconds: 3600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDraft', () => {
    it('should save a new draft', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { draftId: 'draft-123' } });

      const result = await saveDraft(mockDraft);

      expect(result).toBe('draft-123');
      expect(axios.post).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts`,
        mockDraft
      );
    });

    it('should save draft for editing an area', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { draftId: 'draft-123' } });

      const result = await saveDraft(mockDraft, 'area-123');

      expect(result).toBe('draft-123');
      expect(axios.post).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts?areaId=area-123`,
        mockDraft
      );
    });

    it('should handle errors when saving draft', async () => {
      const error = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(saveDraft(mockDraft)).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving draft:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getEditDraft', () => {
    it('should get edit draft for an area', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockDraftResponse });

      const result = await getEditDraft('area-123');

      expect(result).toEqual(mockDraftResponse);
      expect(axios.get).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts/edit/area-123`
      );
    });

    it('should return null when draft not found (404)', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };
      (axios.get as jest.Mock).mockRejectedValue(axiosError);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      const result = await getEditDraft('area-123');

      expect(result).toBeNull();
    });

    it('should throw error for non-404 errors', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getEditDraft('area-123')).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getDraft', () => {
    it('should get draft by id', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockDraftResponse });

      const result = await getDraft('draft-123');

      expect(result).toEqual(mockDraftResponse);
      expect(axios.get).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts/draft-123`
      );
    });

    it('should handle errors when getting draft', async () => {
      const error = new Error('Not found');
      (axios.get as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getDraft('draft-123')).rejects.toThrow('Not found');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserDrafts', () => {
    it('should get all user drafts', async () => {
      const mockDrafts = [mockDraftResponse];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockDrafts });

      const result = await getUserDrafts();

      expect(result).toEqual(mockDrafts);
      expect(axios.get).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts`
      );
    });

    it('should handle errors when getting user drafts', async () => {
      const error = new Error('Unauthorized');
      (axios.get as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getUserDrafts()).rejects.toThrow('Unauthorized');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log axios error details when error response is available', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      (axios.get as jest.Mock).mockRejectedValue(axiosError);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getUserDrafts()).rejects.toEqual(axiosError);
      
      // Should log all three error details
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting user drafts:', axiosError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Status:', 500);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Data:', { message: 'Internal server error' });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('commitDraft', () => {
    it('should commit a draft', async () => {
      const mockCommitResponse = {
        id: 'area-123',
        name: 'Test Area',
        description: 'Test Description',
        enabled: true,
        userId: 'user-123',
        userEmail: 'user@example.com',
        actions: [],
        reactions: [],
        createdAt: '2025-10-28T12:00:00Z',
        updatedAt: '2025-10-28T12:00:00Z',
      };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockCommitResponse });

      const result = await commitDraft('draft-123');

      expect(result).toEqual(mockCommitResponse);
      expect(axios.post).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts/draft-123/commit`
      );
    });

    it('should handle errors when committing draft', async () => {
      const error = new Error('Validation error');
      (axios.post as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(commitDraft('draft-123')).rejects.toThrow('Validation error');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteDraft', () => {
    it('should delete a draft', async () => {
      (axios.delete as jest.Mock).mockResolvedValue({});

      await deleteDraft('draft-123');

      expect(axios.delete).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts/draft-123`
      );
    });

    it('should handle errors when deleting draft', async () => {
      const error = new Error('Not found');
      (axios.delete as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(deleteDraft('draft-123')).rejects.toThrow('Not found');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('extendDraftTTL', () => {
    it('should extend draft TTL', async () => {
      (axios.patch as jest.Mock).mockResolvedValue({});

      await extendDraftTTL('draft-123');

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_CONFIG.endpoints.areas.list}/drafts/draft-123/extend`
      );
    });

    it('should handle errors when extending TTL', async () => {
      const error = new Error('Not found');
      (axios.patch as jest.Mock).mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(extendDraftTTL('draft-123')).rejects.toThrow('Not found');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
