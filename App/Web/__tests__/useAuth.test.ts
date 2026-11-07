import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '../src/hooks/useAuth';
import * as secureStorage from '../src/utils/secureStorage';

// Mock the secureStorage module
jest.mock('../src/utils/secureStorage', () => ({
  hasSecureToken: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with loading state', () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should set authenticated state when user has valid token', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isActive: true,
      isAdmin: false,
      createdAt: '2025-01-01',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
    expect(secureStorage.hasSecureToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', expect.any(Object));
  });

  it('should set unauthenticated state when no token exists', async () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle 401 response from auth endpoint', async () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Authentication failed, user may need to login again');

    consoleWarnSpy.mockRestore();
  });

  it('should handle non-401 error responses from auth endpoint', async () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe('Authentication check failed: 500');
  });

  it('should handle network errors during auth check', async () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(true);
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe('Failed to check authentication status');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should refresh auth when refreshAuth is called', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isActive: true,
      isAdmin: false,
      createdAt: '2025-01-01',
    };

    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Call refreshAuth
    act(() => {
      result.current.refreshAuth();
    });

    expect(secureStorage.hasSecureToken).toHaveBeenCalled();
  });

  it('should periodically check auth status when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      isActive: true,
      isAdmin: false,
      createdAt: '2025-01-01',
    };

    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Simulate token becoming invalid
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(false);

    // Fast-forward time by 5 minutes
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
      await Promise.resolve();
    });

    // Should check token status
    await waitFor(() => {
      expect(secureStorage.hasSecureToken).toHaveBeenCalled();
    });
  });

  it('should cleanup interval on unmount', async () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(false);

    const { unmount } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(secureStorage.hasSecureToken).toHaveBeenCalled();
    });

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  it('should provide refreshAuth function', async () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refreshAuth).toBe('function');
  });

  it('should handle auth check when token exists but fetch fails', async () => {
    (secureStorage.hasSecureToken as jest.Mock).mockResolvedValue(true);
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Failed to check authentication status');

    consoleErrorSpy.mockRestore();
  });
});
