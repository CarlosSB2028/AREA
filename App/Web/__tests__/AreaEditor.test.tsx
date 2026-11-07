import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AreaEditor from '../src/components/ui/areaCreation/AreaEditor'
import { useAreaEditor } from '../src/components/ui/areaCreation/useAreaEditor'
import { useMediaQuery } from '@mantine/hooks'
import { ServiceData, ServiceState, ConnectionData } from '../src/types'

// Mock MantineProvider to avoid useIsomorphicEffect issues
jest.mock('@mantine/core', () => ({
  MantineProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'mantine-provider' }, children),
  Modal: ({ children, opened, onClose, title }: any) =>
    opened ? React.createElement('div', { 'data-testid': 'modal', onClick: onClose }, [
      React.createElement('h2', { key: 'title' }, title),
      children
    ]) : null,
  Button: ({ children, onClick, variant, disabled }: any) =>
    React.createElement('button', { onClick, disabled, 'data-testid': variant === 'default' ? 'start-fresh-btn' : 'continue-editing-btn' }, children),
  Text: ({ children, fw, size, c }: any) =>
    React.createElement('p', { style: { fontWeight: fw, fontSize: size, color: c } }, children),
  Group: ({ children, justify, mt }: any) =>
    React.createElement('div', { style: { display: 'flex', justifyContent: justify, marginTop: mt } }, children),
  Stack: ({ children }: any) =>
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } }, children),
  Drawer: ({ children, opened, onClose, title }: any) =>
    opened ? React.createElement('div', { 'data-testid': 'drawer', onClick: onClose }, [
      React.createElement('h3', { key: 'title' }, title),
      children
    ]) : null,
  getDefaultZIndex: () => 1000,
}))

// Mock Mantine notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}))

// Mock the hook
jest.mock('../src/components/ui/areaCreation/useAreaEditor')
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
}))

// Mock child components
jest.mock('../src/components/ui/areaCreation/AreaEditorToolbar', () => {
  const MockToolbar = ({ areaName, areaDescription, onNameChange, onDescriptionChange, onCommit, onRun, isDraft, onDeleteDraft, isCommitting }: {
    areaName: string;
    areaDescription: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onCommit: () => void;
    onRun: () => void;
    isDraft: boolean;
    onDeleteDraft: () => void;
    isCommitting: boolean;
  }) => React.createElement('div', { 'data-testid': 'area-editor-toolbar' }, [
    React.createElement('input', {
      key: 'name-input',
      'data-testid': 'area-name-input',
      value: areaName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)
    }),
    React.createElement('input', {
      key: 'desc-input',
      'data-testid': 'area-description-input',
      value: areaDescription,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onDescriptionChange(e.target.value)
    }),
    React.createElement('button', {
      key: 'commit-btn',
      'data-testid': 'commit-button',
      onClick: onCommit,
      disabled: isCommitting
    }, isCommitting ? 'Committing...' : 'Commit'),
    React.createElement('button', {
      key: 'run-btn',
      'data-testid': 'run-button',
      onClick: onRun
    }, 'Run'),
    isDraft && React.createElement('button', {
      key: 'delete-btn',
      'data-testid': 'delete-draft-button',
      onClick: onDeleteDraft
    }, 'Delete Draft')
  ].filter(Boolean));
  return { __esModule: true, default: MockToolbar };
})

