import { useEffect, useState } from 'react';
import api from '@/services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import { Plus, Eye, Trash2, Edit3, Heart, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface VisionItem {
  id: string;
  image?: string;
  title: string;
  description: string;
  emoji: string;
  status: 'dream' | 'working' | 'reality';
  notes?: string;
  progress: number;
}

interface Board {
  id: string;
  title: string;
  coverImage?: string;
  isPublic: boolean;
  items: VisionItem[];
}

const statusLabels = { dream: '💭 Dream', working: '🔨 Working On It', reality: '✨ Became Reality' };
const statusColors = { dream: 'bg-info/10 text-info', working: 'bg-warning/10 text-warning', reality: 'bg-success/10 text-success' };

export default function VisionBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [boardDialog, setBoardDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);

  // Board form
  const [bTitle, setBTitle] = useState('');
  const [bPublic, setBPublic] = useState(false);

  // Item form
  const [iTitle, setITitle] = useState('');
  const [iDesc, setIDesc] = useState('');
  const [iEmoji, setIEmoji] = useState('⭐');
  const [iStatus, setIStatus] = useState<'dream' | 'working' | 'reality'>('dream');

  const fetch_ = () => {
    setLoading(true);
    api.get<Board[]>('/boards')
      .then((res) => setBoards(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  const saveBoard = async () => {
    if (!bTitle) return;
    await api.post('/boards', { title: bTitle, isPublic: bPublic });
    setBoardDialog(false); setBTitle(''); fetch_();
  };

  const deleteBoard = async (id: string) => {
    await api.delete(`/boards/${id}`);
    if (activeBoard?.id === id) setActiveBoard(null);
    fetch_();
  };

  const openBoard = (board: Board) => {
    setActiveBoard(board);
    // Fetch items
    api.get<VisionItem[]>(`/vision-items?boardId=${board.id}`)
      .then((res) => setActiveBoard({ ...board, items: res.data }))
      .catch(() => {});
  };

  const saveItem = async () => {
    if (!iTitle || !activeBoard) return;
    await api.post('/vision-items', { boardId: activeBoard.id, title: iTitle, description: iDesc, emoji: iEmoji, status: iStatus, progress: 0 });
    setItemDialog(false); setITitle(''); setIDesc('');
    openBoard(activeBoard);
  };

  const deleteItem = async (id: string) => {
    await api.delete(`/vision-items/${id}`);
    if (activeBoard) openBoard(activeBoard);
  };

  const convertToGoal = async (item: VisionItem) => {
    await api.post('/goals', { title: item.title, category: 'Personal', label: 'From Vision Board', steps: [] });
  };

  const updateStatus = async (itemId: string, status: 'dream' | 'working' | 'reality') => {
    await api.put(`/vision-items/${itemId}`, { status });
    if (activeBoard) openBoard(activeBoard);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetch_} />;

  // Board detail view
  if (activeBoard) {
    return (
      <div>
        <div className="flex items-center justify-between page-header">
          <div>
            <button onClick={() => setActiveBoard(null)} className="text-sm text-primary hover:underline mb-1 block">← Back to boards</button>
            <h1 className="page-title">{activeBoard.title}</h1>
          </div>
          <Button onClick={() => { setITitle(''); setIDesc(''); setIEmoji('⭐'); setIStatus('dream'); setItemDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />Add Vision
          </Button>
        </div>

        {(!activeBoard.items || activeBoard.items.length === 0) ? (
          <EmptyState icon={<Eye className="h-8 w-8 text-muted-foreground" />} title="Empty board" description="Add your first vision to this board" />
        ) : (
          <div className="masonry-grid">
            {activeBoard.items.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="masonry-item glass-card p-4 group">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>{statusLabels[item.status]}</span>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v as any)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dream">Dream</SelectItem>
                      <SelectItem value="working">Working On It</SelectItem>
                      <SelectItem value="reality">Became Reality</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => convertToGoal(item)} className="text-xs h-7">
                    <Target className="h-3 w-3 mr-1" />Goal
                  </Button>
                  <button onClick={() => deleteItem(item.id)} className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={itemDialog} onOpenChange={setItemDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Add Vision</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex gap-3">
                <Input placeholder="Emoji" value={iEmoji} onChange={(e) => setIEmoji(e.target.value)} className="w-16 text-center text-xl" />
                <Input placeholder="Title" value={iTitle} onChange={(e) => setITitle(e.target.value)} className="flex-1" />
              </div>
              <Textarea placeholder="Describe your vision..." value={iDesc} onChange={(e) => setIDesc(e.target.value)} rows={3} />
              <Select value={iStatus} onValueChange={(v) => setIStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dream">💭 Dream</SelectItem>
                  <SelectItem value="working">🔨 Working On It</SelectItem>
                  <SelectItem value="reality">✨ Became Reality</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={saveItem} className="w-full">Add Vision</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Boards grid
  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Vision Boards</h1>
          <p className="page-subtitle">Visualize your dreams and aspirations</p>
        </div>
        <Button onClick={() => setBoardDialog(true)}><Plus className="h-4 w-4 mr-2" />New Board</Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState icon={<Eye className="h-8 w-8 text-muted-foreground" />} title="No vision boards yet" description="Create your first board to start visualizing your dreams" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <motion.div key={board.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden group cursor-pointer" onClick={() => openBoard(board)}>
              <div className="h-32 gradient-calm flex items-center justify-center">
                <Eye className="h-10 w-10 text-primary-foreground/60" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{board.title}</h3>
                  <button onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }} className="opacity-0 group-hover:opacity-100 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{board.isPublic ? 'Public' : 'Private'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={boardDialog} onOpenChange={setBoardDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">New Board</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Board title" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
            <div className="flex items-center gap-2">
              <Switch checked={bPublic} onCheckedChange={setBPublic} id="public" />
              <Label htmlFor="public">Make public</Label>
            </div>
            <Button onClick={saveBoard} className="w-full">Create Board</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
