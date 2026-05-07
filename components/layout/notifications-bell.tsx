'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationsStore } from '@/stores/notifications-store';
import { Link, useRouter } from '@/i18n/routing';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

export function NotificationsBell() {
  const t = useTranslations();
  const router = useRouter();
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const [open, setOpen] = useState(false);

  useRealtimeNotifications();

  const handleNotificationClick = (reportId: string) => {
    setOpen(false);
    markAllRead();
    router.push(`/reports/${reportId}`);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden rounded-2xl border-border/70 bg-background/70 md:inline-flex relative"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -end-1 size-4 rounded-full p-0 text-[10px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t('shell.notifications')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-semibold">{t('shell.notifications')}</p>
          {unreadCount > 0 && (
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => markAllRead()}
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t('notifications.empty')}
            </p>
          ) : (
            notifications.slice(0, 20).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 px-2 py-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification.reportId)}
              >
                <p className="text-sm font-medium">{notification.actionSummary}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <div className="border-t px-2 py-2">
          <Link
            href="/reports"
            className="block text-center text-sm text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            {t('notifications.seeAll')}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}