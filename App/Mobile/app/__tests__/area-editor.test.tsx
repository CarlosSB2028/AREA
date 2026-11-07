import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AreaEditorScreen from '../area-editor';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({
    id: undefined as string | undefined, // New area
  })),
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock contexts
const mockAreaEditor = {
  configuredActions: [],
  configuredReactions: [],
  addAction: jest.fn(),
  addReaction: jest.fn(),
  updateAction: jest.fn(),
  updateReaction: jest.fn(),
  removeAction: jest.fn(),
  removeReaction: jest.fn(),
  clearAll: jest.fn(),
  initializeWithData: jest.fn(),
};

jest.mock('@/contexts/AreaEditorContext', () => ({
  useAreaEditor: jest.fn(() => mockAreaEditor),
}));

const mockLinks = {
  links: [],
  addLink: jest.fn(),
  updateLink: jest.fn(),
  removeLink: jest.fn(),
  removeLinkByIndex: jest.fn(),
  clearLinks: jest.fn(),
  initializeLinks: jest.fn(),
  getLinkBetween: jest.fn(),
};

jest.mock('@/contexts/LinkContext', () => ({
  useLinks: jest.fn(() => mockLinks),
}));

// Mock hooks
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    backgroundSecondary: '#f5f5f5',
    info: '#3b82f6',
    text: '#000000',
    textSecondary: '#666666',
    success: '#10b981',
    warning: '#f59e0b',
    card: '#ffffff',
    border: '#e5e5e5',
    error: '#ef4444',
  }),
}));

// Mock services
jest.mock('@/services/area', () => ({
  createArea: jest.fn(),
  createAreaWithActions: jest.fn(),
  updateArea: jest.fn(),
  getArea: jest.fn(),
  getAreaById: jest.fn(),
}));

jest.mock('@/services/serviceCatalog', () => ({
  getAllServices: jest.fn(),
}));

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && Array.isArray(buttons)) {
    buttons.forEach(button => {
      if (button.onPress) {
        button.onPress();
      }
    });
  }
});

