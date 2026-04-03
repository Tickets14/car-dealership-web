'use client';

import Image, { type ImageProps } from 'next/image';
import {
  IMAGE_BLUR_DATA_URL,
  resolveMediaUrl,
  shouldBypassImageOptimization,
} from '@/lib/image-utils';

type OptimizedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

export function OptimizedImage({
  src,
  alt,
  placeholder,
  blurDataURL,
  unoptimized,
  ...props
}: OptimizedImageProps) {
  const resolvedSrc = resolveMediaUrl(src);
  const bypassOptimization = shouldBypassImageOptimization(resolvedSrc);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      placeholder={placeholder ?? 'blur'}
      blurDataURL={blurDataURL ?? IMAGE_BLUR_DATA_URL}
      unoptimized={unoptimized ?? bypassOptimization}
    />
  );
}
