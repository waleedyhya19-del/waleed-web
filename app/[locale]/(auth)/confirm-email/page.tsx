import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { ConfirmEmailForm } from '@/components/auth/confirm-email-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ConfirmEmailPage() {
  const t = await getTranslations();

  return (
    <Card className="surface-card w-full max-w-lg border-0 shadow-none">
      <CardHeader className="border-b border-border/60 pb-5">
        <p className="section-kicker">{t('auth.confirmEmail')}</p>
        <CardTitle className="mt-3 text-3xl">
          {t('auth.confirmEmailTitle')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm leading-7">
          {t('auth.confirmEmailDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Suspense>
          <ConfirmEmailForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
