'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Testimonial } from '@/lib/types';
import { normalizeTestimonialsPayload } from '@/lib/testimonials';

export function useTestimonials() {
  return useQuery<unknown, Error, Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: () => apiClient.get('/testimonials'),
    select: normalizeTestimonialsPayload,
  });
}
