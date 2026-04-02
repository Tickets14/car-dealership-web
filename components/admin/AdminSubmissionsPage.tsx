'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  BadgeDollarSign,
  CarFront,
  CheckCircle2,
  ClipboardList,
  Eye,
  Loader2,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  Tag,
  UserRound,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  CONDITION_CHECKS,
  CONTACT_METHODS,
  REASONS_FOR_SELLING,
  SUBMISSION_STATUS_OPTIONS,
} from '@/lib/constants';
import {
  useAdminSubmission,
  useAdminSubmissions,
  useUpdateSubmission,
  type AdminSubmissionListItem,
  type AdminSubmissionMutationResponse,
} from '@/lib/hooks/use-admin';
import type {
  SellerSubmission,
  SellerSubmissionPhoto,
  SellerSubmissionWithPhotos,
  SubmissionStatus,
} from '@/lib/types';

type SubmissionFilterValue = 'all' | SubmissionStatus;

const STATUS_TABS: Array<{ value: SubmissionFilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  ...SUBMISSION_STATUS_OPTIONS,
];

function formatPrice(value?: number | null) {
  if (!value || Number.isNaN(value)) {
    return 'Not provided';
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSubmissionTitle(
  submission: Pick<SellerSubmission, 'year' | 'make' | 'model' | 'variant'>
) {
  return [submission.year, submission.make, submission.model, submission.variant]
    .filter(Boolean)
    .join(' ');
}

function formatContactMethod(method?: string | null) {
  return (
    CONTACT_METHODS.find((option) => option.value === method)?.label ??
    method?.replace(/_/g, ' ') ??
    'Unknown'
  );
}

function formatSellingReason(reason?: string | null) {
  return (
    REASONS_FOR_SELLING.find((option) => option.value === reason)?.label ??
    reason?.replace(/_/g, ' ') ??
    'Not specified'
  );
}

function formatChecklistLabel(key: string) {
  return (
    CONDITION_CHECKS.find((item) => item.key === key)?.label ??
    key.replace(/_/g, ' ')
  );
}

function getSubmissionPhotos(
  submission:
    | AdminSubmissionListItem
    | SellerSubmissionWithPhotos
    | (SellerSubmission & Record<string, unknown>)
) {
  const record = submission as Record<string, unknown>;
  const photos =
    (Array.isArray(record.photos) ? (record.photos as SellerSubmissionPhoto[]) : undefined) ??
    (Array.isArray(record.seller_submission_photos)
      ? (record.seller_submission_photos as SellerSubmissionPhoto[])
      : undefined) ??
    [];

  return [...photos].sort((left, right) => left.sort_order - right.sort_order);
}

function resolveDraftCarId(response: AdminSubmissionMutationResponse | undefined) {
  if (!response) return null;
  if (response.draft_car_id) return response.draft_car_id;
  if (response.car_id) return response.car_id;
  if (response.car?.id) return response.car.id;

  const data = response.data;
  if (!data || typeof data !== 'object') return null;

  if ('draft_car_id' in data && typeof data.draft_car_id === 'string') {
    return data.draft_car_id;
  }

  if ('car_id' in data && typeof data.car_id === 'string') {
    return data.car_id;
  }

  if (
    'car' in data &&
    data.car &&
    typeof data.car === 'object' &&
    'id' in data.car &&
    typeof data.car.id === 'string'
  ) {
    return data.car.id;
  }

  return null;
}

function getContactHref(submission: SellerSubmission) {
  const title = formatSubmissionTitle(submission);
  const encodedBody = encodeURIComponent(
    `Hi ${submission.seller_name}, I'm following up on your ${title} seller submission (${submission.reference_number}).`
  );

  if (submission.contact_method === 'email' && submission.seller_email) {
    return `mailto:${submission.seller_email}?subject=${encodeURIComponent(
      `Regarding your seller submission ${submission.reference_number}`
    )}&body=${encodedBody}`;
  }

  if (submission.contact_method === 'phone' && submission.seller_phone) {
    return `tel:${submission.seller_phone}`;
  }

  if (submission.contact_method === 'whatsapp' && submission.seller_phone) {
    const digits = submission.seller_phone.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}?text=${encodedBody}` : null;
  }

  if (submission.seller_email) {
    return `mailto:${submission.seller_email}?subject=${encodeURIComponent(
      `Regarding your seller submission ${submission.reference_number}`
    )}&body=${encodedBody}`;
  }

  if (submission.seller_phone) {
    return `tel:${submission.seller_phone}`;
  }

  return null;
}

function getContactLabel(submission: SellerSubmission) {
  if (submission.contact_method === 'email') return 'Email Seller';
  if (submission.contact_method === 'phone') return 'Call Seller';
  if (submission.contact_method === 'whatsapp') return 'WhatsApp Seller';
  return 'Contact Seller';
}

function SubmissionCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="space-y-5 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SubmissionDetailSkeleton() {
  return (
    <div className="space-y-6 px-6 pb-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 px-5 py-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 px-5 py-5">
          <Skeleton className="h-5 w-36" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmissionActions({
  submission,
  disabled,
  showView = true,
  onView,
  onApprove,
  onReject,
  onCounterOffer,
}: {
  submission: SellerSubmission;
  disabled: boolean;
  showView?: boolean;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCounterOffer: () => void;
}) {
  const contactHref = getContactHref(submission);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showView && (
        <Button type="button" variant="outline" size="sm" onClick={onView}>
          <Eye className="size-4" />
          View Details
        </Button>
      )}

      <Button
        type="button"
        size="sm"
        disabled={disabled || submission.status === 'approved'}
        onClick={onApprove}
      >
        <CheckCircle2 className="size-4" />
        Approve
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled || submission.status === 'rejected'}
        onClick={onCounterOffer}
      >
        <BadgeDollarSign className="size-4" />
        Counter-Offer
      </Button>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={disabled || submission.status === 'rejected'}
        onClick={onReject}
      >
        <XCircle className="size-4" />
        Reject
      </Button>

      {contactHref ? (
        <Button
          variant="outline"
          size="sm"
          render={<a href={contactHref} target="_blank" rel="noreferrer" />}
        >
          <MessageCircleMore className="size-4" />
          {getContactLabel(submission)}
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" disabled>
          <MessageCircleMore className="size-4" />
          Contact Seller
        </Button>
      )}
    </div>
  );
}

export function AdminSubmissionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<SubmissionFilterValue>('all');
  const [detailSubmissionId, setDetailSubmissionId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SellerSubmission | null>(null);
  const [counterTarget, setCounterTarget] = useState<SellerSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const submissionsQuery = useAdminSubmissions({
    page: 1,
    limit: 24,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const allCountQuery = useAdminSubmissions({ page: 1, limit: 1 });
  const pendingCountQuery = useAdminSubmissions({ page: 1, limit: 1, status: 'pending' });
  const approvedCountQuery = useAdminSubmissions({ page: 1, limit: 1, status: 'approved' });
  const counterOfferedCountQuery = useAdminSubmissions({
    page: 1,
    limit: 1,
    status: 'counter_offered',
  });
  const rejectedCountQuery = useAdminSubmissions({ page: 1, limit: 1, status: 'rejected' });

  const { data: detailSubmission, isLoading: detailLoading } =
    useAdminSubmission(detailSubmissionId ?? undefined);

  const updateSubmission = useUpdateSubmission();
  const submissions = submissionsQuery.data?.data ?? [];

  const counts = useMemo(
    () => ({
      all: allCountQuery.data?.total ?? 0,
      pending: pendingCountQuery.data?.total ?? 0,
      approved: approvedCountQuery.data?.total ?? 0,
      counter_offered: counterOfferedCountQuery.data?.total ?? 0,
      rejected: rejectedCountQuery.data?.total ?? 0,
    }),
    [
      allCountQuery.data?.total,
      approvedCountQuery.data?.total,
      counterOfferedCountQuery.data?.total,
      pendingCountQuery.data?.total,
      rejectedCountQuery.data?.total,
    ]
  );

  const isMutating = updateSubmission.isPending;
  const activeDetailSubmission =
    detailSubmission ??
    submissions.find((submission) => submission.id === detailSubmissionId) ??
    null;

  async function handleApprove(submission: SellerSubmission) {
    const confirmed = window.confirm(
      `Approve ${submission.reference_number} and create a draft listing?`
    );
    if (!confirmed) return;

    try {
      const response = await updateSubmission.mutateAsync({
        id: submission.id,
        data: {
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          admin_notes: null,
        },
      });

      const draftCarId = resolveDraftCarId(response);
      toast.success('Submission approved. Draft listing created.');

      if (draftCarId) {
        setDetailSubmissionId(null);
        router.push(`/admin/inventory/${draftCarId}/edit`);
      }
    } catch {
      toast.error('Failed to approve the submission.');
    }
  }

  async function handleRejectSubmit() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Enter a rejection reason before continuing.');
      return;
    }

    try {
      await updateSubmission.mutateAsync({
        id: rejectTarget.id,
        data: {
          status: 'rejected',
          admin_notes: rejectReason.trim(),
          reviewed_at: new Date().toISOString(),
        },
      });

      toast.success('Submission rejected.');
      setRejectTarget(null);
      setRejectReason('');
    } catch {
      toast.error('Failed to reject the submission.');
    }
  }

  async function handleCounterOfferSubmit() {
    if (!counterTarget) return;

    const parsedPrice = Number(counterPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error('Enter a valid counter-offer price.');
      return;
    }

    if (!counterMessage.trim()) {
      toast.error('Enter a counter-offer message.');
      return;
    }

    try {
      await updateSubmission.mutateAsync({
        id: counterTarget.id,
        data: {
          status: 'counter_offered',
          counter_offer_price: parsedPrice,
          counter_offer_message: counterMessage.trim(),
          reviewed_at: new Date().toISOString(),
        },
      });

      toast.success('Counter-offer sent.');
      setCounterTarget(null);
      setCounterPrice('');
      setCounterMessage('');
    } catch {
      toast.error('Failed to send the counter-offer.');
    }
  }

  const totalVisible = submissions.length;
  const totalResults = submissionsQuery.data?.total ?? 0;

  return (
    <>
      <div className="space-y-6">
        <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
          <CardContent className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ClipboardList className="size-4 text-amber-300" />
                <span>Seller Submissions</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Review incoming cars before they reach inventory
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                  Filter by status, inspect seller-provided photos and condition, then approve,
                  reject, or counter-offer in one queue.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                Queue Snapshot
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">{counts.pending}</p>
              <p className="text-sm text-white/70">Pending reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="space-y-5 px-6 py-6">
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as SubmissionFilterValue)}
              className="gap-4"
            >
              <TabsList
                variant="line"
                className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none p-0"
              >
                {STATUS_TABS.map((tab) => (
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

            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {totalVisible} submission{totalVisible === 1 ? '' : 's'}
                {totalResults > totalVisible ? ` of ${totalResults}` : ''}.
              </p>
              <p>Status counts update from the admin submissions endpoint.</p>
            </div>

            {submissionsQuery.isError && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
                <p className="font-medium text-destructive">Failed to load seller submissions.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Refresh the page or verify the admin submissions endpoint response.
                </p>
              </div>
            )}
            {submissionsQuery.isLoading && !submissionsQuery.data ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SubmissionCardSkeleton key={index} />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-3xl border border-dashed bg-muted/20 px-6 py-14 text-center">
                <ClipboardList className="mx-auto size-10 text-muted-foreground/70" />
                <p className="mt-4 text-lg font-medium">No submissions found.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another status tab or wait for new seller submissions to arrive.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {submissions.map((submission) => {
                  const photos = getSubmissionPhotos(submission).slice(0, 3);
                  const photoCount = submission.photo_count ?? photos.length;

                  return (
                    <Card
                      key={submission.id}
                      className="overflow-hidden border-border/70 shadow-sm"
                    >
                      <CardContent className="space-y-5 px-5 py-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={submission.status} />
                              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                {submission.reference_number}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold">
                                {formatSubmissionTitle(submission)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Asking price {formatPrice(submission.asking_price)}
                                {submission.negotiable ? ' · Negotiable' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-muted/30 px-3 py-2 text-right">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                              Submitted
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {format(new Date(submission.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          {photos.length > 0 ? (
                            photos.map((photo, index) => (
                              <div
                                key={photo.id}
                                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
                              >
                                <Image
                                  src={photo.url}
                                  alt={photo.label ?? `Submission photo ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 30vw"
                                />
                              </div>
                            ))
                          ) : (
                            Array.from({ length: 3 }).map((_, index) => (
                              <div
                                key={index}
                                className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted text-center text-sm text-muted-foreground"
                              >
                                <div className="space-y-1">
                                  <CarFront className="mx-auto size-5" />
                                  <p>{photoCount} photo{photoCount === 1 ? '' : 's'}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                          <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                            <div className="flex items-start gap-3">
                              <div className="rounded-2xl bg-primary-50 p-2 text-primary-600">
                                <UserRound className="size-4" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium">{submission.seller_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {submission.seller_email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {submission.seller_phone}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-foreground">
                                {formatContactMethod(submission.contact_method)}
                              </p>
                              <p className="text-muted-foreground">
                                Location: {submission.location || 'Not provided'}
                              </p>
                              <p className="text-muted-foreground">
                                Reason: {formatSellingReason(submission.reason_for_selling)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {submission.status === 'counter_offered' &&
                          submission.counter_offer_price && (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm">
                              <p className="font-medium text-blue-900">
                                Current counter-offer: {formatPrice(submission.counter_offer_price)}
                              </p>
                              {submission.counter_offer_message && (
                                <p className="mt-1 text-blue-900/80">
                                  {submission.counter_offer_message}
                                </p>
                              )}
                            </div>
                          )}

                        {submission.status === 'rejected' && submission.admin_notes && (
                          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
                            <p className="font-medium text-destructive">Rejection reason</p>
                            <p className="mt-1 text-muted-foreground">
                              {submission.admin_notes}
                            </p>
                          </div>
                        )}

                        <SubmissionActions
                          submission={submission}
                          disabled={isMutating}
                          onView={() => setDetailSubmissionId(submission.id)}
                          onApprove={() => handleApprove(submission)}
                          onReject={() => {
                            setRejectTarget(submission);
                            setRejectReason(submission.admin_notes ?? '');
                          }}
                          onCounterOffer={() => {
                            setCounterTarget(submission);
                            setCounterPrice(
                              submission.counter_offer_price
                                ? String(submission.counter_offer_price)
                                : submission.asking_price
                                  ? String(submission.asking_price)
                                  : ''
                            );
                            setCounterMessage(submission.counter_offer_message ?? '');
                          }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={!!detailSubmissionId}
        onOpenChange={(open) => {
          if (!open) {
            setDetailSubmissionId(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-none lg:w-[min(1100px,94vw)]"
        >
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="border-b px-6 py-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={activeDetailSubmission?.status ?? 'pending'}
                    />
                    {activeDetailSubmission && (
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {activeDetailSubmission.reference_number}
                      </span>
                    )}
                  </div>

                  <div>
                    <SheetTitle className="text-xl">
                      {activeDetailSubmission
                        ? formatSubmissionTitle(activeDetailSubmission)
                        : 'Submission details'}
                    </SheetTitle>
                    <SheetDescription className="mt-1">
                      Review seller details, photos, pricing, and condition before taking action.
                    </SheetDescription>
                  </div>
                </div>

                {activeDetailSubmission && (
                  <div className="rounded-2xl bg-muted/30 px-4 py-3 text-sm">
                    <p className="font-medium">
                      {format(new Date(activeDetailSubmission.created_at), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-muted-foreground">
                      Preferred contact: {formatContactMethod(activeDetailSubmission.contact_method)}
                    </p>
                  </div>
                )}
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto pt-6">
              {detailLoading && !detailSubmission ? (
                <SubmissionDetailSkeleton />
              ) : activeDetailSubmission ? (
                <div className="space-y-6 px-6 pb-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="shadow-sm">
                      <CardContent className="space-y-4 px-5 py-5">
                        <div className="flex items-center gap-2">
                          <UserRound className="size-4 text-primary-600" />
                          <h3 className="font-medium">Seller Info</h3>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-3">
                            <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{activeDetailSubmission.seller_name}</p>
                              <p className="text-muted-foreground">
                                Reference {activeDetailSubmission.reference_number}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className="mt-0.5 size-4 text-muted-foreground" />
                            <p>{activeDetailSubmission.seller_email}</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="mt-0.5 size-4 text-muted-foreground" />
                            <p>{activeDetailSubmission.seller_phone}</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                            <p>{activeDetailSubmission.location || 'Location not provided'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardContent className="space-y-4 px-5 py-5">
                        <div className="flex items-center gap-2">
                          <CarFront className="size-4 text-primary-600" />
                          <h3 className="font-medium">Vehicle Summary</h3>
                        </div>

                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-muted-foreground">Vehicle</p>
                            <p className="font-medium">
                              {formatSubmissionTitle(activeDetailSubmission)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Mileage</p>
                            <p className="font-medium">
                              {activeDetailSubmission.mileage
                                ? `${activeDetailSubmission.mileage.toLocaleString()} km`
                                : 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Transmission</p>
                            <p className="font-medium">
                              {activeDetailSubmission.transmission || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fuel Type</p>
                            <p className="font-medium">
                              {activeDetailSubmission.fuel_type || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Color</p>
                            <p className="font-medium">
                              {activeDetailSubmission.color || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Selling Reason</p>
                            <p className="font-medium">
                              {formatSellingReason(activeDetailSubmission.reason_for_selling)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="space-y-4 px-5 py-5">
                        <div className="flex items-center gap-2">
                          <BadgeDollarSign className="size-4 text-primary-600" />
                          <h3 className="font-medium">Pricing & Review</h3>
                        </div>

                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-muted-foreground">Asking Price</p>
                            <p className="font-medium">
                              {formatPrice(activeDetailSubmission.asking_price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Negotiable</p>
                            <p className="font-medium">
                              {activeDetailSubmission.negotiable ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current Status</p>
                            <div className="pt-1">
                              <StatusBadge status={activeDetailSubmission.status} />
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reviewed At</p>
                            <p className="font-medium">
                              {activeDetailSubmission.reviewed_at
                                ? format(
                                    new Date(activeDetailSubmission.reviewed_at),
                                    'MMM d, yyyy h:mm a'
                                  )
                                : 'Not reviewed yet'}
                            </p>
                          </div>
                        </div>

                        {activeDetailSubmission.counter_offer_price && (
                          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm">
                            <p className="font-medium text-blue-900">
                              Counter-offer: {formatPrice(activeDetailSubmission.counter_offer_price)}
                            </p>
                            {activeDetailSubmission.counter_offer_message && (
                              <p className="mt-1 text-blue-900/80">
                                {activeDetailSubmission.counter_offer_message}
                              </p>
                            )}
                          </div>
                        )}

                        {activeDetailSubmission.admin_notes && (
                          <div className="rounded-2xl border bg-muted/20 px-4 py-3 text-sm">
                            <p className="font-medium">Admin Notes</p>
                            <p className="mt-1 text-muted-foreground">
                              {activeDetailSubmission.admin_notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardContent className="space-y-4 px-5 py-5">
                        <div className="flex items-center gap-2">
                          <Tag className="size-4 text-primary-600" />
                          <h3 className="font-medium">Condition</h3>
                        </div>

                        {Object.keys(activeDetailSubmission.condition_checklist ?? {}).length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No condition checklist data was submitted.
                          </p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {Object.entries(activeDetailSubmission.condition_checklist ?? {}).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="rounded-2xl border bg-muted/15 px-4 py-3 text-sm"
                                >
                                  <p className="font-medium">{formatChecklistLabel(key)}</p>
                                  <p className="mt-1 text-muted-foreground">
                                    {typeof value === 'boolean'
                                      ? value
                                        ? 'Yes'
                                        : 'No'
                                      : String(value)}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm">
                    <CardContent className="space-y-4 px-5 py-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-medium">Submitted Photos</h3>
                          <p className="text-sm text-muted-foreground">
                            Seller-uploaded images attached to this submission.
                          </p>
                        </div>
                        <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          {getSubmissionPhotos(activeDetailSubmission).length} photo
                          {getSubmissionPhotos(activeDetailSubmission).length === 1 ? '' : 's'}
                        </div>
                      </div>

                      {getSubmissionPhotos(activeDetailSubmission).length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-muted/15 px-6 py-12 text-center text-sm text-muted-foreground">
                          No photos attached to this submission.
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {getSubmissionPhotos(activeDetailSubmission).map((photo, index) => (
                            <div
                              key={photo.id}
                              className="overflow-hidden rounded-2xl border bg-card"
                            >
                              <div className="relative aspect-[4/3] bg-muted">
                                <Image
                                  src={photo.url}
                                  alt={photo.label ?? `Submission photo ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              </div>
                              <div className="px-4 py-3 text-sm">
                                <p className="font-medium">{photo.label || `Photo ${index + 1}`}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="px-6 pb-6">
                  <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                    Select a submission to inspect full details.
                  </div>
                </div>
              )}
            </div>

            {activeDetailSubmission && (
              <SheetFooter className="border-t bg-background px-6 py-5">
                <SubmissionActions
                  submission={activeDetailSubmission}
                  disabled={isMutating}
                  showView={false}
                  onView={() => undefined}
                  onApprove={() => handleApprove(activeDetailSubmission)}
                  onReject={() => {
                    setRejectTarget(activeDetailSubmission);
                    setRejectReason(activeDetailSubmission.admin_notes ?? '');
                  }}
                  onCounterOffer={() => {
                    setCounterTarget(activeDetailSubmission);
                    setCounterPrice(
                      activeDetailSubmission.counter_offer_price
                        ? String(activeDetailSubmission.counter_offer_price)
                        : activeDetailSubmission.asking_price
                          ? String(activeDetailSubmission.asking_price)
                          : ''
                    );
                    setCounterMessage(activeDetailSubmission.counter_offer_message ?? '');
                  }}
                />
              </SheetFooter>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Save the rejection reason for {rejectTarget?.reference_number} before notifying the
              seller.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject_reason">Reason</Label>
            <Textarea
              id="reject_reason"
              rows={5}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain why the submission was rejected."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={isMutating}
              onClick={handleRejectSubmit}
            >
              {isMutating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!counterTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCounterTarget(null);
            setCounterPrice('');
            setCounterMessage('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Counter-Offer</DialogTitle>
            <DialogDescription>
              Save a revised price and message for {counterTarget?.reference_number}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="counter_price">Counter-Offer Price</Label>
              <Input
                id="counter_price"
                type="number"
                value={counterPrice}
                onChange={(event) => setCounterPrice(event.target.value)}
                placeholder="850000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="counter_message">Message</Label>
              <Textarea
                id="counter_message"
                rows={5}
                value={counterMessage}
                onChange={(event) => setCounterMessage(event.target.value)}
                placeholder="Share the revised offer and next steps."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isMutating}
              onClick={handleCounterOfferSubmit}
            >
              {isMutating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BadgeDollarSign className="size-4" />
              )}
              Save Counter-Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

