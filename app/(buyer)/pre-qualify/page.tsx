import type { Metadata } from 'next';
import { PreQualifyForm } from '@/components/buyer/PreQualifyForm';
import { BUSINESS_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Pre-Qualify | ${BUSINESS_NAME}`,
  description:
    'Check your financing eligibility in minutes. Submit your details and our team will contact you within 24 hours.',
  openGraph: {
    title: `Pre-Qualify | ${BUSINESS_NAME}`,
    description:
      'Submit your financing details online and hear back from our team within 24 hours.',
    type: 'website',
  },
};

export default function PreQualifyPage() {
  return <PreQualifyForm />;
}
