'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfilePanel } from './profile-panel';
import { ChangePasswordPanel } from './change-password-panel';
import { LanguagePanel } from './language-panel';
import { PlatformSettingsPanel } from './platform-settings-panel';
import { useSessionStore } from '@/stores/session-store';

export function SettingsTabs() {
  const t = useTranslations();
  const role = useSessionStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN';

  return (
    <div>
      <PageHeader title={t('settings.title')} />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="password">{t('settings.tabs.password')}</TabsTrigger>
          <TabsTrigger value="language">{t('settings.tabs.language')}</TabsTrigger>
          {isAdmin && <TabsTrigger value="platform">{t('settings.tabs.platform')}</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile">
          <ProfilePanel />
        </TabsContent>
        <TabsContent value="password">
          <ChangePasswordPanel />
        </TabsContent>
        <TabsContent value="language">
          <LanguagePanel />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="platform">
            <PlatformSettingsPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
