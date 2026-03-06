import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Rocket, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { AIInsightCard, JournalCard, MemoryCard } from '@/components/ContentCards';
import { PrimaryButton, SecondaryButton } from '@/components/AppButtons';
import { GoalProgressBar, ReflectionPrompt } from '@/components/InteractiveComponents';
import { Input } from '@/components/ui/input';
import { lifeData, type GoalItemData, type JournalEntryData, type MemoryEntryData } from '@/lib/lifeData';

const animations = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } },
};

const weather = { city: 'San Francisco', temp: 24, icon: '☀️' };

export default function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalItemData[]>([]);
  const [journals, setJournals] = useState<JournalEntryData[]>([]);
  const [memories, setMemories] = useState<MemoryEntryData[]>([]);
  const [quickJournal, setQuickJournal] = useState('');

  const syncData = () => {
    setGoals(lifeData.getGoals());
    setJournals(lifeData.getJournalEntries());
    setMemories(lifeData.getMemories());
  };

  useEffect(() => {
    syncData();
    const handler = () => syncData();
    window.addEventListener('lifeos:data-updated', handler as EventListener);
    return () => window.removeEventListener('lifeos:data-updated', handler as EventListener);
  }, []);

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayMoment = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening';

  const progressByGoal = useMemo(
    () => goals.map((goal) => ({
      ...goal,
      percent: Math.round((goal.milestones.filter((milestone) => milestone.done).length / Math.max(goal.milestones.length, 1)) * 100),
      done: goal.milestones.filter((milestone) => milestone.done).length,
      total: goal.milestones.length,
    })),
    [goals],
  );

  const monthlyProgress = useMemo(() => {
    if (!progressByGoal.length) return 0;
    return Math.round(progressByGoal.reduce((sum, goal) => sum + goal.percent, 0) / progressByGoal.length);
  }, [progressByGoal]);

  const todayTimeline = useMemo(() => {
    const checkpoints = progressByGoal.flatMap((goal) =>
      goal.milestones.slice(0, 2).map((milestone, index) => ({
        id: `${goal.id}-${milestone.id}`,
        time: `${8 + index * 2}:00`,
        title: milestone.text,
        subtitle: goal.title,
        done: milestone.done,
      })),
    );
    return checkpoints.slice(0, 6);
  }, [progressByGoal]);

  const topTasks = useMemo(
    () =>
      progressByGoal
        .flatMap((goal) => goal.milestones.filter((milestone) => !milestone.done).map((milestone) => ({
          id: milestone.id,
          task: milestone.text,
          goal: goal.title,
          priority: goal.percent < 40 ? 'High' : goal.percent < 75 ? 'Medium' : 'Low',
        })))
        .slice(0, 3),
    [progressByGoal],
  );

  const saveQuickJournal = () => {
    if (!quickJournal.trim()) return;
    const entry: JournalEntryData = {
      id: crypto.randomUUID(),
      title: 'Quick capture',
      content: quickJournal.trim(),
      mood: 'Reflective',
      tags: ['quick-capture'],
      date: new Date().toLocaleDateString(),
    };
    lifeData.setJournalEntries([entry, ...lifeData.getJournalEntries()]);
    setQuickJournal('');
  };

  return (
    <motion.div variants={animations.container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={animations.item}>
        <PageHeader
          title={`Good ${dayMoment}, ${user?.name?.split(' ')[0] ?? 'there'}`}
          subtitle="Your dashboard is now generated from your goals, journals, and memory inputs across the app."
        />
      </motion.div>

      <motion.div variants={animations.item} className="grid gap-4 md:grid-cols-3">
        <SectionContainer>
          <p className="caption-text">Current Time</p>
          <p className="text-4xl font-semibold">{time}</p>
        </SectionContainer>
        <SectionContainer>
          <p className="caption-text">Weather</p>
          <p className="flex items-end gap-2 text-4xl font-semibold"><span>{weather.icon}</span>{weather.temp}°C</p>
          <p className="text-sm text-muted-foreground">{weather.city}</p>
        </SectionContainer>
        <SectionContainer>
          <div className="mb-2 flex items-center justify-between">
            <p className="caption-text">Monthly Progress</p>
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          <GoalProgressBar value={monthlyProgress} />
          <p className="mt-2 text-sm font-medium">{monthlyProgress}%</p>
        </SectionContainer>
      </motion.div>

      <motion.div variants={animations.item} className="grid gap-6 lg:grid-cols-2">
        <SectionContainer title="Today" description="Generated from your current milestone checklist.">
          <div className="space-y-3">
            {todayTimeline.length ? todayTimeline.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                {item.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /> : <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                <div className="min-w-12 text-sm text-muted-foreground">{item.time}</div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No timeline entries yet. Add milestones in Goals.</p>}
          </div>
        </SectionContainer>

        <SectionContainer title="Goals" description="Live progress pulled from Goals page.">
          <div className="space-y-4">
            {progressByGoal.length ? progressByGoal.slice(0, 3).map((goal) => (
              <div key={goal.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-muted-foreground">{goal.percent}% • {goal.done}/{goal.total}</p>
                </div>
                <GoalProgressBar value={goal.percent} />
              </div>
            )) : <p className="text-sm text-muted-foreground">Create goals to see progress.</p>}
          </div>
        </SectionContainer>
      </motion.div>

      <motion.div variants={animations.item} className="grid gap-6 lg:grid-cols-2">
        <SectionContainer title="Top Tasks" description="Derived from incomplete milestones.">
          <div className="space-y-2">
            {topTasks.length ? topTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <div>
                  <p className="font-medium">{task.task}</p>
                  <p className="text-xs text-muted-foreground">{task.goal}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${task.priority === 'High' ? 'bg-primary/15 text-primary' : task.priority === 'Medium' ? 'bg-accent/15 text-accent-foreground' : 'bg-muted'}`}>{task.priority}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">No tasks available.</p>}
          </div>
        </SectionContainer>

        <SectionContainer title="Journal quick capture">
          <Input value={quickJournal} onChange={(event) => setQuickJournal(event.target.value)} placeholder="What's on your mind today?" />
          <div className="mt-3 flex justify-between">
            <ReflectionPrompt prompt="What emotion needs your honesty right now?" onUse={() => setQuickJournal((prev) => `${prev}${prev ? ' ' : ''}What emotion needs my honesty right now?`)} />
          </div>
          <PrimaryButton className="mt-3" onClick={saveQuickJournal}><Save className="mr-2 h-4 w-4" />Save capture</PrimaryButton>
        </SectionContainer>
      </motion.div>

      <motion.div variants={animations.item} className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Recent Journals">
          <div className="space-y-3">
            {journals.slice(0, 2).map((entry) => <JournalCard key={entry.id} title={entry.title} excerpt={entry.content} mood={entry.mood} date={entry.date} />)}
            {!journals.length && <p className="text-sm text-muted-foreground">No journals yet.</p>}
          </div>
          <Link to="/journal"><SecondaryButton className="mt-3">Open Journal</SecondaryButton></Link>
        </SectionContainer>

        <SectionContainer title="Memory Highlight">
          {memories[0] ? <MemoryCard title={memories[0].title} date={memories[0].date} description={memories[0].description} /> : <p className="text-sm text-muted-foreground">No memories yet.</p>}
          <Link to="/life-capsule"><SecondaryButton className="mt-3">Open Life Capsule</SecondaryButton></Link>
        </SectionContainer>

        <AIInsightCard
          title="AI Insight Card"
          content={journals.length ? `You've written ${journals.length} entries and tracked ${goals.length} goals. Your strongest signal is consistency when you break work into milestones.` : 'Start journaling and setting goals so I can generate personalized story-level insights.'}
          className="h-full"
        />
      </motion.div>

      <motion.div variants={animations.item} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { AIInsightCard, GoalCard, JournalCard, MemoryCard } from '@/components/ContentCards';
import { ReflectionPrompt } from '@/components/InteractiveComponents';
import { PrimaryButton, SecondaryButton } from '@/components/AppButtons';

const recentJournals = [
  { title: 'I finally slowed down', excerpt: 'Today felt quieter. I stopped trying to optimize everything and simply listened.', mood: 'Calm', date: 'Today' },
  { title: 'Hard conversation with dad', excerpt: 'I noticed old fears return, but I held eye contact and stayed present.', mood: 'Reflective', date: 'Yesterday' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const dayMoment = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader title={`Good ${dayMoment}, ${user?.name?.split(' ')[0] ?? 'there'}`} subtitle="A cinematic overview of your growth, memory, and direction." action={<Link to="/journal"><PrimaryButton>Write reflection</PrimaryButton></Link>} />
      </motion.div>

      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Life Summary Card" description="Where you are right now.">
          <div className="space-y-3 text-sm">
            <p>Journaled <span className="font-semibold text-primary">4</span> days this week.</p>
            <p>Completed <span className="font-semibold text-primary">2</span> milestones this month.</p>
            <p>Captured <span className="font-semibold text-primary">12</span> memories this year.</p>
          </div>
        </SectionContainer>
        <SectionContainer title="Daily Reflection Prompt">
          <ReflectionPrompt prompt="What did you protect your peace from today, and what did that make possible?" />
        </SectionContainer>
        <AIInsightCard title="AI Insight Card" content="Your writing has shifted from proving to processing. Keep building routines that reward inner steadiness over external urgency." className="h-full" />
      </motion.div>

      <motion.div variants={item}>
        <SectionContainer title="Goal Progress Overview" description="Progress visualization across active priorities.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <GoalCard title="Strengthen emotional consistency" progress={62} category="Wellbeing" />
            <GoalCard title="Ship MVP onboarding" progress={48} category="Startup" />
            <GoalCard title="Rebuild family rhythm" progress={71} category="Relationships" />
          </div>
        </SectionContainer>
      </motion.div>

      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        <SectionContainer title="Recent Journal Entries">
          <div className="space-y-3">{recentJournals.map((entry) => <JournalCard key={entry.title} {...entry} />)}</div>
          <Link to="/journal"><SecondaryButton className="mt-4">Open journal</SecondaryButton></Link>
        </SectionContainer>

        <SectionContainer title="Memory Highlight">
          <MemoryCard title="First prototype demo" date="March 2, 2026" description="You presented LifeOS to 6 peers. You were nervous and still delivered with clarity." />
          <Link to="/life-capsule"><SecondaryButton className="mt-4">Open memories</SecondaryButton></Link>
        </SectionContainer>
      </motion.div>

      <motion.div variants={item} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/journal"><button className="w-full rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:bg-muted">Dashboard → Journal</button></Link>
        <Link to="/goals"><button className="w-full rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:bg-muted">Dashboard → Goals</button></Link>
        <Link to="/ai"><button className="w-full rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:bg-muted">Dashboard → AI Companion</button></Link>
        <Link to="/life-capsule"><button className="w-full rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:bg-muted">Dashboard → Memories</button></Link>
        <Link to="/planner"><button className="w-full rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:bg-muted">Dashboard → Planner</button></Link>
      </motion.div>
    </motion.div>
  );
}
