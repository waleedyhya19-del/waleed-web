'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridOptions,
  type RowClickedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { dirOf, type Locale } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';

// Register community features once (tree-shakeable module system, v33+).
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Signal-themed ag-grid theme. Values reference our CSS tokens via `var()`,
 * so the grid follows light/dark and the theme toggle with no extra work.
 */
const signalTheme = themeQuartz.withParams({
  accentColor: 'var(--brand)',
  backgroundColor: 'var(--card)',
  foregroundColor: 'var(--card-foreground)',
  borderColor: 'color-mix(in oklab, var(--border) 90%, transparent)',
  chromeBackgroundColor: 'var(--muted)',
  headerBackgroundColor: 'color-mix(in oklab, var(--muted) 60%, var(--card))',
  headerTextColor: 'var(--muted-foreground)',
  headerFontWeight: 600,
  oddRowBackgroundColor: 'transparent',
  rowHoverColor: 'color-mix(in oklab, var(--brand) 9%, transparent)',
  selectedRowBackgroundColor: 'color-mix(in oklab, var(--brand) 16%, transparent)',
  columnBorder: false,
  wrapperBorder: false,
  fontFamily: 'inherit',
  fontSize: 14,
  headerFontSize: 12,
  rowBorder: true,
  borderRadius: 'var(--radius)',
  wrapperBorderRadius: 'var(--radius)',
  cellHorizontalPadding: 16,
  headerHeight: 44,
  rowHeight: 52,
});

export interface DataGridProps<T> {
  rowData: T[] | undefined;
  columnDefs: ColDef<T>[];
  loading?: boolean;
  onRowClicked?: (row: T) => void;
  getRowId?: GridOptions<T>['getRowId'];
  /** Rows per page. Set 0 to disable pagination. */
  pageSize?: number;
  /** Fixed pixel height; omit for a responsive dashboard height. */
  height?: number | string;
  className?: string;
  emptyText?: string;
}

export function DataGrid<T>({
  rowData,
  columnDefs,
  loading = false,
  onRowClicked,
  getRowId,
  pageSize = 20,
  height,
  className,
  emptyText = 'No results',
}: DataGridProps<T>) {
  const locale = useLocale() as Locale;
  const rtl = dirOf(locale) === 'rtl';

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      flex: 1,
      minWidth: 120,
      cellClass: 'flex items-center',
    }),
    [],
  );

  return (
    <div
      className={cn('w-full', className)}
      style={{ height: height ?? 'clamp(420px, calc(100vh - 300px), 760px)' }}
    >
      <AgGridReact<T>
        theme={signalTheme}
        rowData={rowData ?? []}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        enableRtl={rtl}
        loading={loading}
        getRowId={getRowId}
        animateRows
        pagination={pageSize > 0}
        paginationPageSize={pageSize}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        suppressCellFocus
        rowClass={onRowClicked ? 'cursor-pointer' : undefined}
        onRowClicked={
          onRowClicked
            ? (e: RowClickedEvent<T>) => e.data && onRowClicked(e.data)
            : undefined
        }
        overlayNoRowsTemplate={`<span class="text-sm text-muted-foreground">${emptyText}</span>`}
      />
    </div>
  );
}
