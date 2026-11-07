import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import AreaListPage from '../src/app/areas/page';

jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Select: ({ placeholder, data, value, onChange, ...props }: any) => (
    <select
      data-testid="status-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      {data.map((item: any) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
  Pagination: ({ total, value, onChange }: any) => (
    <div className="mantine-Pagination-root">
      <button onClick={() => onChange(value - 1)} disabled={value <= 1}>Prev</button>
      <span>Page {value} of {total}</span>
      <button onClick={() => onChange(value + 1)} disabled={value >= total}>Next</button>
    </div>
  ),
}))
import { Area, BackendArea, Service } from '../src/types';
import { getAreasBackend, getServices, getAreas, deleteAreabyId, runAreaById } from '../src/services/areasService';
import { enableDisableArea } from '../src/services/adminService';
import { getCurrentUser } from '../src/services/authService';

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
  usePagination: jest.fn(() => ({
    active: 1,
    setPage: jest.fn(),
    range: [1, 2, 3],
    next: jest.fn(),
    previous: jest.fn(),
    first: jest.fn(),
    last: jest.fn()
  })),
  useCombobox: jest.fn(() => ({
    opened: false,
    openDropdown: jest.fn(),
    closeDropdown: jest.fn(),
    toggleDropdown: jest.fn(),
    getOptionProps: jest.fn(() => ({})),
    getDropdownProps: jest.fn(() => ({})),
    getInputProps: jest.fn(() => ({})),
    getToggleButtonProps: jest.fn(() => ({})),
    setSelectedOption: jest.fn(),
    selectedOption: null,
    resetSelectedOption: jest.fn()
  })),
  useSelect: jest.fn(() => ({
    opened: false,
    openDropdown: jest.fn(),
    closeDropdown: jest.fn(),
    toggleDropdown: jest.fn(),
    getOptionProps: jest.fn(() => ({})),
    getDropdownProps: jest.fn(() => ({})),
    getInputProps: jest.fn(() => ({})),
    getToggleButtonProps: jest.fn(() => ({})),
    setSelectedOption: jest.fn(),
    selectedOption: null,
    resetSelectedOption: jest.fn()
  })),
  useDownload: jest.fn(() => ({ downloading: false, download: jest.fn() })),
}));

// Cast the mocked functions
const mockedGetAreasBackend = getAreasBackend as jest.MockedFunction<typeof getAreasBackend>;
const mockedGetServices = getServices as jest.MockedFunction<typeof getServices>;
const mockedGetAreas = getAreas as jest.MockedFunction<typeof getAreas>;
const mockedDeleteAreabyId = deleteAreabyId as jest.MockedFunction<typeof deleteAreabyId>;
const mockedRunAreaById = runAreaById as jest.MockedFunction<typeof runAreaById>;
const mockedEnableDisableArea = enableDisableArea as jest.MockedFunction<typeof enableDisableArea>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

// Mock scrollIntoView for jsdom
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

