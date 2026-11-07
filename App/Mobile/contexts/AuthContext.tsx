import * as authService from '@/services/auth';
import * as storage from '@/services/storage';
import * as userService from '@/services/user';
import { clearApiCookies } from '@/services/cookieManager';
import { User } from '@/types/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithOAuth: (user: User) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  deleteAccount: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      setIsLoading(true);
      const current = await authService.getCurrentUser();
      if (current) {
        setUser(current);
      } else {
        setUser(null);
        await storage.clearAuthData();
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const isEmail = identifier.includes('@');
      const credentials = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await authService.login(credentials);

      if (response.user) {
        setUser(response.user);
        await storage.saveUserData(JSON.stringify(response.user));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with OAuth - set user directly from OAuth response
   */
  const loginWithOAuth = async (userData: User) => {
    try {
      setIsLoading(true);
      setError(null);
      setUser(userData);
      await storage.saveUserData(JSON.stringify(userData));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth login failed';
      setError(message);
      console.error('OAuth login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, username: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register({
        email,
        username,
        password,
        firstName,
        lastName,
        avatarUrl: undefined
      });
      if (response.user) {
        setUser(response.user);
        await storage.saveUserData(JSON.stringify(response.user));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
      await storage.clearAuthData();
      await clearApiCookies();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user to update');
      }

      const updatedUser = await userService.updateProfileWithAvatar({
        ...user,
        ...userData,
      });

      setUser(updatedUser);
      await storage.saveUserData(JSON.stringify(updatedUser));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!user)
        throw new Error('No user to delete');

      await userService.deleteAccount();
      setUser(null);
      await storage.clearAuthData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete account failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh authentication state from backend (for OAuth WebView)
   */
  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      const current = await authService.getCurrentUser();
      if (current) {
        setUser(current);
        await storage.saveUserData(JSON.stringify(current));
      }
    } catch (err) {
      console.error('Failed to refresh auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginWithOAuth,
    register,
    logout,
    updateUser,
    clearError,
    deleteAccount,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
