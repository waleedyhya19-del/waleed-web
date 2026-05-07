import { getTranslations } from 'next-intl/server';

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

export default async function ForgotPasswordPage() {
  const t = await getTranslations();

  return (
    <Card className="surface-card w-full max-w-lg border-0 shadow-none">
      <CardHeader className="border-b border-border/60 pb-5">
        <p className="section-kicker">{t('auth.resetPassword')}</p>
        <CardTitle className="mt-3 text-3xl">{t('auth.forgotPasswordTitle')}</CardTitle>
        <CardDescription className="mt-2 text-sm leading-7">
          {t('auth.forgotPasswordDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <ForgotPasswordForm />
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('common.back')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
