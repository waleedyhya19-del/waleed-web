'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { reportsApi } from '@/lib/api/endpoints';
import type { Report } from '@/lib/api/types';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

export function ReportAssignmentPanel({
  report,
  onUpdated,
}: {
  report: Report;
  onUpdated: () => void;
}) {
  const t = useTranslations();
  const [assignedToId, setAssignedToId] = useState(report.assignedToId ?? '');
  const [submitting, setSubmitting] = useState(false);

  const setAssignment = async (value: string | null) => {
    setSubmitting(true);
    try {
      await reportsApi.assign(report.id, { assignedToId: value });
      toast.success(t('common.update'));
      onUpdated();
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="surface-card space-y-3 p-5">
      <div className="text-sm font-medium">{t('reports.assignment.title')}</div>
      <div className="text-xs text-muted-foreground">
        {report.assignedUserName
          ? t('reports.assignment.assignedTo', { name: report.assignedUserName })
          : t('reports.assignment.unassigned')}
      </div>
      <Input
        placeholder="user UUID"
        value={assignedToId}
        onChange={(e) => setAssignedToId(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!assignedToId || submitting}
          onClick={() => setAssignment(assignedToId)}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {report.assignedToId ? t('reports.assignment.reassign') : t('reports.assignment.assign')}
        </Button>
        {report.assignedToId && (
          <Button size="sm" variant="outline" disabled={submitting} onClick={() => setAssignment(null)}>
            {t('reports.assignment.clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
