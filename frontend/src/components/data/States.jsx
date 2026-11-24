import { AlertTriangle, Inbox } from 'lucide-react';
import { ApiError } from '@/services/apiClient';
import { Button } from '@/components/ui/primitives';

export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-1 ring-primary/10">{icon ?? <Inbox className="size-5" />}</div>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Error panel. 404s are phrased neutrally so the UI never confirms that another tenant's record exists. */
export function ErrorState({ error, onRetry }) {
  const notFound = error instanceof ApiError && error.status === 404;
  const message = error instanceof ApiError ? error.message : 'Something went wrong while loading this page.';
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-destructive-soft text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <p className="font-medium">{notFound ? 'Not found' : 'Unable to load'}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{notFound ? 'This item does not exist or you do not have access to it.' : message}</p>
      {onRetry && !notFound && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
