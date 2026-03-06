import { useMemo, useState } from 'react';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { GoalCard } from '@/components/ContentCards';
import { GoalProgressBar, LifeTimeline } from '@/components/InteractiveComponents';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/AppButtons';

interface Goal { id: string; title: string; category: string; progress: number }

export default function Goals() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Improve emotional resilience', category: 'Wellbeing', progress: 65 },
    { id: '2', title: 'Launch beta to 50 users', category: 'Startup', progress: 40 },
  ]);

  const completion = useMemo(() => Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length), [goals]);

  const addGoal = () => {
    if (!title) return;
    setGoals((prev) => [...prev, { id: crypto.randomUUID(), title, category, progress: 0 }]);
    setTitle('');
  };

  const bump = (id: string) => setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress: Math.min(g.progress + 10, 100) } : g)));
  const remove = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));

  return (
    <div className="space-y-6">
      <PageHeader title="Goals" subtitle="Turn intention into milestones, and milestones into identity." />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Create goal">
          <Input placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="mb-3" />
          <PrimaryButton onClick={addGoal}>Add Goal</PrimaryButton>
        </SectionContainer>
        <SectionContainer title="Overall growth">
          <GoalProgressBar value={Number.isFinite(completion) ? completion : 0} />
          <p className="mt-2 text-sm text-muted-foreground">{Number.isFinite(completion) ? completion : 0}% total completion across all active goals.</p>
        </SectionContainer>
        <SectionContainer title="Goal timeline">
          <LifeTimeline items={[{ year: 'Q1', title: 'Set focus', detail: 'Defined three guiding priorities.' }, { year: 'Q2', title: 'Execution', detail: 'Built consistent weekly cadence.' }, { year: 'Q3', title: 'Refinement', detail: 'Removing goals that no longer align.' }]} />
        </SectionContainer>
      </div>

      <SectionContainer title="Active goals">
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id}>
              <GoalCard title={goal.title} category={goal.category} progress={goal.progress} />
              <div className="mt-2 flex gap-2">
                <button onClick={() => bump(goal.id)} className="rounded-md border px-2 py-1 text-xs">Update +10%</button>
                <button onClick={() => remove(goal.id)} className="rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>
    </div>
  );
}