// Mock the services
jest.mock('../src/services/areasService', () => ({
  getAreas: jest.fn(),
  getServices: jest.fn(() => Promise.resolve([
    {
      id: '1',
      key: 'github',
      name: 'GitHub',
      auth: 'NONE' as const,
      isActive: true,
      iconLightUrl: '/github.svg',
      iconDarkUrl: '/github.svg'
    },
    {
      id: '2',
      key: 'gmail',
      name: 'Gmail',
      auth: 'NONE' as const,
      isActive: true,
      iconLightUrl: '/gmail.svg',
      iconDarkUrl: '/gmail.svg'
    }
  ])),
  deleteAreabyId: jest.fn(),
  runAreaById: jest.fn(),
  getAreasBackend: jest.fn(() => Promise.resolve([
    {
      id: '1',
      name: 'Test Area 1',
      description: 'Test description 1',
      enabled: true,
      userId: 'user1',
      userEmail: 'user1@example.com',
      actions: [],
      reactions: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Test Area 2',
      description: 'Test description 2',
      enabled: false,
      userId: 'user2',
      userEmail: 'user2@example.com',
      actions: [],
      reactions: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
  ])),
}));

jest.mock('../src/services/adminService', () => ({
  enableDisableArea: jest.fn(),
}));

jest.mock('../src/services/authService', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'password',
    avatarSrc: '/avatar.jpg',
    profileData: {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User'
    },
    isAdmin: false,
    isVerified: true
  })),
}));

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock the components
jest.mock('../src/components/ui/areaList/AreaListCard', () => {
  return function MockAreaListCard({ areas, onDelete, onRun, onEnableDisable }: { areas: (Area | BackendArea)[], onDelete?: (id: string | number) => void, onRun?: (id: string | number) => void, onEnableDisable?: (id: string | number, enable: boolean) => void }) {
    return (
      <div data-testid="area-list-card">
        {areas.map((area) => (
          <div key={area.id} data-testid={`area-${area.id}`}>
            {area.name}
            {onDelete && <button onClick={() => onDelete(area.id)}>Delete</button>}
            {onRun && <button onClick={() => onRun(area.id)}>Run</button>}
            {onEnableDisable && 'enabled' in area && <button onClick={() => onEnableDisable(area.id, !area.enabled)}>Toggle</button>}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../src/components/ui/areaList/ServiceFilter', () => {
  return function MockServiceFilter({ services, value, onChange }: { services: Service[], value: string[], onChange: (value: string[]) => void }) {
    return (
      <div data-testid="service-filter">
        <select
          data-testid="service-select"
          multiple
          value={value}
          onChange={(e) => onChange(Array.from(e.target.selectedOptions, (option) => option.value))}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>
    );
  };
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('AreaListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title and create button', async () => {
    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('Areas')).toBeInTheDocument();
      expect(screen.getByText('Create New Area')).toBeInTheDocument();
    });
  });

  it('loads and displays areas from backend', async () => {
    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByTestId('area-list-card')).toBeInTheDocument();
      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
      expect(screen.getByText('Test Area 2')).toBeInTheDocument();
    });
  });

  it('filters areas by name search', async () => {
    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(searchInput, { target: { value: 'Area 1' } });

    // The filtering logic is in the component, but since we're mocking AreaListCard,
    // we need to check that the filtered areas are passed correctly
    await waitFor(() => {
      // This test verifies the search input works
      expect(searchInput).toHaveValue('Area 1');
    });
  });

  it('filters areas by status', async () => {
    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
    });

    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Area 2')).not.toBeInTheDocument();
    });
  });

  it('clears all filters', async () => {
    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
    });

    // Set some filters
    const searchInput = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
      expect(screen.getByText('Test Area 2')).toBeInTheDocument();
    });
  });

  it('navigates to create area page when create button is clicked', async () => {
    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('Create New Area')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create New Area');
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledWith('/areas/create-simple');
  });

  it('redirects to login if user is not authenticated', async () => {
    // @ts-ignore - mocking getCurrentUser to return null
    getCurrentUser.mockResolvedValue(null);

    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('falls back to legacy mode if backend fails', async () => {
    mockedGetAreasBackend.mockRejectedValue(new Error('Backend failed'));
    mockedGetAreas.mockResolvedValue([
      { id: '1', name: 'Legacy Area', status: 'success' as const, services: ['github'], description: 'Legacy', lastRun: '2024-01-01' }
    ]);

    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockedGetAreas).toHaveBeenCalled();
    });
  });

  it('handles delete area', async () => {
    mockedDeleteAreabyId.mockResolvedValue();

    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);
    });

    expect(mockedDeleteAreabyId).toHaveBeenCalledWith('1');
  });

  it('handles run area', async () => {
    mockedRunAreaById.mockResolvedValue();

    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      const runButton = screen.getAllByText('Run')[0];
      fireEvent.click(runButton);
    });

    expect(mockedRunAreaById).toHaveBeenCalledWith('1');
  });

  it('handles enable/disable area', async () => {
    mockedEnableDisableArea.mockResolvedValue();
    mockedGetAreasBackend.mockResolvedValue([
      {
        id: '1',
        name: 'Test Area 1',
        description: 'Test description 1',
        enabled: true,
        userId: 'user1',
        userEmail: 'user1@example.com',
        actions: [],
        reactions: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Test Area 2',
        description: 'Test description 2',
        enabled: false,
        userId: 'user2',
        userEmail: 'user2@example.com',
        actions: [],
        reactions: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
    ]);

    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      const toggleButton = screen.getAllByText('Toggle')[0];
      fireEvent.click(toggleButton);
    });

    expect(mockedEnableDisableArea).toHaveBeenCalledWith('1', false);
  });

  it('shows no areas found message when filtered areas is empty', async () => {
    mockedGetAreasBackend.mockResolvedValue([]);

    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByText('No areas found.')).toBeInTheDocument();
    });
  });

  it('shows pagination when there are more areas than items per page', async () => {
    const manyAreas: BackendArea[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Test Area ${i + 1}`,
      description: `Test description ${i + 1}`,
      enabled: true,
      userId: 'user1',
      userEmail: 'user1@example.com',
      actions: [],
      reactions: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }));

    mockedGetAreasBackend.mockResolvedValue(manyAreas);

    render(<AreaListPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      // Should show only 5 areas per page
      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
      expect(screen.getByText('Test Area 5')).toBeInTheDocument();
      expect(screen.queryByText('Test Area 6')).not.toBeInTheDocument();
    });

    // Check for pagination controls (Mantine Pagination might not have role="navigation")
    const paginationElement = document.querySelector('.mantine-Pagination-root');
    expect(paginationElement).toBeInTheDocument();
  });
});