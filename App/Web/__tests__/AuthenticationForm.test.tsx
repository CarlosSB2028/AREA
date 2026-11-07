import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { AuthenticationForm } from '@/components/ui/auth/AuthenticationForm'
import { login, register, forgotPassword } from '../src/services/authService';

const mockProviders = [
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png", label: 'Google' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", label: 'Microsoft' },
  { iconPath: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg", label: 'Github' },
];
const mockLogin = login as jest.MockedFunction<typeof login>;
const mockRegister = register as jest.MockedFunction<typeof register>;
const mockForgotPassword = forgotPassword as jest.MockedFunction<typeof forgotPassword>;

jest.mock('../src/services/oauthService', () => ({
  getOAuthProviders: jest.fn(() => Promise.resolve(mockProviders)),
  initiateOAuth: jest.fn(),
}))

jest.mock('../src/services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  forgotPassword: jest.fn(),
  extractToken: jest.fn(),
}))

jest.mock('../src/utils/secureStorage', () => ({
  setSecureToken: jest.fn(),
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
}))

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

describe('AuthenticationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.setItem.mockClear();
    mockPush.mockClear();
  });

  it('switches to register mode', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    const registerLink = screen.getByText("Don't have an account? Register")
    fireEvent.click(registerLink)
    expect(screen.getByText('Welcome to Area, register with')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your first name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your last name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument()
  })

  it('switches to forgot password mode', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    const forgotLink = screen.getByText('Forgot password?')
    fireEvent.click(forgotLink)
    expect(screen.getByText('Welcome to Area, forgotPassword with')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Your password')).not.toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('submits the form without errors for valid input', async () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })
    const emailInput = screen.getByPlaceholderText('Area@Area.com or username')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
      expect(screen.queryByText('Password should include at least 8 characters')).not.toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    // Switch to register mode where email validation is stricter
    fireEvent.click(screen.getByText("Don't have an account? Register"))

    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup();
    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    const passwordInput = screen.getByPlaceholderText('Your password')
    await user.type(passwordInput, '123')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Password should include at least 8 characters')).toBeInTheDocument()
    })
  })

  it('validates password confirmation in register mode', async () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    // Switch to register mode
    fireEvent.click(screen.getByText("Don't have an account? Register"))

    const passwordInput = screen.getByPlaceholderText('Your password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password')

    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('validates required fields in register mode', async () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    fireEvent.click(screen.getByText("Don't have an account? Register"))

    expect(screen.getByPlaceholderText('Your first name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your last name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Area@Area.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const mockToken = 'mock-token';
    mockLogin.mockResolvedValue({
      token: mockToken,
      message: 'Login successful',
      user: {
        id: 1,
        email: 'test@example.com',
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      refreshToken: 'refresh-token'
    });

    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    const emailInput = screen.getByPlaceholderText('Area@Area.com or username')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    })
  })

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    const emailInput = screen.getByPlaceholderText('Area@Area.com or username')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('handles successful registration', async () => {
    const mockToken = 'mock-token';
    mockRegister.mockResolvedValue({
      token: mockToken,
      message: 'Registration successful',
      user: {
        id: 1,
        email: 'test@example.com',
        isActive: true,
        isAdmin: false,
        createdAt: new Date().toISOString()
      },
      refreshToken: 'refresh-token'
    });

    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    fireEvent.click(screen.getByText("Don't have an account? Register"))

    const emailInput = screen.getByPlaceholderText('Area@Area.com')
    const usernameInput = screen.getByPlaceholderText('Your username')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password')
    const firstNameInput = screen.getByPlaceholderText('Your first name')
    const lastNameInput = screen.getByPlaceholderText('Your last name')
    const submitButton = screen.getByText('Register')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
    })
  })

  it.skip('handles successful forgot password', async () => {
    mockForgotPassword.mockResolvedValue();

    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    const emailInput = screen.getByPlaceholderText('Area@Area.com or username')
    const passwordInput = screen.getByPlaceholderText('Your password')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    fireEvent.click(screen.getByText('Forgot password?'))

    const emailInputForgot = screen.getByPlaceholderText('Area@Area.com')
    fireEvent.change(emailInputForgot, { target: { value: 'test@example.com' } })

    await waitFor(() => {
      const submitButton = screen.getByText('Send')
      expect(submitButton).not.toBeDisabled()
    })

    const submitButton = screen.getByText('Send')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText('Password reset email sent! Please check your inbox.')).toBeInTheDocument()
    })
  })

  it('switches back to login from register', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    fireEvent.click(screen.getByText("Don't have an account? Register"))
    expect(screen.getByText('Welcome to Area, register with')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Already have an account? Login'))
    expect(screen.getByText('Welcome to Area, login with')).toBeInTheDocument()
  })

  it('switches back to login from forgot password', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    fireEvent.click(screen.getByText('Forgot password?'))
    expect(screen.getByText('Welcome to Area, forgotPassword with')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Remember your password? Login'))
    expect(screen.getByText('Welcome to Area, login with')).toBeInTheDocument()
  })

  it('clears messages when switching form types', () => {
    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    fireEvent.click(screen.getByText('Login'))

    fireEvent.click(screen.getByText("Don't have an account? Register"))

    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
  })

  it('prevents double submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<AuthenticationForm />, { wrapper: AllTheProviders })

    const emailInput = screen.getByPlaceholderText('Area@Area.com or username')
    const passwordInput = screen.getByPlaceholderText('Your password')
    const submitButton = screen.getByText('Login')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    fireEvent.click(submitButton)
    fireEvent.click(submitButton)

    expect(mockLogin).toHaveBeenCalledTimes(1)
  })
})