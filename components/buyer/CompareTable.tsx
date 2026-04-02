'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trophy, X, MessageCircle, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import type { CarWithPhotos, ConditionRating } from '@/lib/types';

interface CompareTableProps {
  cars: CarWithPhotos[];
  onRemove: (id: string) => void;
}

const conditionRank: Record<ConditionRating, number> = {
  excellent: 4,
  good: 3,
  fair: 2,
  project: 1,
};

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

function getWinnerIndices(
  values: number[],
  mode: 'lowest' | 'highest'
): number[] {
  if (values.length === 0) return [];
  const best = mode === 'lowest' ? Math.min(...values) : Math.max(...values);
  const winners: number[] = [];
  values.forEach((v, i) => {
    if (v === best) winners.push(i);
  });
  // Only highlight if there's a clear winner (not all same)
  if (winners.length === values.length) return [];
  return winners;
}

interface RowProps {
  label: string;
  values: React.ReactNode[];
  winnerIndices?: number[];
}

function CompareRow({ label, values, winnerIndices = [] }: RowProps) {
  return (
    <div className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/30 flex items-center">
        {label}
      </div>
      {values.map((value, i) => (
        <div
          key={i}
          className={cn(
            'p-3 text-sm font-medium flex items-center gap-1.5',
            winnerIndices.includes(i) && 'text-emerald-700 bg-emerald-50/50'
          )}
        >
          {winnerIndices.includes(i) && (
            <Trophy className="size-3.5 text-emerald-600 shrink-0" />
          )}
          {value}
        </div>
      ))}
    </div>
  );
}

export function CompareTable({ cars, onRemove }: CompareTableProps) {
  const priceWinners = getWinnerIndices(
    cars.map((c) => c.price_cash),
    'lowest'
  );
  const mileageWinners = getWinnerIndices(
    cars.map((c) => c.mileage),
    'lowest'
  );
  const yearWinners = getWinnerIndices(
    cars.map((c) => c.year),
    'highest'
  );
  const conditionWinners = getWinnerIndices(
    cars.map((c) => conditionRank[c.condition_rating] ?? 0),
    'highest'
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header: photos + titles + remove buttons */}
        <div
          className="grid border-b"
          style={{ gridTemplateColumns: `160px repeat(${cars.length}, 1fr)` }}
        >
          <div className="p-3" />
          {cars.map((car) => {
            const photo = car.photos?.[0];
            const title = `${car.year} ${car.make} ${car.model}`;
            return (
              <div key={car.id} className="p-3 space-y-3">
                <div className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    {photo ? (
                      <Image
                        src={photo.url}
                        alt={photo.alt_text || title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Settings2 className="size-8 opacity-30" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(car.id)}
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90 transition-colors"
                    aria-label={`Remove ${title} from comparison`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">
                    {title}
                  </h3>
                  {car.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {car.variant}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison rows */}
        <CompareRow
          label="Price"
          values={cars.map((c) => formatPrice(c.price_cash))}
          winnerIndices={priceWinners}
        />
        <CompareRow
          label="Year"
          values={cars.map((c) => String(c.year))}
          winnerIndices={yearWinners}
        />
        <CompareRow
          label="Mileage"
          values={cars.map((c) => formatMileage(c.mileage, c.mileage_unit))}
          winnerIndices={mileageWinners}
        />
        <CompareRow
          label="Condition"
          values={cars.map((c) => (
            <Badge
              key={c.id}
              className={cn(
                'text-[11px] border-0',
                conditionColors[c.condition_rating]
              )}
            >
              {c.condition_rating}
            </Badge>
          ))}
          winnerIndices={conditionWinners}
        />
        <CompareRow
          label="Transmission"
          values={cars.map((c) => (
            <span key={c.id} className="capitalize">{c.transmission}</span>
          ))}
        />
        <CompareRow
          label="Fuel Type"
          values={cars.map((c) => (
            <span key={c.id} className="capitalize">{c.fuel_type}</span>
          ))}
        />
        <CompareRow
          label="Body Type"
          values={cars.map((c) => (
            <span key={c.id} className="capitalize">{c.body_type || '—'}</span>
          ))}
        />
        <CompareRow
          label="Color"
          values={cars.map((c) => c.color || '—')}
        />
        <CompareRow
          label="Engine"
          values={cars.map((c) => c.engine_displacement || '—')}
        />
        <CompareRow
          label="Drivetrain"
          values={cars.map((c) => c.drivetrain || '—')}
        />
        <CompareRow
          label="Seats"
          values={cars.map((c) => (c.seats ? String(c.seats) : '—'))}
        />
        <CompareRow
          label="Plate Ending"
          values={cars.map((c) => c.plate_ending || '—')}
        />

        {/* CTAs */}
        <div
          className="grid border-t"
          style={{ gridTemplateColumns: `160px repeat(${cars.length}, 1fr)` }}
        >
          <div className="p-3" />
          {cars.map((car) => {
            const title = `${car.year} ${car.make} ${car.model}`;
            const whatsappUrl = WHATSAPP_NUMBER
              ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in the ${title} (Stock #${car.stock_number}). Is it still available?`)}`
              : null;
            return (
              <div key={car.id} className="p-3 space-y-2">
                <Button
                  className="w-full bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
                  render={<Link href={`/cars/${car.id}`} />}
                >
                  View Details
                </Button>
                {whatsappUrl && (
                  <Button
                    variant="outline"
                    className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    render={
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <MessageCircle className="size-4" />
                    Inquire
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
