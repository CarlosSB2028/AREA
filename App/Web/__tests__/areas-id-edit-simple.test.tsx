import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import EditSimpleAreaPage from '../src/app/areas/[id]/edit-simple/page';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockParams = { id: 'test-area-id' };
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

// Mock services
jest.mock('../src/services/authService', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../src/services/areasService', () => ({
  getAreaById: jest.fn(),
  updateAreaComplete: jest.fn(),
  getActionsByServiceKey: jest.fn(),
  getActionFieldsFromActionDefinition: jest.fn(),
}));

jest.mock('../src/services/serviceConnectionService', () => ({
  initiateServiceConnection: jest.fn(),
}));

// Mock custom hook
jest.mock('../src/hooks/useAreaForm', () => ({
  useAreaForm: jest.fn(),
}));

// Mock step components
jest.mock('../src/components/ui/area-simple-steps', () => ({
  NameStep: ({ areaName, areaDescription, onNameChange, onDescriptionChange }: {
    areaName: string;
    areaDescription: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
  }) => (
    <div data-testid="name-step">
      <input
        data-testid="area-name-input"
        value={areaName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Area name"
      />
      <textarea
        data-testid="area-description-input"
        value={areaDescription}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Area description"
      />
    </div>
  ),
  TriggerStep: ({ onTriggerServiceChange, onTriggerChange, onTriggerParamChange }: {
    onTriggerServiceChange: (service: string) => void;
    onTriggerChange: (triggerId: string) => void;
    onTriggerParamChange: (paramName: string, value: unknown) => void;
  }) => (
    <div data-testid="trigger-step">
      <button
        data-testid="trigger-service-button"
        onClick={() => onTriggerServiceChange('test-service')}
      >
        Select Trigger Service
      </button>
      <button
        data-testid="trigger-button"
        onClick={() => onTriggerChange('test-trigger')}
      >
        Select Trigger
      </button>
      <button
        data-testid="trigger-param-button"
        onClick={() => onTriggerParamChange('param1', 'value1')}
      >
        Set Trigger Param
      </button>
    </div>
  ),
  ReactionsStep: ({ reactions, onAddReaction, onRemoveReaction }: {
    reactions: Array<{ id: string; service: string | null; actionId: string | null; params: Record<string, unknown> }>;
    onAddReaction: () => void;
    onRemoveReaction: (id: string) => void;
  }) => (
    <div data-testid="reactions-step">
      {reactions.map((reaction) => (
        <div key={reaction.id} data-testid={`reaction-${reaction.id}`}>
          Reaction {reaction.id}
        </div>
      ))}
      <button data-testid="add-reaction-button" onClick={onAddReaction}>
        Add Reaction
      </button>
      <button
        data-testid="remove-reaction-button"
        onClick={() => onRemoveReaction(reactions[0]?.id)}
        disabled={reactions.length <= 1}
      >
        Remove Reaction
      </button>
    </div>
  ),
  ResumeStep: () => <div data-testid="resume-step">Resume Step</div>,
}));

jest.mock('../src/components/ui/area-simple-steps/ArrayInput', () => ({
  ArrayInput: () => <div data-testid="array-input">Array Input</div>,
}));

// Import mocked functions after jest.mock
import { getCurrentUser } from '../src/services/authService';
import { getAreaById, updateAreaComplete, getActionsByServiceKey } from '../src/services/areasService';
import { initiateServiceConnection } from '../src/services/serviceConnectionService';
import { useAreaForm } from '../src/hooks/useAreaForm';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('EditSimpleAreaPage', () => {
  const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
  const mockGetAreaById = getAreaById as jest.MockedFunction<typeof getAreaById>;
  const mockUpdateAreaComplete = updateAreaComplete as jest.MockedFunction<typeof updateAreaComplete>;
  const mockGetActionsByServiceKey = getActionsByServiceKey as jest.MockedFunction<typeof getActionsByServiceKey>;
  const mockInitiateServiceConnection = initiateServiceConnection as jest.MockedFunction<typeof initiateServiceConnection>;
  const mockUseAreaForm = useAreaForm as jest.MockedFunction<typeof useAreaForm>;

  const mockUser = {
    id: 'user1',
    name: 'Test User',
    email: 'user@example.com',
    username: 'testuser',
    password: 'password',
    avatarSrc: 'avatar.jpg',
    profileData: {
      email: 'user@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
    isAdmin: false,
    isVerified: true,
  };

  const mockAreaData = {
    id: 'test-area-id',
    name: 'Test Area',
    description: 'Test Description',
    enabled: true,
    userId: 'user1',
    userEmail: 'user@example.com',
    actions: [{
      id: 'action1',
      actionDefinitionId: 'trigger-1',
      name: 'Trigger Action',
      parameters: { param1: 'value1' },
      activationConfig: { type: 'webhook' as const },
    }],
    reactions: [{
      id: 'reaction-1',
      actionDefinitionId: 'reaction-1',
      name: 'Reaction Action',
      parameters: { param2: 'value2' },
      order: 1,
      continue_on_error: false,
    }],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockServices = [
    {
      id: 'service1',
      key: 'service1',
      name: 'Service 1',
      auth: 'NONE' as const,
      isActive: true,
    },
    {
      id: 'service2',
      key: 'service2',
      name: 'Service 2',
      auth: 'OAUTH2' as const,
      isActive: true,
    },
  ];

  const mockActionTriggers = [
    {
      id: 'trigger-1',
      serviceId: 'service1',
      serviceKey: 'service1',
      serviceName: 'Service 1',
      key: 'trigger-1',
      name: 'Trigger 1',
      description: 'Test trigger',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      outputSchema: {},
      isEventCapable: true,
      isExecutable: false,
      version: 1,
    },
  ];

  const mockReactionActions = [
    {
      id: 'reaction-1',
      serviceId: 'service2',
      serviceKey: 'service2',
      serviceName: 'Service 2',
      key: 'reaction-1',
      name: 'Reaction 1',
      description: 'Test reaction',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      outputSchema: {},
      isEventCapable: false,
      isExecutable: true,
      version: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetAreaById.mockResolvedValue(mockAreaData);
    mockUpdateAreaComplete.mockResolvedValue(mockAreaData);
    mockGetActionsByServiceKey.mockResolvedValue(mockActionTriggers);
    mockInitiateServiceConnection.mockResolvedValue(undefined);

    mockUseAreaForm.mockReturnValue({
      services: mockServices,
      serviceConnectionStatuses: {},
      actionTriggers: mockActionTriggers,
      reactionActions: mockReactionActions,
      loading: false,
      loadTriggerActions: jest.fn(),
      loadReactionActions: jest.fn(),
      refreshConnectionStatuses: jest.fn(),
    });
  });

  it('renders without crashing', () => {
    expect(() => renderWithProvider(<EditSimpleAreaPage />)).not.toThrow();
  });

  it('shows loading state initially', () => {
    renderWithProvider(<EditSimpleAreaPage />);

    expect(screen.getByText('Loading area details...')).toBeInTheDocument();
  });

  // TODO: Add more comprehensive tests once infinite re-render issue is resolved
  // The component has complex useEffect dependencies that cause infinite loops in test environment
  // For now, we have basic coverage with render and loading state tests
});