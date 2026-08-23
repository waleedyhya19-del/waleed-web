'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { usersApi } from '@/lib/api/endpoints';
import { useSessionStore } from '@/stores/session-store';
import { useRouter } from '@/lib/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { languageKey, roleKey } from '@/lib/i18n/enums';
import type { Locale } from '@/lib/i18n/routing';
import { fmtDateTime } from '@/lib/utils/format';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

export function UserDetailView({ id }: { id: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const role = useSessionStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN';
  const router = useRouter();
  const state = useAsyncResource(() => usersApi.getById(id), [id]);

  const remove = async () => {
    try {
      await usersApi.deleteById(id);
      toast.success(t('common.delete'));
      router.replace('/staff/users');
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('users.detailTitle')}
        actions={
          isAdmin && (
            <Button variant="outline" onClick={remove}>
              <Trash2 className="h-4 w-4 text-destructive" />
              {t('common.delete')}
            </Button>
          )
        }
      />
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
      >
        {state.data && (
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={state.data.profilePhotoUrl ?? undefined} alt={state.data.displayName} />
                <AvatarFallback>{state.data.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{state.data.displayName}</h2>
                  <Badge variant="outline">{t(roleKey(state.data.role))}</Badge>
                  {state.data.isEmailVerified && (
                    <Badge variant="success">{t('users.fields.isEmailVerified')}</Badge>
                  )}
                </div>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <Field label={t('common.email')} value={state.data.email} />
              <Field label={t('common.phone')} value={state.data.phone} />
              <Field
                label={t('common.language')}
                value={state.data.preferredLanguage ? t(languageKey(state.data.preferredLanguage)) : '—'}
              />
              <Field label={t('users.fields.createdAt')} value={fmtDateTime(state.data.createdAt, locale)} />
              <Field label={t('users.fields.hasPassword')} value={state.data.hasPassword ? t('common.yes') : t('common.no')} />
            </dl>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ?? '—'}</dd>
    </div>
  );
}
