import 'server-only';

import type { Car, CarWithPhotos, PaginatedResponse } from '@/lib/types';
import { getApiUrl } from '@/lib/seo';

const CAR_REVALIDATE_SECONDS = 300;

function buildApiUrl(path: string) {
  const baseUrl = `${getApiUrl().replace(/\/+$/, '')}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  return new URL(normalizedPath, baseUrl).toString();
}

async function fetchApiJson<T>(path: string) {
  const response = await fetch(buildApiUrl(path), {
    next: { revalidate: CAR_REVALIDATE_SECONDS },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

function parseCar(payload: unknown) {
  if (!payload) {
    return null;
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data)
  ) {
    return payload.data as CarWithPhotos;
  }

  return payload as CarWithPhotos;
}

function parsePaginatedCars(payload: unknown) {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data) &&
    'data' in payload.data
  ) {
    return payload.data as PaginatedResponse<Car>;
  }

  return payload as PaginatedResponse<Car>;
}

export async function fetchPublicCar(id: string) {
  const payload = await fetchApiJson<CarWithPhotos | { data: CarWithPhotos }>(
    `/cars/${id}`
  );

  return parseCar(payload);
}

async function fetchCarsPage(page: number, limit: number) {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const payload = await fetchApiJson<
    PaginatedResponse<Car> | { data: PaginatedResponse<Car> }
  >(`/cars?${search.toString()}`);

  if (!payload) {
    return null;
  }

  return parsePaginatedCars(payload);
}

export async function fetchAvailableCarsForSitemap() {
  const pageSize = 100;
  const firstPage = await fetchCarsPage(1, pageSize);

  if (!firstPage) {
    return [];
  }

  const cars = [...firstPage.data];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await fetchCarsPage(page, pageSize);

    if (!nextPage) {
      break;
    }

    cars.push(...nextPage.data);
  }

  return cars.filter((car) => car.status === 'available');
}
