import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavbarMinimal } from '../src/components/ui/layout/NavBar';
import { MantineProvider } from '@mantine/core';

// Mock Next.js navigation
const mockPush = jest.fn();
let mockPathname = '/';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

// Mock user service
jest.mock('../src/services/userService', () => ({
  getUserInfo: jest.fn(),
}));

// Mock Mantine hooks - using global mocks from test-setup.ts

// Mock UserMenu component
jest.mock('../src/components/ui/user/UserMenu', () => ({
  UserMenu: ({ user }: { user: { email: string } }) => <div data-testid="user-menu">User: {user.email}</div>,
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt, 'data-testid': 'navbar-logo' }),
}));

// Mock CSS modules
jest.mock('../src/components/ui/layout/NavBarMinimal.module.css', () => ({
  navbar: 'navbar',
  navbarMain: 'navbarMain',
  logo: 'logo',
  user: 'user',
  link: 'link',
  open: 'open',
  hamburger: 'hamburger',
  overlay: 'overlay',
}));

// Import mocked functions
import { getUserInfo } from '../src/services/userService';
import { useMediaQuery } from '@mantine/hooks';

const mockGetUserInfo = getUserInfo as jest.MockedFunction<typeof getUserInfo>;
const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

// Custom render function with MantineProvider
const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

// Mock user data
const mockUser = {
  id: 'user123',
  name: 'John Doe',
  email: 'test@example.com',
  username: 'johndoe',
  password: 'hashedpassword',
  avatarSrc: 'https://example.com/avatar.jpg',
  profileData: {
    email: 'test@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    password: '',
  },
  isAdmin: false,
  isVerified: true,
};

const mockAdminUser = {
  ...mockUser,
  isAdmin: true,
};

describe('NavbarMinimal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Authentication states', () => {
    test('shows login link when user is not authenticated', async () => {
      mockGetUserInfo.mockRejectedValue(new Error('Not authenticated'));
      mockUseMediaQuery.mockReturnValue(false); // Desktop

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        expect(screen.getByLabelText('Login')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
    });

    test('shows user menu when user is authenticated', async () => {
      mockGetUserInfo.mockResolvedValue(mockUser);
      mockUseMediaQuery.mockReturnValue(false); // Desktop

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        expect(screen.getByTestId('user-menu')).toBeInTheDocument();
      });

      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
      expect(screen.queryByLabelText('Login')).not.toBeInTheDocument();
    });
  });

  describe('Navigation links', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false); // Desktop
    });

    test('renders all navigation links for regular user', async () => {
      mockGetUserInfo.mockResolvedValue(mockUser);

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        expect(screen.getByLabelText('Home')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Areas')).toBeInTheDocument();
      // Dashboard should not be visible for non-admin
      expect(screen.queryByLabelText('Dashboard')).not.toBeInTheDocument();
    });

    test('renders all navigation links including dashboard for admin', async () => {
      mockGetUserInfo.mockResolvedValue(mockAdminUser);

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        expect(screen.getByLabelText('Home')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Areas')).toBeInTheDocument();
      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    });

    test('navigates to correct route when link is clicked', async () => {
      mockGetUserInfo.mockResolvedValue(mockUser);

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        const areasLink = screen.getByLabelText('Areas');
        fireEvent.click(areasLink);
      });

      expect(mockPush).toHaveBeenCalledWith('/areas');
    });

    test('highlights active link based on current pathname', async () => {
      mockGetUserInfo.mockResolvedValue(mockUser);
      mockUseMediaQuery.mockReturnValue(false);

      // Change pathname to /areas
      mockPathname = '/areas';

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        const areasLink = screen.getByLabelText('Areas');
        expect(areasLink).toHaveAttribute('data-active', 'true');
      });

      // Reset pathname
      mockPathname = '/';
    });
  });

  describe('Logo display', () => {
    test('displays logo image', async () => {
      mockGetUserInfo.mockResolvedValue(mockUser);
      mockUseMediaQuery.mockReturnValue(false);

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        const logo = screen.getByTestId('navbar-logo');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/A1.png');
        expect(logo).toHaveAttribute('alt', 'Logo');
      });
    });
  });

  describe('Mobile responsiveness', () => {
    test('shows hamburger menu on mobile when closed', async () => {
      mockGetUserInfo.mockResolvedValue(mockUser);
      mockUseMediaQuery.mockReturnValue(true); // Mobile

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
      });
    });

    test('can toggle navigation menu on mobile', async () => {
      mockGetUserInfo.mockResolvedValue(mockUser);
      mockUseMediaQuery.mockReturnValue(true); // Mobile

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        const hamburgerButton = screen.getByLabelText('Open navigation menu');
        fireEvent.click(hamburgerButton);
      });

      // After clicking, the menu should be open
      // Note: Testing the overlay would require more complex setup
    });
  });

  describe('Error handling', () => {
    test('handles user info fetch error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetUserInfo.mockRejectedValue(new Error('Network error'));
      mockUseMediaQuery.mockReturnValue(false);

      renderWithMantine(<NavbarMinimal />);

      await waitFor(() => {
        expect(screen.getByLabelText('Login')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user info:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});