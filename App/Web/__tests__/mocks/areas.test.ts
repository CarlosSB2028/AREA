import { data as mockAreas, services as mockServices } from '../../src/mocks/areas';

describe('Areas mock data', () => {
  it('should have valid mock areas', () => {
    expect(mockAreas).toBeDefined();
    expect(Array.isArray(mockAreas)).toBe(true);
    expect(mockAreas.length).toBeGreaterThan(0);
  });

  it('should have areas with correct structure', () => {
    mockAreas.forEach(area => {
      expect(area).toHaveProperty('id');
      expect(area).toHaveProperty('name');
      expect(area).toHaveProperty('description');
      expect(area).toHaveProperty('status');
      expect(area).toHaveProperty('services');
      expect(area).toHaveProperty('lastRun');
    });
  });

  it('should have valid mock services', () => {
    expect(mockServices).toBeDefined();
    expect(Array.isArray(mockServices)).toBe(true);
    expect(mockServices.length).toBeGreaterThan(0);
  });

  it('should have services with correct structure', () => {
    mockServices.forEach(service => {
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('logo');
    });
  });

  it('should have services with valid status values', () => {
    const validStatuses = ['success', 'failed', 'in progress', 'not started'];
    mockAreas.forEach(area => {
      expect(validStatuses).toContain(area.status);
    });
  });

  it('should have areas with service arrays', () => {
    mockAreas.forEach(area => {
      expect(Array.isArray(area.services)).toBe(true);
    });
  });
});
