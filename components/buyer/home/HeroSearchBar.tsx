'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POPULAR_MAKES = [
  'Toyota',
  'Honda',
  'Mitsubishi',
  'Nissan',
  'Ford',
  'Hyundai',
  'Suzuki',
  'Mazda',
  'Kia',
  'Chevrolet',
] as const;

export function HeroSearchBar() {
  const router = useRouter();
  const [make, setMake] = useState('');

  function handleSearch() {
    if (make) {
      router.push(`/cars?make=${encodeURIComponent(make)}`);
    } else {
      router.push('/cars');
    }
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <select
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="h-12 w-full appearance-none rounded-lg border-0 bg-white px-4 pr-10 text-sm text-foreground shadow-lg ring-1 ring-black/5 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          aria-label="Select car make"
        >
          <option value="">All Makes</option>
          {POPULAR_MAKES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <Button
        onClick={handleSearch}
        className="h-12 bg-amber-500 px-6 text-sm font-semibold text-primary-900 shadow-lg hover:bg-amber-400 border-amber-500"
      >
        Search Cars
      </Button>
    </div>
  );
}
