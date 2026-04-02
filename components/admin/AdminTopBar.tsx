'use client';

import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { useSession, useLogout } from '@/lib/hooks/use-auth';

interface AdminTopBarProps {
  title: string;
}

export function AdminTopBar({ title }: AdminTopBarProps) {
  const { data: session } = useSession();
  const logout = useLogout();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 sm:px-6">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="gap-2" />
            }
          >
            <User className="size-4" />
            <span className="hidden sm:inline">
              {session?.user.name ?? 'Admin'}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
            <DropdownMenuLabel>
              <div>{session?.user.name ?? 'Admin'}</div>
              <div className="font-normal text-muted-foreground">
                {session?.user.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
