import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'nativewind';
import { useDesignTokens } from '../useDesignTokens';

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('useDesignTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('en mode light', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue({ 
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
      });
    });

    it('devrait retourner les bonnes valeurs de tokens pour le mode light', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.getToken('primary-500')).toBe('rgb(51 51 51)');
      expect(result.current.getToken('typography-900')).toBe('rgb(38 38 39)');
      expect(result.current.getToken('background-0')).toBe('rgb(255 255 255)');
      expect(result.current.getToken('indigo-600')).toBe('rgb(99 102 241)');
    });

    it('devrait retourner les bonnes classes Tailwind', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.getTokenClass('primary-600')).toBe('text-primary-600');
      expect(result.current.getBgTokenClass('background-0')).toBe('bg-background-0');
      expect(result.current.getBorderTokenClass('outline-200')).toBe('border-outline-200');
    });

    it('devrait indiquer le mode colorScheme correct', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.colorScheme).toBe('light');
    });
  });

  describe('en mode dark', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue({ 
        colorScheme: 'dark',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
      });
    });

    it('devrait retourner les bonnes valeurs de tokens pour le mode dark', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.getToken('primary-500')).toBe('rgb(230 230 230)');
      expect(result.current.getToken('typography-900')).toBe('rgb(245 245 245)');
      expect(result.current.getToken('background-0')).toBe('rgb(18 18 18)');
      expect(result.current.getToken('indigo-600')).toBe('rgb(129 140 248)');
    });

    it('devrait indiquer le mode colorScheme correct', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.colorScheme).toBe('dark');
    });
  });

  describe('en mode null/undefined', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue({ 
        colorScheme: undefined,
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
      });
    });

    it('devrait utiliser le mode light par défaut', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.colorScheme).toBe('light');
      expect(result.current.getToken('primary-500')).toBe('rgb(51 51 51)');
    });
  });

  describe('tokens sémantiques', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue({ 
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
      });
    });

    it('devrait retourner les bonnes couleurs pour les états sémantiques', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.getToken('error-500')).toBe('rgb(230 53 53)');
      expect(result.current.getToken('success-600')).toBe('rgb(42 121 72)');
      expect(result.current.getToken('warning-700')).toBe('rgb(180 90 26)');
      expect(result.current.getToken('info-500')).toBe('rgb(13 166 242)');
    });
  });

  describe('tokens d\'interface', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue({ 
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
      });
    });

    it('devrait retourner les bonnes couleurs pour les éléments d\'interface', () => {
      const { result } = renderHook(() => useDesignTokens());

      expect(result.current.getToken('gray-500')).toBe('rgb(107 114 128)');
      expect(result.current.getToken('gray-400')).toBe('rgb(156 163 175)');
      expect(result.current.getToken('gray-200')).toBe('rgb(229 231 235)');
      expect(result.current.getToken('yellow-400')).toBe('rgb(252 211 77)');
    });
  });
});