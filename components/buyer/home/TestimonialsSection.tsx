'use client';

import Image from 'next/image';
import { Star, User } from 'lucide-react';
import { useTestimonials } from '@/lib/hooks/use-testimonials';
import { Skeleton } from '@/components/ui/skeleton';

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useTestimonials();
  const testimonialList = testimonials ?? [];

  if (!isLoading && testimonialList.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-muted-foreground">
            Real stories from real buyers
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-card p-6 ring-1 ring-border space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            : testimonialList.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl bg-card p-6 ring-1 ring-border"
                >
                  <div className="flex items-center gap-3">
                    {t.photo_url ? (
                      <Image
                        src={t.photo_url}
                        alt={t.customer_name}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                        <User className="size-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {t.customer_name}
                      </p>
                      {t.car_purchased && (
                        <p className="text-xs text-muted-foreground">
                          {t.car_purchased}
                        </p>
                      )}
                    </div>
                  </div>

                  {t.rating && (
                    <div className="mt-3 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < t.rating!
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <blockquote className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
