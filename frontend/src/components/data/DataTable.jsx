import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Skeleton } from '@/components/ui/primitives';
import { EmptyState, ErrorState } from './States';

/**
 * Generic table with loading skeleton, error and empty states, row click and server-side pagination.
 *
 * @param {{
 *   columns: { key: string, header: React.ReactNode, cell: (row: any) => React.ReactNode, className?: string }[],
 *   rows?: { id: string }[], loading?: boolean, error?: unknown, onRetry?: () => void, empty?: React.ReactNode,
 *   onRowClick?: (row: any) => void, page?: number, totalPages?: number, total?: number, onPageChange?: (p: number) => void
 * }} props
 */
export function DataTable({ columns, rows, loading, error, onRetry, empty, onRowClick, page, totalPages, total, onPageChange }) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/70 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn('px-4 py-2.5 font-medium', c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <Skeleton className={cn('h-4', c.key === columns[0]?.key ? 'w-28' : 'w-full max-w-40')} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              rows?.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn('border-b last:border-0 transition-colors hover:bg-accent/50', onRowClick && 'cursor-pointer focus-visible:bg-accent')}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && rows && rows.length === 0 && (empty ?? <EmptyState title="Nothing here yet" />)}
      {!loading && onPageChange && page && totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span className="tabular">
            Page {page} of {totalPages}
            {total !== undefined && ` · ${total} records`}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
              <ChevronLeft /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
              Next <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
