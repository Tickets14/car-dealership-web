'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem('auth_token', token);
      setIsAuthenticated(true);
      router.push('/admin/dashboard');
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    router.push('/admin/login');
  }, [router]);

  return { isAuthenticated, isLoading, login, logout };
}
