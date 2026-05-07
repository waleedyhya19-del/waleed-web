'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User as UserIcon } from 'lucide-react';

import { useAssignableUsers } from '@/hooks/use-assignable-users';
import { ReportCategory } from '@/lib/api/types';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox';

interface AssigneeComboboxProps {
  currentAssigneeId: string | null;
  reportCategory?: ReportCategory;
  onAssign: (assigneeId: string) => Promise<void>;
  onSuccess?: () => void;
}

export function AssigneeCombobox({
  currentAssigneeId,
  reportCategory,
  onAssign,
  onSuccess,
}: AssigneeComboboxProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const { assignableUsers } = useAssignableUsers(reportCategory);

  const selectedUser = assignableUsers?.find((u) => u.id === currentAssigneeId);

  const handleSelect = async (userId: string) => {
    setIsAssigning(true);
    try {
      await onAssign(userId);
      onSuccess?.();
    } finally {
      setIsAssigning(false);
      setIsOpen(false);
    }
  };

  return (
    <Combobox
      value={currentAssigneeId ?? ''}
      onValueChange={(value) => {
        if (value && value !== currentAssigneeId) {
          handleSelect(value);
        }
      }}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <ComboboxTrigger className="h-9 rounded-xl border px-3 text-sm" disabled={isAssigning}>
        <ComboboxValue placeholder={selectedUser ? selectedUser.displayName : t('reports.assignTo')} />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="" onSelect={() => { if (currentAssigneeId) handleSelect(''); }}>
            {t('reports.unassign')}
          </ComboboxItem>
          <ComboboxLabel>{t('reports.selectAssignee')}</ComboboxLabel>
          {(assignableUsers || []).map((user) => (
            <ComboboxItem
              key={user.id}
              value={user.id}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="size-4" />
                <span>{user.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  ({t(`roles.${user.role.toLowerCase()}`)})
                </span>
              </div>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}