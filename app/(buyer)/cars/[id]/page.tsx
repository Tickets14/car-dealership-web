import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CarDetailPage from '@/components/buyer/CarDetailPage';
import { BUSINESS_NAME } from '@/lib/constants';
import {
  buildVehicleJsonLd,
  createCarMetadata,
  createPageMetadata,
} from '@/lib/seo';
import { fetchPublicCar } from '@/lib/server/public-cars';

interface CarDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CarDetailRouteProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const car = await fetchPublicCar(id);

    if (!car) {
      return createPageMetadata({
        title: `Car Not Found | ${BUSINESS_NAME}`,
        description: 'The vehicle you are looking for is no longer available.',
        path: `/cars/${id}`,
        noIndex: true,
      });
    }

    return createCarMetadata(car);
  } catch {
    return createPageMetadata({
      title: `Car Details | ${BUSINESS_NAME}`,
      description:
        'View vehicle photos, specifications, pricing, and financing details.',
      path: `/cars/${id}`,
    });
  }
}

export default async function Page({ params }: CarDetailRouteProps) {
  const { id } = await params;
  const car = await fetchPublicCar(id);

  if (!car) {
    notFound();
  }

  const vehicleJsonLd = JSON.stringify(buildVehicleJsonLd(car)).replace(
    /</g,
    '\\u003c'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: vehicleJsonLd }}
      />
      <CarDetailPage id={id} />
    </>
  );
}
