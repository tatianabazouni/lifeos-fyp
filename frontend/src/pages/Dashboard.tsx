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
      </motion.div>
    </motion.div>
  );
}