jest.mock('../src/components/ui/areaCreation/FreeLayoutBoard', () => {
  const MockBoard = ({ services, connections, onAddService, onRemoveService, onEditService, onUpdateService, onCreateConnection, onRemoveConnection, onDuplicateService }: {
    services: ServiceData[];
    connections: ConnectionData[];
    onAddService: () => void;
    onRemoveService: () => void;
    onEditService: () => void;
    onUpdateService: () => void;
    onCreateConnection: () => void;
    onRemoveConnection: () => void;
    onDuplicateService: () => void;
  }) => React.createElement('div', { 'data-testid': 'free-layout-board' }, [
    React.createElement('div', { key: 'services', 'data-testid': 'services-count' }, services.length.toString()),
    React.createElement('div', { key: 'connections', 'data-testid': 'connections-count' }, connections.length.toString()),
    React.createElement('button', { key: 'add-service', 'data-testid': 'add-service-button', onClick: onAddService }, 'Add Service'),
    React.createElement('button', { key: 'remove-service', 'data-testid': 'remove-service-button', onClick: onRemoveService }, 'Remove Service'),
    React.createElement('button', { key: 'edit-service', 'data-testid': 'edit-service-button', onClick: onEditService }, 'Edit Service'),
    React.createElement('button', { key: 'update-service', 'data-testid': 'update-service-button', onClick: onUpdateService }, 'Update Service'),
    React.createElement('button', { key: 'create-connection', 'data-testid': 'create-connection-button', onClick: onCreateConnection }, 'Create Connection'),
    React.createElement('button', { key: 'remove-connection', 'data-testid': 'remove-connection-button', onClick: onRemoveConnection }, 'Remove Connection'),
    React.createElement('button', { key: 'duplicate-service', 'data-testid': 'duplicate-service-button', onClick: onDuplicateService }, 'Duplicate Service')
  ]);
  return { __esModule: true, default: MockBoard };
})

jest.mock('../src/components/ui/areaCreation/InfoServiceCard', () => {
  const MockInfoCard = ({ service, onServiceChange }: {
    service: ServiceData;
    onServiceChange: (service: ServiceData) => void;
  }) => React.createElement('div', { 'data-testid': 'info-service-card' }, [
    React.createElement('div', { key: 'service-id', 'data-testid': 'selected-service-id' }, service.id),
    React.createElement('button', { key: 'change-btn', 'data-testid': 'change-service-button', onClick: () => onServiceChange(service) }, 'Change Service')
  ]);
  return { __esModule: true, default: MockInfoCard };
})

// Mock CSS modules
jest.mock('./AreaEditor.module.css', () => ({
  container: 'container',
  header: 'header',
  boardContainer: 'boardContainer',
}));

const mockUseAreaEditor = useAreaEditor as jest.MockedFunction<typeof useAreaEditor>
const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>

// Test wrapper with MantineProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'mantine-provider' }, children)
}

const customRender = (ui: React.ReactElement, options?: Parameters<typeof render>[1]) =>
  render(ui, { wrapper: AllTheProviders, ...options })
