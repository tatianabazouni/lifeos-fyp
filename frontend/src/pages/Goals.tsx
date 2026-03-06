import { useEffect, useMemo, useState } from 'react';
import { Award, Check, Pencil, Trash2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { GoalCard } from '@/components/ContentCards';
import { GoalProgressBar, LifeTimeline } from '@/components/InteractiveComponents';
import { PrimaryButton } from '@/components/AppButtons';
import { Input } from '@/components/ui/input';
import { lifeData } from '@/lib/lifeData';

interface Goal {
  id: string;
  title: string;
  category: string;
  milestones: { id: string; text: string; done: boolean }[];
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const stored = lifeData.getGoals();
    if (stored.length) return stored;
    return [
      { id: '1', title: 'Build emotional consistency', category: 'Wellbeing', milestones: [{ id: 'm1', text: 'Journal 5x/week', done: true }, { id: 'm2', text: 'Sleep before 12am', done: false }] },
      { id: '2', title: 'Ship startup alpha', category: 'Startup', milestones: [{ id: 'm3', text: 'Finish onboarding flow', done: true }, { id: 'm4', text: 'Add analytics screen', done: false }] },
    ];
  });
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');

  const progressOf = (goal: Goal) => Math.round((goal.milestones.filter((milestone) => milestone.done).length / Math.max(goal.milestones.length, 1)) * 100);
  const totalProgress = useMemo(() => Math.round(goals.reduce((sum, goal) => sum + progressOf(goal), 0) / Math.max(goals.length, 1)), [goals]);
  const chartData = goals.map((goal) => ({ name: goal.title.split(' ').slice(0, 2).join(' '), progress: progressOf(goal) }));
  const achievements = goals.filter((goal) => progressOf(goal) === 100);

  useEffect(() => {
    if (!lifeData.getGoals().length && goals.length) {
      lifeData.setGoals(goals);
    }
  }, []);

  const createGoal = () => {
    if (!title.trim()) return;
    setGoals((prev) => {
      const next = [...prev, { id: crypto.randomUUID(), title, category, milestones: [{ id: crypto.randomUUID(), text: 'Define first milestone', done: false }] }];
      lifeData.setGoals(next);
      return next;
    });
    setTitle('');
  };

  const deleteGoal = (id: string) => setGoals((prev) => { const next = prev.filter((goal) => goal.id !== id); lifeData.setGoals(next); return next; });
  const addMilestone = (goalId: string) => {
    const text = prompt('Milestone');
    if (!text) return;
    setGoals((prev) => { const next = prev.map((goal) => goal.id === goalId ? { ...goal, milestones: [...goal.milestones, { id: crypto.randomUUID(), text, done: false }] } : goal); lifeData.setGoals(next); return next; });
  };
  const toggleMilestone = (goalId: string, milestoneId: string) => setGoals((prev) => { const next = prev.map((goal) => goal.id === goalId ? { ...goal, milestones: goal.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, done: !milestone.done } : milestone) } : goal); lifeData.setGoals(next); return next; });
  const editTitle = (goalId: string) => {
    const value = prompt('Edit goal title');
    if (!value) return;
    setGoals((prev) => { const next = prev.map((goal) => goal.id === goalId ? { ...goal, title: value } : goal); lifeData.setGoals(next); return next; });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Goals" subtitle="Build meaningful growth through milestones, progress visibility, and achievement signals." />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Create goal">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Goal title" className="mb-3" />
          <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" className="mb-3" />
          <PrimaryButton onClick={createGoal}>Create goal</PrimaryButton>
        </SectionContainer>

        <SectionContainer title="Progress overview">
          <GoalProgressBar value={totalProgress} />
          <p className="mt-2 text-sm text-muted-foreground">Total completion: {totalProgress}%</p>
          <div className="mt-4 rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">Achievement indicators</p>
            <div className="space-y-1 text-sm">
              {achievements.length ? achievements.map((goal) => <p key={goal.id} className="flex items-center gap-2 text-success"><Award className="h-4 w-4" />{goal.title}</p>) : <p className="text-muted-foreground">No completed goals yet.</p>}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Goal timeline">
          <LifeTimeline items={[{ year: 'Week 1', title: 'Intention set', detail: 'Selected goals that align with identity, not urgency.' }, { year: 'Week 2', title: 'Milestones defined', detail: 'Broke goals into actionable checkpoints.' }, { year: 'Week 3', title: 'Execution rhythm', detail: 'Focused on consistent weekly review.' }]} />
        </SectionContainer>
      </div>

      <SectionContainer title="Goal progress graph">
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="progress" stroke="#C5005E" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </SectionContainer>

      <SectionContainer title="Active goals">
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border p-4">
              <GoalCard title={goal.title} category={goal.category} progress={progressOf(goal)} />
              <div className="mt-3 space-y-2">
                {goal.milestones.map((milestone) => (
                  <label key={milestone.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={milestone.done} onChange={() => toggleMilestone(goal.id, milestone.id)} />
                    <span className={milestone.done ? 'line-through text-muted-foreground' : ''}>{milestone.text}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-md border px-2 py-1 text-xs" onClick={() => addMilestone(goal.id)}><Check className="mr-1 inline h-3 w-3" />Add milestone</button>
                <button className="rounded-md border px-2 py-1 text-xs" onClick={() => editTitle(goal.id)}><Pencil className="mr-1 inline h-3 w-3" />Edit</button>
                <button className="rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive" onClick={() => deleteGoal(goal.id)}><Trash2 className="mr-1 inline h-3 w-3" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>
    </div>
  );
}
