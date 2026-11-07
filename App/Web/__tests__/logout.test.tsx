import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import LogoutPage from '../src/app/logout/page';
import { logout } from '../src/services/authService';

jest.mock('../src/services/authService');

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('LogoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should render logout processing state initially', () => {
    (logout as jest.Mock).mockResolvedValue(undefined);
    renderWithProvider(<LogoutPage />);
    const loggingOutTexts = screen.getAllByText('Logging out...');
    expect(loggingOutTexts.length).toBeGreaterThan(0);
  });

  it('should display loader while processing', () => {
    (logout as jest.Mock).mockResolvedValue(undefined);
    const { container } = renderWithProvider(<LogoutPage />);
    expect(container.querySelector('[class*="Loader"]')).toBeInTheDocument();
  });

  it('should show success message after logout', async () => {
    (logout as jest.Mock).mockResolvedValue(undefined);
    renderWithProvider(<LogoutPage />);
    await waitFor(
      () => {
        expect(screen.getByText('Logout Successful')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should show error message on logout failure', async () => {
    (logout as jest.Mock).mockRejectedValue(new Error('Logout failed'));
    renderWithProvider(<LogoutPage />);
    await waitFor(
      () => {
        expect(screen.getByText('Logout Error')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should call logout service', async () => {
    (logout as jest.Mock).mockResolvedValue(undefined);
    renderWithProvider(<LogoutPage />);
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });
  });

  it('should display success redirect message', async () => {
    (logout as jest.Mock).mockResolvedValue(undefined);
    renderWithProvider(<LogoutPage />);
    await waitFor(
      () => {
        expect(screen.getByText('Logout successful! Redirecting to login...')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should display error redirect message on failure', async () => {
    (logout as jest.Mock).mockRejectedValue(new Error('Logout failed'));
    renderWithProvider(<LogoutPage />);
    await waitFor(
      () => {
        expect(screen.getByText('Logout failed, but redirecting to login...')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
