'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import { GitCompareArrows, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api-client';
import { useCompare } from '@/lib/hooks/use-compare';
import { CompareTable } from '@/components/buyer/CompareTable';
import type { CarWithPhotos, Car } from '@/lib/types';

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  const carQueries = useQueries({
    queries: compareList.map((entry) => ({
      queryKey: ['cars', entry.id],
      queryFn: () =>
        apiClient.get(`/cars/${entry.id}`) as Promise<CarWithPhotos & { similar?: Car[] }>,
    })),
  });

  const isLoading = carQueries.some((q) => q.isLoading);
  const cars = carQueries
    .filter((q) => q.isSuccess && q.data)
    .map((q) => q.data as CarWithPhotos);

  // Empty state: less than 2 cars
  if (compareList.length < 2) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
            <GitCompareArrows className="size-7 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Compare Cars</h1>
          <p className="text-muted-foreground">
            {compareList.length === 0
              ? 'You haven\u2019t added any cars to compare yet. Browse our inventory and add at least 2 cars to start comparing.'
              : 'Add at least one more car to start comparing. Browse our inventory to find another car.'}
          </p>
          <Button
            className="bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
            render={<Link href="/cars" />}
          >
            <Search className="size-4" />
            Browse Cars
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="overflow-x-auto">
          <div className="flex gap-4 snap-x snap-mandatory pb-2">
            {compareList.map((entry) => (
              <div
                key={entry.id}
                className="min-w-[280px] basis-[280px] snap-start space-y-3"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Compare Cars
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparing {cars.length} vehicles side by side
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/cars" />}
          >
            <Search className="size-4" />
            Add More
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <CompareTable cars={cars} onRemove={removeFromCompare} />
      </div>
    </div>
  );
}
