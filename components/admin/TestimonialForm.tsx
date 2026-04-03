'use client';

import { Controller, useForm } from 'react-hook-form';
import { Loader2, Save, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Testimonial } from '@/lib/types';

interface TestimonialFormValues {
  customer_name: string;
  car_purchased: string;
  quote: string;
  rating: string;
  photo_url: string;
  is_visible: boolean;
}

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTestimonial?: Testimonial | null;
  isSubmitting: boolean;
  onSubmit: (data: Partial<Testimonial>) => Promise<void> | void;
}

function getDefaultValues(
  testimonial?: Testimonial | null
): TestimonialFormValues {
  return {
    customer_name: testimonial?.customer_name ?? '',
    car_purchased: testimonial?.car_purchased ?? '',
    quote: testimonial?.quote ?? '',
    rating: testimonial?.rating ? String(testimonial.rating) : '',
    photo_url: testimonial?.photo_url ?? '',
    is_visible: testimonial?.is_visible ?? true,
  };
}

export function TestimonialForm({
  open,
  onOpenChange,
  initialTestimonial,
  isSubmitting,
  onSubmit,
}: TestimonialFormProps) {
  const form = useForm<TestimonialFormValues>({
    defaultValues: getDefaultValues(initialTestimonial),
  });

  const isEdit = Boolean(initialTestimonial);

  async function handleSubmit(values: TestimonialFormValues) {
    if (!values.customer_name.trim()) {
      form.setError('customer_name', {
        type: 'required',
        message: 'Customer name is required.',
      });
      return;
    }

    if (!values.quote.trim()) {
      form.setError('quote', {
        type: 'required',
        message: 'Quote is required.',
      });
      return;
    }

    const parsedRating = values.rating ? Number(values.rating) : null;
    if (
      parsedRating !== null &&
      (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5)
    ) {
      form.setError('rating', {
        type: 'validate',
        message: 'Rating must be between 1 and 5.',
      });
      return;
    }

    await onSubmit({
      customer_name: values.customer_name.trim(),
      car_purchased: values.car_purchased.trim() || null,
      quote: values.quote.trim(),
      rating: parsedRating,
      photo_url: values.photo_url.trim() || null,
      is_visible: values.is_visible,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100dvh] max-w-none rounded-none p-0 lg:h-auto lg:max-w-xl lg:rounded-xl lg:p-4">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-5 pt-6 lg:px-0 lg:pt-0">
            <DialogTitle>
              {isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
            <DialogDescription>
              Update the testimonial copy, visibility, and sort placement from
              the testimonials grid.
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 lg:px-0 lg:py-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    placeholder="Juan Dela Cruz"
                    aria-invalid={!!form.formState.errors.customer_name}
                    {...form.register('customer_name')}
                  />
                  {form.formState.errors.customer_name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.customer_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="car_purchased">Car Purchased</Label>
                  <Input
                    id="car_purchased"
                    placeholder="2021 Toyota Fortuner"
                    aria-invalid={!!form.formState.errors.car_purchased}
                    {...form.register('car_purchased')}
                  />
                  {form.formState.errors.car_purchased && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.car_purchased.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quote">Quote</Label>
                <Textarea
                  id="quote"
                  rows={6}
                  placeholder="Share the customer's experience with the dealership."
                  aria-invalid={!!form.formState.errors.quote}
                  {...form.register('quote')}
                />
                {form.formState.errors.quote && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.quote.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rating">Rating</Label>
                  <div className="relative">
                    <Star className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="rating"
                      type="number"
                      min={1}
                      max={5}
                      placeholder="5"
                      className="pl-9"
                      aria-invalid={!!form.formState.errors.rating}
                      {...form.register('rating')}
                    />
                  </div>
                  {form.formState.errors.rating && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.rating.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="photo_url">Photo URL</Label>
                  <Input
                    id="photo_url"
                    placeholder="https://example.com/customer.jpg"
                    aria-invalid={!!form.formState.errors.photo_url}
                    {...form.register('photo_url')}
                  />
                  {form.formState.errors.photo_url && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.photo_url.message}
                    </p>
                  )}
                </div>
              </div>

              <Controller
                control={form.control}
                name="is_visible"
                render={({ field }) => (
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="is_visible">Visible on storefront</Label>
                        <p className="text-sm text-muted-foreground">
                          Turn this off to keep the testimonial in admin only.
                        </p>
                      </div>
                      <Switch
                        id="is_visible"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}
              />
            </div>

            <DialogFooter className="mx-0 mb-0 rounded-none px-5 py-4 lg:-mx-4 lg:-mb-4 lg:rounded-b-xl">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isEdit ? 'Save Changes' : 'Add Testimonial'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
