/**
 * Types for authentication (cookie-based, no public tokens)
 */

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  message: string;
  user: User | null;
}

export type LoginCredentials =
  | { email: string; username?: never; password: string }
  | { username: string; email?: never; password: string }
  | { email: string; username: string; password: string };

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

export interface AuthError {
  code?: string;
  message: string;
  field?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}
