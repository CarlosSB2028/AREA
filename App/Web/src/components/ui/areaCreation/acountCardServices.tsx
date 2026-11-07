import { Card, Text, Menu, ActionIcon, Flex, Avatar, Button, Stack } from '@mantine/core';
import { IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { AccountCardProps } from '../../../types';

export default function AccountCardServices({ logo, accountName, email, isLoggedIn, onView, onChange, onDelete, onConnect }: AccountCardProps) {
  return (
    <Card radius="md" withBorder padding="md">
      <Stack gap="sm">
        {isLoggedIn ? (
          <Flex justify="space-between" align="center">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar src={logo} alt={accountName} size="md" />
              <div>
                <Text >{accountName}</Text>
                {email && <Text size="xs" color="dimmed">{email}</Text>}
              </div>
            </div>
            <Menu width={180} withArrow>
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={onView}>
                  View
                </Menu.Item>
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={onChange}>
                  Change
                </Menu.Item>
                <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={onDelete}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        ) : (
          <Flex justify="space-between" align="center">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar size="md" />
              <Text color="dimmed" size="sm">No account connected</Text>
            </div>
            <Button size="sm" onClick={onConnect}>Connect</Button>
          </Flex>
        )}
      </Stack>
    </Card>
  );
}
