'use client';

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface CreateInquiryData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  carId?: string;
}

export function useCreateInquiry() {
  return useMutation({
    mutationFn: (data: CreateInquiryData) =>
      apiClient.post('/inquiries', data),
  });
}
