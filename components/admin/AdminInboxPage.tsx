'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CarFront,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Mail,
  MessageSquareMore,
  Phone,
  Search,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  INQUIRY_STATUS_OPTIONS,
  INQUIRY_TYPE_OPTIONS,
} from '@/lib/constants';
import {
  useAdminInquiries,
  type AdminInquiryListItem,
} from '@/lib/hooks/use-admin';
import type { Car, InquiryStatus, InquiryType } from '@/lib/types';

type InquiryTypeFilter = 'all' | InquiryType;
type InquiryStatusFilter = 'all' | InquiryStatus;

const TYPE_TABS: Array<{ value: InquiryTypeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  ...INQUIRY_TYPE_OPTIONS,
];

const inquiryTypeStyles: Record<InquiryType, string> = {
  buyer_inquiry: 'bg-sky-100 text-sky-800',
  visit_request: 'bg-amber-100 text-amber-800',
  pre_qualification: 'bg-emerald-100 text-emerald-800',
  seller_thread: 'bg-violet-100 text-violet-800',
};

function formatInquiryType(type: InquiryType) {
  return (
    INQUIRY_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    type.replace(/_/g, ' ')
  );
}

function InquiryTypeBadge({ type }: { type: InquiryType }) {
  return (
    <Badge
      className={inquiryTypeStyles[type] ?? 'bg-muted text-muted-foreground'}
    >
      {formatInquiryType(type)}
    </Badge>
  );
}

function resolveUnread(inquiry: AdminInquiryListItem) {
  return inquiry.unread ?? inquiry.status === 'new';
}

function resolveLastPreview(inquiry: AdminInquiryListItem) {
  return inquiry.last_message_preview?.trim() || inquiry.message?.trim() || 'No message preview available.';
}

function resolveLastActivityAt(inquiry: AdminInquiryListItem) {
  return inquiry.last_message_at ?? inquiry.updated_at ?? inquiry.created_at;
}

function formatCarSummary(car?: Car | null) {
  if (!car) return 'No linked car';

  return [car.year, car.make, car.model, car.variant]
    .filter(Boolean)
    .join(' ');
}

function formatCarMeta(car?: Car | null) {
  if (!car) return null;

  return `Stock #${car.stock_number} | PHP ${Math.round(car.price_cash).toLocaleString()}`;
}

function InboxSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="space-y-4 px-6 py-6 sm:px-8">
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="h-10 w-72 bg-white/20" />
          <Skeleton className="h-5 w-96 max-w-full bg-white/15" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-6 py-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminInboxPage() {
  const [typeFilter, setTypeFilter] = useState<InquiryTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<InquiryStatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const filters = useMemo(
    () => ({
      page,
      limit: 12,
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: debouncedSearch || undefined,
    }),
    [debouncedSearch, page, statusFilter, typeFilter]
  );

  const inquiriesQuery = useAdminInquiries(filters);
  const allCountQuery = useAdminInquiries({ page: 1, limit: 1 });
  const buyerCountQuery = useAdminInquiries({
    page: 1,
    limit: 1,
    type: 'buyer_inquiry',
  });
  const visitCountQuery = useAdminInquiries({
    page: 1,
    limit: 1,
    type: 'visit_request',
  });
  const preQualCountQuery = useAdminInquiries({
    page: 1,
    limit: 1,
    type: 'pre_qualification',
  });
  const sellerCountQuery = useAdminInquiries({
    page: 1,
    limit: 1,
    type: 'seller_thread',
  });

  const counts = useMemo(
    () => ({
      all: allCountQuery.data?.total ?? 0,
      buyer_inquiry: buyerCountQuery.data?.total ?? 0,
      visit_request: visitCountQuery.data?.total ?? 0,
      pre_qualification: preQualCountQuery.data?.total ?? 0,
      seller_thread: sellerCountQuery.data?.total ?? 0,
    }),
    [
      allCountQuery.data?.total,
      buyerCountQuery.data?.total,
      preQualCountQuery.data?.total,
      sellerCountQuery.data?.total,
      visitCountQuery.data?.total,
    ]
  );

  const inquiries = inquiriesQuery.data?.data ?? [];

  if (inquiriesQuery.isLoading && !inquiriesQuery.data) {
    return <InboxSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <MessageSquareMore className="size-4 text-amber-300" />
              <span>Admin Inbox</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Track inquiries, visits, and financing leads
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                Filter by inquiry type, review the latest customer message, and
                jump directly into the full conversation thread.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              Inbox Snapshot
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {counts.all}
            </p>
            <p className="text-sm text-white/70">Total inquiries</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-5 px-6 py-6">
          <Tabs
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as InquiryTypeFilter);
              setPage(1);
            }}
            className="gap-4"
          >
            <TabsList
              variant="line"
              className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none p-0"
            >
              {TYPE_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-10 gap-2 rounded-xl px-3 data-active:bg-muted/60"
                >
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {counts[tab.value]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div className="space-y-1.5">
              <label htmlFor="inbox-search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="inbox-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, email, phone, or message"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inbox-status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as InquiryStatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger id="inbox-status" className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {INQUIRY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {inquiries.length} conversation
              {inquiries.length === 1 ? '' : 's'}
              {typeof inquiriesQuery.data?.total === 'number'
                ? ` of ${inquiriesQuery.data.total}`
                : ''}
              .
            </p>
            <p>Unread items are highlighted with a blue status dot.</p>
          </div>

          {inquiriesQuery.isError && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
              <p className="font-medium text-destructive">
                Failed to load inquiry inbox.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Refresh the page or verify the admin inquiries endpoint response.
              </p>
            </div>
          )}

          {inquiries.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-muted/20 px-6 py-14 text-center">
              <Inbox className="mx-auto size-10 text-muted-foreground/70" />
              <p className="mt-4 text-lg font-medium">No inquiries found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the filters or wait for new conversations to arrive.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {inquiries.map((inquiry) => {
                const unread = resolveUnread(inquiry);
                const carMeta = formatCarMeta(inquiry.car);

                return (
                  <Card
                    key={inquiry.id}
                    className={`overflow-hidden shadow-sm transition-colors ${
                      unread ? 'border-primary-200 bg-primary-50/40' : ''
                    }`}
                  >
                    <CardContent className="space-y-5 px-5 py-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {unread && (
                              <span className="size-2 rounded-full bg-primary-600" />
                            )}
                            <p className="text-lg font-semibold">
                              {inquiry.name}
                            </p>
                            <InquiryTypeBadge type={inquiry.type} />
                            <StatusBadge status={inquiry.status} />
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="size-4" />
                              <span>{inquiry.email}</span>
                            </div>
                            {inquiry.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="size-4" />
                                <span>{inquiry.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-muted/30 px-3 py-2 text-right">
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            Last activity
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {formatDistanceToNow(
                              new Date(resolveLastActivityAt(inquiry)),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-primary-50 p-2 text-primary-600">
                            <CarFront className="size-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {formatCarSummary(inquiry.car)}
                            </p>
                            {carMeta ? (
                              <p className="text-sm text-muted-foreground">
                                {carMeta}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                This inquiry is not linked to a car listing.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-background px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-muted p-2 text-muted-foreground">
                            <UserRound className="size-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Last message</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {resolveLastPreview(inquiry)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          {inquiry.message_count ?? 0} message
                          {(inquiry.message_count ?? 0) === 1 ? '' : 's'}
                        </div>

                        <Button
                          render={<Link href={`/admin/inbox/${inquiry.id}`} />}
                        >
                          Open Thread
                          <ChevronRight className="size-4" data-icon="inline-end" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {inquiriesQuery.data && inquiriesQuery.data.totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {inquiriesQuery.data.page} of {inquiriesQuery.data.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= inquiriesQuery.data.totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(inquiriesQuery.data?.totalPages ?? current, current + 1)
                    )
                  }
                >
                  Next
                  <ChevronRight className="size-4" data-icon="inline-end" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
