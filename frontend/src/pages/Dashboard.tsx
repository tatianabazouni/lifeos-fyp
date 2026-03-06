import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { AIInsightCard, GoalCard, JournalCard, MemoryCard } from '@/components/ContentCards';
import { ReflectionPrompt } from '@/components/InteractiveComponents';
import { Link } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '@/components/AppButtons';

const recentJournals = [
  { title: 'I finally slowed down', excerpt: 'Today felt quieter. I stopped trying to optimize everything and simply listened.', mood: 'Calm', date: 'Today' },
  { title: 'Hard conversation with dad', excerpt: 'I noticed old fears return, but I held eye contact and stayed present.', mood: 'Reflective', date: 'Yesterday' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Good evening, this is your life in motion" subtitle="A reflective view of your growth, memory, and direction." action={<Link to="/journal"><PrimaryButton>Write reflection</PrimaryButton></Link>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Life Summary" description="A gentle snapshot of where you are.">
          <div className="space-y-3 text-sm">
            <p>Journaled <span className="font-semibold text-primary">4</span> days this week.</p>
            <p>Completed <span className="font-semibold text-primary">2</span> milestones this month.</p>
            <p>Captured <span className="font-semibold text-primary">12</span> meaningful memories this year.</p>
          </div>
        </SectionContainer>
        <SectionContainer title="Daily Reflection Prompt">
          <ReflectionPrompt prompt="What did you protect your energy from today, and what did it allow you to feel?" />
        </SectionContainer>
        <AIInsightCard title="AI Insight" content="Your recent writing suggests a shift from external validation toward inner steadiness. Consider setting one boundary this week that protects your future self." className="h-full" />
      </div>

      <SectionContainer title="Goal Progress Overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <GoalCard title="Strengthen emotional consistency" progress={62} category="Wellbeing" />
          <GoalCard title="Ship MVP onboarding" progress={48} category="Startup" />
          <GoalCard title="Rebuild family rhythm" progress={71} category="Relationships" />
        </div>
      </SectionContainer>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionContainer title="Recent Journal Entries">
          <div className="space-y-3">{recentJournals.map((entry) => <JournalCard key={entry.title} {...entry} />)}</div>
          <Link to="/journal"><SecondaryButton className="mt-4">Open journal timeline</SecondaryButton></Link>
        </SectionContainer>
        <SectionContainer title="Memory Highlight">
          <MemoryCard title="First prototype demo" date="March 2, 2026" description="You presented LifeOS to 6 peers. You were nervous and still delivered with clarity." />
        </SectionContainer>
      </div>
    </div>
  );
}
