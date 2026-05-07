'use client';

import { startTransition, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

import { errorToast, successToast } from '@/components/shared/error-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Language } from '@/lib/api/types';
import { usersApi } from '@/lib/api/users';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

interface LanguageSwitcherProps {
  currentLanguage?: Language;
}

export function LanguageSwitcher({ currentLanguage = Language.AR }: LanguageSwitcherProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const { user, setUser } = useCurrentUser();
  const [language, setLanguage] = useState(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (newLanguage: Language) => {
    const previousLanguage = language;
    setLanguage(newLanguage);

    try {
      setIsSaving(true);
      await usersApi.updateMe({ preferredLanguage: newLanguage });
      if (user) {
        setUser({
          ...user,
          preferredLanguage: newLanguage,
        });
        invalidateResourceCacheByPrefix(`users:detail:${user.id}`);
        invalidateResourceCacheByPrefix(`moderators:detail:${user.id}`);
      }
      invalidateResourceCache('settings:me');
      invalidateResourceCache('dashboard:overview');
      successToast(t('updateSuccess'));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setLanguage(previousLanguage);
      errorToast({
        error,
        fallbackMessage: t('loadError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Select
      value={language}
      onValueChange={(value) => handleChange(value as Language)}
      disabled={isSaving}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={Language.AR}>{t('arabic')}</SelectItem>
        <SelectItem value={Language.EN}>{t('english')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
