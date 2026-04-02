'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Fuel, Gauge, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Car, CarPhoto } from '@/lib/types';

interface CarCardProps {
  car: Car & { photos?: CarPhoto[] };
  isCompared?: boolean;
  compareFull?: boolean;
  onCompareToggle?: (car: Car & { photos?: CarPhoto[] }) => void;
}

const conditionColors: Record<string, string> = {
  excellent: 'bg-emerald-100 text-emerald-800',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-amber-100 text-amber-800',
  project: 'bg-red-100 text-red-800',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(mileage: number, unit: string) {
  return `${new Intl.NumberFormat('en').format(mileage)} ${unit}`;
}

export function CarCard({
  car,
  isCompared = false,
  compareFull = false,
  onCompareToggle,
}: CarCardProps) {
  const photo = car.photos?.[0];
  const title = `${car.year} ${car.make} ${car.model}`;

  return (
    <div className="group relative">
      <Link
        href={`/cars/${car.id}`}
        className={cn(
          'block overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border transition-all duration-200',
          'hover:-translate-y-1 hover:shadow-lg'
        )}
      >
        {/* Photo */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt_text || title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Settings2 className="size-10 opacity-30" />
            </div>
          )}

          {/* Featured star */}
          {car.is_featured && (
            <div className="absolute top-2 left-2 rounded-full bg-amber-500 p-1.5 shadow-md">
              <Star className="size-3.5 fill-white text-white" />
            </div>
          )}

          {/* Status badge */}
          {car.status === 'reserved' && (
            <Badge className="absolute top-2 right-2 bg-amber-600 text-white border-0">
              Reserved
            </Badge>
          )}
          {car.status === 'sold' && (
            <Badge className="absolute top-2 right-2 bg-red-600 text-white border-0">
              Sold
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <div>
            <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
              {title}
            </h3>
            {car.variant && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {car.variant}
              </p>
            )}
          </div>

          <p className="text-lg font-bold text-primary-600">
            {formatPrice(car.price_cash)}
          </p>

          {/* Spec chips */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Gauge className="size-3" />
              {formatMileage(car.mileage, car.mileage_unit)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Settings2 className="size-3" />
              {car.transmission}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Fuel className="size-3" />
              {car.fuel_type}
            </span>
          </div>

          {/* Condition */}
          <Badge
            className={cn(
              'text-[11px] border-0',
              conditionColors[car.condition_rating] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {car.condition_rating}
          </Badge>
        </div>
      </Link>

      {/* Compare checkbox */}
      {onCompareToggle && (
        <label
          className={cn(
            'absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm cursor-pointer transition-opacity',
            'md:opacity-0 md:group-hover:opacity-100',
            isCompared && 'md:opacity-100'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isCompared}
            disabled={compareFull && !isCompared}
            onCheckedChange={() => onCompareToggle(car)}
          />
          Compare
        </label>
      )}
    </div>
  );
}
