'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import type { CarPhoto, PhotoCategory } from '@/lib/types';

const CATEGORIES: { label: string; value: PhotoCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Exterior', value: 'exterior' },
  { label: 'Interior', value: 'interior' },
  { label: 'Engine', value: 'engine' },
  { label: 'Documents', value: 'documents' },
] as const;

interface PhotoGalleryProps {
  photos: CarPhoto[];
  alt: string;
}

export function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | 'all'>(
    'all'
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  const filtered =
    activeCategory === 'all'
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  const currentPhoto = filtered[selectedIndex] ?? filtered[0];
  const availableCategories = CATEGORIES.filter(
    (category) =>
      category.value === 'all' ||
      photos.some((photo) => photo.category === category.value)
  );

  const goTo = useCallback(
    (direction: 1 | -1) => {
      setSelectedIndex((index) => {
        const next = index + direction;
        if (next < 0) {
          return filtered.length - 1;
        }
        if (next >= filtered.length) {
          return 0;
        }
        return next;
      });
    },
    [filtered.length]
  );

  useEffect(() => {
    if (lightboxOpen) {
      lightboxRef.current?.focus();
    }
  }, [lightboxOpen]);

  function handleCategoryChange(category: PhotoCategory | 'all') {
    setActiveCategory(category);
    setSelectedIndex(0);
  }

  function handleTouchStart(event: React.TouchEvent) {
    setTouchStart(event.touches[0].clientX);
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStart === null) {
      return;
    }

    const difference = touchStart - event.changedTouches[0].clientX;

    if (Math.abs(difference) > 50) {
      goTo(difference > 0 ? 1 : -1);
    }

    setTouchStart(null);
  }

  if (photos.length === 0) {
    return (
      <div className="-mx-4 flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground sm:mx-0 sm:rounded-xl">
        No photos available
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {availableCategories.length > 2 && (
          <div
            className="flex gap-1.5 overflow-x-auto pb-1 print:hidden"
            role="toolbar"
            aria-label="Photo categories"
          >
            {availableCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleCategoryChange(category.value)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  activeCategory === category.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                )}
                aria-pressed={activeCategory === category.value}
                aria-label={`Show ${category.label.toLowerCase()} photos`}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        <div
          className="group relative -mx-4 aspect-[4/3] overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:mx-0 sm:rounded-xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-label={`${alt} gallery`}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              goTo(-1);
            }

            if (event.key === 'ArrowRight') {
              event.preventDefault();
              goTo(1);
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setLightboxOpen(true);
            }
          }}
        >
          {currentPhoto && (
            <OptimizedImage
              src={currentPhoto.url}
              alt={currentPhoto.alt_text || alt}
              fill
              className="object-cover"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) calc(100vw - 3rem), 60vw"
              loading="eager"
            />
          )}

          {filtered.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/55 text-white hover:bg-black/70 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 print:hidden"
                onClick={() => goTo(-1)}
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/55 text-white hover:bg-black/70 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 print:hidden"
                onClick={() => goTo(1)}
                aria-label="Next photo"
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute bottom-2 right-2 bg-black/55 text-white hover:bg-black/70 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 print:hidden"
            onClick={() => setLightboxOpen(true)}
            aria-label="Open fullscreen gallery"
          >
            <Expand className="size-4" />
          </Button>

          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white print:hidden">
            {selectedIndex + 1} / {filtered.length}
          </span>
        </div>

        {filtered.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1 print:hidden"
            role="list"
            aria-label="Gallery thumbnails"
          >
            {filtered.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'relative shrink-0 size-16 overflow-hidden rounded-lg ring-2 transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  index === selectedIndex
                    ? 'ring-primary-600'
                    : 'ring-transparent hover:ring-primary-300'
                )}
                aria-label={`View photo ${index + 1}`}
                aria-current={index === selectedIndex}
              >
                <OptimizedImage
                  src={photo.url}
                  alt={photo.alt_text || `${alt} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-[100dvh] max-w-none rounded-none border-0 bg-black/95 p-0 text-white sm:h-[100dvh]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{alt} photo viewer</DialogTitle>
          </DialogHeader>

          <div
            ref={lightboxRef}
            className="relative flex h-full w-full items-center justify-center outline-none"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goTo(-1);
              }

              if (event.key === 'ArrowRight') {
                event.preventDefault();
                goTo(1);
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 text-white hover:bg-white/10"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close fullscreen gallery"
            >
              <X className="size-6" />
            </Button>

            {filtered.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/10"
                  onClick={() => goTo(-1)}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-8" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/10"
                  onClick={() => goTo(1)}
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-8" />
                </Button>
              </>
            )}

            <div className="relative h-[80vh] w-[90vw] max-w-5xl">
              {currentPhoto && (
                <OptimizedImage
                  src={currentPhoto.url}
                  alt={currentPhoto.alt_text || alt}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              )}
            </div>

            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-3 py-1 text-sm text-white">
              {selectedIndex + 1} / {filtered.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
