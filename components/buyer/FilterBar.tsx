'use client';

import { useRef, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useQueryStates, parseAsString, parseAsInteger, parseAsArrayOf } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  BODY_TYPES,
  TRANSMISSIONS,
  FUEL_TYPES,
  CONDITIONS,
} from '@/lib/constants';

// ─── Parser definitions ─────────────────────────────────────────────────────

const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Mitsubishi', 'Nissan', 'Ford',
  'Hyundai', 'Suzuki', 'Mazda', 'Kia', 'Chevrolet',
  'Subaru', 'Isuzu', 'BMW', 'Mercedes-Benz', 'Volkswagen',
] as const;

export const filterParsers = {
  search: parseAsString.withDefault(''),
  make: parseAsArrayOf(parseAsString).withDefault([]),
  model: parseAsString.withDefault(''),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  minYear: parseAsInteger,
  maxYear: parseAsInteger,
  bodyType: parseAsArrayOf(parseAsString).withDefault([]),
  transmission: parseAsArrayOf(parseAsString).withDefault([]),
  fuelType: parseAsArrayOf(parseAsString).withDefault([]),
  minMileage: parseAsInteger,
  maxMileage: parseAsInteger,
  condition: parseAsArrayOf(parseAsString).withDefault([]),
  sort: parseAsString.withDefault('createdAt:desc'),
  page: parseAsInteger.withDefault(1),
};

// ─── Debounced slider hook ──────────────────────────────────────────────────

function useDebouncedSlider(
  canonical: [number, number],
  onCommit: (val: [number, number]) => void,
  delay = 300
) {
  const [pending, setPending] = useState<[number, number] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const displayed = pending ?? canonical;

  function onChange(val: number | readonly number[]) {
    if (typeof val === 'number') return;
    const v: [number, number] = [val[0], val[1]];
    setPending(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onCommit(v);
      setPending(null);
    }, delay);
  }

  return { value: displayed, onChange } as const;
}

// ─── Filter content (shared between sidebar & sheet) ────────────────────────

interface FilterContentProps {
  filters: ReturnType<typeof useQueryStates<typeof filterParsers>>[0];
  setFilters: ReturnType<typeof useQueryStates<typeof filterParsers>>[1];
  activeCount: number;
}

