import { useEffect, useMemo, useRef, useState } from 'react';
import { Bold, BookOpenText, Italic, List, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { EmotionTag, ReflectionPrompt } from '@/components/InteractiveComponents';
import { JournalCard } from '@/components/ContentCards';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/AppButtons';
import { lifeData, type JournalEntryData, type JournalNotebookData } from '@/lib/lifeData';

const prompts = [
  'What did today teach me about my triggers?',
  'Where did I choose alignment over approval?',
  'What one truth do I need to hear from myself tonight?',
];
const moods = ['Calm', 'Hopeful', 'Anxious', 'Grateful', 'Heavy', 'Focused'];

const draftKey = (notebookId: string) => `journal_rich_draft_${notebookId}`;

function buildDefaultNotebook(entries: JournalEntryData[]): JournalNotebookData {
  return {
    id: 'default-notebook',
    title: 'My Diary',
    description: 'Your primary personal notebook.',
    createdAt: new Date().toISOString(),
    entries,
  };
}

function loadNotebooks(): JournalNotebookData[] {
  const notebooks = lifeData.getJournalNotebooks();
  if (notebooks.length) return notebooks;

  const legacyEntries = lifeData.getJournalEntries();
  const seeded = [buildDefaultNotebook(legacyEntries)];
  lifeData.setJournalNotebooks(seeded);
  lifeData.setJournalEntries(legacyEntries);
  return seeded;
}

export default function Journal() {
  const [title, setTitle] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  const [notebooks, setNotebooks] = useState<JournalNotebookData[]>(() => loadNotebooks());
  const [activeNotebookId, setActiveNotebookId] = useState<string>('');
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [search, setSearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const activeNotebook = useMemo(() => notebooks.find((book) => book.id === activeNotebookId) ?? notebooks[0], [notebooks, activeNotebookId]);
  const entries = activeNotebook?.entries ?? [];

  useEffect(() => {
    if (!activeNotebookId && notebooks[0]) setActiveNotebookId(notebooks[0].id);
  }, [activeNotebookId, notebooks]);

  const content = editorRef.current?.innerText ?? '';
  const words = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);

  const persistNotebooks = (next: JournalNotebookData[]) => {
    setNotebooks(next);
    lifeData.setJournalNotebooks(next);
    lifeData.setJournalEntries(next.flatMap((book) => book.entries));
  };

  const apply = (command: 'bold' | 'italic' | 'insertUnorderedList') => {
    document.execCommand(command);
    editorRef.current?.focus();
  };

  const saveEntry = () => {
    if (!title || !content.trim() || !activeNotebook) return;
    const entry: JournalEntryData = {
      id: crypto.randomUUID(),
      title,
      content: content.trim(),
      mood: emotion,
      tags,
      date: new Date().toLocaleDateString(),
      notebookId: activeNotebook.id,
    };

    persistNotebooks(
      notebooks.map((book) => (book.id === activeNotebook.id ? { ...book, entries: [entry, ...book.entries] } : book)),
    );

    setTitle('');
    setTags([]);
    if (editorRef.current) editorRef.current.innerHTML = '';
    localStorage.removeItem(draftKey(activeNotebook.id));
  };

  const autosave = () => {
    if (!editorRef.current || !activeNotebook) return;
    localStorage.setItem(draftKey(activeNotebook.id), editorRef.current.innerHTML);
  };

  const loadDraft = () => {
    if (!editorRef.current || !activeNotebook) return;
    const draft = localStorage.getItem(draftKey(activeNotebook.id));
    if (draft) editorRef.current.innerHTML = draft;
  };

  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags((prev) => [...prev, tagInput.trim()]);
    setTagInput('');
  };

  const createNotebook = () => {
    if (!newNotebookTitle.trim()) return;
    const notebook: JournalNotebookData = {
      id: crypto.randomUUID(),
      title: newNotebookTitle.trim(),
      description: 'Personal notebook',
      createdAt: new Date().toISOString(),
      entries: [],
    };
    const next = [notebook, ...notebooks];
    persistNotebooks(next);
    setActiveNotebookId(notebook.id);
    setNewNotebookTitle('');
    setTitle('');
    setTags([]);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const switchNotebook = (id: string) => {
    setActiveNotebookId(id);
    setTitle('');
    setTags([]);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const filtered = entries.filter((entry) => `${entry.title} ${entry.content} ${entry.mood} ${entry.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6" onMouseEnter={loadDraft}>
      <PageHeader title="Journal Notebooks" subtitle="Create notebooks for diaries and keep multiple titled entries inside each notebook." />
      <div className="grid gap-6 lg:grid-cols-4">
        <SectionContainer title="Notebooks" description="Switch between personal diaries and journals.">
          <div className="space-y-2">
            {notebooks.map((notebook) => (
              <button key={notebook.id} onClick={() => switchNotebook(notebook.id)} className={`w-full rounded-xl border p-3 text-left transition ${activeNotebookId === notebook.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}>
                <div className="flex items-center gap-2">
                  <BookOpenText className="h-4 w-4 text-primary" />
                  <p className="font-medium">{notebook.title}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{notebook.entries.length} entries</p>
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input value={newNotebookTitle} onChange={(event) => setNewNotebookTitle(event.target.value)} placeholder="New notebook title" />
            <PrimaryButton onClick={createNotebook} variant="secondary"><Plus className="h-4 w-4" /></PrimaryButton>
          </div>
        </SectionContainer>

        <SectionContainer title={`Write in ${activeNotebook?.title ?? 'Notebook'}`} description="Create titled entries inside this notebook.">
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
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{words} words</span><span>{entries.length} entries in this notebook</span></div>
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
            <p className="text-foreground/80">Your writing becomes more detailed in travel/adventure themed notebooks. Consider a weekly review per notebook to spot emotional patterns by life context.</p>
          </motion.div>
        </SectionContainer>

        <SectionContainer title={`${activeNotebook?.title ?? 'Notebook'} entries`} description="Search titled entries in the current notebook.">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notebook entries" className="mb-3" />
          <div className="space-y-3">
            {filtered.map((entry) => (
              <JournalCard key={entry.id} title={entry.title} excerpt={entry.content} mood={`${entry.mood} ${entry.tags.map((tag) => `#${tag}`).join(' ')}`} date={entry.date} />
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No matching entries in this notebook yet.</p>}
          </div>
        </SectionContainer>
      </div>
    </div>
  );
}
