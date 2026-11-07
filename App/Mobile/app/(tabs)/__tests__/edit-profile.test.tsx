import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import EditProfileScreen from '../edit-profile';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    })
  ),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <NavigationContainer>{children}</NavigationContainer>
      </AuthProvider>
    </GluestackUIProvider>
  );
}

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the edit profile screen', async () => {
    const { toJSON } = render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<EditProfileScreen />, { wrapper: Providers });
    expect(toJSON()).toBeTruthy();
  });
});
