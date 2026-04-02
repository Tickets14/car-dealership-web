import { AdminInquiryDetailPage } from '@/components/admin/AdminInquiryDetailPage';

export const metadata = {
  title: 'Inquiry Detail',
};

interface MessageDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MessageDetailPage({
  params,
}: MessageDetailPageProps) {
  const { id } = await params;

  return <AdminInquiryDetailPage inquiryId={id} />;
}
