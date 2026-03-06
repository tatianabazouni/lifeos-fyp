import { useMemo, useState } from 'react';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { EmotionTag, ReflectionPrompt } from '@/components/InteractiveComponents';
import { JournalCard } from '@/components/ContentCards';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PrimaryButton } from '@/components/AppButtons';

const prompts = [
  'Where did I abandon myself today?',
  'What did I do that my future self will thank me for?',
  'Which emotion did I avoid naming?',
];
const emotions = ['Calm', 'Hopeful', 'Anxious', 'Grateful', 'Heavy', 'Focused'];

export default function Journal() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(localStorage.getItem('draft_journal') ?? '');
  const [emotion, setEmotion] = useState('Reflective');
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState<{ title: string; content: string; mood: string; date: string }[]>([]);

  const words = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);

  const saveEntry = () => {
    if (!title || !content) return;
    setEntries((prev) => [{ title, content, mood: emotion, date: new Date().toLocaleDateString() }, ...prev]);
    setTitle('');
    setContent('');
    localStorage.removeItem('draft_journal');
  };

  const filtered = entries.filter((entry) => `${entry.title} ${entry.content} ${entry.mood}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Journal" subtitle="A private room for honest reflection, with gentle structure and emotional awareness." />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Write" description="Autosaves while you think.">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title" className="mb-3" />
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              localStorage.setItem('draft_journal', e.target.value);
            }}
            placeholder="Let the page hold what you cannot carry alone..."
            className="min-h-56"
          />
          <div className="mt-3 flex flex-wrap gap-2">{emotions.map((item) => <EmotionTag key={item} label={item} active={emotion === item} onClick={() => setEmotion(item)} />)}</div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{words} words</span><span>Autosaved</span></div>
          <PrimaryButton className="mt-4" onClick={saveEntry}>Save Entry</PrimaryButton>
        </SectionContainer>

        <SectionContainer title="Reflection prompts" description="When you feel blocked, begin here.">
          <div className="space-y-3">{prompts.map((prompt) => <ReflectionPrompt key={prompt} prompt={prompt} onUse={() => setContent((prev) => `${prev}\n\n${prompt}\n`)} />)}</div>
          <p className="mt-4 text-xs text-muted-foreground">Current streak: 5 days</p>
        </SectionContainer>

        <SectionContainer title="Timeline" description="Search entries by thought, mood, or tag.">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search journal entries" className="mb-3" />
          <div className="space-y-3">{filtered.map((entry) => <JournalCard key={`${entry.title}-${entry.date}`} title={entry.title} excerpt={entry.content} mood={entry.mood} date={entry.date} />)}</div>
        </SectionContainer>
      </div>
    </div>
  );
}
