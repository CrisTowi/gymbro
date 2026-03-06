'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  setAuthToken,
  getAuthToken,
  fetchMe,
  login as apiLogin,
  register as apiRegister,
  validateInvitation,
  type User,
} from '@/lib/api';

const STORAGE_KEY = 'gymbro_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (params: {
    invitationToken: string;
    name: string;
    email: string;
    password: string;
    height?: number | null;
    weight?: number | null;
    goal?: string | null;
    language?: string;
  }) => Promise<void>;
  validateInvitation: (
    token: string
  ) => Promise<{ valid: boolean; email: string | null; lang: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  const loadStoredAuth = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setState((s) => ({ ...s, token: null, user: null, isLoading: false }));
      return;
    }
    setAuthToken(stored);
    try {
      const user = await fetchMe();
      setState({ token: stored, user, isLoading: false });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
      setState({ token: null, user: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await apiLogin(email, password);
    localStorage.setItem(STORAGE_KEY, token);
    setAuthToken(token);
    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const register = useCallback(
    async (params: {
      invitationToken: string;
      name: string;
      email: string;
      password: string;
      height?: number | null;
      weight?: number | null;
      goal?: string | null;
      language?: string;
    }) => {
      const { user, token } = await apiRegister(params);
      localStorage.setItem(STORAGE_KEY, token);
      setAuthToken(token);
      setState({ user, token, isLoading: false });
    },
    []
  );

  const validateInvitationToken = useCallback(async (token: string) => {
    return validateInvitation(token);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!currentToken) return;
    setAuthToken(currentToken);
    try {
      const user = await fetchMe();
      setState((s) => (s.token ? { ...s, user } : s));
    } catch {
      // Token may be invalid; leave state unchanged, next navigation may trigger logout
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
    validateInvitation: validateInvitationToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
