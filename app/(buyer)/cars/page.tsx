import type { Metadata } from 'next';
import { Suspense } from 'react';
import CarsBrowsePage from '@/components/buyer/CarsBrowsePage';
import { BUSINESS_NAME } from '@/lib/constants';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: `Browse Cars | ${BUSINESS_NAME}`,
  description:
    'Browse quality pre-owned cars by make, price, body type, and financing needs. Compare listings and find your next vehicle.',
  path: '/cars',
});

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CarsBrowsePage />
    </Suspense>
  );
}
