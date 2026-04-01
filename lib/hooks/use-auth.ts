'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Session {
  user: { id: string; email: string; name: string };
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data: LoginData) =>
      apiClient.post<unknown, LoginResponse>('/admin/auth/login', data),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.invalidateQueries({ queryKey: ['session'] });
      router.push('/admin/dashboard');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => apiClient.post('/admin/auth/logout'),
    onSettled: () => {
      localStorage.removeItem('auth_token');
      queryClient.clear();
      router.push('/admin/login');
    },
  });
}

export function useSession() {
  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: () => apiClient.get('/admin/auth/session'),
    retry: false,
  });
}
