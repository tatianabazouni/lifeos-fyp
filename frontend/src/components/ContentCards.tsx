import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function InsightCard({ title, insight }: { title: string; insight: string }) {
  return <article className="rounded-xl border bg-card p-4"><h3 className="mb-1 font-medium">{title}</h3><p className="text-sm text-muted-foreground">{insight}</p></article>;
}

export function GoalCard({ title, progress, category }: { title: string; progress: number; category: string }) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between"><h3 className="font-medium">{title}</h3><span className="text-xs text-muted-foreground">{category}</span></div>
      <Progress value={progress} className="h-2" />
      <p className="mt-2 text-xs text-muted-foreground">{progress}% complete</p>
    </article>
  );
}

export function JournalCard({ title, excerpt, mood, date }: { title: string; excerpt: string; mood: string; date: string }) {
  return <article className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{date} • {mood}</p><h3 className="mt-1 font-medium">{title}</h3><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{excerpt}</p></article>;
}

export function MemoryCard({ title, date, description }: { title: string; date: string; description: string }) {
  return <article className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{date}</p><h3 className="mt-1 font-medium">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{description}</p></article>;
}

export function ConnectionCard({ name, type, note }: { name: string; type: string; note: string }) {
  return <article className="rounded-xl border bg-card p-4"><h3 className="font-medium">{name}</h3><p className="text-xs text-primary">{type}</p><p className="mt-2 text-sm text-muted-foreground">{note}</p></article>;
}

export function AIInsightCard({ title, content, className }: { title: string; content: string; className?: string }) {
  return <article className={cn('rounded-xl border border-primary/20 bg-primary/5 p-4', className)}><h3 className="mb-1 font-medium text-primary">{title}</h3><p className="text-sm text-foreground/85">{content}</p></article>;
}
