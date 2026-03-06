import { useMemo, useRef, useState } from 'react';
import { Bold, Italic, List, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { EmotionTag, ReflectionPrompt } from '@/components/InteractiveComponents';
import { JournalCard } from '@/components/ContentCards';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/AppButtons';

interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
}

const prompts = [
  'What did today teach me about my triggers?',
  'Where did I choose alignment over approval?',
  'What one truth do I need to hear from myself tonight?',
];
const moods = ['Calm', 'Hopeful', 'Anxious', 'Grateful', 'Heavy', 'Focused'];

export default function Journal() {
  const [title, setTitle] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const content = editorRef.current?.innerText ?? '';
  const words = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);

  const apply = (command: 'bold' | 'italic' | 'insertUnorderedList') => {
    document.execCommand(command);
    editorRef.current?.focus();
  };

  const saveEntry = () => {
    if (!title || !content.trim()) return;
    const entry: Entry = { id: crypto.randomUUID(), title, content: content.trim(), mood: emotion, tags, date: new Date().toLocaleDateString() };
    setEntries((prev) => [entry, ...prev]);
    setTitle('');
    setTags([]);
    if (editorRef.current) editorRef.current.innerHTML = '';
    localStorage.removeItem('journal_rich_draft');
  };

  const autosave = () => {
    if (!editorRef.current) return;
    localStorage.setItem('journal_rich_draft', editorRef.current.innerHTML);
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('journal_rich_draft');
    if (draft && editorRef.current) editorRef.current.innerHTML = draft;
  };

  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags((prev) => [...prev, tagInput.trim()]);
    setTagInput('');
  };

  const filtered = entries.filter((entry) => `${entry.title} ${entry.content} ${entry.mood} ${entry.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6" onMouseEnter={loadDraft}>
      <PageHeader title="Journal" subtitle="A deep reflection space with rich writing, emotional tags, and searchable timeline." />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Rich writing studio" description="Write with structure, style, and presence.">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Entry title" className="mb-3" />
          <div className="mb-2 flex gap-2">
            <button aria-label="Bold" onClick={() => apply('bold')} className="rounded-md border p-2 hover:bg-muted"><Bold className="h-4 w-4" /></button>
            <button aria-label="Italic" onClick={() => apply('italic')} className="rounded-md border p-2 hover:bg-muted"><Italic className="h-4 w-4" /></button>
            <button aria-label="List" onClick={() => apply('insertUnorderedList')} className="rounded-md border p-2 hover:bg-muted"><List className="h-4 w-4" /></button>
          </div>
          <div ref={editorRef} onInput={autosave} contentEditable suppressContentEditableWarning className="min-h-52 rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Journal rich text editor" />
          <div className="mt-3 flex flex-wrap gap-2">{moods.map((mood) => <EmotionTag key={mood} label={mood} active={emotion === mood} onClick={() => setEmotion(mood)} />)}</div>
          <div className="mt-3 flex gap-2">
            <Input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="Add tag" />
            <PrimaryButton variant="secondary" onClick={addTag}>Tag</PrimaryButton>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">#{tag}</span>)}</div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{words} words</span><span>Writing streak: 5 days</span></div>
          <PrimaryButton className="mt-4" onClick={saveEntry}>Save entry</PrimaryButton>
        </SectionContainer>

        <SectionContainer title="AI reflection prompts" description="Gentle questions to deepen self-understanding.">
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <ReflectionPrompt key={prompt} prompt={prompt} onUse={() => {
                if (!editorRef.current) return;
                editorRef.current.innerHTML += `<p><strong>${prompt}</strong></p><p></p>`;
                autosave();
              }} />
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="mb-1 flex items-center gap-2 font-medium text-primary"><Sparkles className="h-4 w-4" />AI insight</p>
            <p className="text-foreground/80">You often write about uncertainty when you skip rest. Consider journaling earlier before mental fatigue peaks.</p>
          </motion.div>
        </SectionContainer>

        <SectionContainer title="Journal timeline" description="Search entries by thought, emotion, and tag.">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search journal entries" className="mb-3" />
          <div className="space-y-3">
            {filtered.map((entry) => (
              <JournalCard key={entry.id} title={entry.title} excerpt={entry.content} mood={`${entry.mood} ${entry.tags.map((tag) => `#${tag}`).join(' ')}`} date={entry.date} />
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No matching entries yet.</p>}
          </div>
        </SectionContainer>
      </div>
    </div>
  );
}
