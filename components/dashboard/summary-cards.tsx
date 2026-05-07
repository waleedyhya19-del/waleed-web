'use client';

import { Activity, ShieldAlert, Sparkles, UsersRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { ReportStatus } from '@/lib/api/types';
import { formatNumber } from '@/lib/formatters';

interface SummaryCardsProps {
  reportsByStatus: Record<ReportStatus, number>;
  totalUsers: number;
  totalModerators: number;
  openReports: number;
  escalatedReports: number;
  solvedRate: number;
}

export function SummaryCards({
  reportsByStatus,
  totalUsers,
  totalModerators,
  openReports,
  escalatedReports,
  solvedRate,
}: SummaryCardsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const totalReports = Object.values(reportsByStatus).reduce(
    (sum, value) => sum + value,
    0
  );

  const cards = [
    {
      title: t('dashboard.totalReports'),
      value: formatNumber(totalReports, locale),
      detail: t('dashboard.openReportsLabel', {
        count: formatNumber(openReports, locale),
      }),
      href: '/reports',
      icon: Activity,
      className:
        'bg-[linear-gradient(160deg,rgba(14,116,144,0.95),rgba(8,145,178,0.82))] text-white',
    },
    {
      title: t('dashboard.totalUsers'),
      value: formatNumber(totalUsers, locale),
      detail: t('dashboard.moderatorsLabel', {
        count: formatNumber(totalModerators, locale),
      }),
      href: '/users',
      icon: UsersRound,
      className:
        'bg-[linear-gradient(160deg,rgba(15,23,42,0.94),rgba(30,64,175,0.76))] text-white',
    },
    {
      title: t('dashboard.escalatedReports'),
      value: formatNumber(escalatedReports, locale),
      detail: t('dashboard.escalationHint'),
      href: '/reports',
      icon: ShieldAlert,
      className:
        'bg-[linear-gradient(160deg,rgba(194,65,12,0.96),rgba(251,146,60,0.80))] text-white',
    },
    {
      title: t('dashboard.solvedRate'),
      value: `${formatNumber(solvedRate, locale)}%`,
      detail: t('dashboard.resolveHint'),
      href: '/reports',
      icon: Sparkles,
      className:
        'bg-[linear-gradient(160deg,rgba(20,83,45,0.96),rgba(16,185,129,0.78))] text-white',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.title}
            href={card.href}
            className={`group overflow-hidden rounded-[1.75rem] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1 ${card.className}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/72">{card.title}</p>
                <p className="mt-4 text-3xl font-semibold">{card.value}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/14">
                <Icon className="size-5" />
              </div>
            </div>
            <p className="mt-6 text-sm text-white/78">{card.detail}</p>
          </Link>
        );
      })}
    </div>
  );
}
