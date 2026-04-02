import type { Metadata } from 'next';
import { AdminDashboardPage } from '@/components/admin/AdminDashboardPage';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default function DashboardPage() {
  return <AdminDashboardPage generatedAt={new Date().toISOString()} />;
}
