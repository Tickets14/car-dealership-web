'use client';

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface PreQualifyData {
  name: string;
  email: string;
  phone: string;
  income: number;
  creditScore: string;
  downPayment: number;
}

export function useCreatePreQualification() {
  return useMutation({
    mutationFn: (data: PreQualifyData) =>
      apiClient.post('/pre-qualify', data),
  });
}
