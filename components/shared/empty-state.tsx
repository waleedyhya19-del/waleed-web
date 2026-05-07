'use client';

import { ReactNode } from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="surface-card-muted flex flex-col items-center justify-center rounded-[1.75rem] py-12 text-center">
      {icon || <FileX className="mb-4 size-12 text-muted-foreground/60" />}
      {title && <h3 className="mb-2 text-lg font-medium">{title}</h3>}
      {description && (
        <p className="mb-4 max-w-md text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
