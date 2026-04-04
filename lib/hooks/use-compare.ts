'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { MAX_COMPARE_CARS } from '@/lib/constants';
import type { Car } from '@/lib/types';

const STORAGE_KEY = 'compare_cars';

type CompareEntry = Pick<Car, 'id' | 'make' | 'model' | 'year'> & {
  photo?: string;
};

const EMPTY_COMPARE_LIST: CompareEntry[] = [];
const listeners = new Set<() => void>();

let cachedSerializedSnapshot: string | null | undefined;
let cachedSnapshot: CompareEntry[] = EMPTY_COMPARE_LIST;
let isStorageListenerBound = false;

function parseSnapshot(raw: string | null): CompareEntry[] {
  if (!raw) return EMPTY_COMPARE_LIST;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return EMPTY_COMPARE_LIST;
    }

    return parsed as CompareEntry[];
  } catch {
    return EMPTY_COMPARE_LIST;
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;

  cachedSerializedSnapshot = event.newValue;
  cachedSnapshot = parseSnapshot(event.newValue);
  emitChange();
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window !== 'undefined' && !isStorageListenerBound) {
    window.addEventListener('storage', handleStorage);
    isStorageListenerBound = true;
  }

  return () => {
    listeners.delete(listener);

    if (typeof window !== 'undefined' && listeners.size === 0 && isStorageListenerBound) {
      window.removeEventListener('storage', handleStorage);
      isStorageListenerBound = false;
    }
  };
}

function getSnapshot(): CompareEntry[] {
  if (typeof window === 'undefined') return EMPTY_COMPARE_LIST;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedSerializedSnapshot) {
      return cachedSnapshot;
    }

    cachedSerializedSnapshot = raw;
    cachedSnapshot = parseSnapshot(raw);
    return cachedSnapshot;
  } catch {
    cachedSerializedSnapshot = null;
    cachedSnapshot = EMPTY_COMPARE_LIST;
    return EMPTY_COMPARE_LIST;
  }
}

function getServerSnapshot(): CompareEntry[] {
  return EMPTY_COMPARE_LIST;
}

function setStored(entries: CompareEntry[]) {
  const nextEntries = entries.length === 0 ? EMPTY_COMPARE_LIST : [...entries];

  cachedSnapshot = nextEntries;

  try {
    if (nextEntries.length === 0) {
      cachedSerializedSnapshot = null;
      localStorage.removeItem(STORAGE_KEY);
    } else {
      cachedSerializedSnapshot = JSON.stringify(nextEntries);
      localStorage.setItem(STORAGE_KEY, cachedSerializedSnapshot);
    }
  } catch {
    cachedSerializedSnapshot = nextEntries.length === 0 ? null : JSON.stringify(nextEntries);
  }

  emitChange();
}

export function useCompare() {
  const compareList = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addToCompare = useCallback((car: CompareEntry) => {
    const current = getSnapshot();
    if (current.length >= MAX_COMPARE_CARS) return;
    if (current.some((c) => c.id === car.id)) return;
    setStored([...current, car]);
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    const current = getSnapshot();
    setStored(current.filter((c) => c.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setStored([]);
  }, []);

  const isInCompare = useCallback(
    (id: string) => compareList.some((c) => c.id === id),
    [compareList]
  );

  return {
    compareList,
    compareIds: compareList.map((c) => c.id),
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    isFull: compareList.length >= MAX_COMPARE_CARS,
  };
}
