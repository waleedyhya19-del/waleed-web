'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { announcementsApi } from '@/lib/api/endpoints';
import { Link } from '@/lib/i18n/routing';
import { useSessionStore } from '@/stores/session-store';
import { fmtRelative } from '@/lib/utils/format';
import type { Locale } from '@/lib/i18n/routing';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

export function AnnouncementsAdmin() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const role = useSessionStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN';
  const state = useAsyncResource(() => announcementsApi.list({ take: 50 }), []);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

  const remove = async (id: string) => {
    try {
      await announcementsApi.remove(id);
      toast.success(t('common.delete'));
      state.refresh();
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('announcements.listTitle')}
        actions={
          isAdmin && (
            <Button asChild>
              <Link href="/staff/announcements/new">
                <Plus className="h-4 w-4" />
                {t('announcements.createTitle')}
              </Link>
            </Button>
          )
        }
      />
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
        empty={isEmpty}
        emptyChildren={<EmptyState title={t('announcements.empty')} />}
      >
        <div className="space-y-3">
          {state.data?.data.map((a) => (
            <div key={a.id} className="surface-card flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  {!a.isActive && <Badge variant="secondary">{t('common.no')}</Badge>}
                </div>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{a.body}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {fmtRelative(a.createdAt, locale)}
                </div>
              </div>
              {isAdmin && (
                <Button size="icon" variant="ghost" onClick={() => remove(a.id)} aria-label={t('common.delete')}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
