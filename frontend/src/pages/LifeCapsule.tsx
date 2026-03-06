import { useEffect, useState } from 'react';
import api from '@/services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import { Plus, Clock, MapPin, Users, Trash2, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  people?: string[];
  emotion?: string;
  tags?: string[];
  type: string;
}

interface Chapter {
  id: string;
  title: string;
  icon: string;
  dateRange: string;
  memories: Memory[];
}

const templates = [
  '🧒 Childhood', '✝️ Baptism', '🕊️ First Communion', '⛪ Confirmation',
  '🎓 School', '🏫 University', '🎂 Birthday Memories', '🙏 Faith Journey',
  '💼 Career', '✈️ Travel', '👫 Friendships', '👪 Family',
  '🏆 Achievements', '📝 Custom',
];

const emotions = ['😊 Joy', '😢 Sadness', '🤔 Nostalgia', '🔥 Excitement', '😌 Peace', '💪 Pride', '🥰 Love'];

export default function LifeCapsule() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [chapterDialog, setChapterDialog] = useState(false);
  const [memoryDialog, setMemoryDialog] = useState(false);
  const [activeChapter, setActiveChapter] = useState<string>('');

  // Chapter form
  const [chTitle, setChTitle] = useState('');
  const [chIcon, setChIcon] = useState('📝');
  const [chDateRange, setChDateRange] = useState('');

  // Memory form
  const [memTitle, setMemTitle] = useState('');
  const [memDesc, setMemDesc] = useState('');
  const [memDate, setMemDate] = useState('');
  const [memLocation, setMemLocation] = useState('');
  const [memEmotion, setMemEmotion] = useState('');
  const [memType, setMemType] = useState('text');

  const fetch_ = () => {
    setLoading(true);

    api.get<Chapter[]>('/life/chapters')
      .then((res) => {
        const formatted = res.data.map((c: any) => ({
          ...c,
          id: c._id
        }));

        setChapters(formatted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  const toggle = (id: string) => setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const saveChapter = async () => {
    if (!chTitle) return;
    await api.post('/chapters', { title: chTitle, icon: chIcon, dateRange: chDateRange });
    setChapterDialog(false); setChTitle(''); fetch_();
  };

  const deleteChapter = async (id: string) => {
    await api.delete(`/chapters/${id}`);
    fetch_();
  };

  const openAddMemory = (chapterId: string) => {
    setActiveChapter(chapterId);
    setMemTitle(''); setMemDesc(''); setMemDate(''); setMemLocation(''); setMemEmotion(''); setMemType('text');
    setMemoryDialog(true);
  };

  const saveMemory = async () => {
    if (!memTitle) return;
    await api.post('/memories', {
      chapterId: activeChapter, title: memTitle, description: memDesc,
      date: memDate, location: memLocation, emotion: memEmotion, type: memType,
    });
    setMemoryDialog(false); fetch_();
  };

  const deleteMemory = async (id: string) => {
    await api.delete(`/memories/${id}`);
    fetch_();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetch_} />;

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Life Capsule</h1>
          <p className="page-subtitle">Document the chapters of your life</p>
        </div>
        <Button onClick={() => setChapterDialog(true)}><Plus className="h-4 w-4 mr-2" />New Chapter</Button>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8 text-muted-foreground" />}
          title="Your life story begins here"
          description="Create your first chapter to start documenting your journey"
          action={<Button onClick={() => setChapterDialog(true)} variant="outline"><Plus className="h-4 w-4 mr-2" />Create Chapter</Button>}
        />
      ) : (
        <div className="relative pl-10">
          <div className="timeline-line" />
          <div className="space-y-6">
            {chapters.map((ch, i) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Timeline dot */}
                <div className="absolute left-[14px] w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs border-2 border-background z-10">
                  <span>{ch.icon}</span>
                </div>

                <div className="glass-card">
                  <button
                    onClick={() => toggle(ch.id)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="text-left">
                      <h3 className="font-semibold">{ch.icon} {ch.title}</h3>
                      <p className="text-xs text-muted-foreground">{ch.dateRange}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{ch.memories?.length || 0} memories</span>
                      {expanded.includes(ch.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </button>

                  {expanded.includes(ch.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-3">
                        {ch.memories?.map((mem) => (
                          <div key={mem.id} className="bg-muted/50 rounded-lg p-3 group">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">{mem.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mem.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  {mem.date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{mem.date}</span>}
                                  {mem.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{mem.location}</span>}
                                </div>
                              </div>
                              <button onClick={() => deleteMemory(mem.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openAddMemory(ch.id)}>
                            <Plus className="h-3 w-3 mr-1" />Add Memory
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteChapter(ch.id)} className="text-destructive">
                            <Trash2 className="h-3 w-3 mr-1" />Delete Chapter
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter Dialog */}
      <Dialog open={chapterDialog} onOpenChange={setChapterDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">New Chapter</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <p className="text-sm font-medium mb-2">Template</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setChTitle(t.slice(2).trim()); setChIcon(t.slice(0, 2).trim()); }}
                    className={`mood-chip ${chTitle === t.slice(2).trim() ? 'active' : ''}`}
                  >{t}</button>
                ))}
              </div>
            </div>
            <Input placeholder="Chapter title" value={chTitle} onChange={(e) => setChTitle(e.target.value)} />
            <Input placeholder="Date range (e.g. 2000 - 2010)" value={chDateRange} onChange={(e) => setChDateRange(e.target.value)} />
            <Button onClick={saveChapter} className="w-full">Create Chapter</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Memory Dialog */}
      <Dialog open={memoryDialog} onOpenChange={setMemoryDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">Add Memory</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Memory title" value={memTitle} onChange={(e) => setMemTitle(e.target.value)} />
            <Textarea placeholder="Describe this memory..." value={memDesc} onChange={(e) => setMemDesc(e.target.value)} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={memDate} onChange={(e) => setMemDate(e.target.value)} />
              <Input placeholder="Location" value={memLocation} onChange={(e) => setMemLocation(e.target.value)} />
            </div>
            <Select value={memType} onValueChange={setMemType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">📝 Text</SelectItem>
                <SelectItem value="photo">📷 Photo</SelectItem>
                <SelectItem value="milestone">🏆 Milestone</SelectItem>
                <SelectItem value="lesson">💡 Lesson</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <p className="text-sm font-medium mb-2">Emotion</p>
              <div className="flex flex-wrap gap-2">
                {emotions.map((e) => (
                  <button key={e} onClick={() => setMemEmotion(e)} className={`mood-chip ${memEmotion === e ? 'active' : ''}`}>{e}</button>
                ))}
              </div>
            </div>
            <Button onClick={saveMemory} className="w-full">Save Memory</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
