'use client';

import { useTranslations } from 'next-intl';
import { ShieldAlert } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
  const t = useTranslations();
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 text-lg font-semibold">{t('auth.accessDeniedTitle')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('auth.accessDeniedDescription')}
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">{t('common.signIn')}</Link>
        </Button>
      </div>
    </div>
  );
}
