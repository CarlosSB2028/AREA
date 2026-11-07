'use client';

import { AxiosError } from 'axios';
import { PasswordInput, TextInput, Avatar, Button, Container, Card, Stack, Group, Menu, Text, Loader, Alert, Tabs, Space, Modal } from '@mantine/core';
import { IconCamera, IconUser, IconPlug, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { getCurrentUser, updateProfile, deleteAccount } from '../../services/authService';
import {  uploadAvatar } from '../../services/userService';
import { ProfileData, UserContent } from '../../types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ServicesTabProfile from '../../components/user/ServicesTabProfile';

const profileSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be at most 100 characters'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name must be at most 100 characters'),
  password: z.string().optional().refine((val: string | undefined) => !val || val.length >= 6, {
    message: 'Password must be at least 6 characters',
  }),
});

export default function ProfilPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserContent | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [originalAvatarSrc, setOriginalAvatarSrc] = useState<string>('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileData>({
    initialValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
    },
    validate: (values) => {
      try {
        profileSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.flatten().fieldErrors;
        }
        return {};
      }
    },
  });

  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setOriginalAvatarSrc(userData.avatarSrc);
        form.setValues(userData.profileData);
        form.resetDirty(userData.profileData);
        setUserId(userData.id);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      try {
        await getCurrentUser();
      } catch (authError) {
        console.error('User not authenticated:', authError);
        setNotification({ message: 'Your session has expired. Please log in again.', type: 'error' });
        setLoading(false);
        return;
      }

      let avatarUrl = user?.avatarSrc;
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(avatarFile);
          setOriginalAvatarSrc(avatarUrl);
        } catch (uploadError) {
          console.error('Failed to upload avatar:', uploadError);
          setNotification({ message: 'Failed to upload avatar. Profile will be updated without avatar change.', type: 'warning' });
          avatarUrl = user?.avatarSrc;
        }
      }

      const updatedUser = await updateProfile(userId, form.values, avatarFile ? avatarUrl : undefined);
      setUser(updatedUser);
      setOriginalAvatarSrc(updatedUser.avatarSrc);
      form.setValues(updatedUser.profileData);
      form.resetDirty(updatedUser.profileData);
      setAvatarFile(null);
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          setNotification({ message: 'You are not authorized to update your profile. Please check your authentication.', type: 'error' });
        } else if (error.response?.status === 404) {
          setNotification({ message: 'User not found. Please try logging in again.', type: 'error' });
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.error || 'Invalid request. Please check your input.';
          setNotification({ message: errorMessage, type: 'error' });
        } else {
          setNotification({ message: 'Failed to update profile. Please try again.', type: 'error' });
        }
      } else {
        setNotification({ message: 'Failed to update profile. Please try again.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    try {
      const avatarPreviewSrc = await readFileAsDataURL(file);
      setUser(prev => prev ? { ...prev, avatarSrc: avatarPreviewSrc } : null);
      setAvatarFile(file);
    } catch (error) {
      console.error('Failed to read file', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId || userId.trim() === '') {
      setNotification({ message: 'Invalid user ID. Please try logging in again.', type: 'error' });
      setDeleteModalOpened(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(userId);
      setNotification({ message: 'Account deleted successfully. Redirecting...', type: 'success' });
      setDeleteModalOpened(false);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Failed to delete account:', error);
      setNotification({ message: 'Failed to delete account. Please try again.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const isDirty = form.isDirty() || avatarFile !== null;

  if (isLoadingUser) {
    return (
      <Container size="sm" py="xl">
        <Group justify="center">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Text ta="center">Failed to load user data.</Text>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Tabs variant="pills" radius="xl" defaultValue="profile">
        <Tabs.List justify="center">
          <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="services" leftSection={<IconPlug size={16} />}>
            Services
          </Tabs.Tab>
        </Tabs.List>
        <Space h="md" />
      <Tabs.Panel value="profile">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          {notification && (
            <Alert
              variant="light"
              color={notification.type === 'success' ? 'green' : notification.type === 'error' ? 'red' : 'yellow'}
              withCloseButton
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </Alert>
          )}
          <Group justify="center">
            <div style={{ position: 'relative' }}>
              <Avatar size="xl" src={user.avatarSrc} />
              <Button
                size="xs"
                style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: '50%' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <IconCamera size={12} />
              </Button>
            </div>
          </Group>
          <TextInput
            label="Email"
            variant="filled"
            placeholder="Email"
            readOnly
            {...form.getInputProps('email')}
          />
          <div>
            <TextInput
              label="Username"
              placeholder="Username"
              maxLength={50}
              {...form.getInputProps('username')}
            />
            <Text size="xs" c="dimmed" mt={4} ta="right">
              {form.values.username?.length || 0}/50 characters
            </Text>
          </div>
          <PasswordInput
            label="New Password (optional)"
            description="Leave empty to keep current password"
            placeholder="New Password"
            {...form.getInputProps('password')}
          />
          <div>
            <TextInput
              label="First Name"
              placeholder="First Name"
              maxLength={100}
              {...form.getInputProps('firstName')}
            />
            <Text size="xs" c="dimmed" mt={4} ta="right">
              {form.values.firstName.length}/100 characters
            </Text>
          </div>
          <div>
            <TextInput
              label="Last Name"
              placeholder="Last Name"
              maxLength={100}
              {...form.getInputProps('lastName')}
            />
            <Text size="xs" c="dimmed" mt={4} ta="right">
              {form.values.lastName.length}/100 characters
            </Text>
          </div>
          <Group justify="flex-end">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button disabled={!isDirty} variant="filled" loading={loading}>
                  Save Changes
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={handleSave}>
                  Confirm Save
                </Menu.Item>
                <Menu.Item onClick={() => {
                  form.setValues(user.profileData);
                  form.resetDirty(user.profileData);
                  setUser(prev => prev ? { ...prev, avatarSrc: originalAvatarSrc } : null);
                  setAvatarFile(null);
                }}>
                  Discard Changes
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Stack>
      </Card>

      <Space h="xl" />

      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ borderColor: '#fa5252' }}>
        <Stack gap="md">
          <div>
            <Text size="lg" fw={600} c="red">
              Danger Zone
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Irreversible and destructive actions
            </Text>
          </div>
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={() => setDeleteModalOpened(true)}
          >
            Delete Account
          </Button>
        </Stack>
      </Card>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        data-testid="avatar-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              setNotification({ message: 'File size must be less than 5MB', type: 'error' });
              return;
            }
            handleAvatarChange(file);
          }
        }}
      />
      </Tabs.Panel>
      <Tabs.Panel value="services">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <ServicesTabProfile />
        </Card>
      </Tabs.Panel>
      </Tabs>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Account"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteAccount} loading={isDeleting}>
              Delete Account
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
