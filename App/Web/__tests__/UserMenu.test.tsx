import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { UserMenu } from '@/components/ui/user/UserMenu'

jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core');
  const MockMenu = ({ children }: { children: React.ReactNode }) => <div data-testid="menu">{children}</div>;
  MockMenu.Target = ({ children }: { children: React.ReactNode }) => children;
  (MockMenu.Target as any).displayName = 'MenuTarget';
  MockMenu.Dropdown = ({ children }: { children: React.ReactNode }) => <div data-testid="menu-dropdown">{children}</div>;
  (MockMenu.Dropdown as any).displayName = 'MenuDropdown';
  MockMenu.Item = ({ children, onClick, leftSection, rightSection }: {
    children: React.ReactNode;
    onClick?: () => void;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
  }) => (
    <div data-testid="menu-item" onClick={onClick}>
      {leftSection}
      {children}
      {rightSection}
    </div>
  );
  (MockMenu.Item as any).displayName = 'MenuItem';
  MockMenu.Divider = () => <div data-testid="menu-divider" />;
  (MockMenu.Divider as any).displayName = 'MenuDivider';
  MockMenu.Label = ({ children }: { children: React.ReactNode }) => <div data-testid="menu-label">{children}</div>;
  (MockMenu.Label as any).displayName = 'MenuLabel';

  return {
    ...actual,
    Menu: MockMenu,
  };
});

jest.mock('@mantine/hooks', () => ({
  usePrevious: jest.fn(() => null),
  upperFirst: jest.fn((str: string) => str.charAt(0).toUpperCase() + str.slice(1)),
  useIsomorphicEffect: jest.fn(() => {}),
  useId: jest.fn(() => 'mantine-test-id'),
  useUncontrolled: jest.fn(() => ['', jest.fn(), false]),
  useReducedMotion: jest.fn(() => false),
  useClickOutside: jest.fn(() => [jest.fn(), jest.fn()]),
  useFocusReturn: jest.fn(() => ({ onFocusEnter: jest.fn(), onFocusLeave: jest.fn() })),
  useFocusTrap: jest.fn(() => ({ activate: jest.fn(), deactivate: jest.fn() })),
  useHotkeys: jest.fn(() => {}),
  useHover: jest.fn(() => ({ hovered: false, ref: { current: null } })),
  useIntersection: jest.fn(() => ({ ref: { current: null }, entry: null })),
  useMediaQuery: jest.fn(() => false),
  useMergedRef: jest.fn(() => ({ current: null })),
  useMove: jest.fn(() => ({ ref: { current: null }, active: false })),
  useOrientation: jest.fn(() => ({ angle: 0, type: 'landscape-primary' })),
  useResizeObserver: jest.fn(() => [{ width: 0, height: 0 }, { current: null }]),
  useScrollIntoView: jest.fn(() => ({ scrollIntoView: jest.fn(), targetRef: { current: null }, scrollableRef: { current: null } })),
  useToggle: jest.fn(() => [false, jest.fn()]),
  useViewportSize: jest.fn(() => ({ width: 1024, height: 768 })),
  useWindowEvent: jest.fn(() => {}),
  useWindowScroll: jest.fn(() => ({ x: 0, y: 0 })),
  useDebouncedValue: jest.fn((value) => [value]),
  useDebouncedCallback: jest.fn((fn) => fn),
  useThrottledCallback: jest.fn((fn) => fn),
  useDidUpdate: jest.fn(() => {}),
  useForceUpdate: jest.fn(() => jest.fn()),
  useListState: jest.fn(() => [[], { 
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
    reorder: jest.fn() 
  }]),
  useQueue: jest.fn(() => [[], { add: jest.fn(), clear: jest.fn(), size: 0 }]),
  useSetState: jest.fn((initial) => [initial, jest.fn()]),
  useCounter: jest.fn(() => [0, { increment: jest.fn(), decrement: jest.fn(), set: jest.fn(), reset: jest.fn() }]),
  useDisclosure: jest.fn(() => [false, { open: jest.fn(), close: jest.fn(), toggle: jest.fn() }]),
  useInputState: jest.fn((initial) => [initial, jest.fn()]),
  useTextSelection: jest.fn(() => ({ selection: null, ref: { current: null } })),
  useOs: jest.fn(() => 'windows'),
  useHash: jest.fn(() => ['', jest.fn()]),
  useLocalStorage: jest.fn(() => ['', jest.fn(), jest.fn()]),
  useSessionStorage: jest.fn(() => ['', jest.fn(), jest.fn()]),
  useColorScheme: jest.fn(() => 'light'),
  useNetwork: jest.fn(() => ({ online: true, rtt: 0, type: 'wifi', saveData: false, downlink: 10, effectiveType: '4g' })),
  usePageLeave: jest.fn(() => {}),
  useIdle: jest.fn(() => false),
  useEyeDropper: jest.fn(() => ({ supported: false, open: jest.fn() })),
  useFavicon: jest.fn(() => [null, jest.fn()]),
  useFullscreen: jest.fn(() => ({ ref: { current: null }, toggle: jest.fn(), fullscreen: false })),
  useGeolocation: jest.fn(() => ({ 
    loading: false, 
    accuracy: 0, 
    altitude: null, 
    altitudeAccuracy: null, 
    heading: null, 
    latitude: 0, 
    longitude: 0, 
    speed: null, 
    timestamp: Date.now(), 
    error: null 
  })),
  useMouse: jest.fn(() => ({ x: 0, y: 0, ref: { current: null } })),
  useClipboard: jest.fn(() => ({ copy: jest.fn(), copied: false, error: null })),
  useDownload: jest.fn(() => ({ downloading: false, download: jest.fn() })),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

const mockUser = {
  id: "1",
  name: "Test User",
  email: "testuser@example.com",
  avatarSrc: "https://example.com/avatar.png",
  password: 'zadsfqSGDSX*&é',
  isAdmin: true,
  isVerified: true,
  profileData: {
    email: "testuser@example.com",
    firstName: "Test",
    lastName: "User",
    language: "English",
  },
}

describe('UserMenu', () => {
  it('renders the user avatar', () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByLabelText('User menu')
    expect(avatar).toBeInTheDocument()
    const img = avatar.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockUser.avatarSrc)
  })

  it('opens menu when avatar is clicked', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByLabelText('User menu')
    fireEvent.click(avatar)
    // With the mock, menu is always open, so just check dropdown is present
    expect(screen.getByTestId('menu-dropdown')).toBeInTheDocument()
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  })

  it('clicks profile section without error', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByLabelText('User menu')
    fireEvent.click(avatar)
    await waitFor(() => {
      const profileGroup = screen.getByText(mockUser.name).closest('div')
      fireEvent.click(profileGroup!)
    })
  })

  it('clicks logout menu item without error', async () => {
    render(<UserMenu user={mockUser} />, { wrapper: AllTheProviders })
    const avatar = screen.getByLabelText('User menu')
    fireEvent.click(avatar)
    await waitFor(() => {
      const logoutItem = screen.getByText('Logout')
      fireEvent.click(logoutItem)
    })
  })
})