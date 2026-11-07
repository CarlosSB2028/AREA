// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height }: {
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
  }) =>
    React.createElement('img', { src, alt, width, height }),
}))

jest.mock('@mantine/carousel', () => ({
  Carousel: Object.assign(
    ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'carousel' }, children),
    {
      Slide: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'carousel-slide' }, children),
    }
  ),
}))

jest.mock('embla-carousel-autoplay', () => jest.fn(() => ({})))

// Mock Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(() => false),
  useIsomorphicEffect: jest.fn(() => {}),
  useLocalStorage: jest.fn(() => ['', jest.fn()]),
  useColorScheme: jest.fn(() => 'light'),
  useHotkeys: jest.fn(() => {}),
  useDebouncedValue: jest.fn((value) => [value]),
  useDebounce: jest.fn((fn) => fn),
  useClickOutside: jest.fn(() => jest.fn()),
  useFocusTrap: jest.fn(() => ({ ref: { current: null }, activate: jest.fn(), deactivate: jest.fn() })),
  useFocusReturn: jest.fn(() => jest.fn()),
  useMergedRef: jest.fn(() => ({ current: null })),
  useResizeObserver: jest.fn(() => ({ ref: { current: null }, width: 0, height: 0 })),
  useViewportSize: jest.fn(() => ({ width: 1024, height: 768 })),
  useIntersection: jest.fn(() => ({ ref: { current: null }, entry: null })),
  useHash: jest.fn(() => ['', jest.fn()]),
  useNetwork: jest.fn(() => ({ online: true })),
  useOs: jest.fn(() => 'macos'),
  usePageLeave: jest.fn(() => jest.fn()),
  useReducedMotion: jest.fn(() => false),
  useScrollLock: jest.fn(() => [false, jest.fn()]),
  useToggle: jest.fn(() => [false, jest.fn()]),
  useUncontrolled: jest.fn((options) => {
    // Handle arrays properly for useCombobox
    if (options?.defaultValue !== undefined && Array.isArray(options.defaultValue)) {
      return [options.defaultValue, jest.fn()];
    }
    if (options?.value !== undefined && Array.isArray(options.value)) {
      return [options.value, jest.fn()];
    }
    return [options?.defaultValue ?? options?.value ?? false, jest.fn()];
  }),
  useCombobox: jest.fn(() => ({
    resetSelectedOption: jest.fn(),
    openDropdown: jest.fn(),
    closeDropdown: jest.fn(),
    toggleDropdown: jest.fn(),
    selectFirstOption: jest.fn(),
    selectActiveOption: jest.fn(),
    selectNextOption: jest.fn(),
    selectPreviousOption: jest.fn(),
    updateSelectedOptionIndex: jest.fn(),
    listId: 'mantine-test-list-id',
    dropdownOpened: false,
    selectedOptionIndex: -1,
  })),
  useId: jest.fn(() => 'mantine-id'),
  useDidUpdate: jest.fn((fn) => fn()),
  useForceUpdate: jest.fn(() => jest.fn()),
  useLogger: jest.fn(() => ({ log: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  useTimeout: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), clear: jest.fn() })),
  useInterval: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), active: false })),
  useHover: jest.fn(() => ({ hovered: false, ref: { current: null } })),
  useMouse: jest.fn(() => ({ x: 0, y: 0, ref: { current: null } })),
  useMove: jest.fn(() => ({ x: 0, y: 0, active: false })),
  useFullscreen: jest.fn(() => ({ fullscreen: false, toggle: jest.fn(), ref: { current: null } })),
  useIdle: jest.fn(() => false),
  useEyeDropper: jest.fn(() => ({ supported: false, open: jest.fn() })),
  useFavicon: jest.fn(() => jest.fn()),
  useHeadroom: jest.fn(() => ({ fixed: false, floating: false })),
  useInputState: jest.fn((initialValue) => [initialValue, jest.fn()]),
  useListState: jest.fn((initialValue = []) => [initialValue, {
    setState: jest.fn(),
    append: jest.fn(),
    prepend: jest.fn(),
    insert: jest.fn(),
    remove: jest.fn(),
    pop: jest.fn(),
    shift: jest.fn(),
    apply: jest.fn(),
    applyWhere: jest.fn(),
    filter: jest.fn(),
    setItem: jest.fn(),
    setItemProp: jest.fn(),
    sort: jest.fn(),
    reorder: jest.fn(),
  }]),
  useCounter: jest.fn((initialValue = 0) => [initialValue, {
    increment: jest.fn(),
    decrement: jest.fn(),
    set: jest.fn(),
    reset: jest.fn(),
  }]),
  useSetState: jest.fn((initialState = {}) => [initialState, {
    setState: jest.fn(),
    reset: jest.fn(),
  }]),
  useDisclosure: jest.fn((initialState = false) => [initialState, {
    open: jest.fn(),
    close: jest.fn(),
    toggle: jest.fn(),
  }]),
  useSessionStorage: jest.fn((key, defaultValue) => [defaultValue, jest.fn()]),
  useWindowEvent: jest.fn(() => {}),
  useWindowScroll: jest.fn(() => ({ x: 0, y: 0 })),
  useElementSize: jest.fn(() => ({ ref: { current: null }, width: 0, height: 0 })),
  useShallowEffect: jest.fn((fn) => fn()),
  useValidatedState: jest.fn((initialValue) => [initialValue, jest.fn(), { valid: true, message: '' }]),
  useForm: jest.fn(() => ({
    values: {},
    errors: {},
    setValues: jest.fn(),
    setErrors: jest.fn(),
    setFieldValue: jest.fn(),
    setFieldError: jest.fn(),
    validate: jest.fn(),
    validateField: jest.fn(),
    reset: jest.fn(),
    resetDirty: jest.fn(),
    resetTouched: jest.fn(),
    isDirty: jest.fn(() => false),
    isTouched: jest.fn(() => false),
    isValid: jest.fn(() => true),
    getInputProps: jest.fn(() => ({})),
    getValues: jest.fn(() => ({})),
    onSubmit: jest.fn(),
    onReset: jest.fn(),
  })),
  mergeRefs: jest.fn(() => jest.fn()),
}))

process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'

// REMOVED: Global service mocks that were blocking coverage
// These services now use built-in mock data mode (USE_MOCK_DATA flag)
// Tests can import and test them directly with their actual implementations