'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/shared/empty-state';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchValue?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  loading?: boolean;
  mobileCard?: (item: T) => React.ReactNode;
  toolbar?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string;
}

function DataTableLoadingState({ columns }: { columns: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-[1.5rem] bg-slate-200/70 dark:bg-slate-800/60"
        />
      ))}
      <div className="hidden overflow-hidden rounded-[1.5rem] border border-border/70 lg:block">
        <div className="h-14 animate-pulse bg-slate-200/80 dark:bg-slate-800/70" />
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid h-16 animate-pulse border-t border-border/60 bg-white/60 dark:bg-slate-950/50"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          />
        ))}
      </div>
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchValue,
  searchPlaceholder,
  onSearch,
  loading,
  mobileCard,
  toolbar,
  emptyStateTitle,
  emptyStateDescription,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId = (row) => row.id,
}: DataTableProps<T>) {
  const t = useTranslations();

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = data.map(getRowId);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  const isAllSelected =
    selectable &&
    data.length > 0 &&
    data.every((row) => selectedIds.includes(getRowId(row)));

  const isSomeSelected =
    selectable &&
    !isAllSelected &&
    data.some((row) => selectedIds.includes(getRowId(row)));

  return (
    <div className="space-y-4">
      {(onSearch || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {onSearch ? (
            <InputGroup className="h-12 rounded-2xl border-border/70 bg-background/75 px-1 shadow-sm sm:max-w-sm">
              <InputGroupAddon align="inline-start">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                value={searchValue ?? ''}
                placeholder={searchPlaceholder || t('common.search')}
                onChange={(event) => onSearch(event.target.value)}
              />
            </InputGroup>
          ) : (
            <div />
          )}
          {toolbar}
        </div>
      )}

      {loading ? (
        <DataTableLoadingState columns={columns.length} />
      ) : data.length === 0 ? (
        <EmptyState
          title={emptyStateTitle || t('common.noResults')}
          description={emptyStateDescription || t('common.noData')}
        />
      ) : (
        <>
          <div className="grid gap-3 lg:hidden">
            {data.map((item) =>
              mobileCard ? (
                <div key={item.id}>{mobileCard(item)}</div>
              ) : (
                <div key={item.id} className="surface-card-muted rounded-[1.5rem] p-4">
                  <div className="grid gap-3">
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className="flex items-start justify-between gap-3"
                      >
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {column.header}
                        </span>
                        <span className="max-w-[60%] text-end text-sm font-medium">
                          {column.cell
                            ? column.cell(item)
                            : (item[column.key as keyof T] as React.ReactNode)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="surface-card-muted hidden overflow-hidden rounded-[1.75rem] border lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border/70 bg-background/60 hover:bg-background/60">
                  {selectable && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        ref={
                          isSomeSelected
                            ? undefined
                            : null
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={column.className}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => {
                  const rowId = getRowId(item);
                  const isSelected = selectedIds.includes(rowId);

                  return (
                    <TableRow key={item.id}>
                      {selectable && (
                        <TableCell className="w-12">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectRow(rowId, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className={column.className}
                        >
                          {column.cell
                            ? column.cell(item)
                            : (item[column.key as keyof T] as React.ReactNode)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}