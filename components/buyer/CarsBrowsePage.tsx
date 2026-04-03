'use client';

import { useMemo } from 'react';
import { useQueryStates } from 'nuqs';
import { Search } from 'lucide-react';
import { useCars } from '@/lib/hooks/use-cars';
import { useCompare } from '@/lib/hooks/use-compare';
import { CarCard } from '@/components/buyer/CarCard';
import {
  FilterSidebar,
  FilterSheet,
  filterParsers,
} from '@/components/buyer/FilterBar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SORT_OPTIONS } from '@/lib/constants';

function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default function CarsPage() {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
  });

  // Build API params from URL filters
  const apiFilters = useMemo(
    () => ({
      page: filters.page,
      search: filters.search || undefined,
      make: filters.make.length > 0 ? filters.make.join(',') : undefined,
      model: filters.model || undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      minYear: filters.minYear ?? undefined,
      maxYear: filters.maxYear ?? undefined,
      bodyType:
        filters.bodyType.length > 0
          ? filters.bodyType.join(',')
          : undefined,
      transmission:
        filters.transmission.length > 0
          ? filters.transmission.join(',')
          : undefined,
      fuelType:
        filters.fuelType.length > 0
          ? filters.fuelType.join(',')
          : undefined,
      minMileage: filters.minMileage ?? undefined,
      maxMileage: filters.maxMileage ?? undefined,
      condition:
        filters.condition.length > 0
          ? filters.condition.join(',')
          : undefined,
      sort: filters.sort,
    }),
    [filters]
  );

  const { data, isLoading } = useCars(apiFilters);
  const { isInCompare, addToCompare, removeFromCompare, isFull } = useCompare();

  // Count active filters (excluding sort & page)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.make.length > 0) count++;
    if (filters.model) count++;
    if (filters.minPrice !== null) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.minYear !== null) count++;
    if (filters.maxYear !== null) count++;
    if (filters.bodyType.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.minMileage !== null) count++;
    if (filters.maxMileage !== null) count++;
    if (filters.condition.length > 0) count++;
    return count;
  }, [filters]);

  const filterProps = {
    filters,
    setFilters,
    activeCount: activeFilterCount,
  };

  const cars = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <FilterSidebar {...filterProps} />

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <div className="sticky top-16 z-20 flex flex-col gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <FilterSheet {...filterProps} />
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="inline-block h-4 w-20" />
              ) : (
                <>
                  <span className="font-medium text-foreground">{total}</span>{' '}
                  {total === 1 ? 'car' : 'cars'} found
                </>
              )}
            </p>
          </div>

          <Select
            value={filters.sort}
            onValueChange={(val) => setFilters({ sort: val, page: 1 })}
          >
            <SelectTrigger size="sm" className="w-full gap-1.5 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Car grid */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>
          ) : cars.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="size-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">No cars found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or search terms to find what
                you&apos;re looking for.
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    setFilters({
                      search: null,
                      make: null,
                      model: null,
                      minPrice: null,
                      maxPrice: null,
                      minYear: null,
                      maxYear: null,
                      bodyType: null,
                      transmission: null,
                      fuelType: null,
                      minMileage: null,
                      maxMileage: null,
                      condition: null,
                      page: 1,
                    })
                  }
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {cars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isCompared={isInCompare(car.id)}
                    compareFull={isFull}
                    onCompareToggle={(c) =>
                      isInCompare(c.id)
                        ? removeFromCompare(c.id)
                        : addToCompare({
                            id: c.id,
                            make: c.make,
                            model: c.model,
                            year: c.year,
                            photo: c.photos?.[0]?.url,
                          })
                    }
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() =>
                      setFilters({ page: filters.page - 1 })
                    }
                  >
                    Previous
                  </Button>
                  <span className="px-3 text-sm text-muted-foreground tabular-nums">
                    Page {filters.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() =>
                      setFilters({ page: filters.page + 1 })
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
