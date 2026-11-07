import { 
  clearSecureToken, 
  hasSecureToken,
  isWebCryptoSupported
} from '../../src/utils/secureStorage';

// Mock the API_CONFIG
jest.mock('../../src/config/api', () => ({
  API_CONFIG: {
    baseURL: '',
    endpoints: {
      auth: {
        status: '/api/auth/status',
        logout: '/api/auth/logout',
      },
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorageMock.removeItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
  });

  describe('hasSecureToken', () => {
    it('should return true when authentication is successful', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true })
      });

      const result = await hasSecureToken();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should return false when authentication fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: false })
      });

      const result = await hasSecureToken();
      expect(result).toBe(false);
    });

    it('should return false when request fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await hasSecureToken();
      expect(result).toBe(false);
    });

    it('should return false when fetch throws an error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await hasSecureToken();
      expect(result).toBe(false);
    });
  });

  describe('clearSecureToken', () => {
    it('should call logout endpoint and clear storage', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await clearSecureToken();

      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_at');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_ate');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('_sk');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should clear storage even if logout endpoint fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await clearSecureToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_at');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_ate');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('_sk');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('isWebCryptoSupported', () => {
    const originalCrypto = global.crypto;

    afterEach(() => {
      global.crypto = originalCrypto;
    });

    it('should return true when WebCrypto is supported', () => {
      global.crypto = {
        subtle: {}
      } as Crypto;

      const result = isWebCryptoSupported();
      expect(result).toBe(true);
    });

    it('should return false when crypto is undefined', () => {
      Object.defineProperty(global, 'crypto', { value: undefined, configurable: true });

      const result = isWebCryptoSupported();
      expect(result).toBe(false);
    });

    it('should return false when crypto.subtle is undefined', () => {
      global.crypto = {} as Crypto;

      const result = isWebCryptoSupported();
      expect(result).toBe(false);
    });
  });
});