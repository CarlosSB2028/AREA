'use client';

import { useState, useEffect } from 'react';
import { Grid, Card, Title, TextInput, Combobox, useCombobox, Space } from '@mantine/core';
import { LineChart, BarChart } from '@mantine/charts';
import { StatsGrid } from './StatsGrid';
import { UsersTable } from './UsersTable';
import { getLineData, getBarData, getCardUserData, getUsers, deleteUser } from '../../../services/adminService';
import { ModaleUser } from './ModaleUser';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LineDataPoint {
  date: string;
  users: number;
}

interface BarDataPoint {
  month: string;
  newUsers: number;
}

interface CardUserDataPoint {
  title: string;
  icon: 'user' | 'discount' | 'receipt' | 'coin';
  value: string;
  diff: number;
}

export function UsersTab() {
  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [barData, setBarData] = useState<BarDataPoint[]>([]);
  const [cardUserData, setCardUserData] = useState<CardUserDataPoint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modaleOpened, setModaleOpened] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const comboboxValueUser = ['', 'User', 'Admin'];

  const fetchData = async () => {
    try {
      const lineDataResult = await getLineData();
      setLineData(Array.isArray(lineDataResult) ? lineDataResult : []);

      const barDataResult = await getBarData();
      setBarData(Array.isArray(barDataResult) ? barDataResult : []);

      const cardUserDataResult = await getCardUserData();
      setCardUserData(Array.isArray(cardUserDataResult) ? cardUserDataResult : []);

      const usersData = await getUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users data:', error);
      setLineData([]);
      setBarData([]);
      setCardUserData([]);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) &&
    (selectedRole ? user.role === selectedRole : true)
  );

  const handleAddUser = () => {
    setSelectedUserId(null);
    setModaleOpened(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUserId(user.id.toString());
    setModaleOpened(true);
  };

  const handleDeleteUser = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id));
    deleteUser(user.id.toString());
  };

  const handleModalClose = () => {
    setModaleOpened(false);
    setSelectedUserId(null);
    fetchData();
  };

  return (
    <>
      <StatsGrid data={cardUserData} />
      <Space h="md" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder shadow="sm" p="md" radius="md">
            <Title order={3} mb="xs">Users Connected per Day</Title>
            <LineChart
              h={300}
              data={lineData}
              dataKey="date"
              series={[{ name: 'users', color: 'blue' }]}
              curveType="linear"
              gridAxis="xy"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder shadow="sm" p="md" radius="md">
            <Title order={3} mb="xs">New users per Month</Title>
            <BarChart
              h={300}
              data={barData}
              dataKey="month"
              series={[{ name: 'users', color: 'indigo' }]}
              gridAxis="y"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Grid>
            <Grid.Col span={{ base: 8, md: 10 }}>
              <TextInput
                placeholder="Search users by name..."
                value={searchUsers}
                onChange={(event) => setSearchUsers(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, md: 2 }}>
              <Combobox
                store={combobox}
                onOptionSubmit={(value) => {
                  setSelectedRole(value);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <TextInput
                    placeholder="Select role"
                    value={selectedRole || ''}
                    readOnly
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                  />
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>
                    {comboboxValueUser.map(role => (
                      <Combobox.Option key={role} value={role}>
                        {role === '' ? 'All' : role}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        <Grid.Col span={12}>
          <UsersTable users={filteredUsers} onAddUser={handleAddUser} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} />
        </Grid.Col>
      </Grid>
      <ModaleUser opened={modaleOpened} onClose={handleModalClose} userId={selectedUserId} />
    </>
  );
}