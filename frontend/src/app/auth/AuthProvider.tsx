import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../apiClient';
import type { ApiResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初期化: localStorageのトークンからユーザー復元
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    (async () => {
      try {
        const res = await apiClient.get<ApiResponse<User>>('/auth/me');
        setUser(res.data.data);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
    const token = res.data.data.token;
    const me = res.data.data.user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(me));
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(me);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.Authorization;
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value = useMemo<AuthContextValue>(() => ({ user, isLoading, login, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
