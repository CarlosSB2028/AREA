import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { UserMenu } from '../../src/components/ui/user/UserMenu';
import { UserContent } from '../../src/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

const mockUser: UserContent = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe',
  password: 'hashedpassword',
  avatarSrc: 'https://example.com/avatar.jpg',
  profileData: {
    email: 'john@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    password: '',
  },
  isAdmin: false,
  isVerified: true,
};

const mockUserLongName: UserContent = {
  ...mockUser,
  name: 'This is a very long name that should be truncated because it is too long',
};

const mockUserShortName: UserContent = {
  ...mockUser,
  name: 'A',
};

describe('UserMenu', () => {
  it('should render user avatar with user menu label', () => {
    renderWithProvider(<UserMenu user={mockUser} />);
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toBeInTheDocument();
  });

  it('should render menu with correct aria attributes', () => {
    renderWithProvider(<UserMenu user={mockUser} />);
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('should have group container', () => {
    const { container } = renderWithProvider(<UserMenu user={mockUser} />);
    const group = container.querySelector('[class*="Group"]');
    expect(group).toBeInTheDocument();
  });

  it('should use user avatar source', () => {
    renderWithProvider(<UserMenu user={mockUser} />);
    const img = screen.getByRole('img', { hidden: true });
    expect(img).toHaveAttribute('src', mockUser.avatarSrc);
  });

  it('should render with long name truncation support', () => {
    renderWithProvider(<UserMenu user={mockUserLongName} />);
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toBeInTheDocument();
  });

  it('should render with short names', () => {
    renderWithProvider(<UserMenu user={mockUserShortName} />);
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toBeInTheDocument();
  });

  it('should render with different user data', () => {
    const differentUser = {
      ...mockUser,
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarSrc: 'https://example.com/jane.jpg',
    };
    renderWithProvider(<UserMenu user={differentUser} />);
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toBeInTheDocument();
  });

  it('should render avatar with radius', () => {
    renderWithProvider(<UserMenu user={mockUser} />);
    const avatar = screen.getByLabelText('User menu');
    expect(avatar).toHaveStyle('--avatar-radius: calc(2.5rem * var(--mantine-scale))');
  });
});
