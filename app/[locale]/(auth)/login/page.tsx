import { getTranslations } from 'next-intl/server';

import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <Card className="surface-card w-full max-w-lg border-0 shadow-none">
      <CardHeader className="border-b border-border/60 pb-5">
        <p className="section-kicker">{t('auth.login')}</p>
        <CardTitle className="mt-3 text-3xl">{t('auth.heroCardTitle')}</CardTitle>
        <CardDescription className="mt-2 text-sm leading-7">
          {t('auth.heroCardDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <LoginForm />
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
