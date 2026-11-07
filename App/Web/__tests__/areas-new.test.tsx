import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import NewAreaPage from '../src/app/areas/new/page';

// Mock Next.js router
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock services
jest.mock('../src/services/authService', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock AreaEditor component
jest.mock('../src/components/ui/areaCreation/AreaEditor', () => {
  return function MockAreaEditor() {
    return <div data-testid="area-editor">Area Editor Component</div>;
  };
});

// Import mocked functions after jest.mock
import { getCurrentUser } from '../src/services/authService';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe('NewAreaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
  });

  it('redirects to login when user is not authenticated', async () => {
    (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(<NewAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to login when getCurrentUser returns null', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    render(<NewAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('renders AreaEditor when user is authenticated', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

    render(<NewAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByTestId('area-editor')).toBeInTheDocument();
    });
  });

  it('passes draftId to AreaEditor when present in search params', async () => {
    mockSearchParams.set('draft', 'draft-123');
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

    render(<NewAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(screen.getByTestId('area-editor')).toBeInTheDocument();
    });
  });

  it('handles authentication errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<NewAreaPage />, { wrapper: AllTheProviders });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
      expect(consoleSpy).toHaveBeenCalledWith('Auth check failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});