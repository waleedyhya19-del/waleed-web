import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <h1 className="text-lg font-semibold">{t('errors.notFound')}</h1>
        <Button asChild className="mt-4">
          <Link href="/">{t('common.back')}</Link>
        </Button>
      </div>
    </div>
  );
}
