'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/lib/hooks/use-auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { Loader2 } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/inventory': 'Inventory',
  '/admin/inventory/new': 'Add Car',
  '/admin/submissions': 'Submissions',
  '/admin/inbox': 'Inquiries',
  '/admin/testimonials': 'Testimonials',
  '/admin/settings': 'Settings',
};

function getTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Check edit pattern
  if (/^\/admin\/inventory\/[^/]+\/edit$/.test(pathname)) return 'Edit Car';
  if (/^\/admin\/inbox\/[^/]+$/.test(pathname)) return 'Inquiry Details';
  // Fall back to closest parent match
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path)) return title;
  }
  return 'Admin';
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const { data: session, isLoading, isError } = useSession();

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading && (isError || !session)) {
      router.replace('/admin/login');
    }
  }, [isLoading, isError, session, isLoginPage, router]);

  // Login page — render without shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Not authenticated — show nothing while redirecting
  if (!session) {
    return null;
  }

  const title = getTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar title={title} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
