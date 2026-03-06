import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { PrimaryButton } from '@/components/AppButtons';
import { Input } from '@/components/ui/input';

interface VisionCard {
  id: string;
  title: string;
  image: string;
}
interface VisionBoard {
  id: string;
  title: string;
  cards: VisionCard[];
}

const demoImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

export default function VisionBoards() {
  const [boards, setBoards] = useState<VisionBoard[]>([{ id: 'b1', title: 'Next Chapter', cards: [{ id: 'c1', title: 'Ocean-side deep work', image: demoImage }, { id: 'c2', title: 'Health + grounded mornings', image: demoImage }] }]);
  const [activeBoardId, setActiveBoardId] = useState('b1');
  const [newBoard, setNewBoard] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const activeBoard = boards.find((board) => board.id === activeBoardId);

  const createBoard = () => {
    if (!newBoard.trim()) return;
    const board = { id: crypto.randomUUID(), title: newBoard, cards: [] };
    setBoards((prev) => [...prev, board]);
    setActiveBoardId(board.id);
    setNewBoard('');
  };

  const addImageCard = (file?: File) => {
    if (!activeBoard) return;
    const toBase64 = (target: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const card: VisionCard = { id: crypto.randomUUID(), title: target.name.replace(/\..+$/, ''), image: String(reader.result ?? demoImage) };
        setBoards((prev) => prev.map((board) => board.id === activeBoard.id ? { ...board, cards: [...board.cards, card] } : board));
      };
      reader.readAsDataURL(target);
    };

    if (file) toBase64(file);
    else {
      const card: VisionCard = { id: crypto.randomUUID(), title: 'Untitled vision', image: demoImage };
      setBoards((prev) => prev.map((board) => board.id === activeBoard.id ? { ...board, cards: [...board.cards, card] } : board));
    }
  };

  const reorderCards = (draggedId: string, overId: string) => {
    if (!activeBoard || draggedId === overId) return;
    const cards = [...activeBoard.cards];
    const fromIndex = cards.findIndex((card) => card.id === draggedId);
    const toIndex = cards.findIndex((card) => card.id === overId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = cards.splice(fromIndex, 1);
    cards.splice(toIndex, 0, moved);
    setBoards((prev) => prev.map((board) => board.id === activeBoard.id ? { ...board, cards } : board));
  };

  const removeCard = (id: string) => setBoards((prev) => prev.map((board) => board.id === activeBoardId ? { ...board, cards: board.cards.filter((card) => card.id !== id) } : board));

  return (
    <div className="space-y-6">
      <PageHeader title="Vision Boards" subtitle="Design your future visually. Rearrange your intentions until they feel true." />
      <div className="grid gap-6 lg:grid-cols-4">
        <SectionContainer title="Boards" description="Create and switch between visual futures.">
          <div className="space-y-2">
            {boards.map((board) => (
              <button key={board.id} onClick={() => setActiveBoardId(board.id)} className={`w-full rounded-lg border p-2 text-left text-sm transition ${board.id === activeBoardId ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                {board.title}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input value={newBoard} onChange={(event) => setNewBoard(event.target.value)} placeholder="Create board" />
            <PrimaryButton onClick={createBoard}><Plus className="h-4 w-4" /></PrimaryButton>
          </div>
        </SectionContainer>

        <SectionContainer title={activeBoard?.title ?? 'Board'} description="Drag cards to reorder your vision narrative.">
          <div className="mb-4 flex gap-2">
            <PrimaryButton onClick={() => fileRef.current?.click()}><ImagePlus className="mr-2 h-4 w-4" />Add image</PrimaryButton>
            <PrimaryButton variant="secondary" onClick={() => addImageCard()}><Plus className="mr-2 h-4 w-4" />Quick card</PrimaryButton>
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={(event) => event.target.files?.[0] && addImageCard(event.target.files[0])} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {activeBoard?.cards.map((card, index) => (
              <motion.article
                key={card.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', card.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => reorderCards(event.dataTransfer.getData('text/plain'), card.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden rounded-xl border bg-card"
              >
                <img src={card.image} alt={card.title} className="h-32 w-full object-cover" />
                <div className="flex items-center justify-between p-3">
                  <p className="text-sm font-medium">{card.title}</p>
                  <button aria-label="Delete card" onClick={() => removeCard(card.id)} className="opacity-0 transition group-hover:opacity-100"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </motion.article>
            ))}
          </div>
        </SectionContainer>
      </div>
    </div>
  );
}
