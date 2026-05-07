'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAssignableUsers } from '@/hooks/use-assignable-users';
import { reportsApi } from '@/lib/api/reports';
import { ReportCategory } from '@/lib/api/types';
import { invalidateResourceCache } from '@/stores/resource-cache-store';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BulkActionsBarProps {
  selectedIds: string[];
  reportCategory?: ReportCategory;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedIds,
  reportCategory,
  onClearSelection,
}: BulkActionsBarProps) {
  const t = useTranslations();
  const [assigneeId, setAssigneeId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { assignableUsers } = useAssignableUsers(reportCategory);

  const selectedAssignee = assignableUsers?.find((m) => m.id === assigneeId);

  const handleAssign = async () => {
    if (!assigneeId) return;
    setIsLoading(true);
    try {
      await reportsApi.bulkAssign(selectedIds, assigneeId);
      invalidateResourceCache('reports:list');
      successToast(t('reports.bulkAssignSuccess'));
      onClearSelection();
      setAssigneeId('');
    } catch (error) {
      errorToast({ error, fallbackMessage: t('errors.serverError') });
    } finally {
      setIsLoading(false);
      setConfirmOpen(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-border/70 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-6">
        <span className="text-sm font-medium text-muted-foreground">
          {t('reports.reportsSelected', { count: selectedIds.length })}
        </span>

        <div className="flex items-center gap-2">
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger className="h-9 w-48 rounded-xl">
              <SelectValue placeholder={t('reports.assignTo')} />
            </SelectTrigger>
            <SelectContent>
              {(assignableUsers || []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            className="rounded-xl"
            disabled={!assigneeId || isLoading}
            onClick={() => setConfirmOpen(true)}
          >
            {t('reports.bulkAssign')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={onClearSelection}
          >
            {t('reports.clearSelection')}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('reports.bulkAssign')}
        description={t('reports.confirmBulkAssign', {
          count: selectedIds.length,
          assignee: selectedAssignee?.displayName ?? '',
        })}
        onConfirm={handleAssign}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
