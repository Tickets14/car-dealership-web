'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { MAX_COMPARE_CARS } from '@/lib/constants';
import type { Car } from '@/lib/types';

const STORAGE_KEY = 'compare_cars';

type CompareEntry = Pick<Car, 'id' | 'make' | 'model' | 'year'> & {
  photo?: string;
};

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): CompareEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompareEntry[]) : [];
  } catch {
    return [];
  }
}

function getServerSnapshot(): CompareEntry[] {
  return [];
}

function setStored(entries: CompareEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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
