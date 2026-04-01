'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useSettings(keys: string[]) {
  return useQuery<Record<string, string>>({
    queryKey: ['settings', keys],
    queryFn: () =>
      apiClient.get('/settings', { params: { keys: keys.join(',') } }),
    enabled: keys.length > 0,
  });
}
