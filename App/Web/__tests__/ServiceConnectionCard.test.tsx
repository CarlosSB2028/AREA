import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ServiceConnectionCard from '../src/components/user/ServiceConnectionCard';
import { BackendService, ConnectedService } from '../src/types';
import { MantineProvider } from '@mantine/core';

// Mock the service connection service
jest.mock('../src/services/serviceConnectionService', () => ({
  initiateServiceConnection: jest.fn(),
}));

import { initiateServiceConnection } from '../src/services/serviceConnectionService';

const mockInitiateServiceConnection = initiateServiceConnection as jest.MockedFunction<typeof initiateServiceConnection>;

const renderWithMantine = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('ServiceConnectionCard', () => {
  const mockService: BackendService = {
    id: 'test-service-id',
    key: 'test-service',
    name: 'Test Service',
    auth: 'OAUTH2',
    isActive: true,
    iconLightUrl: 'https://example.com/light-icon.png',
    iconDarkUrl: 'https://example.com/dark-icon.png',
  };

  const mockConnectedService: ConnectedService = {
    serviceKey: 'test-service',
    serviceName: 'Test Service',
    iconUrl: 'https://example.com/icon.png',
    connectionType: 'oauth2',
    userEmail: 'test@example.com',
    userName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    providerUserId: '12345',
    isConnected: true,
    canDisconnect: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

describe('ServiceConnectionCard', () => {
  const mockService: BackendService = {
    id: 'test-service-id',
    key: 'test-service',
    name: 'Test Service',
    auth: 'OAUTH2',
    isActive: true,
    iconLightUrl: 'https://example.com/light-icon.png',
    iconDarkUrl: 'https://example.com/dark-icon.png',
  };

  const mockConnectedService: ConnectedService = {
    serviceKey: 'test-service',
    serviceName: 'Test Service',
    iconUrl: 'https://example.com/icon.png',
    connectionType: 'oauth2',
    userEmail: 'test@example.com',
    userName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    providerUserId: '12345',
    isConnected: true,
    canDisconnect: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Connected Service', () => {
    it('renders connected badge and user information', () => {
      renderWithMantine(<ServiceConnectionCard service={mockService} connectedService={mockConnectedService} />);

      expect(screen.getByText('Test Service')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });
});
});