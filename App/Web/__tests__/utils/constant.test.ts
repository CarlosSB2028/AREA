import { TIME_MS, TOKEN_EXPIRY } from '../../src/utils/constant';

describe('constant.ts', () => {
  describe('TIME_MS', () => {
    it('should define SECOND constant as 1000ms', () => {
      expect(TIME_MS.SECOND).toBe(1000);
    });

    it('should define MINUTE constant', () => {
      expect(TIME_MS.MINUTE).toBe(60000);
    });

    it('should define HOUR constant', () => {
      expect(TIME_MS.HOUR).toBe(3600000);
    });

    it('should define DAY constant', () => {
      expect(TIME_MS.DAY).toBe(86400000);
    });

    it('should define WEEK constant', () => {
      expect(TIME_MS.WEEK).toBe(604800000);
    });

    it('should have correct time relationships', () => {
      expect(TIME_MS.MINUTE).toBe(TIME_MS.SECOND * 60);
      expect(TIME_MS.HOUR).toBe(TIME_MS.MINUTE * 60);
      expect(TIME_MS.DAY).toBe(TIME_MS.HOUR * 24);
      expect(TIME_MS.WEEK).toBe(TIME_MS.DAY * 7);
    });

    it('should have ascending values', () => {
      expect(TIME_MS.SECOND).toBeLessThan(TIME_MS.MINUTE);
      expect(TIME_MS.MINUTE).toBeLessThan(TIME_MS.HOUR);
      expect(TIME_MS.HOUR).toBeLessThan(TIME_MS.DAY);
      expect(TIME_MS.DAY).toBeLessThan(TIME_MS.WEEK);
    });

    it('should all be positive numbers', () => {
      expect(TIME_MS.SECOND).toBeGreaterThan(0);
      expect(TIME_MS.MINUTE).toBeGreaterThan(0);
      expect(TIME_MS.HOUR).toBeGreaterThan(0);
      expect(TIME_MS.DAY).toBeGreaterThan(0);
      expect(TIME_MS.WEEK).toBeGreaterThan(0);
    });
  });

  describe('TOKEN_EXPIRY', () => {
    it('should define SHORT expiry as 1 hour', () => {
      expect(TOKEN_EXPIRY.SHORT).toBe(TIME_MS.HOUR);
    });

    it('should define MEDIUM expiry as 8 hours', () => {
      expect(TOKEN_EXPIRY.MEDIUM).toBe(TIME_MS.HOUR * 8);
    });

    it('should define LONG expiry as 1 day', () => {
      expect(TOKEN_EXPIRY.LONG).toBe(TIME_MS.DAY);
    });

    it('should define REMEMBER_ME expiry as 1 week', () => {
      expect(TOKEN_EXPIRY.REMEMBER_ME).toBe(TIME_MS.WEEK);
    });

    it('should have ascending expiry times', () => {
      expect(TOKEN_EXPIRY.SHORT).toBeLessThan(TOKEN_EXPIRY.MEDIUM);
      expect(TOKEN_EXPIRY.MEDIUM).toBeLessThan(TOKEN_EXPIRY.LONG);
      expect(TOKEN_EXPIRY.LONG).toBeLessThan(TOKEN_EXPIRY.REMEMBER_ME);
    });

    it('should use TIME_MS constants', () => {
      expect(TOKEN_EXPIRY.SHORT).toBe(TIME_MS.HOUR);
      expect(TOKEN_EXPIRY.MEDIUM).toBe(TIME_MS.HOUR * 8);
      expect(TOKEN_EXPIRY.LONG).toBe(TIME_MS.DAY);
      expect(TOKEN_EXPIRY.REMEMBER_ME).toBe(TIME_MS.WEEK);
    });

    it('should all be positive numbers', () => {
      expect(TOKEN_EXPIRY.SHORT).toBeGreaterThan(0);
      expect(TOKEN_EXPIRY.MEDIUM).toBeGreaterThan(0);
      expect(TOKEN_EXPIRY.LONG).toBeGreaterThan(0);
      expect(TOKEN_EXPIRY.REMEMBER_ME).toBeGreaterThan(0);
    });
  });
});
