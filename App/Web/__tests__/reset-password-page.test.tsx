import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import ResetPasswordPage from '../src/app/reset-password/page';

jest.mock('../src/components/ui/auth/ResetPasswordForm', () => ({
  ResetPasswordForm: () => <div data-testid="reset-password-form">Reset Password Form</div>,
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('ResetPasswordPage', () => {
  it('should render reset password content', async () => {
    renderWithProvider(<ResetPasswordPage />);
    
    const form = await screen.findByTestId('reset-password-form');
    expect(form).toBeInTheDocument();
  });

  it('should render ResetPasswordForm component', async () => {
    renderWithProvider(<ResetPasswordPage />);
    
    const form = await screen.findByTestId('reset-password-form');
    expect(form).toHaveTextContent('Reset Password Form');
  });

  it('should have spacing divs around form', async () => {
    const { container } = renderWithProvider(<ResetPasswordPage />);
    
    const divs = container.querySelectorAll('div[style*="height: 130px"]');
    expect(divs.length).toBe(2);
  });

  it('should render in Suspense boundary', async () => {
    renderWithProvider(<ResetPasswordPage />);
    
    const form = await screen.findByTestId('reset-password-form');
    expect(form).toBeInTheDocument();
  });
});
