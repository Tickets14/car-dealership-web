import type { Metadata } from 'next';
import SellCarPage from '@/components/buyer/SellCarPage';
import { BUSINESS_NAME } from '@/lib/constants';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: `Sell Your Car | ${BUSINESS_NAME}`,
  description:
    'Submit your vehicle details online and get a fair offer from our team. Upload photos, share the specs, and hear back quickly.',
  path: '/sell',
});

export default function Page() {
  return <SellCarPage />;
}
