'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminNotifications,
  useMarkNotificationsRead,
} from '@/lib/hooks/use-admin';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { data: notifications = [], isLoading } = useAdminNotifications();
  const markRead = useMarkNotificationsRead();

  // Override refetchInterval on the query — we call it with 30s in the hook consumer
  // but since the hook doesn't set it, we use the query's refetchInterval option
  // Actually we need to re-call useAdminNotifications with refetchInterval;
  // let's just do that inline in the layout where we consume it.
  // For now, the hook returns whatever the default staleTime gives us.

  const unread = notifications.filter((n) => !n.is_read);
  const unreadCount = unread.length;

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    markRead.mutate(unread.map((n) => n.id));
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" />
        }
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">
          {unreadCount} unread notifications
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="flex items-center justify-between border-b p-3">
          <PopoverTitle>Notifications</PopoverTitle>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </PopoverHeader>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-xl border p-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            <ul>
              {notifications.slice(0, 10).map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'border-b px-3 py-2.5 last:border-0',
                    !n.is_read && 'bg-primary-50/50'
                  )}
                >
                  <p
                    className={cn(
                      'text-sm',
                      !n.is_read && 'font-medium'
                    )}
                  >
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {n.message}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
