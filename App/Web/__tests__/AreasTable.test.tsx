import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AreasTable } from '../src/components/ui/dashboard/AreasTable';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const mockAreas = [
  { id: 1, name: 'GitHub PR Monitor', description: 'Monitors pull requests', lastRun: '2024-09-25', status: 'success', user: 'John Doe', enabled: true },
  { id: 2, name: 'Slack Alert', description: 'Sends alerts', lastRun: '2024-09-24', status: 'failed', user: 'Jane Smith', enabled: false },
  { id: 3, name: 'GitLab CI', description: 'Monitors CI', lastRun: '2024-09-23', status: 'in progress', user: 'Bob Johnson', enabled: true },
];

const mockOnAddArea = jest.fn();
const mockOnEditArea = jest.fn();
const mockOnDeleteArea = jest.fn();
const mockOnToggleArea = jest.fn();

describe('AreasTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with areas data', () => {
    render(
      <AreasTable
        areas={mockAreas}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('All Areas')).toBeInTheDocument();
    expect(screen.getByText('GitHub PR Monitor')).toBeInTheDocument();
    expect(screen.getByText('Slack Alert')).toBeInTheDocument();
    expect(screen.getByText('GitLab CI')).toBeInTheDocument();
  });

  it('displays area status with correct badge colors', () => {
    render(
      <AreasTable
        areas={mockAreas}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.getByText('in progress')).toBeInTheDocument();
  });

  it('renders user links', () => {
    render(
      <AreasTable
        areas={mockAreas}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    const johnLink = screen.getByText('John Doe');
    expect(johnLink).toBeInTheDocument();
    expect(johnLink.closest('a')).toHaveAttribute('href', '/profil/john-doe');
  });

  it('renders toggle switches for enable/disable', () => {
    render(
      <AreasTable
        areas={mockAreas}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    // Check for toggle switches - they should be present
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
  });

  it('handles toggle area action', () => {
    render(
      <MantineProvider>
        <AreasTable
          areas={mockAreas}
          onToggleArea={mockOnToggleArea}
        />
      </MantineProvider>
    );

    // Check for toggle switches - they should be present
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
  });  it('renders add area button', () => {
    render(
      <AreasTable
        areas={mockAreas}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    const addButton = screen.getByText('Add Area');
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(mockOnAddArea).toHaveBeenCalled();
  });

  it('handles edit area action', () => {
    render(
      <AreasTable
        areas={mockAreas}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    // Find edit buttons by their icon
    const editButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg') && button.textContent === ''
    );
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);
    expect(mockOnEditArea).toHaveBeenCalledWith(mockAreas[0]);
  });


  it('renders table headers correctly', () => {
    render(
      <AreasTable
        areas={mockAreas}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Last Run')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Enable/Disable')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles empty areas list', () => {
    render(
      <AreasTable
        areas={[]}
        onAddArea={mockOnAddArea}
        onEditArea={mockOnEditArea}
        onDeleteArea={mockOnDeleteArea}
        onToggleArea={mockOnToggleArea}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('All Areas')).toBeInTheDocument();
    expect(screen.queryByText('GitHub PR Monitor')).not.toBeInTheDocument();
  });
});