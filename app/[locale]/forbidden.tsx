import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-lg border-0 p-8 text-center">
        <p className="section-kicker">403</p>
        <h1 className="mt-3 text-4xl font-semibold">
          {t('errors.forbidden')}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {t('errors.forbiddenDesc')}
        </p>
        <Link href="/" className="mt-6 inline-flex">
          <Button className="rounded-2xl">{t('common.goHome')}</Button>
        </Link>
      </div>
    </div>
  );
}
