'use client';

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useCreateSubmission() {
  return useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post('/seller-submissions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  });
}
