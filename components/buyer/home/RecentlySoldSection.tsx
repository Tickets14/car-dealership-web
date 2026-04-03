'use client';

import { useRecentlySoldCars } from '@/lib/hooks/use-cars';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings2 } from 'lucide-react';
import type { Car, CarPhoto } from '@/lib/types';

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

function SoldCard({ car }: { car: Car & { photos?: CarPhoto[] } }) {
  const photo = car.photos?.[0];
  const title = `${car.year} ${car.make} ${car.model}`;
  const days = daysSince(car.sold_date);

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photo ? (
          <OptimizedImage
            src={photo.url}
            alt={title}
            fill
            className="object-cover grayscale"
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground grayscale">
            <Settings2 className="size-10 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white tracking-wider">
            SOLD
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-primary-600 mt-0.5">
          {formatPrice(car.price_cash)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Sold {days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`}
        </p>
      </div>
    </div>
  );
}

export function RecentlySoldSection() {
  const { data: cars, isLoading } = useRecentlySoldCars();

  if (!isLoading && (!cars || cars.length === 0)) return null;

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Recently Sold
          </h2>
          <p className="mt-1 text-muted-foreground">
            Cars move fast — don&apos;t miss your next one
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl ring-1 ring-border">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))
            : cars?.slice(0, 4).map((car) => (
                <SoldCard key={car.id} car={car} />
              ))}
        </div>
      </div>
    </section>
  );
}
