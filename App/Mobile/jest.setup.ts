process.env.EXPO_PUBLIC_USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK ?? 'false';
process.env.EXPO_PUBLIC_MOCK_DELAY = process.env.EXPO_PUBLIC_USE_MOCK ?? '0';

declare global {
  var _ReactNativeCSSInterop: {
    StyleSheet: {
      create: (styles: any) => any;
      flatten: (style: any) => any;
    };
    css: jest.MockedFunction<any>;
    styled: jest.MockedFunction<any>;
  };
}

global._ReactNativeCSSInterop = {
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  css: jest.fn(),
  styled: jest.fn(),
};

// Silence NativeWind style injection warnings during tests
jest.mock('nativewind', () => {
  const actual = jest.requireActual('nativewind');
  return {
    ...actual,
    useColorScheme: () => ({ colorScheme: 'light', setColorScheme: () => {} }),
  };
});

// Mock expo-router router to prevent navigation errors
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    // Execute the provided effect immediately in tests so components depending
    // on focus effects (like loading OAuth providers) run during render.
    useFocusEffect: (effect: any) => {
      try {
        // effect is typically a function returned by useCallback
        const res = typeof effect === 'function' ? effect() : undefined;
        // If the effect returns a cleanup function, call it (no-op here)
        if (typeof res === 'function') {
          // call cleanup synchronously
          res();
        }
      } catch (e) {
        // swallow errors in the mock to avoid breaking unrelated tests
      }
      return undefined;
    },
  };
});

// Mock react-native-reanimated for Jest
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('react-native-reanimated').setUpTests();

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, left: 0, right: 0, bottom: 0 };
  return {
    SafeAreaView: require('react-native').View,
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaInsetsContext: { Provider: ({ children }: any) => children },
    useSafeAreaInsets: () => inset,
  };
});

// Mock Image from expo-image to RN Image for simplicity in tests
jest.mock('expo-image', () => require('react-native'));

// Initialize i18n for tests with default language 'en'
import '@/i18n';

// Suppress specific console.error warnings that are expected in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Ignore React act() warnings from async state updates in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('inside a test was not wrapped in act') ||
       args[0].includes('An update to') && args[0].includes('was not wrapped in act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