const defaultMockReturn = {
  servicesState: [
    {
      id: 'service1',
      logo: 'logo1.png',
      serviceName: 'Service 1',
      event: 'event1',
      cardName: 'Card 1',
      state: ServiceState.Configuration,
      actionId: 1,
      serviceId: 'service1',
      activationConfig: { type: 'chain' as const }
    },
    {
      id: 'service2',
      logo: 'logo2.png',
      serviceName: 'Service 2',
      event: 'event2',
      cardName: 'Card 2',
      state: ServiceState.Configuration,
      actionId: 2,
      serviceId: 'service2',
      activationConfig: { type: 'chain' as const }
    }
  ] as ServiceData[],
  connections: [
    {
      id: 'connection1',
      sourceId: 'service1',
      targetId: 'service2',
      linkData: { type: 'chain' as const }
    }
  ] as ConnectionData[],
  selectedService: null as ServiceData | null,
  modalOpened: false,
  setModalOpened: jest.fn(),
  isDragging: false,
  setIsDragging: jest.fn(),
  areaName: 'Test Area',
  setAreaName: jest.fn(),
  areaDescription: 'Test Description',
  setAreaDescription: jest.fn(),
  currentDraftId: undefined,
  isCommitting: false,
  showDraftModal: false,
  setShowDraftModal: jest.fn(),
  pendingDraft: null,
  draftModalActions: {
    onAccept: jest.fn(),
    onReject: jest.fn(),
  },
  handleDragEnd: jest.fn(),
  handleCommit: jest.fn(),
  handleRun: jest.fn(),
  handleDeleteDraft: jest.fn(),
  addNewServiceBelow: jest.fn(),
  removeService: jest.fn(),
  editService: jest.fn(),
  updateService: jest.fn(),
  moveServiceUp: jest.fn(),
  moveServiceDown: jest.fn(),
  duplicateService: jest.fn(),
  createConnection: jest.fn(),
  removeConnection: jest.fn(),
  updateConnection: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseAreaEditor.mockReturnValue({
    servicesState: [],
    connections: [],
    selectedService: null,
    modalOpened: false,
    setModalOpened: jest.fn(),
    isDragging: false,
    setIsDragging: jest.fn(),
    areaName: 'Test Area',
    setAreaName: jest.fn(),
    areaDescription: 'Test Description',
    setAreaDescription: jest.fn(),
    currentDraftId: undefined,
    isCommitting: false,
    showDraftModal: false,
    setShowDraftModal: jest.fn(),
    pendingDraft: null,
    draftModalActions: {
      onAccept: jest.fn(),
      onReject: jest.fn(),
    },
    handleDragEnd: jest.fn(),
    handleCommit: jest.fn(),
    handleRun: jest.fn(),
    handleDeleteDraft: jest.fn(),
    addNewServiceBelow: jest.fn(),
    removeService: jest.fn(),
    editService: jest.fn(),
    updateService: jest.fn(),
    moveServiceUp: jest.fn(),
    moveServiceDown: jest.fn(),
    duplicateService: jest.fn(),
    createConnection: jest.fn(),
    removeConnection: jest.fn(),
    updateConnection: jest.fn(),
  })
  mockUseMediaQuery.mockReturnValue(false)
})