describe('AreaEditorScreen', () => {
  const mockGetAllServices = require('@/services/serviceCatalog').getAllServices;
  const mockCreateAreaWithActions = require('@/services/area').createAreaWithActions;
  const mockUpdateArea = require('@/services/area').updateArea;
  const mockGetArea = require('@/services/area').getArea;
  const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
  const mockRouter = require('expo-router').router;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    mockUseLocalSearchParams.mockReturnValue({
      id: undefined as string | undefined, // New area
    });

    // Default mocks
    mockGetAllServices.mockResolvedValue([
      {
        id: 'service-1',
        key: 'github',
        name: 'GitHub',
        isActive: true,
        iconLightUrl: 'https://github.com/favicon.ico',
      },
      {
        id: 'service-2',
        key: 'discord',
        name: 'Discord',
        isActive: true,
      },
    ]);

    mockCreateAreaWithActions.mockResolvedValue({ id: 'area-1' });
    mockAreaEditor.initializeWithData.mockResolvedValue({ id: 'area-1' });
  });

  it('renders area editor with empty state', async () => {
    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Area')).toBeTruthy();
    });

    expect(screen.getByPlaceholderText('My automation area')).toBeTruthy();
    expect(screen.getByPlaceholderText('Describe what this automation does...')).toBeTruthy();
    expect(screen.getByText('No triggers yet')).toBeTruthy();
    expect(screen.getByText('No actions yet')).toBeTruthy();
  });

  it('loads existing area when id is provided', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'area-1',
    });

    mockGetArea.mockResolvedValue({
      id: 'area-1',
      title: 'Test Area',
      description: 'Test Description',
      actions: [],
      reactions: [],
    });

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(mockGetArea).toHaveBeenCalledWith('area-1');
    });

    expect(mockAreaEditor.initializeWithData).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Array)
    );
  });

  it('updates area title and description', async () => {
    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Area')).toBeTruthy();
    });

    const titleInput = screen.getByPlaceholderText('My automation area');
    const descriptionInput = screen.getByPlaceholderText('Describe what this automation does...');

    fireEvent.changeText(titleInput, 'My Test Area');
    fireEvent.changeText(descriptionInput, 'This is a test area');

    // Check that the input values have changed
    expect(titleInput.props.value).toBe('My Test Area');
    expect(descriptionInput.props.value).toBe('This is a test area');
  });

  it('navigates to service selector when adding action', async () => {
    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('No triggers yet')).toBeTruthy();
    });

    const addActionTouchable = screen.getByText('No triggers yet').parent?.parent;
    fireEvent.press(addActionTouchable);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/service-selector',
      params: { type: 'action' }
    });
  });

  it('navigates to service selector when adding reaction', async () => {
    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('No actions yet')).toBeTruthy();
    });

    const addReactionTouchable = screen.getByText('No actions yet').parent?.parent;
    fireEvent.press(addReactionTouchable);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/service-selector',
      params: { type: 'reaction' }
    });
  });

  it('renders configured actions and reactions', async () => {
    const mockUseAreaEditor = require('@/contexts/AreaEditorContext').useAreaEditor;
    mockUseAreaEditor.mockReturnValue({
      ...mockAreaEditor,
      configuredActions: [
        {
          id: 'action-1',
          action: {
            id: 'action-1',
            name: 'Create Issue',
            description: 'Creates a new issue',
            parameters: { title: 'Test Issue' },
            actionDefinitionId: 'def-1',
          },
          service: { id: '1', key: 'github', name: 'GitHub' },
          definition: { id: 'def-1', name: 'Create Issue' },
        },
      ],
      configuredReactions: [
        {
          id: 'reaction-1',
          reaction: {
            id: 'reaction-1',
            name: 'Send Message',
            description: 'Sends a message',
            parameters: { content: 'Hello' },
            actionDefinitionId: 'def-2',
          },
          service: { id: '2', key: 'discord', name: 'Discord' },
          definition: { id: 'def-2', name: 'Send Message' },
        },
      ],
    });

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Issue')).toBeTruthy();
      expect(screen.getByText('Send Message')).toBeTruthy();
    });
  });

  it('handles save area successfully', async () => {
    const mockUseAreaEditor = require('@/contexts/AreaEditorContext').useAreaEditor;
    mockUseAreaEditor.mockReturnValue({
      ...mockAreaEditor,
      configuredActions: [{
        action: {
          actionDefinitionId: 'def-1',
          name: 'Test Action',
          description: 'Test Description',
          parameters: {},
          activationConfig: { type: 'webhook' },
          serviceAccountId: 'account-1',
        },
        service: { id: '1', key: 'github', name: 'GitHub' },
        definition: { id: 'def-1', name: 'Create Issue' },
      }],
      configuredReactions: [],
    });

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Area')).toBeTruthy();
    });

    // Set area name
    const titleInput = screen.getByPlaceholderText('My automation area');
    fireEvent.changeText(titleInput, 'Test Area');

    // Find buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4); // At least back, save, edit, delete

    // Press save button (second button in header)
    const saveButton = buttons[1];
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockCreateAreaWithActions).toHaveBeenCalled();
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('shows validation error when saving without title', async () => {
    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Area')).toBeTruthy();
    });

    const buttons = screen.getAllByRole('button');
    const saveButton = buttons[1]; // Save button is the second button
    fireEvent.press(saveButton);

    expect(mockAlert).toHaveBeenCalledWith(
      'Validation Error',
      'Area name is required'
    );
  });

  it('handles save error gracefully', async () => {
    mockCreateAreaWithActions.mockRejectedValue(new Error('Save failed'));

    const mockUseAreaEditor = require('@/contexts/AreaEditorContext').useAreaEditor;
    mockUseAreaEditor.mockReturnValue({
      ...mockAreaEditor,
      configuredActions: [{
        action: {
          actionDefinitionId: 'def-1',
          name: 'Test Action',
          description: 'Test Description',
          parameters: {},
          activationConfig: { type: 'webhook' },
          serviceAccountId: 'account-1',
        },
        service: { id: '1', key: 'github', name: 'GitHub' },
        definition: { id: 'def-1', name: 'Create Issue' },
      }],
      configuredReactions: [],
    });

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Area')).toBeTruthy();
    });

    // Set area name
    const titleInput = screen.getByPlaceholderText('My automation area');
    fireEvent.changeText(titleInput, 'Test Area');

    const buttons = screen.getAllByRole('button');
    const saveButton = buttons[1]; // Save button is the second button
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Save Failed',
        'Failed to save area'
      );
    });
  });

  it('navigates back when back button is pressed', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: undefined, // New area
    });

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Area')).toBeTruthy();
    });

    // Find back button
    const backButtons = screen.getAllByRole('button');
    const backButton = backButtons[0]; // First button should be back
    fireEvent.press(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('handles area loading error', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'area-1',
    });

    mockGetArea.mockRejectedValue(new Error('Load failed'));

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Load Failed',
        'Failed to load area data',
        [{ text: 'OK', onPress: expect.any(Function) }]
      );
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('shows edit mode when editing existing area', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'area-1',
    });

    mockGetArea.mockResolvedValue({
      id: 'area-1',
      name: 'Existing Area',
      description: 'Existing Description',
      actions: [],
      reactions: [],
    });

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('View Area')).toBeTruthy();
    });
  });

  it('handles service loading error gracefully', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: undefined as string | undefined, // New area
    });

    mockGetAllServices.mockRejectedValue(new Error('Service load failed'));

    render(<AreaEditorScreen />);

    await waitFor(() => {
      expect(screen.getByText('Create Area')).toBeTruthy();
    });

    // Should still render even if services fail to load
    expect(screen.getByText('No actions yet')).toBeTruthy();
  });
});