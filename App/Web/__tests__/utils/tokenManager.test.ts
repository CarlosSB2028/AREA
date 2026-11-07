import {
  refreshAuthToken,
  ensureValidToken,
  handleAuthFailure,
} from '../../src/utils/tokenManager';
import { API_CONFIG } from '../../src/config/api';

global.fetch = jest.fn();

describe('tokenManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('refreshAuthToken', () => {
    it('should refresh token successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await refreshAuthToken();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Token refreshed successfully');

      consoleLogSpy.mockRestore();
    });

    it('should handle token refresh failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await refreshAuthToken();

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Token refresh failed:', 401);

      consoleWarnSpy.mockRestore();
    });

    it('should handle network errors during refresh', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await refreshAuthToken();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Token refresh error:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should not create multiple refresh promises concurrently', async () => {
      let resolveRefresh: (value: Response) => void;
      const refreshPromise = new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(refreshPromise);

      const call1 = refreshAuthToken();
      const call2 = refreshAuthToken();
      const call3 = refreshAuthToken();

      resolveRefresh!({ ok: true, status: 200 } as Response);

      await Promise.all([call1, call2, call3]);

      // Should only call fetch once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('ensureValidToken', () => {
    it('should return true when token is valid', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ authenticated: true }),
      });

      const result = await ensureValidToken();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.status}`,
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should refresh token when not authenticated', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ authenticated: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

      const result = await ensureValidToken();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle status check failure', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

      const result = await ensureValidToken();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await ensureValidToken();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking token validity:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleAuthFailure', () => {
    it('should logout and clear storage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      localStorage.setItem('_at', 'token');
      localStorage.setItem('_ate', 'expiry');
      localStorage.setItem('authToken', 'auth');
      sessionStorage.setItem('_sk', 'session');

      await handleAuthFailure();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );

      expect(localStorage.getItem('_at')).toBeNull();
      expect(localStorage.getItem('_ate')).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('_sk')).toBeNull();
    });

    it('should clear storage even if logout fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Logout failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      localStorage.setItem('_at', 'token');
      localStorage.setItem('authToken', 'auth');

      await handleAuthFailure();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
      expect(localStorage.getItem('_at')).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});
