import type { Metadata } from 'next';
import { BUSINESS_NAME } from '@/lib/constants';
import { resolveMediaUrl } from '@/lib/image-utils';
import type { CarStatus, CarWithPhotos } from '@/lib/types';

const DEFAULT_SITE_URL = 'http://localhost:3000';
const DEFAULT_API_URL = 'http://localhost:5000/api';
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

function normalizeBaseUrl(rawUrl: string | undefined, fallback: string) {
  const trimmed = rawUrl?.trim();

  if (!trimmed) {
    return fallback;
  }

  const withProtocol = ABSOLUTE_URL_PATTERN.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

export function getSiteUrl() {
  return normalizeBaseUrl(
    process.env.SITE_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      process.env.VERCEL_URL,
    DEFAULT_SITE_URL
  );
}

export function getApiUrl() {
  return normalizeBaseUrl(
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL,
    DEFAULT_API_URL
  );
}

export function toAbsoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${getSiteUrl()}/`).toString();
}

export function getAbsoluteImageUrl(src: string | null | undefined) {
  if (!src) {
    return null;
  }

  const resolved = resolveMediaUrl(src);

  if (!resolved) {
    return null;
  }

  if (resolved.startsWith('//')) {
    return `https:${resolved}`;
  }

  if (ABSOLUTE_URL_PATTERN.test(resolved)) {
    return resolved;
  }

  return toAbsoluteUrl(resolved);
}

export function getCarDisplayName(
  car: Pick<CarWithPhotos, 'year' | 'make' | 'model' | 'variant'>
) {
  return [car.year, car.make, car.model, car.variant].filter(Boolean).join(' ');
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(mileage: number, unit: string) {
  return `${new Intl.NumberFormat('en').format(mileage)} ${unit}`;
}

function capitalizeWords(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function mapAvailability(status: CarStatus) {
  switch (status) {
    case 'available':
      return 'https://schema.org/InStock';
    case 'reserved':
      return 'https://schema.org/PreOrder';
    case 'sold':
      return 'https://schema.org/SoldOut';
    default:
      return 'https://schema.org/LimitedAvailability';
  }
}

function mapConditionToSchema(condition: CarWithPhotos['condition_rating']) {
  if (condition === 'excellent' || condition === 'good') {
    return 'https://schema.org/UsedCondition';
  }

  if (condition === 'fair' || condition === 'project') {
    return 'https://schema.org/DamagedCondition';
  }

  return undefined;
}

export function getCarSeoDescription(car: CarWithPhotos) {
  if (car.description?.trim()) {
    return car.description.trim();
  }

  const specs = [
    formatMileage(car.mileage, car.mileage_unit),
    capitalizeWords(car.transmission),
    capitalizeWords(car.fuel_type),
    capitalizeWords(car.condition_rating),
  ];

  return `${getCarDisplayName(car)} for sale at ${BUSINESS_NAME}. ${specs.join(
    ' | '
  )}. Cash price ${formatPrice(car.price_cash)}.`;
}

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: PageMetadataOptions): Metadata {
  const pageUrl = toAbsoluteUrl(path);
  const resolvedImage = getAbsoluteImageUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: BUSINESS_NAME,
      type: 'website',
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
    },
    twitter: {
      card: resolvedImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

export function createCarMetadata(car: CarWithPhotos): Metadata {
  const title = `${getCarDisplayName(car)} | ${BUSINESS_NAME}`;
  const description = getCarSeoDescription(car);
  const primaryImage = getAbsoluteImageUrl(car.photos[0]?.url);

  return createPageMetadata({
    title,
    description,
    path: `/cars/${car.id}`,
    image: primaryImage,
  });
}

export function buildVehicleJsonLd(car: CarWithPhotos) {
  const title = getCarDisplayName(car);
  const url = toAbsoluteUrl(`/cars/${car.id}`);
  const images = car.photos
    .map((photo) => getAbsoluteImageUrl(photo.url))
    .filter((image): image is string => Boolean(image));

  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: title,
    description: getCarSeoDescription(car),
    sku: car.stock_number,
    image: images.length > 0 ? images : undefined,
    brand: {
      '@type': 'Brand',
      name: car.make,
    },
    model: car.model,
    vehicleConfiguration: car.variant ?? undefined,
    vehicleModelDate: String(car.year),
    color: car.color ?? undefined,
    bodyType: car.body_type ? capitalizeWords(car.body_type) : undefined,
    fuelType: capitalizeWords(car.fuel_type),
    vehicleTransmission: capitalizeWords(car.transmission),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: car.mileage,
      unitText: car.mileage_unit,
    },
    numberOfSeats: car.seats ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PHP',
      price: car.price_cash,
      availability: mapAvailability(car.status),
      itemCondition: mapConditionToSchema(car.condition_rating),
      url,
      seller: {
        '@type': 'AutoDealer',
        name: BUSINESS_NAME,
      },
    },
  };
}
