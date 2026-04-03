'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  CarFront,
  Loader2,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type Column, type SortState } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/ui/optimized-image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminCars,
  useBulkDeleteCars,
  useBulkUpdateCars,
  useUpdateCar,
  type AdminCarListItem,
} from '@/lib/hooks/use-admin';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

function resolveThumbnail(car: AdminCarListItem) {
  if (car.thumbnail_url) return car.thumbnail_url;

  const orderedPhotos = [...(car.photos ?? [])].sort(
    (left, right) => left.sort_order - right.sort_order
  );

  return orderedPhotos[0]?.url ?? null;
}

function MobileInventoryCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="space-y-4 px-4 py-4">
        <div className="flex gap-3">
          <Skeleton className="h-20 w-28 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-muted/20 p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryMobileCard({
  car,
  selected,
  busy,
  isBulkBusy,
  onToggleSelected,
  onToggleFeatured,
}: {
  car: AdminCarListItem;
  selected: boolean;
  busy: boolean;
  isBulkBusy: boolean;
  onToggleSelected: (id: string) => void;
  onToggleFeatured: (car: AdminCarListItem) => void;
}) {
  const thumbnail = resolveThumbnail(car);

  return (
    <Card
      className={`overflow-hidden shadow-sm ${selected ? 'border-primary-200 ring-2 ring-primary-100' : ''}`}
    >
      <CardContent className="space-y-4 px-4 py-4">
        <div className="flex gap-3">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {thumbnail ? (
              <OptimizedImage
                src={thumbnail}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <CarFront className="size-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Stock #{car.stock_number}
                </p>
                <h3 className="mt-1 text-base font-semibold leading-tight">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {car.variant || 'No variant specified'}
                </p>
              </div>
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelected(car.id)}
                aria-label={`Select ${car.stock_number}`}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={car.status} />
              <p className="text-xs text-muted-foreground capitalize">
                {car.transmission} · {car.fuel_type}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-muted/20 p-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Cash Price
            </p>
            <p className="mt-1 text-sm font-medium">{formatPrice(car.price_cash)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Inquiries
            </p>
            <p className="mt-1 text-sm font-medium">{car.inquiry_count ?? 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Listed
            </p>
            <p className="mt-1 text-sm font-medium">
              {format(new Date(car.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Featured
            </p>
            <p className="mt-1 text-sm font-medium">
              {car.is_featured ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            render={<Link href={`/admin/inventory/${car.id}/edit`} />}
          >
            Edit Listing
          </Button>
          <Button
            type="button"
            variant={car.is_featured ? 'default' : 'outline'}
            disabled={busy || isBulkBusy}
            onClick={() => onToggleFeatured(car)}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Star className={`size-4 ${car.is_featured ? 'fill-current' : ''}`} />
            )}
            {car.is_featured ? 'Featured' : 'Feature'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="space-y-4 px-6 py-6 sm:px-8">
          <Skeleton className="h-4 w-36 bg-white/20" />
          <Skeleton className="h-10 w-64 bg-white/20" />
          <Skeleton className="h-5 w-80 max-w-full bg-white/15" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-44" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <MobileInventoryCardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden lg:block">
        <DataTable<AdminCarListItem>
          columns={[
            { id: 'photo', header: 'Photo', cell: () => null },
            { id: 'stock', header: 'Stock #', cell: () => null },
            { id: 'vehicle', header: 'Vehicle', cell: () => null },
            { id: 'price', header: 'Price', cell: () => null },
            { id: 'status', header: 'Status', cell: () => null },
            { id: 'listed', header: 'Listed', cell: () => null },
            { id: 'inquiries', header: 'Inquiries', cell: () => null },
            { id: 'featured', header: 'Featured', cell: () => null },
          ]}
          data={[]}
          getRowId={(row) => row.id}
          loading
          selectable
        />
      </div>
    </div>
  );
}

export function AdminInventoryPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'available' | 'reserved' | 'sold'>('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({
    column: 'created_at',
    direction: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [featuredBusyId, setFeaturedBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sort]);

  const filters = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sort: `${sort.column}:${sort.direction}`,
    }),
    [debouncedSearch, page, sort, statusFilter]
  );

  const {
    data: carsResponse,
    isLoading: carsLoading,
    isError: carsError,
  } = useAdminCars(filters);
  const bulkUpdateCars = useBulkUpdateCars();
  const bulkDeleteCars = useBulkDeleteCars();
  const updateCar = useUpdateCar();

  const cars = useMemo(() => carsResponse?.data ?? [], [carsResponse]);
  const selectedCount = selectedIds.size;
  const isBulkBusy =
    bulkUpdateCars.isPending || bulkDeleteCars.isPending || updateCar.isPending;

  function handleToggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  useEffect(() => {
    setSelectedIds((current) => {
      if (current.size === 0) return current;

      const next = new Set(
        Array.from(current).filter((id) => cars.some((car) => car.id === id))
      );

      return next.size === current.size ? current : next;
    });
  }, [cars]);

  async function handleBulkStatusUpdate(status: 'available' | 'sold') {
    if (selectedIds.size === 0) return;

    try {
      await bulkUpdateCars.mutateAsync({
        ids: Array.from(selectedIds),
        updates: { status },
      });
      toast.success(`Marked ${selectedIds.size} listing(s) as ${status}.`);
      setSelectedIds(new Set());
    } catch {
      toast.error(`Failed to update selected listings to ${status}.`);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.size} selected listing(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await bulkDeleteCars.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} listing(s).`);
      setSelectedIds(new Set());
    } catch {
      toast.error('Failed to delete selected listings.');
    }
  }

  async function handleToggleFeatured(car: AdminCarListItem) {
    try {
      setFeaturedBusyId(car.id);
      await updateCar.mutateAsync({
        id: car.id,
        data: { is_featured: !car.is_featured },
      });
      toast.success(
        car.is_featured
          ? 'Listing removed from featured cars.'
          : 'Listing marked as featured.'
      );
    } catch {
      toast.error('Failed to update featured status.');
    } finally {
      setFeaturedBusyId(null);
    }
  }

  const columns: Column<AdminCarListItem>[] = [
    {
      id: 'photo',
      header: 'Photo',
      className: 'w-[88px]',
      cell: (car) => {
        const thumbnail = resolveThumbnail(car);

        if (!thumbnail) {
          return (
            <div className="flex h-14 w-18 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <CarFront className="size-4" />
            </div>
          );
        }

        return (
          <div className="relative h-14 w-18 overflow-hidden rounded-xl bg-muted">
            <OptimizedImage
              src={thumbnail}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover"
              sizes="72px"
            />
          </div>
        );
      },
    },
    {
      id: 'stock_number',
      header: 'Stock #',
      cell: (car) => (
        <div className="space-y-0.5">
          <p className="font-medium">{car.stock_number}</p>
          <p className="text-xs text-muted-foreground">
            ID: {car.id.slice(0, 8)}
          </p>
        </div>
      ),
    },
    {
      id: 'vehicle',
      header: 'Year / Make / Model',
      cell: (car) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {car.year} {car.make} {car.model}
          </p>
          <p className="text-sm text-muted-foreground">
            {car.variant || 'No variant specified'}
          </p>
        </div>
      ),
    },
    {
      id: 'price_cash',
      header: 'Price',
      sortable: true,
      cell: (car) => (
        <div className="space-y-0.5">
          <p className="font-medium">{formatPrice(car.price_cash)}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {car.transmission} · {car.fuel_type}
          </p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (car) => <StatusBadge status={car.status} />,
    },
    {
      id: 'created_at',
      header: 'Listed',
      sortable: true,
      cell: (car) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {format(new Date(car.created_at), 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated {format(new Date(car.updated_at), 'MMM d')}
          </p>
        </div>
      ),
    },
    {
      id: 'inquiry_count',
      header: 'Inquiries',
      cell: (car) => (
        <span className="inline-flex min-w-10 justify-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
          {car.inquiry_count ?? 0}
        </span>
      ),
    },
    {
      id: 'featured',
      header: 'Featured',
      cell: (car) => {
        const busy = featuredBusyId === car.id;

        return (
          <Button
            type="button"
            variant={car.is_featured ? 'default' : 'ghost'}
            size="icon-sm"
            disabled={busy || isBulkBusy}
            onClick={() => handleToggleFeatured(car)}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Star
                className={`size-4 ${car.is_featured ? 'fill-current' : ''}`}
              />
            )}
            <span className="sr-only">
              {car.is_featured ? 'Remove from featured' : 'Mark as featured'}
            </span>
          </Button>
        );
      },
    },
  ];

  if (carsLoading && !carsResponse) {
    return <InventorySkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Tag className="size-4 text-amber-300" />
              <span>Inventory Management</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Manage active inventory listings
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                Search listings, update status in bulk, and keep featured cars
                current from one queue.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              Total Listings
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {carsResponse?.total ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-4 px-6 py-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
            <div className="space-y-1.5">
              <label htmlFor="inventory-search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="inventory-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search stock #, make, model, or variant"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inventory-status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as 'all' | 'draft' | 'available' | 'reserved' | 'sold'
                  )
                }
              >
                <SelectTrigger id="inventory-status" className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button render={<Link href="/admin/inventory/new" />}>
              <Plus className="size-4" />
              Add New Listing
            </Button>
          </div>

          {selectedCount > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border bg-muted/20 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {selectedCount} listing{selectedCount === 1 ? '' : 's'} selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Apply a bulk status update or remove the selected inventory.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isBulkBusy}
                  onClick={() => handleBulkStatusUpdate('available')}
                >
                  {bulkUpdateCars.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Tag className="size-4" />
                  )}
                  Mark Available
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isBulkBusy}
                  onClick={() => handleBulkStatusUpdate('sold')}
                >
                  {bulkUpdateCars.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Tag className="size-4" />
                  )}
                  Mark Sold
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isBulkBusy}
                  onClick={handleBulkDelete}
                >
                  {bulkDeleteCars.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          )}

          {carsError && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
              <p className="font-medium text-destructive">
                Failed to load inventory listings.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Refresh the page or verify the admin cars endpoint response.
              </p>
            </div>
          )}

          <div className="space-y-4 lg:hidden">
            {cars.length === 0 ? (
              <div className="rounded-3xl border border-dashed bg-muted/20 px-6 py-14 text-center">
                <CarFront className="mx-auto size-10 text-muted-foreground/70" />
                <p className="mt-4 text-lg font-medium">No listings found.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust the filters or add a new inventory listing.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {cars.map((car) => (
                  <InventoryMobileCard
                    key={car.id}
                    car={car}
                    selected={selectedIds.has(car.id)}
                    busy={featuredBusyId === car.id}
                    isBulkBusy={isBulkBusy}
                    onToggleSelected={handleToggleSelected}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}

            {carsResponse && carsResponse.totalPages > 1 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {selectedCount > 0
                    ? `${selectedCount} of ${carsResponse.total} selected`
                    : `${carsResponse.total} total`}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={carsResponse.page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {carsResponse.page} / {carsResponse.totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={carsResponse.page >= carsResponse.totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(carsResponse.totalPages, current + 1)
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={cars}
              getRowId={(row) => row.id}
              loading={carsLoading}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sort={sort}
              onSortChange={setSort}
              pagination={
                carsResponse
                  ? {
                      page: carsResponse.page,
                      totalPages: carsResponse.totalPages,
                      total: carsResponse.total,
                    }
                  : undefined
              }
              onPageChange={setPage}
              emptyMessage="No listings match the current filters."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
