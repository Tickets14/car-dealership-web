'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/lib/hooks/use-compare';
import { cn } from '@/lib/utils';

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length < 2) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 shadow-2xl backdrop-blur-md',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 overflow-x-auto">
          {compareList.map((car) => (
            <div
              key={car.id}
              className="relative flex shrink-0 items-center gap-2 rounded-lg bg-muted px-3 py-1.5"
            >
              {car.photo ? (
                <Image
                  src={car.photo}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  width={40}
                  height={30}
                  className="rounded object-cover"
                />
              ) : (
                <div className="h-[30px] w-[40px] rounded bg-muted-foreground/10" />
              )}
              <span className="text-sm font-medium whitespace-nowrap">
                {car.year} {car.make} {car.model}
              </span>
              <button
                type="button"
                onClick={() => removeFromCompare(car.id)}
                className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                aria-label={`Remove ${car.make} ${car.model}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Clear All
          </Button>
          <Button
            size="sm"
            className="bg-amber-500 text-primary-900 font-semibold hover:bg-amber-400 border-amber-500"
            render={<Link href="/compare" />}
          >
            Compare Now
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}
