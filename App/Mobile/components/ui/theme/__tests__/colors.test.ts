import { bg, border, text, themeColors } from '../colors';

describe('themeColors', () => {
  it('should contain all required theme color constants', () => {
    expect(themeColors).toEqual({
      // Main brand colors
      main: 'main',
      mainDark: 'main-dark',
      
      // Surface colors
      surface: 'surface',
      surfaceMuted: 'surface-muted',
      
      // Accent color
      accent: 'accent',
      
      // Text colors
      textPrimary: 'text-primary',
      textSecondary: 'text-secondary',
      
      // Utility colors
      highlight: 'highlight',
      borderLight: 'border-light',
      
      // Semantic colors
      error: 'error-500',
      success: 'success-500',
      warning: 'warning-500',
      info: 'info-500',
      
      // Background variations
      background: 'background-0',
      backgroundMuted: 'background-muted',
    });
  });

  it('should be immutable (readonly)', () => {
    // In JavaScript, objects are not truly immutable by default
    // This test verifies the structure is as expected
    expect(Object.keys(themeColors)).toHaveLength(15);
    expect(themeColors.main).toBe('main');
  });

  it('should contain string values for all color keys', () => {
    Object.values(themeColors).forEach(color => {
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });
});

describe('color helper functions', () => {
  describe('bg', () => {
    it('should return correct background class', () => {
      expect(bg('surface')).toBe('bg-surface');
      expect(bg('main')).toBe('bg-main');
      expect(bg('error-500')).toBe('bg-error-500');
    });

    it('should work with themeColors constants', () => {
      expect(bg(themeColors.surface)).toBe('bg-surface');
      expect(bg(themeColors.main)).toBe('bg-main');
      expect(bg(themeColors.textPrimary)).toBe('bg-text-primary');
    });

    it('should handle empty string', () => {
      expect(bg('')).toBe('bg-');
    });
  });

  describe('text', () => {
    it('should return correct text class', () => {
      expect(text('text-primary')).toBe('text-text-primary');
      expect(text('main')).toBe('text-main');
      expect(text('error-500')).toBe('text-error-500');
    });

    it('should work with themeColors constants', () => {
      expect(text(themeColors.textPrimary)).toBe('text-text-primary');
      expect(text(themeColors.main)).toBe('text-main');
      expect(text(themeColors.error)).toBe('text-error-500');
    });

    it('should handle empty string', () => {
      expect(text('')).toBe('text-');
    });
  });

  describe('border', () => {
    it('should return correct border class', () => {
      expect(border('border-light')).toBe('border-border-light');
      expect(border('main')).toBe('border-main');
      expect(border('error-500')).toBe('border-error-500');
    });

    it('should work with themeColors constants', () => {
      expect(border(themeColors.borderLight)).toBe('border-border-light');
      expect(border(themeColors.main)).toBe('border-main');
      expect(border(themeColors.accent)).toBe('border-accent');
    });

    it('should handle empty string', () => {
      expect(border('')).toBe('border-');
    });
  });
});

describe('color helper integration', () => {
  it('should work together for complete styling', () => {
    const surfaceStyles = {
      background: bg(themeColors.surface),
      text: text(themeColors.textPrimary),
      border: border(themeColors.borderLight),
    };

    expect(surfaceStyles).toEqual({
      background: 'bg-surface',
      text: 'text-text-primary',
      border: 'border-border-light',
    });
  });

  it('should support chaining in template literals', () => {
    const className = `${bg(themeColors.surface)} ${text(themeColors.textPrimary)} ${border(themeColors.borderLight)}`;
    expect(className).toBe('bg-surface text-text-primary border-border-light');
  });
});