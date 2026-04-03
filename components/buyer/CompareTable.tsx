'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  Settings2,
  Trophy,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { useContactInfo } from '@/lib/hooks/use-settings';
import { getCarWhatsAppLink } from '@/lib/dealership-links';
import type { CarWithPhotos, ConditionRating } from '@/lib/types';

interface CompareTableProps {
  cars: CarWithPhotos[];
  onRemove: (id: string) => void;
}

interface CompareMetric {
  label: string;
  render: (car: CarWithPhotos) => ReactNode;
  winnerIndices?: number[];
}

const conditionRank: Record<ConditionRating, number> = {
  excellent: 4,
  good: 3,
  fair: 2,
  project: 1,
};

const conditionColors: Record<ConditionRating, string> = {
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

function getWinnerIndices(
  values: number[],
  mode: 'lowest' | 'highest'
): number[] {
  if (values.length === 0) return [];

  const best = mode === 'lowest' ? Math.min(...values) : Math.max(...values);
  const winners = values.reduce<number[]>((result, value, index) => {
    if (value === best) result.push(index);
    return result;
  }, []);

  return winners.length === values.length ? [] : winners;
}

function CompareMetricCard({
  label,
  value,
  isWinner,
}: {
  label: string;
  value: ReactNode;
  isWinner: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-3',
        isWinner && 'border-emerald-200 bg-emerald-50/60'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        {isWinner && <Trophy className="size-3.5 shrink-0 text-emerald-600" />}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export function CompareTable({ cars, onRemove }: CompareTableProps) {
  const { whatsappNumber } = useContactInfo();
  const priceWinners = getWinnerIndices(
    cars.map((car) => car.price_cash),
    'lowest'
  );
  const mileageWinners = getWinnerIndices(
    cars.map((car) => car.mileage),
    'lowest'
  );
  const yearWinners = getWinnerIndices(
    cars.map((car) => car.year),
    'highest'
  );
  const conditionWinners = getWinnerIndices(
    cars.map((car) => conditionRank[car.condition_rating] ?? 0),
    'highest'
  );

  const metrics: CompareMetric[] = [
    {
      label: 'Price',
      render: (car) => formatPrice(car.price_cash),
      winnerIndices: priceWinners,
    },
    {
      label: 'Year',
      render: (car) => String(car.year),
      winnerIndices: yearWinners,
    },
    {
      label: 'Mileage',
      render: (car) => formatMileage(car.mileage, car.mileage_unit),
      winnerIndices: mileageWinners,
    },
    {
      label: 'Condition',
      render: (car) => (
        <Badge
          className={cn(
            'border-0 text-[11px]',
            conditionColors[car.condition_rating]
          )}
        >
          {car.condition_rating}
        </Badge>
      ),
      winnerIndices: conditionWinners,
    },
    {
      label: 'Transmission',
      render: (car) => <span className="capitalize">{car.transmission}</span>,
    },
    {
      label: 'Fuel Type',
      render: (car) => <span className="capitalize">{car.fuel_type}</span>,
    },
    {
      label: 'Body Type',
      render: (car) => <span className="capitalize">{car.body_type || 'N/A'}</span>,
    },
    {
      label: 'Color',
      render: (car) => car.color || 'N/A',
    },
    {
      label: 'Engine',
      render: (car) => car.engine_displacement || 'N/A',
    },
    {
      label: 'Drivetrain',
      render: (car) => car.drivetrain || 'N/A',
    },
    {
      label: 'Seats',
      render: (car) => (car.seats ? String(car.seats) : 'N/A'),
    },
    {
      label: 'Plate Ending',
      render: (car) => car.plate_ending || 'N/A',
    },
  ];

  return (
    <div
      className="overflow-x-auto focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      tabIndex={0}
      aria-label="Comparison table"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }

        event.preventDefault();
        event.currentTarget.scrollBy({
          left: event.key === 'ArrowRight' ? 320 : -320,
          behavior: 'smooth',
        });
      }}
    >
      <div className="flex min-w-full gap-4 snap-x snap-mandatory px-4 py-4 sm:px-6">
        {cars.map((car, index) => {
          const photo = car.photos?.[0];
          const title = `${car.year} ${car.make} ${car.model}`;
          const fullTitle = car.variant ? `${title} ${car.variant}` : title;
          const whatsappUrl = getCarWhatsAppLink({
            phoneNumber: whatsappNumber,
            carId: car.id,
            carName: fullTitle,
            stockNumber: car.stock_number,
            priceCash: car.price_cash,
          });

          return (
            <article
              key={car.id}
              className="flex min-w-[280px] basis-[280px] snap-start flex-col rounded-2xl border bg-card shadow-sm"
            >
              <div className="space-y-4 p-4">
                <div className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    {photo ? (
                      <OptimizedImage
                        src={photo.url}
                        alt={photo.alt_text || title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80vw, 280px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Settings2 className="size-8 opacity-30" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(car.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/65 p-1 text-white transition-colors hover:bg-black/80"
                    aria-label={`Remove ${title} from comparison`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-semibold leading-tight">
                    {title}
                  </h3>
                  {car.variant && (
                    <p className="text-sm text-muted-foreground">
                      {car.variant}
                    </p>
                  )}
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Stock #{car.stock_number}
                  </p>
                </div>

                <div className="space-y-2">
                  {metrics.map((metric) => (
                    <CompareMetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.render(car)}
                      isWinner={metric.winnerIndices?.includes(index) ?? false}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-2 border-t bg-muted/20 p-4">
                <Button
                  className="w-full border-primary-600 bg-primary-600 text-white hover:bg-primary-700"
                  render={<Link href={`/cars/${car.id}`} />}
                >
                  View Details
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
                {whatsappUrl && (
                  <Button
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    render={
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Inquire about ${fullTitle} on WhatsApp`}
                      />
                    }
                  >
                    <MessageCircle className="size-4" />
                    Inquire on WhatsApp
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
