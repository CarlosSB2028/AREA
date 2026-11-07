"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { AxiosError } from 'axios';
import { PasswordStrength } from './PasswordStrength';
import { resetPassword } from '../../../services/authService';

export function ResetPasswordForm(props: PaperProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const isSubmittingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },

    validate: {
      password: (val) => val.length <= 8 ? 'Password should include at least 8 characters' : null,
      confirmPassword: (val, values) => val !== values.password ? 'Passwords do not match' : null,
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      const statusHandlers: Record<number, (data?: { message?: string }) => string> = {
        400: (data?: { message?: string }) => data?.message || 'Invalid request. Please check your input.',
        401: () => 'Invalid or expired token.',
        422: (data?: { message?: string }) => data?.message || 'Invalid data provided.',
        429: () => 'Too many attempts. Please wait a few minutes before trying again.',
        500: () => 'Server error. Please try again later.',
      };
      if (status && statusHandlers[status])
        return statusHandlers[status](data);
      return data?.message || 'An unexpected error occurred. Please try again.';
    }

    if (error instanceof Error) {
      const networkErrors = ['Network Error', 'ERR_NETWORK'];
      const timeoutErrors = ['timeout'];
      if (networkErrors.some(err => error.message.includes(err)))
        return 'Network error. Please check your connection and try again.';
      if (timeoutErrors.some(err => error.message.includes(err)))
        return 'Request timed out. Please try again.';
      return error.message;
    }

    return 'An error occurred. Please try again.';
  };

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (isSubmittingRef.current)
        return;
    if (loading)
        return;

    isSubmittingRef.current = true;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!token) {
        throw new Error('No reset token provided.');
      }
      await resetPassword(token, values.password);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleFormSubmit = async () => {
    const now = Date.now();
    if (now - lastSubmitTime < 1000)
        return;
    setLastSubmitTime(now);
    if (isSubmittingRef.current)
        return;
    if (loading)
        return;
    setError(null);
    setSuccess(null);
    const validation = form.validate();
    if (validation.hasErrors) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }
    await handleSubmit(form.values);
  };

  return (
    <Paper radius="md" p="lg" withBorder w="40%" mx="auto" {...props}>
      <Stack>
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Reset Failed">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="green" icon={<IconCheck size={16} />} title="Success">
            {success}
          </Alert>
        )}

        <PasswordStrength
          value={form.values.password}
          onChange={(val) => {
            form.setFieldValue('password', val);
            clearMessages();
          }}
          error={form.errors.password}
        />

        <PasswordInput
          required
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={form.values.confirmPassword}
          onChange={(event) => {
            form.setFieldValue('confirmPassword', event.currentTarget.value);
            clearMessages();
          }}
          error={form.errors.confirmPassword}
          radius="md"
        />

        <Button
          type="button"
          radius="xl"
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
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Stack>
    </Paper>
  );
}