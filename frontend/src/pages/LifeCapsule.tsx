import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { MemoryCard } from '@/components/ContentCards';
import { PrimaryButton } from '@/components/AppButtons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { lifeData } from '@/lib/lifeData';

interface MemoryEntry {
  id: string;
  title: string;
  description: string;
  year: number;
  date: string;
  photo?: string;
}

export default function LifeCapsule() {
  const [entries, setEntries] = useState<MemoryEntry[]>(() => {
    const stored = lifeData.getMemories();
    if (stored.length) return stored;
    return [
      { id: '1', title: 'First pitch day', description: 'I stopped apologizing for ambition and spoke clearly.', year: 2026, date: '2026-02-14' },
      { id: '2', title: 'Family dinner reset', description: 'Everyone stayed at the table longer than usual.', year: 2025, date: '2025-11-08' },
    ];
  });
  const [year, setYear] = useState(2026);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const yearEntries = useMemo(() => entries.filter((entry) => entry.year === year).sort((a, b) => b.date.localeCompare(a.date)), [entries, year]);

  useEffect(() => {
    if (!lifeData.getMemories().length && entries.length) {
      lifeData.setMemories(entries);
    }
  }, []);

  const onUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const addMemory = () => {
    if (!title || !date) return;
    const selectedYear = Number(date.slice(0, 4));
    setEntries((prev) => {
      const next = [{ id: crypto.randomUUID(), title, description, date, year: selectedYear, photo }, ...prev];
      lifeData.setMemories(next);
      return next;
    });
    setTitle('');
    setDescription('');
    setDate('');
    setPhoto(undefined);
    setYear(selectedYear);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Life Capsule" subtitle="Archive meaningful moments across years, with memory cards, timeline, and photo moments." />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Add memory" description="Capture what mattered and why.">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Memory title" className="mb-3" />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What happened and what did it change?" className="mb-3" />
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mb-3" />
          <div className="flex gap-2">
            <PrimaryButton onClick={() => fileRef.current?.click()} variant="secondary"><Camera className="mr-2 h-4 w-4" />Upload photo</PrimaryButton>
            <PrimaryButton onClick={addMemory}><Plus className="mr-2 h-4 w-4" />Save</PrimaryButton>
          </div>
          <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={(event) => onUpload(event.target.files?.[0])} />
          {photo && <img src={photo} alt="Memory preview" className="mt-3 h-40 w-full rounded-lg object-cover" />}
        </SectionContainer>

        <SectionContainer title="Year navigation">
          <div className="mb-4 flex items-center justify-between rounded-xl border p-3">
            <button aria-label="Previous year" onClick={() => setYear((value) => value - 1)} className="rounded-md p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
            <p className="text-2xl font-semibold">{year}</p>
            <button aria-label="Next year" onClick={() => setYear((value) => value + 1)} className="rounded-md p-2 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <ol className="space-y-3 border-l pl-4">
            {yearEntries.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs text-primary">{entry.date}</p>
                <p className="text-sm font-medium">{entry.title}</p>
              </li>
            ))}
            {yearEntries.length === 0 && <p className="text-sm text-muted-foreground">No memories in this year yet.</p>}
          </ol>
        </SectionContainer>

        <SectionContainer title="Memory timeline">
          <div className="space-y-3">
            {yearEntries.map((entry, index) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <MemoryCard title={entry.title} date={entry.date} description={entry.description} />
                {entry.photo && <img src={entry.photo} alt={entry.title} className="mt-2 h-36 w-full rounded-lg object-cover" />}
              </motion.div>
            ))}
          </div>
        </SectionContainer>
      </div>
    </div>
  );
}
