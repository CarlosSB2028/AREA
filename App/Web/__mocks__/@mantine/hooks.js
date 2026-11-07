module.exports = {
  usePrevious: jest.fn((value) => value),
  useMediaQuery: jest.fn(() => false),
  useViewportSize: jest.fn(() => ({ width: 1024, height: 768 })),
  useHover: jest.fn(() => [{ current: null }, false]),
  useId: jest.fn((id) => id || 'test-id'),
  useClickOutside: jest.fn(),
  useDisclosure: jest.fn((initial = false) => [initial, { open: jest.fn(), close: jest.fn(), toggle: jest.fn() }]),
};
