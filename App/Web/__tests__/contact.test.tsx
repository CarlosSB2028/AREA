import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import ContactPage from '../src/app/contact/page';

jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Select: ({ placeholder, data, value, onChange, ...props }: any) => (
    <select
      data-testid="subject-select"
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
}))

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
}));

// Mock scrollIntoView for jsdom
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

// Create a custom render function with MantineProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    {children}
  </MantineProvider>
);

const customRender = (ui: React.ReactElement) => render(ui, { wrapper: AllTheProviders });

describe('ContactPage', () => {
  it('renders the contact page with title and logo', () => {
    customRender(<ContactPage />);

    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText("Questions or need help? We're here to assist you every step of the way.")).toBeInTheDocument();
    expect(screen.getByAltText('AREA Logo')).toBeInTheDocument();
  });

  it('renders contact method cards', () => {
    customRender(<ContactPage />);

    expect(screen.getByText('Email Support')).toBeInTheDocument();
    expect(screen.getByText('GitHub Issues')).toBeInTheDocument();
    expect(screen.getByText('Discord Community')).toBeInTheDocument();

    expect(screen.getByText('support@area-automation-platform.com')).toBeInTheDocument();
    expect(screen.getByText('github.com/area')).toBeInTheDocument();
    expect(screen.getByText('Join our server')).toBeInTheDocument();
  });

  it('renders the contact form with all required fields', () => {
    customRender(<ContactPage />);

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('subject-select')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us more about your inquiry...')).toBeInTheDocument();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
  });

  it('renders quick info cards', () => {
    customRender(<ContactPage />);

    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Phone Support')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();

    expect(screen.getByText('Within 24 hours')).toBeInTheDocument();
    expect(screen.getByText('+33 6 95 41 16 79')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('allows filling out the contact form', () => {
    customRender(<ContactPage />);

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const messageTextarea = screen.getByPlaceholderText('Tell us more about your inquiry...');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageTextarea, { target: { value: 'This is a test message' } });

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(messageTextarea).toHaveValue('This is a test message');
  });

  it('allows selecting a subject from the dropdown', () => {
    customRender(<ContactPage />);

    const subjectSelect = screen.getByTestId('subject-select');
    fireEvent.change(subjectSelect, { target: { value: 'support' } });

    // The select should now have the selected value
    expect(subjectSelect).toHaveValue('support');
  });

  it('submits the form and shows success message', async () => {
    // Mock console.log to avoid console output during tests
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    customRender(<ContactPage />);

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const subjectSelect = screen.getByTestId('subject-select');
    const messageTextarea = screen.getByPlaceholderText('Tell us more about your inquiry...');
    const submitButton = screen.getByText('Send Message');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    // Select subject
    fireEvent.change(subjectSelect, { target: { value: 'support' } });

    fireEvent.change(messageTextarea, { target: { value: 'This is a test message' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check that console.log was called with form data
    expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'support',
      message: 'This is a test message',
    });

    // Check that success message appears
    await waitFor(() => {
      expect(screen.getByText('Message Sent!')).toBeInTheDocument();
      expect(screen.getByText('Thank you! We\'ll get back to you soon.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('does not submit form with empty required fields due to HTML5 validation', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    customRender(<ContactPage />);

    const submitButton = screen.getByText('Send Message');
    fireEvent.click(submitButton);

    // Form should not submit with empty required fields due to HTML5 validation
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('contact method cards have correct links', () => {
    customRender(<ContactPage />);

    const emailCard = screen.getByText('support@area-automation-platform.com').closest('a');
    const githubCard = screen.getByText('github.com/area').closest('a');
    const discordCard = screen.getByText('Join our server').closest('a');

    expect(emailCard).toHaveAttribute('href', 'mailto:support@area-automation-platform.com');
    expect(githubCard).toHaveAttribute('href', 'https://github.com/SamTess/AREA');
    expect(discordCard).toHaveAttribute('href', '#');
  });
});