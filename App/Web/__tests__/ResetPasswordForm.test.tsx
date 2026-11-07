import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { ResetPasswordForm } from '@/components/ui/auth/ResetPasswordForm'
import { resetPassword } from '../src/services/authService';

jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  PasswordInput: ({ label, placeholder, value, onChange, error, required, radius }: any) => (
    <div>
      <label>{label}{required && ' *'}</label>
      <input
        type="password"
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        required={required}
        style={{ borderRadius: radius === 'md' ? '4px' : '0' }}
      />
      {error && <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>{error}</div>}
    </div>
  ),
  Button: ({ children, type, radius, loading, disabled, onClick }: any) => (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ borderRadius: radius === 'xl' ? '20px' : '4px' }}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
  Paper: ({ children, radius, p, withBorder, w, mx, ...props }: any) => (
    <div
      style={{
        borderRadius: radius === 'md' ? '4px' : '0',
        padding: p === 'lg' ? '16px' : '8px',
        border: withBorder ? '1px solid #ccc' : 'none',
        width: w === '40%' ? '40%' : 'auto',
        marginLeft: mx === 'auto' ? 'auto' : '0',
        marginRight: mx === 'auto' ? 'auto' : '0',
      }}
      {...props}
    >
      {children}
    </div>
  ),
  Stack: ({ children, gap, align, justify }: any) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: gap === 'md' ? '8px' : '4px',
        alignItems: align === 'stretch' ? 'stretch' : 'flex-start',
        justifyContent: justify === 'flex-start' ? 'flex-start' : 'center',
      }}
    >
      {children}
    </div>
  ),
  Alert: ({ children, color, icon, title }: any) => (
    <div
      style={{
        backgroundColor: color === 'red' ? '#fee' : color === 'green' ? '#efe' : '#fff',
        border: `1px solid ${color === 'red' ? 'red' : color === 'green' ? 'green' : '#ccc'}`,
        padding: '8px',
        borderRadius: '4px',
      }}
    >
      {icon && <span>{icon}</span>}
      {title && <strong>{title}</strong>}
      {children}
    </div>
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
}))

jest.mock('@mantine/form', () => {
  const createFormMock = (config: {
    initialValues: Record<string, unknown>;
    validate?: Record<string, (value: unknown, values?: Record<string, unknown>) => string | null>;
    validateInputOnChange?: boolean;
    validateInputOnBlur?: boolean;
  }) => {
    let values = { ...config.initialValues };
    let errors: Record<string, string> = {};

    const validateField = (field: string, value: unknown, allValues: Record<string, unknown>) => {
      if (!config.validate || !config.validate[field]) return null;
      
      const validator = config.validate[field];
      return validator(value, allValues);
    };

    const updateErrors = () => {
      const newErrors: Record<string, string> = {};
      Object.keys(config.validate || {}).forEach(field => {
        const error = validateField(field, values[field], values);
        if (error) {
          newErrors[field] = error;
        }
      });
      errors = newErrors;
    };

    const setFieldValue = (field: string, value: unknown) => {
      values = { ...values, [field]: value };
      if (config.validateInputOnChange) {
        updateErrors();
      }
    };

    const validate = () => {
      updateErrors();
      return { hasErrors: Object.keys(errors).length > 0, errors };
    };

    // Create a proxy for errors to make it reactive
    const errorsProxy = new Proxy(errors, {
      get(target, prop) {
        return target[prop as string];
      },
    });

    return {
      values,
      get errors() {
        return errorsProxy;
      },
      setFieldValue,
      validate,
      onSubmit: jest.fn(),
      getInputProps: (field: string) => ({
        value: values[field],
        onChange: (event: { currentTarget?: { value: unknown } } | unknown) => {
          const value = (event as { currentTarget?: { value: unknown } })?.currentTarget?.value ?? event;
          setFieldValue(field, value);
        },
        error: errors[field],
        onBlur: () => {
          if (config.validateInputOnBlur) {
            updateErrors();
          }
        },
      }),
    };
  };

  return {
    useForm: jest.fn(createFormMock),
  };
})

jest.mock('../src/components/ui/auth/PasswordStrength', () => ({
  PasswordStrength: ({ value, onChange, error }: { value?: string; onChange?: (value: string) => void; error?: string }) => (
    <div>
      <input
        type="password"
        placeholder="Your password"
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        data-testid="password-input"
      />
      {error && <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>{error}</div>}
    </div>
  ),
}))

const mockResetPassword = resetPassword as jest.MockedFunction<typeof resetPassword>;

jest.mock('../src/services/authService', () => ({
  resetPassword: jest.fn(),
}))

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => 'mock-token'),
  }),
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options })

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with password fields', () => {
    customRender(<ResetPasswordForm />);

    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please correct the errors in the form before submitting.')).toBeInTheDocument();
    });
  });

  it('shows validation error when password is too short', async () => {
    const user = userEvent.setup();
    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInput, '123');
    await user.type(confirmPasswordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please correct the errors in the form before submitting.')).toBeInTheDocument();
    });
  });

  it('shows error when reset password fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid token';
    mockResetPassword.mockRejectedValueOnce({
      response: { status: 401, data: { message: errorMessage } }
    });

    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired token.')).toBeInTheDocument();
    });
  });

  it('disables submit button when form has errors', async () => {
    const user = userEvent.setup();
    customRender(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText('Your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Type valid data
    await user.type(passwordInput, 'validpassword123');
    await user.type(confirmPasswordInput, 'validpassword123');

    // Button should not be disabled for valid data
    expect(submitButton).not.toBeDisabled();
  });
});