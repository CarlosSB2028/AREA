jest.unmock('../../src/services/authService');

import {
  getAuthStatus
} from '../../src/services/authService';

describe('authService with mock data', () => {
  describe('getAuthStatus', () => {
    it('should get authentication status', async () => {
      const result = await getAuthStatus();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('authenticated');
      expect(typeof result.authenticated).toBe('boolean');
    });
  });
});
