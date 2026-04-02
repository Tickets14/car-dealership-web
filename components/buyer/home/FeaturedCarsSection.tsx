'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFeaturedCars } from '@/lib/hooks/use-cars';
import { useCompare } from '@/lib/hooks/use-compare';
import { CarCard } from '@/components/buyer/CarCard';
import { Skeleton } from '@/components/ui/skeleton';

function CarCardSkeleton() {
  return (
    <div className="w-[280px] shrink-0 sm:w-[300px]">
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
    </div>
  );
}

export function FeaturedCarsSection() {
  const { data: cars, isLoading } = useFeaturedCars();
  const { isInCompare, addToCompare, removeFromCompare, isFull } = useCompare();

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured Cars
            </h2>
            <p className="mt-1 text-muted-foreground">
              Hand-picked vehicles at great prices
            </p>
          </div>
          <Link
            href="/cars"
            className="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:underline sm:flex"
          >
            View All Cars
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-none">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CarCardSkeleton key={i} />
              ))
            : cars?.map((car) => (
                <div key={car.id} className="w-[280px] shrink-0 sm:w-[300px]">
                  <CarCard
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
                </div>
              ))}
        </div>

        <Link
          href="/cars"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary-600 hover:underline sm:hidden"
        >
          View All Cars
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
