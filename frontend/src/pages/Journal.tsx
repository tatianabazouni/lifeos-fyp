import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Trash2, Edit3, Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
}

const moods = [
  '😊 Happy',
  '😌 Calm',
  '😢 Sad',
  '😤 Frustrated',
  '🤔 Reflective',
  '🔥 Motivated',
  '😴 Tired',
  '🥰 Grateful'
];

export default function Journal() {
  const { user } = useAuth(); // ✅ FIX ADDED

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const fetchEntries = async () => {
    if (!user) return; // ✅ now valid

    setLoading(true);
    try {
      const res = await api.get<JournalEntry[]>('/journal');
      setEntries(
        res.data.map((entry: any) => ({
          ...entry,
          id: entry._id || entry.id
        }))
      );
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]); // ✅ depend on user

  const resetForm = () => {
    setTitle('');
    setContent('');
    setMood('');
    setTags([]);
    setTagInput('');
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditing(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTags(entry.tags);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title || !content) return;

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/journal/${editing.id}`, { title, content, mood, tags });
      } else {
        await api.post('/journal', { title, content, mood, tags });
      }

      setDialogOpen(false);
      resetForm();
      fetchEntries();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/journal/${id}`);
    fetchEntries();
  };

  const getAiFeedback = async () => {
    if (!content) return;

    setAiLoading(true);
    try {
      const res = await api.post<{ feedback: string }>(
        '/ai/journal-feedback',
        { content }
      );

      setContent(prev =>
        prev + '\n\n--- AI Feedback ---\n' + res.data.feedback
      );
    } finally {
      setAiLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchEntries} />;

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-subtitle">Document your thoughts and reflections</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
          title="No journal entries yet"
          description="Start writing your first entry to begin your reflection journey"
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Write Entry
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 group"
            >
              <h3 className="font-semibold">{entry.title}</h3>
              <p className="text-xs text-muted-foreground">{entry.date}</p>
              <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                {entry.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}