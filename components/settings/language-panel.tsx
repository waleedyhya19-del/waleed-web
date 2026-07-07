'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usersApi } from '@/lib/api/endpoints';
import { useSessionStore } from '@/stores/session-store';
import { Language } from '@/lib/api/types';
import { useRouter, usePathname, type Locale } from '@/lib/i18n/routing';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

export function LanguagePanel() {
  const t = useTranslations();
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const locale = useLocale() as Locale;
  const [value, setValue] = useState<Language>(user?.preferredLanguage ?? 'AR');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const onSave = async () => {
    setSubmitting(true);
    try {
      const updated = await usersApi.updateMe({ preferredLanguage: value });
      setUser(updated);
      const next: Locale = value === 'AR' ? 'ar' : 'en';
      if (next !== locale) router.replace(pathname, { locale: next });
      toast.success(t('settings.language.updated'));
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label>{t('common.language')}</Label>
        <Select value={value} onValueChange={(v) => setValue(v as Language)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AR">{t('language.AR')}</SelectItem>
            <SelectItem value="EN">{t('language.EN')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSave} disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {t('common.save')}
      </Button>
    </div>
  );
}
