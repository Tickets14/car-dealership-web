'use client';

import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowRight,
  CarFront,
  ClipboardList,
  Clock3,
  Inbox,
  LayoutDashboard,
  MessageSquareMore,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { MetricsCard } from '@/components/admin/MetricsCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminNotifications,
  useDashboard,
  type DashboardActivity,
  type DashboardData,
} from '@/lib/hooks/use-admin';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdminDashboardPageProps {
  generatedAt: string;
}

interface ActivityFeedItem {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  unread: boolean;
  kind?: string | null;
}

const QUICK_ACTIONS = [
  {
    href: '/admin/inventory/new',
    title: 'Add New Listing',
    description: 'Create a fresh inventory entry and publish it when ready.',
    icon: Plus,
    tone: 'bg-primary-50 text-primary-600',
  },
  {
    href: '/admin/submissions',
    title: 'View Submissions',
    description: 'Review seller submissions and move qualified cars into inventory.',
    icon: ClipboardList,
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    href: '/admin/inbox',
    title: 'View Inbox',
    description: 'Reply to inquiries, update status, and keep leads moving.',
    icon: Inbox,
    tone: 'bg-emerald-50 text-emerald-600',
  },
] as const;

function getGreeting(isoDate: string) {
  const hour = new Date(isoDate).getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getMetricValue(
  dashboard: DashboardData | undefined,
  keys: Array<keyof DashboardData>,
  fallback = 0
) {
  for (const key of keys) {
    const value = dashboard?.[key];
    if (typeof value === 'number') {
      return value;
    }
  }

  return fallback;
}

function normalizeActivity(
  notifications: Notification[],
  recentActivity: DashboardActivity[] | undefined
) {
  if (notifications.length > 0) {
    return notifications.map<ActivityFeedItem>((item) => ({
      id: item.id,
      title: item.title,
      description: item.message,
      createdAt: item.created_at,
      unread: !item.is_read,
      kind: item.type,
    }));
  }

  return (recentActivity ?? []).map<ActivityFeedItem>((item) => ({
    id: item.id,
    title: item.message,
    description: item.type,
    createdAt: item.createdAt,
    unread: false,
    kind: item.type,
  }));
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="space-y-4 px-6 py-6 sm:px-8">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-10 w-64 bg-white/20" />
          <Skeleton className="h-5 w-80 max-w-full bg-white/15" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="gap-3">
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminDashboardPage({
  generatedAt,
}: AdminDashboardPageProps) {
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
  } = useDashboard();
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
  } = useAdminNotifications();

  const activityFeed = normalizeActivity(
    notifications,
    dashboard?.recentActivity
  ).slice(0, 8);

  const metrics = [
    {
      title: 'Active Listings',
      value: getMetricValue(dashboard, ['activeListings', 'availableCars', 'totalCars']),
      icon: <LayoutDashboard className="size-5" />,
    },
    {
      title: 'Pending Submissions',
      value: getMetricValue(dashboard, ['pendingSubmissions']),
      icon: <ClipboardList className="size-5" />,
    },
    {
      title: 'New Inquiries Today',
      value: getMetricValue(dashboard, ['newInquiriesToday', 'unreadInquiries']),
      icon: <MessageSquareMore className="size-5" />,
    },
    {
      title: 'Reserved Cars',
      value: getMetricValue(dashboard, ['reservedCars']),
      icon: <CarFront className="size-5" />,
    },
    {
      title: 'Sold This Month',
      value: getMetricValue(dashboard, ['soldThisMonth', 'soldCars']),
      icon: <TrendingUp className="size-5" />,
    },
  ] as const;

  if (dashboardLoading && !dashboard) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Sparkles className="size-4 text-amber-300" />
                <span>{getGreeting(generatedAt)}</span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Here&apos;s what needs attention today.
                </h2>
                <p className="mt-1 text-sm text-white/70 sm:text-base">
                  {format(new Date(generatedAt), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                Dashboard Snapshot
              </p>
              <p className="mt-1 text-sm text-white/80">
                Inventory, submissions, inquiries, and activity in one place.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {dashboardError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="px-6 py-6">
            <p className="font-medium text-destructive">
              Failed to load dashboard metrics.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Refresh the page or verify the admin dashboard endpoint response.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <MetricsCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              className="shadow-sm"
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump directly into the workflows that move inventory and leads.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;

              return (
                <div
                  key={action.href}
                  className="rounded-2xl border bg-muted/20 p-4 transition-colors hover:bg-muted/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-2xl',
                        action.tone
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <ArrowRight className="mt-1 size-4 text-muted-foreground" />
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4 w-full justify-between"
                    render={<Link href={action.href} />}
                  >
                    Open
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest notifications and updates from across the admin panel.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {notificationsLoading && activityFeed.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/20 px-5 py-10 text-center">
                <Clock3 className="mx-auto size-8 text-muted-foreground/70" />
                <p className="mt-3 font-medium">No recent activity yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New notifications and dashboard events will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-2xl border px-4 py-3 transition-colors',
                      item.unread
                        ? 'border-primary-200 bg-primary-50/60'
                        : 'bg-muted/15'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {item.unread && (
                            <span className="size-2 rounded-full bg-primary-600" />
                          )}
                          <p className="font-medium">{item.title}</p>
                        </div>

                        {item.description && (
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        )}

                        {item.kind && (
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            {String(item.kind).replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
