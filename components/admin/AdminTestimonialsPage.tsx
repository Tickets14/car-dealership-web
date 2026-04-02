'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Quote,
  Star,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { TestimonialForm } from '@/components/admin/TestimonialForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  useAdminTestimonials,
  useCreateTestimonial,
  useDeleteTestimonial,
  useUpdateTestimonial,
} from '@/lib/hooks/use-admin';
import type { Testimonial } from '@/lib/types';

function formatCreated(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function sortTestimonials(testimonials: Testimonial[]) {
  return [...testimonials].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
  });
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) {
    return <p className="text-xs text-muted-foreground">No rating provided</p>;
  }

  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < rating ? 'fill-current' : ''}`}
        />
      ))}
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="space-y-4 px-6 py-6 sm:px-8">
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="h-10 w-64 bg-white/20" />
          <Skeleton className="h-5 w-96 max-w-full bg-white/15" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-32" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminTestimonialsPage() {
  const testimonialsQuery = useAdminTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();
  const [formOpen, setFormOpen] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(
    null
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const testimonials = useMemo(
    () => sortTestimonials(testimonialsQuery.data ?? []),
    [testimonialsQuery.data]
  );

  const isSubmitting =
    createTestimonial.isPending || updateTestimonial.isPending || deleteTestimonial.isPending;

  function openCreateDialog() {
    setEditingTestimonial(null);
    setFormVersion((current) => current + 1);
    setFormOpen(true);
  }

  function openEditDialog(testimonial: Testimonial) {
    setEditingTestimonial(testimonial);
    setFormVersion((current) => current + 1);
    setFormOpen(true);
  }

  async function handleSave(data: Partial<Testimonial>) {
    try {
      if (editingTestimonial) {
        await updateTestimonial.mutateAsync({
          id: editingTestimonial.id,
          data,
        });
        toast.success('Testimonial updated.');
      } else {
        await createTestimonial.mutateAsync({
          ...data,
          sort_order: testimonials.length,
        });
        toast.success('Testimonial created.');
      }

      setFormOpen(false);
      setEditingTestimonial(null);
    } catch {
      toast.error('Failed to save testimonial.');
    }
  }

  async function handleToggleVisibility(testimonial: Testimonial) {
    try {
      setBusyId(testimonial.id);
      await updateTestimonial.mutateAsync({
        id: testimonial.id,
        data: { is_visible: !testimonial.is_visible },
      });
      toast.success(
        testimonial.is_visible
          ? 'Testimonial hidden from the storefront.'
          : 'Testimonial is now visible on the storefront.'
      );
    } catch {
      toast.error('Failed to update testimonial visibility.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(testimonial: Testimonial) {
    const confirmed = window.confirm(
      `Delete the testimonial from ${testimonial.customer_name}?`
    );
    if (!confirmed) return;

    try {
      setBusyId(testimonial.id);
      await deleteTestimonial.mutateAsync(testimonial.id);
      toast.success('Testimonial deleted.');
    } catch {
      toast.error('Failed to delete testimonial.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(testimonial: Testimonial, direction: 'up' | 'down') {
    const currentIndex = testimonials.findIndex((item) => item.id === testimonial.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const adjacent = testimonials[targetIndex];

    try {
      setBusyId(testimonial.id);
      await updateTestimonial.mutateAsync({
        id: testimonial.id,
        data: { sort_order: adjacent.sort_order },
      });
      await updateTestimonial.mutateAsync({
        id: adjacent.id,
        data: { sort_order: testimonial.sort_order },
      });
      toast.success('Testimonial order updated.');
    } catch {
      toast.error('Failed to reorder testimonials.');
    } finally {
      setBusyId(null);
    }
  }

  if (testimonialsQuery.isLoading && !testimonialsQuery.data) {
    return <TestimonialsSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
          <CardContent className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MessageSquareQuote className="size-4 text-amber-300" />
                <span>Testimonials</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Curate trust-building customer stories
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                  Reorder testimonial cards, toggle storefront visibility, and
                  keep recent customer feedback polished for the buyer site.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                  Visible
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {testimonials.filter((item) => item.is_visible).length}
                </p>
              </div>

              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                onClick={openCreateDialog}
              >
                <Plus className="size-4" />
                Add Testimonial
              </Button>
            </div>
          </CardContent>
        </Card>

        {testimonialsQuery.isError && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="px-6 py-6">
              <p className="font-medium text-destructive">
                Failed to load testimonials.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Refresh the page or verify the admin testimonials endpoint response.
              </p>
            </CardContent>
          </Card>
        )}

        {testimonials.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="px-6 py-14 text-center">
              <Quote className="mx-auto size-10 text-muted-foreground/70" />
              <p className="mt-4 text-lg font-medium">No testimonials yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add the first customer quote to populate the testimonials section.
              </p>
              <Button className="mt-5" onClick={openCreateDialog}>
                <Plus className="size-4" />
                Add Testimonial
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial, index) => {
              const busy = busyId === testimonial.id && isSubmitting;

              return (
                <Card key={testimonial.id} className="overflow-hidden shadow-sm">
                  <CardContent className="space-y-5 px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {testimonial.photo_url ? (
                          <div className="relative size-16 overflow-hidden rounded-2xl bg-muted">
                            <Image
                              src={testimonial.photo_url}
                              alt={testimonial.customer_name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <UserRound className="size-6" />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold">{testimonial.customer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.car_purchased || 'No vehicle noted'}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          testimonial.is_visible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {testimonial.is_visible ? 'Visible' : 'Hidden'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Stars rating={testimonial.rating} />
                      <p className="min-h-24 text-sm leading-relaxed text-muted-foreground">
                        “{testimonial.quote}”
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>Order #{index + 1}</span>
                      <span>Added {formatCreated(testimonial.created_at)}</span>
                    </div>

                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium">Storefront Visibility</p>
                          <p className="text-sm text-muted-foreground">
                            Toggle whether buyers can see this testimonial.
                          </p>
                        </div>
                        <Switch
                          checked={testimonial.is_visible}
                          disabled={busy}
                          onCheckedChange={() => handleToggleVisibility(testimonial)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy || index === 0}
                        onClick={() => handleMove(testimonial, 'up')}
                      >
                        <ArrowUp className="size-4" />
                        Move Up
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy || index === testimonials.length - 1}
                        onClick={() => handleMove(testimonial, 'down')}
                      >
                        <ArrowDown className="size-4" />
                        Move Down
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => openEditDialog(testimonial)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={busy}
                        onClick={() => handleDelete(testimonial)}
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Delete
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {testimonial.is_visible ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                      <span>
                        {testimonial.is_visible
                          ? 'This testimonial is visible on the storefront.'
                          : 'This testimonial is hidden from buyers.'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <TestimonialForm
        key={`${editingTestimonial?.id ?? 'new'}-${formVersion}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialTestimonial={editingTestimonial}
        isSubmitting={isSubmitting}
        onSubmit={handleSave}
      />
    </>
  );
}
