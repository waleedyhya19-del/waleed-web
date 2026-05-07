'use client';

import { RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { PlatformSettingsSection } from '@/components/settings/platform-settings-section';
import { ProfileForm } from '@/components/settings/profile-form';
import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { usersApi } from '@/lib/api/users';

export function SettingsPageContent() {
  const t = useTranslations();
  const { data, error, refresh } = useAsyncResource(
    async () => usersApi.getMe(),
    [],
    {
      fallbackMessage: t('settings.loadError'),
      cacheKey: 'settings:me',
      staleTimeMs: 60_000,
    }
  );

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.settings')}
          title={t('settings.title')}
          description={t('settings.pageDescription')}
          actions={
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => void refresh()}
            >
              <RefreshCcw className="size-4" />
              {t('common.refresh')}
            </Button>
          }
        />
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        {error ? (
          <RequestErrorState
            error={error}
            title={t('common.error')}
            fallbackMessage={t('settings.loadError')}
            action={
              <Button type="button" className="rounded-2xl" onClick={() => void refresh()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : data ? (
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
            <ProfileForm user={data} />
            <ChangePasswordForm />
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="h-80 animate-pulse rounded-[1.75rem] bg-slate-200/70 dark:bg-slate-800/60" />
            <div className="h-80 animate-pulse rounded-[1.75rem] bg-slate-200/60 dark:bg-slate-800/50" />
          </div>
        )}
      </ScrollReveal>

      <ScrollReveal delay={0.12}>
        <PlatformSettingsSection />
      </ScrollReveal>
    </div>
  );
}
