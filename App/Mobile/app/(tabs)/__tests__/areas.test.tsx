import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AreasTab from '../areas';
import { NavigationContainer } from '@react-navigation/native';
import { AreaProvider } from '@/contexts/AreaContext';
import * as areaService from '@/services/area';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    clearError: jest.fn(),
  }),
}));

jest.mock('@/services/area', () => {
  const actual = jest.requireActual('@/services/area');
  return {
    ...actual,
    getUserAreas: jest.fn(),
    createArea: jest.fn(),
    updateArea: jest.fn(),
    deleteArea: jest.fn(),
    toggleArea: jest.fn(),
  };
});

const mockAreas = [
  {
    id: '1',
    name: 'Test Area 1',
    description: 'Description 1',
    enabled: true,
    userId: 'user-123',
    userEmail: 'test@example.com',
    actions: [],
    reactions: [],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-13T08:30:00Z',
  },
  {
    id: '2',
    name: 'Test Area 2',
    description: 'Description 2',
    enabled: false,
    userId: 'user-123',
    userEmail: 'test@example.com',
    actions: [],
    reactions: [],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-13T08:30:00Z',
  },
];

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AreaProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </AreaProvider>
  );
}

const renderWithProviders = () => render(<AreasTab />, { wrapper: Providers });

beforeEach(() => {
  jest.clearAllMocks();

  (areaService.getUserAreas as jest.Mock).mockResolvedValue(mockAreas);
  (areaService.createArea as jest.Mock).mockImplementation(async payload => ({
    id: 'new-area',
    userId: 'user-123',
    userEmail: 'test@example.com',
    enabled: false,
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-13T08:30:00Z',
    actions: [],
    reactions: [],
    ...payload,
  }));
  (areaService.updateArea as jest.Mock).mockImplementation(async (id, updates) => ({
    ...mockAreas.find(area => area.id === id),
    ...updates,
    updatedAt: '2025-10-13T08:30:00Z',
  }));
  (areaService.deleteArea as jest.Mock).mockResolvedValue(undefined);
  (areaService.toggleArea as jest.Mock).mockImplementation(async (id, enabled) => ({
    ...mockAreas.find(area => area.id === id),
    enabled,
    updatedAt: '2025-10-13T08:30:00Z',
  }));
});

describe('AreasTab', () => {
  it('shows loading screen initially', () => {
    const { getByText } = renderWithProviders();

    expect(getByText('Loading Areas...')).toBeTruthy();
  });

  it('displays areas list after loading', async () => {
    const { getByText, queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull(), {
      timeout: 3000,
    });

    expect(getByText('Test Area 1')).toBeTruthy();
    expect(getByText('Test Area 2')).toBeTruthy();
  });

  it('displays header with title and new button', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() => expect(getByText('Areas')).toBeTruthy());
    expect(getByText('New')).toBeTruthy();
  });

  it('displays subtitle text', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() =>
      expect(getByText('Manage your automated workflows')).toBeTruthy()
    );
  });
});
