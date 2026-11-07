import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import OAuthCallbackPage from '../src/app/oauth-callback/page';
import axios from '../src/config/axios';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock axios
jest.mock('../src/config/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Mock useAuth hook
jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    refreshAuth: jest.fn(),
  }),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location.href
const mockHref = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    reload: jest.fn(),
  },
  writable: true,
});

// Custom render function with MantineProvider
const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  describe('Initial rendering', () => {
    test('renders processing state immediately', async () => {
      mockGet.mockReturnValue(null); // No code parameter

      renderWithMantine(<OAuthCallbackPage />);

      // Component processes immediately and shows error
      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('No authorization code received')).toBeInTheDocument();
    });
  });

  describe('Error handling - missing code', () => {
    test('shows error when no authorization code is provided', async () => {
      mockGet.mockReturnValue(null); // No code parameter

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('No authorization code received')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('Error handling - OAuth error in URL', () => {
    test('handles OAuth error with description', async () => {
      mockGet
        .mockImplementation((key: string) => {
          if (key === 'error') return 'access_denied';
          if (key === 'error_description') return 'User denied access';
          return null;
        });

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('User denied access')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?error=access_denied');
      }, { timeout: 4000 });
    });

    test('handles OAuth error without description', async () => {
      mockGet
        .mockImplementation((key: string) => {
          if (key === 'error') return 'invalid_request';
          return null;
        });

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('invalid_request')).toBeInTheDocument();
    });
  });

  describe('Successful OAuth exchange - login mode', () => {
    beforeEach(() => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'auth_code_123';
        return null;
      });

      mockLocalStorage.getItem
        .mockImplementation((key: string) => {
          if (key === 'oauth_link_mode') return 'false';
          if (key === 'oauth_provider') return 'github';
          if (key === 'oauth_return_url') return '/dashboard';
          return null;
        });

      (axios.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: { success: true }
      });
    });

    test('completes successful login flow', async () => {
      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication successful!')).toBeInTheDocument();
      });

      expect(screen.getByText('Authentication successful! Redirecting...')).toBeInTheDocument();

      // Check localStorage cleanup
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('oauth_link_mode');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('oauth_provider');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('oauth_return_url');

      // Check API call
      expect(axios.post).toHaveBeenCalledWith('/api/oauth/github/exchange', {
        code: 'auth_code_123'
      });

      // Check redirect
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      }, { timeout: 2000 });
    });
  });

  describe('Successful OAuth exchange - link mode', () => {
    beforeEach(() => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'link_code_456';
        return null;
      });

      mockLocalStorage.getItem
        .mockImplementation((key: string) => {
          if (key === 'oauth_link_mode') return 'true';
          if (key === 'oauth_provider') return 'google';
          if (key === 'oauth_return_url') return '/profil';
          return null;
        });

      (axios.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: { success: true }
      });
    });

    test('completes successful account linking flow', async () => {
      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication successful!')).toBeInTheDocument();
      });

      expect(screen.getByText('Account linked successfully! Redirecting...')).toBeInTheDocument();

      // Check API call for linking
      expect(axios.post).toHaveBeenCalledWith('/api/oauth-link/google/exchange', {
        code: 'link_code_456'
      });

      // Check redirect
      await waitFor(() => {
        expect(window.location.href).toBe('/profil');
      }, { timeout: 2000 });
    });
  });

  describe('Error handling - API errors', () => {
    beforeEach(() => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'error_code_789';
        return null;
      });

      mockLocalStorage.getItem
        .mockImplementation((key: string) => {
          if (key === 'oauth_link_mode') return 'false';
          if (key === 'oauth_provider') return 'github';
          return null;
        });
    });

    test('handles 409 conflict error (account already linked)', async () => {
      const mockError = {
        response: {
          status: 409,
          data: {
            message: 'Account already linked',
            suggestion: 'Try logging in instead'
          }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('Account already linked. Try logging in instead')).toBeInTheDocument();
    });

    test('handles 400 bad request error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid code',
            suggestion: 'Please try again'
          }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('Invalid code. Please try again')).toBeInTheDocument();
    });

    test('handles 401 unauthorized error', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {}
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('Invalid or expired authorization code')).toBeInTheDocument();
    });

    test('handles 500 server error', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {}
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('Server error during authentication')).toBeInTheDocument();
    });

    test('handles generic API error', async () => {
      const mockError = {
        response: {
          status: 403,
          data: {
            message: 'Forbidden'
          }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    test('handles network error', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });
  });

  describe('Link mode error handling', () => {
    test('redirects to return URL after link mode error', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'error_code_789';
        return null;
      });

      mockLocalStorage.getItem
        .mockImplementation((key: string) => {
          if (key === 'oauth_link_mode') return 'true';
          if (key === 'oauth_provider') return 'github';
          if (key === 'oauth_return_url') return '/profil';
          return null;
        });

      (axios.post as jest.Mock).mockRejectedValue(new Error('Link failed'));

      renderWithMantine(<OAuthCallbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Authentication error')).toBeInTheDocument();
      });

      // Should redirect to return URL after 5 seconds in link mode
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profil');
      }, { timeout: 8000 });
    }, 10000);
  });

  describe('Processing states', () => {
    test('shows processing message during API call', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'auth_code_123';
        return null;
      });

      mockLocalStorage.getItem
        .mockImplementation((key: string) => {
          if (key === 'oauth_link_mode') return 'false';
          if (key === 'oauth_provider') return 'github';
          return null;
        });

      // Delay the API response
      let resolvePromise: (value: { status: number; data: { success: boolean } }) => void;
      const promise = new Promise<{ status: number; data: { success: boolean } }>((resolve) => {
        resolvePromise = resolve;
      });

      (axios.post as jest.Mock).mockReturnValue(promise);

      renderWithMantine(<OAuthCallbackPage />);

      // Should show processing message
      await waitFor(() => {
        expect(screen.getByText('Exchanging authorization code...')).toBeInTheDocument();
      });

      // Resolve the promise
      act(() => {
        resolvePromise!({
          status: 200,
          data: { success: true }
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Authentication successful!')).toBeInTheDocument();
      });
    });
  });
});