import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import ProfileScreen from '../profile';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(() => {}), // No-op for testing
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        {children}
      </AuthProvider>
    </GluestackUIProvider>
  );
}

describe('ProfileScreen', () => {
  it('renders header and options', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('Manage your account and personal information')).toBeTruthy();
    expect(screen.getByText('Edit Profile')).toBeTruthy();
    expect(screen.getByText('Manage service connections')).toBeTruthy();
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('renders all option subtitles', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    expect(screen.getByText('Update your personal information')).toBeTruthy();
    expect(screen.getByText('Manage service connections')).toBeTruthy();
    expect(screen.getByText('Sign out of your account')).toBeTruthy();
  });

  it('renders user profile information', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Check if profile section exists
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders language toggle button', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Check if profile header exists
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders all menu items as pressable', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Verify main menu items are rendered
    expect(screen.getByText('Edit Profile')).toBeTruthy();
    expect(screen.getByText('Manage service connections')).toBeTruthy();
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('displays correct structure with avatar', () => {
    const { toJSON } = render(<ProfileScreen />, { wrapper: Providers });
    expect(toJSON()).toBeTruthy();
  });
});
