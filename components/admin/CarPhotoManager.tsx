'use client';

import Image from 'next/image';
import { ImagePlus, MoveDown, MoveUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ExistingCarPhotoItem {
  id: string;
  url: string;
  alt_text?: string | null;
  sort_order?: number;
}

export interface PendingCarPhotoItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface CarPhotoManagerProps {
  existingPhotos: ExistingCarPhotoItem[];
  newPhotos: PendingCarPhotoItem[];
  onAddPhotos: (files: FileList | null) => void;
  onRemoveExisting: (photoId: string) => void;
  onMoveExisting: (photoId: string, direction: 'up' | 'down') => void;
  onRemoveNew: (photoId: string) => void;
}

export function CarPhotoManager({
  existingPhotos,
  newPhotos,
  onAddPhotos,
  onRemoveExisting,
  onMoveExisting,
  onRemoveNew,
}: CarPhotoManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-dashed bg-muted/25 p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <ImagePlus className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Upload Car Photos</p>
              <p className="text-sm text-muted-foreground">
                Add one or more photos for the listing.
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(event) => onAddPhotos(event.target.files)}
            />
          </label>
        </div>

        {existingPhotos.length > 0 && (
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Existing Photos</h3>
              <p className="text-sm text-muted-foreground">
                Reorder or remove photos already attached to this car.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {existingPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border bg-card"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      src={photo.url}
                      alt={photo.alt_text ?? `Car photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="text-sm font-medium">Photo {index + 1}</p>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0}
                        onClick={() => onMoveExisting(photo.id, 'up')}
                      >
                        <MoveUp className="size-4" />
                        <span className="sr-only">Move photo up</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === existingPhotos.length - 1}
                        onClick={() => onMoveExisting(photo.id, 'down')}
                      >
                        <MoveDown className="size-4" />
                        <span className="sr-only">Move photo down</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemoveExisting(photo.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete photo</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {newPhotos.length > 0 && (
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Pending Uploads</h3>
              <p className="text-sm text-muted-foreground">
                These files will upload when you save the listing.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {newPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border bg-card"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      src={photo.previewUrl}
                      alt={photo.file.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {photo.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onRemoveNew(photo.id)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove pending photo</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
