'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CarPhoto, PhotoCategory } from '@/lib/types';

const CATEGORIES: { label: string; value: PhotoCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Exterior', value: 'exterior' },
  { label: 'Interior', value: 'interior' },
  { label: 'Engine', value: 'engine' },
  { label: 'Documents', value: 'documents' },
];

interface PhotoGalleryProps {
  photos: CarPhoto[];
  alt: string;
}

export function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const filtered =
    activeCategory === 'all'
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const currentPhoto = filtered[selectedIndex] ?? filtered[0];

  // Filter out categories with no photos
  const availableCategories = CATEGORIES.filter(
    (cat) =>
      cat.value === 'all' || photos.some((p) => p.category === cat.value)
  );

  const goTo = useCallback(
    (dir: 1 | -1) => {
      setSelectedIndex((i) => {
        const next = i + dir;
        if (next < 0) return filtered.length - 1;
        if (next >= filtered.length) return 0;
        return next;
      });
    },
    [filtered.length]
  );

  const handleCategoryChange = (cat: PhotoCategory | 'all') => {
    setActiveCategory(cat);
    setSelectedIndex(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? 1 : -1);
    }
    setTouchStart(null);
  };

  if (photos.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        No photos available
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Category filter tabs */}
        {availableCategories.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {availableCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  activeCategory === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentPhoto && (
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.alt_text || alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          )}

          {/* Nav arrows */}
          {filtered.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => goTo(-1)}
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => goTo(1)}
                aria-label="Next photo"
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute bottom-2 right-2 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setLightboxOpen(true)}
            aria-label="View fullscreen"
          >
            <Expand className="size-4" />
          </Button>

          {/* Counter */}
          <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
            {selectedIndex + 1} / {filtered.length}
          </span>
        </div>

        {/* Thumbnail strip */}
        {filtered.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filtered.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  'relative shrink-0 size-16 rounded-lg overflow-hidden ring-2 transition-all',
                  i === selectedIndex
                    ? 'ring-primary-600'
                    : 'ring-transparent hover:ring-primary-300'
                )}
                aria-label={`View photo ${i + 1}`}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt_text || `${alt} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="size-6" />
          </Button>

          {filtered.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(-1);
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(1);
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="size-8" />
              </Button>
            </>
          )}

          <div
            className="relative h-[80vh] w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {currentPhoto && (
              <Image
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
      )}
    </>
  );
}
