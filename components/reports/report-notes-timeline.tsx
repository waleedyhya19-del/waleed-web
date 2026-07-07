'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { ReportNote } from '@/lib/api/types';
import type { Locale } from '@/lib/i18n/routing';
import { fmtRelative } from '@/lib/utils/format';
import { statusKey } from '@/lib/i18n/enums';
import { Badge } from '@/components/ui/badge';

export function ReportNotesTimeline({ notes }: { notes: ReportNote[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  return (
    <div className="surface-card p-6">
      <div className="mb-4 text-sm font-medium">{t('reports.notes.title')}</div>
      {notes.length === 0 ? (
        <div className="text-sm text-muted-foreground">{t('reports.notes.empty')}</div>
      ) : (
        <ol className="space-y-4 border-s border-border ps-4">
          {notes.map((n) => (
            <li key={n.id} className="relative">
              <span className="absolute -start-[9px] top-2 h-2 w-2 rounded-full bg-accent" />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{n.authorDisplayName}</span>
                <Badge variant={n.action === 'ACCEPTED' ? 'success' : 'destructive'}>
                  {t(`noteAction.${n.action}`)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {t(statusKey(n.statusFrom))} → {t(statusKey(n.statusTo))}
                </span>
                <span className="ms-auto text-xs text-muted-foreground">
                  {fmtRelative(n.createdAt, locale)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm">{n.noteText}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
