import { CarForm } from '@/components/admin/CarForm';

export const metadata = {
  title: 'Add New Listing',
};

interface NewCarPageProps {
  searchParams: Promise<{
    from_submission?: string | string[];
  }>;
}

export default async function NewCarPage({ searchParams }: NewCarPageProps) {
  const resolvedSearchParams = await searchParams;
  const fromSubmission = Array.isArray(resolvedSearchParams.from_submission)
    ? resolvedSearchParams.from_submission[0]
    : resolvedSearchParams.from_submission;

  return <CarForm mode="create" fromSubmission={fromSubmission ?? null} />;
}
