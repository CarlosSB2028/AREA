"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Anchor,
  Button,
  Divider,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { upperFirst } from '@mantine/hooks';
import { AxiosError } from 'axios';
import { PasswordStrength } from './PasswordStrength';
import { login, register, forgotPassword } from '../../../services/authService';
import { getOAuthProviders, initiateOAuth } from '../../../services/oauthService';
import { FormValues, OAuthProvider, LoginData } from '../../../types';

export function AuthenticationForm(props: PaperProps) {
  const [type, setType] = useState<'login' | 'register' | 'forgotPassword'>('login');
  const [data, setData] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const isSubmittingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    const loadProviders = async () => {
      const providers = await getOAuthProviders();
      setData(providers);
    };
    loadProviders();
  }, []);

  const form = useForm({
    initialValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      email: (val) => {
        if (type === 'register' && !val) return 'Email is required';
        if (val && val.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Invalid email';
        return null;
      },
      username: (val) => {
        if (type === 'register' && (!val || val.trim().length < 3)) return 'Username must be at least 3 characters';
        if (type === 'register' && val && val.trim().length > 50) return 'Username must not exceed 50 characters';
        return null;
      },
      password: (val) => { return val.length <= 8 ? 'Password should include at least 6 characters' : null; },
      confirmPassword: (val, values) => {
        if (type !== 'register') return null;
        return val !== values.password ? 'Passwords do not match' : null;
      },
      firstName: (val) => {
        if (type !== 'register') return null;
        return val.trim().length === 0 ? 'First name is required' : null;
      },
      lastName: (val) => {
        if (type !== 'register') return null;
        return val.trim().length === 0 ? 'Last name is required' : null;
      },
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const handleTypeChange = (newType: 'login' | 'register' | 'forgotPassword') => {
    setType(newType);
    setError(null);
    setSuccess(null);
    form.reset();
    form.clearErrors();
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleOAuthClick = (providerKey: string) => {
    initiateOAuth(providerKey);
  };

  const getErrorMessage = (error: unknown, type: 'login' | 'register' | 'forgotPassword'): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;
      const statusHandlers: Record<number, (type: 'login' | 'register' | 'forgotPassword', data?: { message?: string }) => string> = {
        400: (type: 'login' | 'register' | 'forgotPassword', data?: { message?: string }) => {
          const messages = {
            login: 'Invalid email or password. Please check your credentials and try again.',
            register: data?.message || 'Registration failed. Please check your information and try again.',
            forgotPassword: 'Invalid email address. Please enter a valid email.'
          };
          return messages[type] || 'Bad request. Please check your input.';
        },
        401: (type: 'login' | 'register' | 'forgotPassword') =>
          type === 'login'
            ? 'Invalid email or password. Please check your credentials.'
            : 'Authentication failed. Please try again.',
        403: () => 'Access denied. Your account may be suspended.',
        409: (type: 'login' | 'register' | 'forgotPassword') =>
          type === 'register'
            ? 'An account with this email already exists. Please use a different email or try logging in.'
            : 'Conflict error. Please try again.',
        422: (type: 'login' | 'register' | 'forgotPassword', data?: { message?: string }) => data?.message || 'Invalid data provided. Please check your information.',
        429: () => 'Too many attempts. Please wait a few minutes before trying again.',
        500: () => 'Server error. Please try again later.',
        503: () => 'Service temporarily unavailable. Please try again later.'
      };

      if (status && statusHandlers[status]) {
        return statusHandlers[status](type, data);
      }

      return data?.message || 'An unexpected error occurred. Please try again.';
    }

    if (error instanceof Error) {
      const networkErrors = ['Network Error', 'ERR_NETWORK'];
      const timeoutErrors = ['timeout'];

      if (networkErrors.some(err => error.message.includes(err))) {
        return 'Network error. Please check your connection and try again.';
      }

      if (timeoutErrors.some(err => error.message.includes(err))) {
        return 'Request timed out. Please try again.';
      }

      return error.message;
    }

    return 'An error occurred. Please try again.';
  };

  const handleSubmit = async (values: FormValues) => {
    if (isSubmittingRef.current) { return; }
    if (loading) { return; }

    isSubmittingRef.current = true;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (type === 'login') {
        if (!values.email && !values.username) {
          setError('Please enter either an email or username');
          setLoading(false);
          isSubmittingRef.current = false;
          return;
        }

        let loginData: LoginData;
        if (values.email && values.username) {
          loginData = { email: values.email, username: values.username, password: values.password };
        } else if (values.email) {
          loginData = { email: values.email, password: values.password };
        } else {
          loginData = { username: values.username, password: values.password };
        }

        await login(loginData);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.reload();
          router.push('/');
        }, 1500);
      } else if (type === 'register') {
        await register({
          email: values.email,
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password
        });
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          window.location.reload();
          router.push('/');
        }, 1500);
      } else if (type === 'forgotPassword') {
        await forgotPassword(values.email);
        setSuccess('Password reset email sent! Please check your inbox.');
        window.location.reload();
        router.push('/login');
        form.reset();
      }
    } catch (error: unknown) {
      console.error('Authentication error caught:', error);
      const errorMessage = getErrorMessage(error, type);
      setError(errorMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleFormSubmit = async () => {
    const now = Date.now();
    if (now - lastSubmitTime < 1000) {
      return;
    }
    setLastSubmitTime(now);
    if (isSubmittingRef.current) { return; }
    if (loading) { return; }
    setError(null);
    setSuccess(null);
    await handleSubmit(form.values);
  };

  return (
    <Paper radius="md" p="lg" withBorder w="40%" mx="auto" {...props}>
      <Text size="lg" fw={500}>
        Welcome to Area, {type} with
      </Text>

      <div>
        {error && (
          <Alert color="red" mb="md" icon={<IconAlertCircle size={16} />} title="Authentication Failed">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="green" mb="md" icon={<IconCheck size={16} />} title="Success">
            {success}
          </Alert>
        )}

        {type !== 'forgotPassword' && (
            <>
            <Stack mb="md" mt="md">
                {data.map((item) => (
              <Button
                variant="default"
                key={item.providerKey}
                radius="xl"
                leftSection={<Image src={item.providerLogoUrl} alt={`icon ${item.providerLabel}`} width={20} height={20} />}
                onClick={() => handleOAuthClick(item.providerKey)}
              >
                {item.providerLabel}
              </Button>
                ))}
            </Stack>
            <Divider label="Or continue with email" labelPosition="center" my="lg" styles={{ label: { color: 'var(--mantine-color-dark-6)' } }} />
            </>
        )}
        {type === 'forgotPassword' && (
          <>
            <Divider labelPosition="center" my="lg" />
          </>
        )}
        <Stack>
          {type === 'register' && (
            <>
              <TextInput
                label="First Name"
                placeholder="Your first name"
                value={form.values.firstName}
                onChange={(event) => {
                  form.setFieldValue('firstName', event.currentTarget.value);
                  clearMessages();
                }}
                radius="md"
              />
              <TextInput
                label="Last Name"
                placeholder="Your last name"
                value={form.values.lastName}
                onChange={(event) => {
                  form.setFieldValue('lastName', event.currentTarget.value);
                  clearMessages();
                }}
                radius="md"
              />
            </>
          )}

          {type === 'login' ? (
            <TextInput
              label="Email or Username"
              placeholder="Area@Area.com or username"
              value={form.values.email || form.values.username || ''}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (value.includes('@')) {
                  form.setFieldValue('email', value);
                  form.setFieldValue('username', '');
                } else {
                  form.setFieldValue('username', value);
                  form.setFieldValue('email', '');
                }
                clearMessages();
              }}
              error={form.errors.email || form.errors.username}
              radius="md"
            />
          ) : (
            <>
              <TextInput
                required
                label="Email"
                placeholder="Area@Area.com"
                value={form.values.email}
                onChange={(event) => {
                  form.setFieldValue('email', event.currentTarget.value);
                  clearMessages();
                }}
                error={form.errors.email && 'Invalid email'}
                radius="md"
              />
              {type === 'register' && (
                <TextInput
                  required
                  label="Username"
                  placeholder="Your username"
                  value={form.values.username}
                  onChange={(event) => {
                    form.setFieldValue('username', event.currentTarget.value);
                    clearMessages();
                  }}
                  error={form.errors.username}
                  radius="md"
                />
              )}
            </>
          )}

          {type === 'register' ? (
            <>
              <PasswordStrength
                value={form.values.password}
                onChange={(val) => {
                  form.setFieldValue('password', val);
                  clearMessages();
                }}
              />
              <PasswordInput
                required
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.values.confirmPassword}
                onChange={(event) => {
                  form.setFieldValue('confirmPassword', event.currentTarget.value);
                  clearMessages();
                }}
                error={form.errors.confirmPassword}
                radius="md"
              />
            </>
          ) : type === 'login' ? (
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => {
                form.setFieldValue('password', event.currentTarget.value);
                clearMessages();
              }}
              error={form.errors.password && 'Password should include at least 8 characters'}
              radius="md"
            />
          ) : null}
        </Stack>

        <Stack align="flex-start" mt="xl">
          <Anchor component="button" type="button" c="blue.9" onClick={() => handleTypeChange(type === 'login' ? 'register' : type === 'register' ? 'login' : 'login')} size="xs">
            {type === 'register'
              ? 'Already have an account? Login'
              : type === 'forgotPassword'
              ? 'Remember your password? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Anchor component="button" type="button" c="blue.9" onClick={() => handleTypeChange('forgotPassword')} size="xs">
            {type === 'login' ? 'Forgot password?' : ''}
          </Anchor>
        </Stack>
        <Stack mb="md" mt="md">
          <Button
            type="button"
            radius="xl"
            color="blue.9"
            loading={loading}
            disabled={loading || Object.keys(form.errors).length > 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!loading) {
                handleFormSubmit();
              }
            }}
          >
            {loading ? 'Processing...' : (type === 'forgotPassword' ? 'Send' : upperFirst(type))}
          </Button>
        </Stack>
      </div>
    </Paper>
  );
}