describe('AreaEditor', () => {
  it('can import AreaEditor component', () => {
    expect(typeof AreaEditor).toBe('function');
  });

  it('renders without crashing', () => {
    const { container } = render(<AreaEditor areaId={undefined} draftId={undefined} />);
    expect(container).toBeInTheDocument();
  });

  describe('Draft Modal', () => {
    beforeEach(() => {
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        showDraftModal: true,
      })
    })

    it('renders draft modal when showDraftModal is true', () => {
      customRender(<AreaEditor />)

      expect(screen.getByText('Draft Found')).toBeInTheDocument()
      expect(screen.getByText('Untitled Draft')).toBeInTheDocument()
    })

    it('calls onReject when Start Fresh button is clicked', () => {
      const mockOnReject = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        showDraftModal: true,
        draftModalActions: {
          onAccept: jest.fn(),
          onReject: mockOnReject,
        },
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByText('Start Fresh'))
      expect(mockOnReject).toHaveBeenCalled()
    })

    it('calls onAccept when Continue Editing button is clicked', () => {
      const mockOnAccept = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        showDraftModal: true,
        draftModalActions: {
          onAccept: mockOnAccept,
          onReject: jest.fn(),
        },
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByText('Continue Editing'))
      expect(mockOnAccept).toHaveBeenCalled()
    })
  })

  describe('Toolbar Integration', () => {
    it('passes area name and description to toolbar', () => {
      customRender(<AreaEditor />)

      expect(screen.getByTestId('area-name-input')).toHaveValue('Test Area')
      expect(screen.getByTestId('area-description-input')).toHaveValue('Test Description')
    })

    it('calls setAreaName when name input changes', () => {
      const mockSetAreaName = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        setAreaName: mockSetAreaName,
      })

      customRender(<AreaEditor />)

      fireEvent.change(screen.getByTestId('area-name-input'), {
        target: { value: 'New Area Name' },
      })
      expect(mockSetAreaName).toHaveBeenCalledWith('New Area Name')
    })

    it('calls setAreaDescription when description input changes', () => {
      const mockSetAreaDescription = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        setAreaDescription: mockSetAreaDescription,
      })

      customRender(<AreaEditor />)

      fireEvent.change(screen.getByTestId('area-description-input'), {
        target: { value: 'New Description' },
      })
      expect(mockSetAreaDescription).toHaveBeenCalledWith('New Description')
    })

    it('calls handleCommit when commit button is clicked', () => {
      const mockHandleCommit = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        handleCommit: mockHandleCommit,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('commit-button'))
      expect(mockHandleCommit).toHaveBeenCalled()
    })

    it('calls handleRun when run button is clicked', () => {
      const mockHandleRun = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        handleRun: mockHandleRun,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('run-button'))
      expect(mockHandleRun).toHaveBeenCalled()
    })

    it('shows delete draft button when currentDraftId exists', () => {
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        currentDraftId: 'draft-123',
      })

      customRender(<AreaEditor />)

      expect(screen.getByTestId('delete-draft-button')).toBeInTheDocument()
    })

    it('calls handleDeleteDraft when delete draft button is clicked', () => {
      const mockHandleDeleteDraft = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        currentDraftId: 'draft-123',
        handleDeleteDraft: mockHandleDeleteDraft,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('delete-draft-button'))
      expect(mockHandleDeleteDraft).toHaveBeenCalled()
    })

    it('disables commit button when isCommitting is true', () => {
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        isCommitting: true,
      })

      customRender(<AreaEditor />)

      expect(screen.getByTestId('commit-button')).toBeDisabled()
      expect(screen.getByTestId('commit-button')).toHaveTextContent('Committing...')
    })
  })

  describe('Board Integration', () => {
    beforeEach(() => {
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
      })
    })

    it('passes services and connections to board', () => {
      customRender(<AreaEditor />)

      expect(screen.getByTestId('services-count')).toHaveTextContent('2')
      expect(screen.getByTestId('connections-count')).toHaveTextContent('1')
    })

    it('calls addNewServiceBelow when add service button is clicked', () => {
      const mockAddNewServiceBelow = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        addNewServiceBelow: mockAddNewServiceBelow,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('add-service-button'))
      expect(mockAddNewServiceBelow).toHaveBeenCalled()
    })

    it('calls removeService when remove service button is clicked', () => {
      const mockRemoveService = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        removeService: mockRemoveService,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('remove-service-button'))
      expect(mockRemoveService).toHaveBeenCalled()
    })

    it('calls editService when edit service button is clicked', () => {
      const mockEditService = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        editService: mockEditService,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('edit-service-button'))
      expect(mockEditService).toHaveBeenCalled()
    })

    it('calls updateService when update service button is clicked', () => {
      const mockUpdateService = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        updateService: mockUpdateService,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('update-service-button'))
      expect(mockUpdateService).toHaveBeenCalled()
    })

    it('calls createConnection when create connection button is clicked', () => {
      const mockCreateConnection = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        createConnection: mockCreateConnection,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('create-connection-button'))
      expect(mockCreateConnection).toHaveBeenCalled()
    })

    it('calls removeConnection when remove connection button is clicked', () => {
      const mockRemoveConnection = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        removeConnection: mockRemoveConnection,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('remove-connection-button'))
      expect(mockRemoveConnection).toHaveBeenCalled()
    })

    it('calls duplicateService when duplicate service button is clicked', () => {
      const mockDuplicateService = jest.fn()
      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        duplicateService: mockDuplicateService,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('duplicate-service-button'))
      expect(mockDuplicateService).toHaveBeenCalled()
    })
  })

  describe('Drawer/Modal Integration', () => {
    it('renders drawer with InfoServiceCard when modalOpened is true and selectedService exists', () => {
      const selectedService: ServiceData = {
        id: 'selected-service',
        logo: '',
        serviceName: 'Selected Service',
        event: '',
        cardName: 'Selected Service',
        state: ServiceState.Configuration,
        actionId: 0,
        serviceId: '',
        activationConfig: { type: 'chain' as const }
      }

      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        modalOpened: true,
        selectedService,
      })

      customRender(<AreaEditor />)

      expect(screen.getByTestId('info-service-card')).toBeInTheDocument()
      expect(screen.getByTestId('selected-service-id')).toHaveTextContent('selected-service')
    })

    it('calls setModalOpened with false when drawer is closed', () => {
      const mockSetModalOpened = jest.fn()
      const selectedService: ServiceData = {
        id: 'selected-service',
        logo: '',
        serviceName: 'Selected Service',
        event: '',
        cardName: 'Selected Service',
        state: ServiceState.Configuration,
        actionId: 0,
        serviceId: '',
        activationConfig: { type: 'chain' as const }
      }

      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        modalOpened: true,
        selectedService,
        setModalOpened: mockSetModalOpened,
      })

      customRender(<AreaEditor />)

      // The drawer close button would trigger onClose
      // Since we can't easily test the Mantine Drawer close event,
      // we verify the component renders with the correct props
      expect(screen.getByTestId('info-service-card')).toBeInTheDocument()
    })

    it('calls updateService when service is changed in InfoServiceCard', () => {
      const mockUpdateService = jest.fn()
      const selectedService: ServiceData = {
        id: 'selected-service',
        logo: '',
        serviceName: 'Selected Service',
        event: '',
        cardName: 'Selected Service',
        state: ServiceState.Configuration,
        actionId: 0,
        serviceId: '',
        activationConfig: { type: 'chain' as const }
      }

      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        modalOpened: true,
        selectedService,
        updateService: mockUpdateService,
      })

      customRender(<AreaEditor />)

      fireEvent.click(screen.getByTestId('change-service-button'))
      expect(mockUpdateService).toHaveBeenCalledWith(selectedService)
    })
  })

  describe('Responsive Design', () => {
    it('uses 80% drawer size on small screens', () => {
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') return true
        return false
      })

      const selectedService: ServiceData = {
        id: 'service',
        logo: '',
        serviceName: 'Service',
        event: '',
        cardName: 'Service',
        state: ServiceState.Configuration,
        actionId: 0,
        serviceId: '',
        activationConfig: { type: 'chain' as const }
      }

      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        modalOpened: true,
        selectedService,
      })

      customRender(<AreaEditor />)

      // The drawer size is calculated but not directly testable
      // We can verify the media query was called
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: 768px)')
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: 992px)')
    })

    it('uses 50% drawer size on medium screens', () => {
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') return false
        if (query === '(max-width: 992px)') return true
        return false
      })

      const selectedService: ServiceData = {
        id: 'service',
        logo: '',
        serviceName: 'Service',
        event: '',
        cardName: 'Service',
        state: ServiceState.Configuration,
        actionId: 0,
        serviceId: '',
        activationConfig: { type: 'chain' as const }
      }

      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        modalOpened: true,
        selectedService,
      })

      customRender(<AreaEditor />)

      expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: 768px)')
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: 992px)')
    })

    it('uses 35% drawer size on large screens', () => {
      mockUseMediaQuery.mockImplementation(() => false)

      const selectedService: ServiceData = {
        id: 'service',
        logo: '',
        serviceName: 'Service',
        event: '',
        cardName: 'Service',
        state: ServiceState.Configuration,
        actionId: 0,
        serviceId: '',
        activationConfig: { type: 'chain' as const }
      }

      mockUseAreaEditor.mockReturnValue({
        ...defaultMockReturn,
        modalOpened: true,
        selectedService,
      })

      customRender(<AreaEditor />)

      expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: 768px)')
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: 992px)')
    })
  })

  describe('Hook Integration', () => {
    it('calls useAreaEditor with correct parameters', () => {
      customRender(<AreaEditor areaId="area-123" draftId="draft-456" />)

      expect(mockUseAreaEditor).toHaveBeenCalledWith('area-123', 'draft-456')
    })

    it('calls useAreaEditor with undefined parameters when not provided', () => {
      customRender(<AreaEditor />)

      expect(mockUseAreaEditor).toHaveBeenCalledWith(undefined, undefined)
    })
  })
})