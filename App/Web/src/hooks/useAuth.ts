"use client";

import { useState, useEffect, useCallback } from 'react';
import { hasSecureToken } from '../utils/secureStorage';

interface User {
  id: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const isAuthenticated = await hasSecureToken();

      if (isAuthenticated) {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false,
            error: null
          });
        } else if (response.status === 401) {
          console.warn('Authentication failed, user may need to login again');
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: `Authentication check failed: ${response.status}`
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Failed to check authentication status'
      });
    }
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
    const interval = setInterval(() => {
      if (authState.isAuthenticated) {
        hasSecureToken().then((isAuth) => {
          if (!isAuth && authState.isAuthenticated) {
            checkAuth();
          }
        });
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuth, authState.isAuthenticated]);

  return {
    ...authState,
    refreshAuth
  };
};