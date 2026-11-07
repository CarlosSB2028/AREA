"use client";
import {
  IconChevronRight,
  IconLogout
} from '@tabler/icons-react';
import { Avatar, Group, Menu, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { UserContent } from '../../../types';

export function UserMenu({ user }: { user: UserContent }) {
  const router = useRouter();

  return (
    <Group justify="center">
      <Menu
        withArrow
        width={300}
        position="right"
        transitionProps={{ transition: 'pop' }}
        withinPortal
        zIndex={99999999}
      >
        <Menu.Target>
          <Avatar size={40} src={user.avatarSrc} radius={40} aria-label="User menu" />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item rightSection={<IconChevronRight size={16} stroke={1.5} />}>
            <Group onClick={() => router.push("/profil")}>
              <Avatar
                radius="xl"
                src={user.avatarSrc}
              />

              <div>
                <Text fw={500}>
                  {user.name.length > 20 ? user.name.slice(0, 20) + "..." : user.name}
                </Text>
                <Text size="xs" c="dark.3">
                  {user.email}
                </Text>
              </div>
            </Group>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Settings</Menu.Label>
          <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />} onClick={() => router.push("/logout")}>
            Logout
          </Menu.Item>

          <Menu.Divider />

        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}