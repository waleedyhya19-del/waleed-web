import { getTranslations } from 'next-intl/server';

import { ResendConfirmationForm } from '@/components/auth/resend-confirmation-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/routing';

export default async function ResendConfirmationPage() {
  const t = await getTranslations();

  return (
    <Card className="surface-card w-full max-w-lg border-0 shadow-none">
      <CardHeader className="border-b border-border/60 pb-5">
        <p className="section-kicker">{t('auth.resendConfirmation')}</p>
        <CardTitle className="mt-3 text-3xl">
          {t('auth.resendConfirmationTitle')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm leading-7">
          {t('auth.resendConfirmationDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <ResendConfirmationForm />
        <div className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            {t('common.back')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
