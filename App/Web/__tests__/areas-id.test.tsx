import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import EditAreaPage from '../src/app/areas/[id]/page';

// Mock Next.js router
const mockPush = jest.fn();
const mockParams = { id: 'test-area-id' };
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock services
jest.mock('../src/services/authService', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../src/services/areasService', () => ({
  getAreaById: jest.fn(),
}));

// Mock AreaEditor component
jest.mock('../src/components/ui/areaCreation/AreaEditor', () => {
  return function MockAreaEditor() {
    return <div data-testid="area-editor">Area Editor Component</div>;
  };
});

// Import mocked functions after jest.mock
import { getCurrentUser } from '../src/services/authService';
import { getAreaById } from '../src/services/areasService';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('EditAreaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it('redirects to home when user is not authenticated', async () => {
    (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('redirects to home when getCurrentUser returns null', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('redirects to areas when area does not exist', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (getAreaById as jest.Mock).mockResolvedValue(null);

    render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/areas');
    });
  });

  it('redirects to areas when user does not own the area', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (getAreaById as jest.Mock).mockResolvedValue({ userId: 'user-2' });

    render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/areas');
    });
  });

  it('redirects to edit-simple when no mode is specified', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (getAreaById as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/areas/test-area-id/edit-simple');
    });
  });

  it('renders AreaEditor when mode is advanced', async () => {
    mockSearchParams.set('mode', 'advanced');
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (getAreaById as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByTestId('area-editor')).toBeInTheDocument();
    });
  });

  it('renders nothing when mode is not advanced', async () => {
    mockSearchParams.set('mode', 'simple');
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (getAreaById as jest.Mock).mockResolvedValue({ userId: 'user-1' });

    const { container } = render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      // The component should render null, so there should be no content inside the wrapper
      const wrapper = container.querySelector('[data-testid="mantine-provider"]') || container.firstElementChild;
      expect(wrapper?.children.length).toBe(0);
    });
  });

  it('handles getAreaById error gracefully', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (getAreaById as jest.Mock).mockRejectedValue(new Error('Area not found'));

    render(<EditAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/areas');
    });
  });
});