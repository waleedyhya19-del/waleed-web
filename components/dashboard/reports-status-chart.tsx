'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyReportPoint } from '@/lib/dashboard';
import { formatDate } from '@/lib/formatters';

function ChartLoadingState() {
  return (
    <div className="h-[280px] animate-pulse rounded-[1.5rem] bg-slate-200/70 dark:bg-slate-800/60" />
  );
}

const ApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <ChartLoadingState />,
});

interface ReportsStatusChartProps {
  trend: DailyReportPoint[];
}

export function ReportsStatusChart({ trend }: ReportsStatusChartProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const categories = useMemo(
    () =>
      trend.map((point) =>
        formatDate(point.date, locale, {
          month: 'short',
          day: 'numeric',
        })
      ),
    [locale, trend]
  );
  const series = useMemo(
    () => [
      {
        name: t('dashboard.dailyReports'),
        data: trend.map((point) => point.total),
      },
    ],
    [t, trend]
  );
  const options = useMemo(
    () => ({
      chart: {
        fontFamily: 'var(--font-sans)',
        toolbar: { show: false },
        sparkline: { enabled: false },
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth' as const,
        width: 3,
      },
      fill: {
        type: 'gradient' as const,
        gradient: {
          shadeIntensity: 0,
          opacityFrom: 0.45,
          opacityTo: 0.06,
          stops: [0, 85, 100],
        },
      },
      colors: ['#0f766e'],
      grid: {
        borderColor: 'rgba(15, 23, 42, 0.08)',
        strokeDashArray: 4,
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '11px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '11px',
          },
        },
      },
      tooltip: {
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
      },
      legend: { show: false },
    }),
    [categories, resolvedTheme]
  );

  return (
    <Card className="surface-card border-0 shadow-none">
      <CardHeader className="gap-3">
        <CardTitle>{t('dashboard.activityTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.activityDescription')}
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <ApexChart
          type="area"
          height={280}
          series={series}
          options={options}
        />
      </CardContent>
    </Card>
  );
}
