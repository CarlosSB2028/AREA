import { mockUser } from '../../src/mocks/user';

describe('User mock data', () => {
  it('should have valid mock user', () => {
    expect(mockUser).toBeDefined();
    expect(typeof mockUser).toBe('object');
  });

  it('should have user with correct structure', () => {
    expect(mockUser).toHaveProperty('name');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('avatarSrc');
    expect(mockUser).toHaveProperty('profileData');
  });

  it('should have valid profile data', () => {
    expect(mockUser.profileData).toHaveProperty('email');
    expect(mockUser.profileData).toHaveProperty('firstName');
    expect(mockUser.profileData).toHaveProperty('lastName');
    expect(mockUser.profileData).toHaveProperty('language');
  });

  it('should have valid email format', () => {
    expect(mockUser.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(mockUser.profileData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('should have user name matching profile', () => {
    const fullName = `${mockUser.profileData.firstName} ${mockUser.profileData.lastName}`;
    expect(mockUser.name).toBe(fullName);
  });
});
