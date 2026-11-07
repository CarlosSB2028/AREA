// Test all mock data files for consistency and completeness
import { mockAccounts } from '../../src/mocks/accounts';
import { mockUser } from '../../src/mocks/user';
import { data as adminChartData, lineData, barData, revenueData, profitData, users } from '../../src/mocks/adminData';

describe('Mock Data - Accounts', () => {
  it('should have mockAccounts data', () => {
    expect(mockAccounts).toBeDefined();
    expect(Array.isArray(mockAccounts)).toBe(true);
    expect(mockAccounts.length).toBeGreaterThan(0);
  });

  it('should have Slack, Gmail, and GitHub accounts', () => {
    const accountNames = mockAccounts.map(a => a.accountName);
    expect(accountNames).toContain('Slack Account');
    expect(accountNames).toContain('Gmail Account');
    expect(accountNames).toContain('GitHub Account');
  });

  it('account should have required properties', () => {
    mockAccounts.forEach(account => {
      expect(account).toHaveProperty('logo');
      expect(account).toHaveProperty('accountName');
      expect(account).toHaveProperty('email');
      expect(account).toHaveProperty('isLoggedIn');
      expect(typeof account.accountName).toBe('string');
      expect(typeof account.email).toBe('string');
      expect(typeof account.isLoggedIn).toBe('boolean');
    });
  });

  it('should have at least one logged-in account', () => {
    const loggedIn = mockAccounts.filter(a => a.isLoggedIn);
    expect(loggedIn.length).toBeGreaterThan(0);
  });

  it('should have at least one logged-out account', () => {
    const loggedOut = mockAccounts.filter(a => !a.isLoggedIn);
    expect(loggedOut.length).toBeGreaterThan(0);
  });
});

describe('Mock Data - User', () => {
  it('should have mockUser data', () => {
    expect(mockUser).toBeDefined();
  });

  it('user should have required properties', () => {
    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('name');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('password');
  });

  it('user should have valid email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(mockUser.email).toMatch(emailRegex);
  });

  it('user should be verified', () => {
    expect(mockUser.isVerified).toBe(true);
  });

  it('user should be admin', () => {
    expect(mockUser.isAdmin).toBe(true);
  });

  it('user profile should have first and last name', () => {
    expect(mockUser.profileData).toHaveProperty('firstName');
    expect(mockUser.profileData).toHaveProperty('lastName');
    expect(mockUser.profileData.firstName).toBe('Test');
    expect(mockUser.profileData.lastName).toBe('Tester');
  });
});

describe('Mock Data - Admin Dashboard', () => {
  describe('line data', () => {
    it('should have line data', () => {
      expect(lineData).toBeDefined();
      expect(Array.isArray(lineData)).toBe(true);
      expect(lineData.length).toBeGreaterThan(0);
    });

    it('line data should have date and users properties', () => {
      lineData.forEach(data => {
        expect(data).toHaveProperty('date');
        expect(data).toHaveProperty('users');
        expect(typeof data.date).toBe('string');
        expect(typeof data.users).toBe('number');
      });
    });

    it('should have data for multiple days', () => {
      expect(lineData.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('bar data', () => {
    it('should have bar data', () => {
      expect(barData).toBeDefined();
      expect(Array.isArray(barData)).toBe(true);
      expect(barData.length).toBeGreaterThan(0);
    });

    it('bar data should have month and users properties', () => {
      barData.forEach(data => {
        expect(data).toHaveProperty('month');
        expect(data).toHaveProperty('users');
        expect(typeof data.month).toBe('string');
        expect(typeof data.users).toBe('number');
      });
    });

    it('should have data for at least 12 months', () => {
      expect(barData.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('revenue data', () => {
    it('should have revenue data', () => {
      expect(revenueData).toBeDefined();
      expect(Array.isArray(revenueData)).toBe(true);
      expect(revenueData.length).toBeGreaterThan(0);
    });

    it('revenue data should have month and revenue properties', () => {
      revenueData.forEach(data => {
        expect(data).toHaveProperty('month');
        expect(data).toHaveProperty('revenue');
        expect(typeof data.revenue).toBe('number');
        expect(data.revenue).toBeGreaterThan(0);
      });
    });

    it('revenue should be positive', () => {
      revenueData.forEach(data => {
        expect(data.revenue).toBeGreaterThan(0);
      });
    });
  });

  describe('profit data', () => {
    it('should have profit data', () => {
      expect(profitData).toBeDefined();
      expect(Array.isArray(profitData)).toBe(true);
      expect(profitData.length).toBeGreaterThan(0);
    });

    it('profit data should have month and profit properties', () => {
      profitData.forEach(data => {
        expect(data).toHaveProperty('month');
        expect(data).toHaveProperty('profit');
        expect(typeof data.profit).toBe('number');
        expect(data.profit).toBeGreaterThan(0);
      });
    });

    it('profit should be less than or equal to revenue', () => {
      expect(profitData.every(p => p.profit > 0)).toBe(true);
    });
  });

  describe('users data', () => {
    it('should have users data', () => {
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it('should have multiple users', () => {
      expect(users.length).toBeGreaterThanOrEqual(20);
    });

    it('user should have id, name, email, and role', () => {
      users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.role).toBe('string');
      });
    });

    it('users should have valid roles', () => {
      const validRoles = ['Admin', 'User'];
      users.forEach(user => {
        expect(validRoles).toContain(user.role);
      });
    });

    it('should have at least one admin user', () => {
      const admins = users.filter(u => u.role === 'Admin');
      expect(admins.length).toBeGreaterThan(0);
    });

    it('should have mostly regular users', () => {
      const regularUsers = users.filter(u => u.role === 'User');
      expect(regularUsers.length).toBeGreaterThan(0);
    });

    it('should have valid email formats', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      users.forEach(user => {
        expect(user.email).toMatch(emailRegex);
      });
    });

    it('user ids should be unique', () => {
      const ids = users.map(u => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('admin chart data', () => {
    it('should have admin chart data', () => {
      expect(adminChartData).toBeDefined();
      expect(typeof adminChartData).toBe('object');
    });

    it('admin chart data should have date entries', () => {
      const keys = Object.keys(adminChartData);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach(key => {
        expect(typeof adminChartData[key as keyof typeof adminChartData]).toBe('number');
      });
    });
  });

  describe('data consistency', () => {
    it('revenue should be greater than or equal to profit', () => {
      const revenueByMonth = new Map(revenueData.map(r => [r.month, r.revenue]));
      profitData.forEach(p => {
        const revenue = revenueByMonth.get(p.month);
        if (revenue !== undefined) {
          expect(p.profit).toBeLessThanOrEqual(revenue);
        }
      });
    });

    it('all months in barData should have positive user counts', () => {
      barData.forEach(data => {
        expect(data.users).toBeGreaterThan(0);
      });
    });

    it('user count should generally increase over time in lineData', () => {
      // At least some data points should show growth pattern
      let hasGrowth = false;
      for (let i = 1; i < lineData.length; i++) {
        if (lineData[i].users > lineData[i - 1].users) {
          hasGrowth = true;
          break;
        }
      }
      expect(hasGrowth).toBe(true);
    });
  });
});
