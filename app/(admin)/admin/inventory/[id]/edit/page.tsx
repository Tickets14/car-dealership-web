import { CarForm } from '@/components/admin/CarForm';

export const metadata = {
  title: 'Edit Listing',
};

interface EditCarPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCarPage({ params }: EditCarPageProps) {
  const { id } = await params;

  return <CarForm mode="edit" carId={id} />;
}
