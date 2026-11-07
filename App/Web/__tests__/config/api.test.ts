import { API_CONFIG, buildApiUrl } from '../../src/config/api';

describe('api configuration', () => {
  describe('API_CONFIG', () => {
    it('should have a baseURL', () => {
      expect(API_CONFIG.baseURL).toBeDefined();
      expect(typeof API_CONFIG.baseURL).toBe('string');
    });
  });

  describe('buildApiUrl', () => {
    it('should build correct URL with endpoint', () => {
      const url = buildApiUrl('/api/test');
      expect(url).toContain('/api/test');
      expect(url).toMatch(/^https?:\/\/.+\/api\/test$/);
    });

    it('should handle endpoints without leading slash', () => {
      const url = buildApiUrl('api/test');
      expect(url).toContain('api/test');
    });

    it('should handle empty endpoint', () => {
      const url = buildApiUrl('');
      expect(url).toBe(API_CONFIG.baseURL);
    });

    it('should concatenate baseURL and endpoint correctly', () => {
      const endpoint = '/test/endpoint';
      const url = buildApiUrl(endpoint);
      expect(url).toBe(`${API_CONFIG.baseURL}${endpoint}`);
    });
  });
});