'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Car, CarWithPhotos, PaginatedResponse } from '@/lib/types';

export interface CarFilters {
  page?: number;
  limit?: number;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  sort?: string;
  search?: string;
}

export function useCars(filters: CarFilters = {}) {
  return useQuery<PaginatedResponse<Car>>({
    queryKey: ['cars', filters],
    queryFn: () => apiClient.get('/cars', { params: filters }),
  });
}

export function useCar(id: string | undefined) {
  return useQuery<CarWithPhotos & { similar?: Car[] }>({
    queryKey: ['cars', id],
    queryFn: () => apiClient.get(`/cars/${id}`),
    enabled: !!id,
  });
}

export function useFeaturedCars() {
  return useQuery<Car[]>({
    queryKey: ['cars', 'featured'],
    queryFn: () => apiClient.get('/cars/featured'),
  });
}

export function useRecentlySoldCars() {
  return useQuery<Car[]>({
    queryKey: ['cars', 'recently-sold'],
    queryFn: () => apiClient.get('/cars/recently-sold'),
  });
}
