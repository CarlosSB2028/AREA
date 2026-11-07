import { USE_MOCK_DATA, API_CONFIG } from '../../src/config/api';

describe('API configuration', () => {
  it('should have USE_MOCK_DATA defined', () => {
    expect(USE_MOCK_DATA).toBeDefined();
    expect(typeof USE_MOCK_DATA).toBe('boolean');
  });

  it('should have API_CONFIG defined', () => {
    expect(API_CONFIG).toBeDefined();
    expect(API_CONFIG).toHaveProperty('baseURL');
    expect(API_CONFIG).toHaveProperty('endpoints');
  });

  it('should have endpoints configured', () => {
    expect(API_CONFIG.endpoints).toBeDefined();
    expect(API_CONFIG.endpoints).toHaveProperty('auth');
    expect(API_CONFIG.endpoints).toHaveProperty('areas');
    expect(API_CONFIG.endpoints).toHaveProperty('services');
    expect(API_CONFIG.endpoints).toHaveProperty('user');
  });

  it('should have auth endpoints', () => {
    expect(API_CONFIG.endpoints.auth).toHaveProperty('login');
    expect(API_CONFIG.endpoints.auth).toHaveProperty('register');
    expect(API_CONFIG.endpoints.auth).toHaveProperty('logout');
    expect(API_CONFIG.endpoints.auth).toHaveProperty('refresh');
    expect(API_CONFIG.endpoints.auth).toHaveProperty('providers');
    expect(API_CONFIG.endpoints.auth).toHaveProperty('forgotPassword');
  });

  it('should have areas endpoints', () => {
    expect(API_CONFIG.endpoints.areas).toHaveProperty('list');
    expect(API_CONFIG.endpoints.areas).toHaveProperty('create');
    expect(API_CONFIG.endpoints.areas).toHaveProperty('update');
    expect(API_CONFIG.endpoints.areas).toHaveProperty('delete');
  });

  it('should have services endpoints', () => {
    expect(API_CONFIG.endpoints.services).toHaveProperty('list');
    expect(API_CONFIG.endpoints.services).toHaveProperty('search');
  });

  it('should have user endpoints', () => {
    expect(API_CONFIG.endpoints.user).toHaveProperty('profile');
    expect(API_CONFIG.endpoints.user).toHaveProperty('avatar');
    expect(API_CONFIG.endpoints.user).toHaveProperty('getUser');
  });
});