function FilterContent({ filters, setFilters, activeCount }: FilterContentProps) {
  const currentYear = new Date().getFullYear();

  const price = useDebouncedSlider(
    [filters.minPrice ?? 0, filters.maxPrice ?? 5000000],
    (val) =>
      setFilters({
        minPrice: val[0] === 0 ? null : val[0],
        maxPrice: val[1] === 5000000 ? null : val[1],
        page: 1,
      })
  );

  const year = useDebouncedSlider(
    [filters.minYear ?? 2000, filters.maxYear ?? currentYear],
    (val) =>
      setFilters({
        minYear: val[0] === 2000 ? null : val[0],
        maxYear: val[1] === currentYear ? null : val[1],
        page: 1,
      })
  );

  const mileage = useDebouncedSlider(
    [filters.minMileage ?? 0, filters.maxMileage ?? 300000],
    (val) =>
      setFilters({
        minMileage: val[0] === 0 ? null : val[0],
        maxMileage: val[1] === 300000 ? null : val[1],
        page: 1,
      })
  );

  function toggleArrayFilter(
    key: 'make' | 'bodyType' | 'transmission' | 'fuelType' | 'condition',
    value: string
  ) {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ [key]: next.length > 0 ? next : null, page: 1 });
  }

  function clearAll() {
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
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Filters
          {activeCount > 0 && (
            <Badge className="ml-2 border-0 bg-primary-600 text-white">
              {activeCount}
            </Badge>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-1.5">
        <Label className="text-xs">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search make, model..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ search: e.target.value || null, page: 1 })
            }
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Make (multi-select with Command) */}
      <div className="space-y-1.5">
        <Label className="text-xs">Make</Label>
        <MakeMultiSelect
          selected={filters.make}
          onToggle={(make) => toggleArrayFilter('make', make)}
        />
      </div>

      {/* Model (text input, dependent on make) */}
      {filters.make.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Model</Label>
          <Input
            placeholder="e.g. Civic, Vios..."
            value={filters.model}
            onChange={(e) =>
              setFilters({ model: e.target.value || null, page: 1 })
            }
            className="h-9 text-sm"
          />
        </div>
      )}

      <Separator />

      {/* Price range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Price Range</Label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCompact(price.value[0])} – {formatCompact(price.value[1])}
          </span>
        </div>
        <Slider
          min={0}
          max={5000000}
          step={50000}
          value={price.value}
          onValueChange={price.onChange}
        />
      </div>

      <Separator />

      {/* Year range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Year</Label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {year.value[0]} – {year.value[1]}
          </span>
        </div>
        <Slider
          min={2000}
          max={new Date().getFullYear()}
          step={1}
          value={year.value}
          onValueChange={year.onChange}
        />
      </div>

      <Separator />

      {/* Body type */}
      <div className="space-y-2">
        <Label className="text-xs">Body Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {BODY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleArrayFilter('bodyType', type.toLowerCase())}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                filters.bodyType.includes(type.toLowerCase())
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Transmission */}
      <CheckboxGroup
        label="Transmission"
        options={TRANSMISSIONS as unknown as string[]}
        selected={filters.transmission}
        onToggle={(val) => toggleArrayFilter('transmission', val.toLowerCase())}
        getKey={(v) => v.toLowerCase()}
      />

      <Separator />

      {/* Fuel type */}
      <CheckboxGroup
        label="Fuel Type"
        options={FUEL_TYPES as unknown as string[]}
        selected={filters.fuelType}
        onToggle={(val) => toggleArrayFilter('fuelType', val.toLowerCase())}
        getKey={(v) => v.toLowerCase()}
      />

      <Separator />

      {/* Mileage range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Mileage</Label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCompact(mileage.value[0])} – {formatCompact(mileage.value[1])} km
          </span>
        </div>
        <Slider
          min={0}
          max={300000}
          step={5000}
          value={mileage.value}
          onValueChange={mileage.onChange}
        />
      </div>

      <Separator />

      {/* Condition */}
      <CheckboxGroup
        label="Condition"
        options={CONDITIONS as unknown as string[]}
        selected={filters.condition}
        onToggle={(val) => toggleArrayFilter('condition', val.toLowerCase())}
        getKey={(v) => v.toLowerCase()}
      />
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function MakeMultiSelect({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (make: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors hover:bg-muted dark:bg-input/30"
          />
        }
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground">Any make</span>
        ) : (
          <span className="line-clamp-1 text-left">
            {selected.join(', ')}
          </span>
        )}
        <SlidersHorizontal className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search makes..." />
          <CommandList>
            <CommandEmpty>No makes found.</CommandEmpty>
            <CommandGroup>
              {POPULAR_MAKES.map((make) => (
                <CommandItem
                  key={make}
                  value={make}
                  data-checked={selected.includes(make)}
                  onSelect={() => onToggle(make)}
                >
                  {make}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
  getKey,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  getKey: (value: string) => string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="space-y-1.5">
        {options.map((option) => {
          const key = getKey(option);
          return (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(key)}
                onCheckedChange={() => onToggle(option)}
              />
              <span className="text-sm">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

// ─── Exports ────────────────────────────────────────────────────────────────

export function FilterSidebar(props: FilterContentProps) {
  return (
    <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-r p-4 lg:block">
      <FilterContent {...props} />
    </aside>
  );
}

export function FilterSheet(props: FilterContentProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="lg:hidden" />
        }
      >
        <SlidersHorizontal className="size-4" data-icon="inline-start" />
        Filters
        {props.activeCount > 0 && (
          <Badge className="ml-1 border-0 bg-primary-600 text-white">
            {props.activeCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow down your search</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8">
          <FilterContent {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
