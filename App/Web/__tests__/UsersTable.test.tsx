import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { UsersTable } from '../src/components/ui/dashboard/UsersTable';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
];

const mockOnAddUser = jest.fn();
const mockOnEditUser = jest.fn();
const mockOnDeleteUser = jest.fn();

describe('UsersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with users data', () => {
    render(
      <UsersTable
        users={mockUsers}
        onAddUser={mockOnAddUser}
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('All Users')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('displays user roles with badges', () => {
    render(
      <UsersTable
        users={mockUsers}
        onAddUser={mockOnAddUser}
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getAllByText('User')).toHaveLength(2);
  });

  it('renders add user button', () => {
    render(
      <UsersTable
        users={mockUsers}
        onAddUser={mockOnAddUser}
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />,
      { wrapper: AllTheProviders }
    );

    const addButton = screen.getByText('Add User');
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(mockOnAddUser).toHaveBeenCalled();
  });


  it('renders table headers correctly', () => {
    render(
      <UsersTable
        users={mockUsers}
        onAddUser={mockOnAddUser}
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles empty users list', () => {
    render(
      <UsersTable
        users={[]}
        onAddUser={mockOnAddUser}
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />,
      { wrapper: AllTheProviders }
    );

    expect(screen.getByText('All Users')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});