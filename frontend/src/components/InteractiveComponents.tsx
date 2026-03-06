import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function EmotionTag({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={cn('rounded-full border px-3 py-1 text-xs transition', active ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted')}>{label}</button>;
}

export function GoalProgressBar({ value }: { value: number }) {
  return <Progress value={value} className="h-2" aria-label={`Goal progress ${value}%`} />;
}

export function LifeTimeline({ items }: { items: { year: string; title: string; detail: string }[] }) {
  return (
    <ol className="space-y-4 border-l pl-4">
      {items.map((item) => <li key={item.year + item.title}><p className="text-xs text-primary">{item.year}</p><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.detail}</p></li>)}
    </ol>
  );
}

export function ReflectionPrompt({ prompt, onUse }: { prompt: string; onUse?: () => void }) {
  return <button onClick={onUse} className="w-full rounded-xl border border-primary/20 bg-primary/5 p-3 text-left text-sm hover:bg-primary/10">{prompt}</button>;
}
