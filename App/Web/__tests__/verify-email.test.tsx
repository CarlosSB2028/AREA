import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerifyEmailPage from '../src/app/verify-email/page';
import { MantineProvider } from '@mantine/core';

// Mock services
jest.mock('../src/services/authService', () => ({
  verifyEmail: jest.fn(),
}));

// Mock Next.js navigation
const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Import mocked functions
import { verifyEmail } from '../src/services/authService';

const mockVerifyEmail = verifyEmail as jest.MockedFunction<typeof verifyEmail>;

// Custom render function with MantineProvider
const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Email verification process', () => {
    test('successfully verifies email with valid token', async () => {
      mockGet.mockImplementation((key: string) => key === 'token' ? 'valid-token' : null);
      mockVerifyEmail.mockResolvedValue(undefined);

      renderWithMantine(<VerifyEmailPage />);

      // Initially shows loading
      await waitFor(() => {
        expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
      });

      // Should call verifyEmail with the token
      await waitFor(() => {
        expect(mockVerifyEmail).toHaveBeenCalledWith('valid-token');
      });

      // Should show success message
      expect(screen.getByText('Email verified successfully!')).toBeInTheDocument();
      expect(screen.getByText('Redirecting to the home page...')).toBeInTheDocument();

      // Should redirect after delay
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });

    test('handles missing token', async () => {
      mockGet.mockReturnValue(null); // No token

      renderWithMantine(<VerifyEmailPage />);

      // Should show error immediately
      await waitFor(() => {
        expect(screen.getByText('Error: Verification token missing')).toBeInTheDocument();
        expect(screen.getByText('Please check the link in your email.')).toBeInTheDocument();
      });

      // Should not call verifyEmail
      expect(mockVerifyEmail).not.toHaveBeenCalled();

      // Should redirect after delay
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });

    test('handles verification failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGet.mockImplementation((key: string) => key === 'token' ? 'invalid-token' : null);
      mockVerifyEmail.mockRejectedValue(new Error('Invalid token'));

      renderWithMantine(<VerifyEmailPage />);

      // Initially shows loading
      await waitFor(() => {
        expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
      });

      // Should call verifyEmail and fail
      await waitFor(() => {
        expect(mockVerifyEmail).toHaveBeenCalledWith('invalid-token');
      });

      // Should show error message
      expect(screen.getByText('Error: Verification token missing')).toBeInTheDocument();
      expect(screen.getByText('Please check the link in your email.')).toBeInTheDocument();

      // Error state doesn't auto-redirect (only missing token redirects)
      // Wait a bit to ensure no redirect happens
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(mockPush).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('handles empty token string', async () => {
      mockGet.mockImplementation((key: string) => key === 'token' ? '' : null); // Empty token

      renderWithMantine(<VerifyEmailPage />);

      // Should show error immediately
      await waitFor(() => {
        expect(screen.getByText('Error: Verification token missing')).toBeInTheDocument();
        expect(screen.getByText('Please check the link in your email.')).toBeInTheDocument();
      });

      // Should not call verifyEmail
      expect(mockVerifyEmail).not.toHaveBeenCalled();

      // Should redirect after delay
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });
  });
});