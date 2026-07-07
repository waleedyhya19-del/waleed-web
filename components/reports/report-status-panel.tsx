'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { reportsApi } from '@/lib/api/endpoints';
import type { Report, ReportStatus, ResolvedWipeState } from '@/lib/api/types';
import { statusKey, wipeStateKey } from '@/lib/i18n/enums';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

const TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  RECEIVED: ['REVIEWING', 'ESCALATED', 'REJECTED'],
  REVIEWING: ['ESCALATED', 'REJECTED', 'RESOLVED'],
  ESCALATED: ['RESOLVED', 'REJECTED'],
  REJECTED: ['CLOSED', 'REVIEWING'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

const NOTE_ACTIONS = ['ACCEPTED', 'REJECTED'] as const;

export function ReportStatusPanel({
  report,
  onUpdated,
}: {
  report: Report;
  onUpdated: () => void;
}) {
  const t = useTranslations();
  const [target, setTarget] = useState<ReportStatus | ''>('');
  const [note, setNote] = useState('');
  const [noteAction, setNoteAction] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const [wipeState, setWipeState] = useState<ResolvedWipeState | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const allowedTargets = useMemo(() => TRANSITIONS[report.status] ?? [], [report.status]);
  const needsWipeState =
    target === 'RESOLVED' && (report.rewardIfDataIntact !== null || report.rewardIfWiped !== null);

  const onSubmit = async () => {
    if (!target) return;
    if (needsWipeState && !wipeState) {
      toast.error(t('reports.status.requireWipeState'));
      return;
    }
    setSubmitting(true);
    try {
      await reportsApi.updateStatus(report.id, {
        status: target,
        note: note.trim() || undefined,
        resolvedWipeState: needsWipeState ? (wipeState as ResolvedWipeState) : undefined,
      });
      toast.success(t('common.update'));
      onUpdated();
      setTarget('');
      setNote('');
      setWipeState('');
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (allowedTargets.length === 0) {
    return (
      <div className="surface-card p-5 text-sm text-muted-foreground">
        {t('reports.status.transitionTitle')} — {t('common.empty')}
      </div>
    );
  }

  return (
    <div className="surface-card space-y-3 p-5">
      <div className="text-sm font-medium">{t('reports.status.transitionTitle')}</div>
      <Select value={target} onValueChange={(v) => setTarget(v as ReportStatus)}>
        <SelectTrigger>
          <SelectValue placeholder={t('common.unknown')} />
        </SelectTrigger>
        <SelectContent>
          {allowedTargets.map((s) => (
            <SelectItem key={s} value={s}>
              {t(statusKey(s))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {needsWipeState && (
        <Select value={wipeState} onValueChange={(v) => setWipeState(v as ResolvedWipeState)}>
          <SelectTrigger>
            <SelectValue placeholder={t('reports.status.requireWipeState')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DATA_INTACT">{t(wipeStateKey('DATA_INTACT'))}</SelectItem>
            <SelectItem value="WIPED">{t(wipeStateKey('WIPED'))}</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('reports.notes.placeholder')}
      />
      {note.trim() && (
        <Select value={noteAction} onValueChange={(v) => setNoteAction(v as 'ACCEPTED' | 'REJECTED')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTE_ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {t(`noteAction.${a}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button className="w-full" disabled={!target || submitting} onClick={onSubmit}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {t('common.update')}
      </Button>
    </div>
  );
}
