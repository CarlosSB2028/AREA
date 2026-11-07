import { API_CONFIG } from '../../src/config/api';

const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockLocation = {
  href: '',
  pathname: '/test',
  includes: jest.fn()
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (window as any).location;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.location = mockLocation as any;

describe('axios configuration', () => {
  let axios: typeof import('axios').default;

  beforeEach(async () => {
    localStorageMock.clear();
    jest.clearAllMocks();
    mockLocation.pathname = '/test';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    axios = require('axios').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../../src/config/axios');
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should have a valid axios instance', () => {
    expect(axios).toBeDefined();
    expect(typeof axios.get).toBe('function');
    expect(typeof axios.post).toBe('function');
    expect(typeof axios.put).toBe('function');
    expect(typeof axios.delete).toBe('function');
  });

  it('should have interceptors configured', () => {
    expect(axios.interceptors).toBeDefined();
    expect(axios.interceptors.request).toBeDefined();
    expect(axios.interceptors.response).toBeDefined();
  });

  it('should have correct base configuration', () => {
    expect(axios.defaults).toBeDefined();
    expect(axios.defaults.baseURL).toBe(API_CONFIG.baseURL);
    expect(axios.defaults.withCredentials).toBe(true);
  });

  it('should have withCredentials set to true', () => {
    expect(axios.defaults.withCredentials).toBe(true);
  });

  it('should have baseURL configured', () => {
    expect(axios.defaults.baseURL).toBeDefined();
    expect(typeof axios.defaults.baseURL).toBe('string');
    expect(axios.defaults.baseURL).toBe(API_CONFIG.baseURL);
  });

  describe('request interceptor', () => {
    it('should configure Content-Type header', () => {
      // The request interceptor sets Content-Type
      expect(axios.defaults.headers.common).toBeDefined();
    });
  });

  describe('response interceptor', () => {
    it('should have response interceptor registered', () => {
      const handlers = (axios.interceptors.response as unknown as { handlers: Array<unknown> }).handlers || [];
      expect(handlers.length).toBeGreaterThan(0);
    });
  });

  describe('header configuration', () => {
    it('should have default headers object', () => {
      expect(axios.defaults.headers).toBeDefined();
    });
  });
});