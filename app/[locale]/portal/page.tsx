'use client';

import { useTranslations } from 'next-intl';
import { FileText, Megaphone, Search } from 'lucide-react';
import { useSessionStore } from '@/stores/session-store';
import { PageHeader } from '@/components/shared/page-header';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';

export default function PortalHome() {
  const t = useTranslations();
  const user = useSessionStore((s) => s.user);
  return (
    <div>
      <PageHeader
        title={t('portal.greeting', { name: user?.displayName ?? '' })}
        description={t('portal.welcome')}
        actions={
          <Button asChild>
            <Link href="/portal/reports/new">{t('portal.newReportCta')}</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/portal/reports', key: 'nav.myReports', icon: FileText },
          { href: '/portal/serial-lookup', key: 'nav.serialLookup', icon: Search },
          { href: '/portal/announcements', key: 'nav.announcements', icon: Megaphone },
        ].map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="surface-card flex items-center gap-3 p-5 transition-colors hover:border-accent/50"
          >
            <div className="rounded-md bg-muted p-2 text-muted-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium">{t(key)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
