import { Badge } from '@mantine/core';
import { DataTable, Column } from '../DataTable';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UsersTableProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (updatedUser: User) => void;
  onDeleteUser: (user: User) => void;
}

export function UsersTable({ users, onAddUser, onEditUser, onDeleteUser }: UsersTableProps) {
  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <Badge color={user.role === 'Admin' ? 'blue' : 'green'} variant="light">
          {user.role}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="All Users"
      data={users}
      columns={columns}
      itemsPerPage={10}
      onAdd={onAddUser}
      onEdit={onEditUser}
      onDelete={onDeleteUser}
      addButtonText="Add User"
    />
  );
}