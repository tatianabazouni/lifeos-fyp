import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return <div className="space-y-3">{Array.from({ length: lines }).map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-muted" />)}</div>;
}

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center">
      <div className="mx-auto mb-3 w-fit text-muted-foreground">{icon ?? <Inbox className="h-8 w-8" />}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }: { title?: string; description: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="mb-2 flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> {title}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 rounded-md bg-destructive px-3 py-1.5 text-sm text-white">Retry</button>}
    </div>
  );
}

export function InlineLoading() {
  return <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading" />;
}
