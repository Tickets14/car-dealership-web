import type { Car } from '@/lib/types';

function isCarArray(value: unknown): value is Car[] {
  return Array.isArray(value);
}

export function normalizeCarListPayload(payload: unknown): Car[] {
  if (isCarArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const directCandidates = [record.cars, record.items, record.data];

  for (const candidate of directCandidates) {
    if (isCarArray(candidate)) {
      return candidate;
    }

    if (!candidate || typeof candidate !== 'object') {
      continue;
    }

    const nestedRecord = candidate as Record<string, unknown>;

    if (isCarArray(nestedRecord.cars)) {
      return nestedRecord.cars;
    }

    if (isCarArray(nestedRecord.items)) {
      return nestedRecord.items;
    }

    if (isCarArray(nestedRecord.data)) {
      return nestedRecord.data;
    }
  }

  return [];
}
