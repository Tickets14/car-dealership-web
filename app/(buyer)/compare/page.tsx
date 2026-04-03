import type { Metadata } from 'next';
import CompareCarsPage from '@/components/buyer/CompareCarsPage';
import { BUSINESS_NAME } from '@/lib/constants';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: `Compare Cars | ${BUSINESS_NAME}`,
  description:
    'Compare selected vehicles side by side to review pricing, specs, and features before you decide.',
  path: '/compare',
  noIndex: true,
});

export default function Page() {
  return <CompareCarsPage />;
}
