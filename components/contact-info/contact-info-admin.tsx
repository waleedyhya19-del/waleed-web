'use client';

import { useTranslations } from 'next-intl';
import { Plus, Trash2, Phone, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { contactInfoApi } from '@/lib/api/endpoints';
import { Link } from '@/lib/i18n/routing';
import { useSessionStore } from '@/stores/session-store';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

export function ContactInfoAdmin() {
  const t = useTranslations();
  const role = useSessionStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN';
  const state = useAsyncResource(() => contactInfoApi.list({ take: 100 }), []);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

  const remove = async (id: string) => {
    try {
      await contactInfoApi.remove(id);
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
        title={t('contactInfo.listTitle')}
        actions={
          isAdmin && (
            <Button asChild>
              <Link href="/staff/contact-info/new">
                <Plus className="h-4 w-4" />
                {t('contactInfo.createTitle')}
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
        emptyChildren={<EmptyState title={t('contactInfo.empty')} />}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {state.data?.data.map((c) => {
            const Icon = c.type === 'PHONE' ? Phone : Link2;
            return (
              <div key={c.id} className="surface-card flex items-center gap-3 p-4">
                <div className="rounded-md bg-muted p-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.value}</div>
                </div>
                {isAdmin && (
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </QueryBoundary>
    </div>
  );
}
