'use client';

import {
  Gauge,
  Settings2,
  Fuel,
  Calendar,
  Palette,
  Car,
  Disc3,
  Users,
  Hash,
  Cog,
} from 'lucide-react';
import type { CarWithPhotos } from '@/lib/types';

interface SpecsGridProps {
  car: CarWithPhotos;
}

function formatMileage(mileage: number, unit: string) {
  return `${new Intl.NumberFormat('en').format(mileage)} ${unit}`;
}

export function SpecsGrid({ car }: SpecsGridProps) {
  const specs = [
    { icon: Calendar, label: 'Year', value: car.year },
    {
      icon: Gauge,
      label: 'Mileage',
      value: formatMileage(car.mileage, car.mileage_unit),
    },
    { icon: Settings2, label: 'Transmission', value: car.transmission },
    { icon: Fuel, label: 'Fuel Type', value: car.fuel_type },
    car.body_type && { icon: Car, label: 'Body Type', value: car.body_type },
    car.color && { icon: Palette, label: 'Color', value: car.color },
    car.engine_displacement && {
      icon: Cog,
      label: 'Engine',
      value: car.engine_displacement,
    },
    car.drivetrain && {
      icon: Disc3,
      label: 'Drivetrain',
      value: car.drivetrain,
    },
    car.seats && { icon: Users, label: 'Seats', value: car.seats },
    car.plate_ending && {
      icon: Hash,
      label: 'Plate Ending',
      value: car.plate_ending,
    },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }[];

  return (
    <div className="grid grid-cols-2 gap-3">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex items-start gap-3 rounded-lg border bg-card p-3"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <spec.icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{spec.label}</p>
            <p className="text-sm font-medium capitalize truncate">
              {String(spec.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
