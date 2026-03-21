/**
 * Journal — The most beautiful digital diary.
 * Three view modes: Scrapbook (hero), Book (3D), List (quick browse).
 * Full-screen editor, heatmap calendar, mood trail, localStorage persistence.
 */
import { useState, useEffect, useCallback } from "react";
import { createJournalEntry, getJournalEntries, updateJournalEntry } from "@/api/journalApi";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Plus, BookOpen, PenLine, Feather,
  LayoutGrid, Book, List, Volume2, Sparkles,
} from "lucide-react";
import Journal3DBook from "@/components/journal/Journal3DBook";
import LifeBookSetup from "@/components/journal/LifeBookSetup";
import LifeBookChapterView from "@/components/journal/LifeBookChapterView";
import ScrapbookView from "@/components/journal/ScrapbookView";
import JournalListView from "@/components/journal/JournalListView";
import JournalEntryEditor from "@/components/journal/JournalEntryEditor";
import JournalCalendarHeatmap from "@/components/journal/JournalCalendarHeatmap";
import VoiceNotePlayer from "@/components/journal/VoiceNotePlayer";
import {
  createLifeBook,
  getBookReflections,
  type LifeBook,
} from "@/components/journal/lifeBookTypes";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  photos: string[];
  hasVoiceNote: boolean;
  stickers: string[];
}

const moodEmoji: Record<string, string> = {
  happy: "😊", grateful: "❤️", reflective: "🧠",
  motivated: "☀️", calm: "🌙", sad: "☁️",
};

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<"scrapbook" | "book" | "list" | "lifebook">("scrapbook");
  const [lifeBook, setLifeBook] = useState<LifeBook | null>(null);
  const [showLifeBookSetup, setShowLifeBookSetup] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getJournalEntries();
        setEntries(data.map((entry: any) => ({
          id: String(entry._id || entry.id),
          date: entry.date || entry.createdAt,
          title: entry.title || "Untitled",
          content: entry.content || "",
          mood: entry.mood || "reflective",
          tags: Array.isArray(entry.tags) ? entry.tags : [],
          photos: [],
          hasVoiceNote: false,
          stickers: [],
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load journal");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveEntry = useCallback(async (entry: JournalEntry) => {
    try {
      const payload = { title: entry.title, content: entry.content, mood: entry.mood, tags: entry.tags, date: entry.date };
      const exists = entries.find((e) => e.id === entry.id);
      if (exists) {
        const updated = await updateJournalEntry(entry.id, payload);
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...entry, id: String(updated._id || updated.id) } : e)));
      } else {
        const created = await createJournalEntry(payload);
        setEntries((prev) => [{ ...entry, id: String(created._id || created.id) }, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    }
  }, [entries]);

  const handleCreateLifeBook = (title: string, authorName: string) => {
    const book = createLifeBook(title, authorName);
    setLifeBook(book);
    setViewMode("lifebook");
  };

  const handleUpdatePrompt = (chapterId: string, promptId: string, response: string) => {
    if (!lifeBook) return;
    setLifeBook({
      ...lifeBook,
      chapters: lifeBook.chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              prompts: ch.prompts.map((p) =>
                p.id === promptId
                  ? { ...p, response, writtenAt: new Date().toISOString() }
                  : p
              ),
            }
          : ch
      ),
    });
  };

  const reflections = lifeBook ? getBookReflections(lifeBook) : [];

  const viewModes = [
    { key: "scrapbook" as const, icon: LayoutGrid, label: "Scrapbook" },
    { key: "book" as const, icon: Book, label: "3D Book" },
    { key: "list" as const, icon: List, label: "List" },
    { key: "lifebook" as const, icon: Feather, label: "Life Story" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {loading && <p className="text-sm text-muted-foreground">Loading journal...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground mt-1 font-handwritten text-xl">
            Your digital scrapbook of life
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-muted/40 rounded-xl p-1 border border-border/30">
            {viewModes.map((vm) => {
              const Icon = vm.icon;
              return (
                <button
                  key={vm.key}
                  onClick={() => {
                    if (vm.key === "lifebook" && !lifeBook) {
                      setShowLifeBookSetup(true);
                      return;
                    }
                    setViewMode(vm.key);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    viewMode === vm.key
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{vm.label}</span>
                </button>
              );
            })}
          </div>
          {viewMode !== "lifebook" && (
            <Button
              onClick={() => setShowEditor(true)}
              className="gradient-primary text-primary-foreground shadow-depth rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" /> New Entry
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {viewMode === "book" ? (
          <motion.div key="book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Journal3DBook
              entries={entries}
              reflections={reflections}
              bookTitle={lifeBook?.title}
              authorName={lifeBook?.authorName}
              onWriteEntry={() => setShowEditor(true)}
            />
          </motion.div>
        ) : viewMode === "lifebook" ? (
          <motion.div key="lifebook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {lifeBook ? (
              <LifeBookChapterView
                book={lifeBook}
                onUpdatePrompt={handleUpdatePrompt}
                onViewBook={() => setViewMode("book")}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-20">
                <Feather className="h-20 w-20 text-primary/25" strokeWidth={1} />
                <h3 className="font-display text-2xl font-bold">Write the story of your life</h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Your Life Book is a guided journey through the chapters of your life.
                </p>
                <Button onClick={() => setShowLifeBookSetup(true)} className="gradient-primary text-primary-foreground shadow-depth rounded-xl">
                  <BookOpen className="mr-2 h-4 w-4" /> Create My Life Book
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Scrapbook or List — shown with sidebar */
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6"
          >
            {/* Main area */}
            <div>
              {viewMode === "scrapbook" ? (
                <ScrapbookView
                  entries={entries}
                  onOpenEntry={setExpandedEntry}
                  onNewEntry={() => setShowEditor(true)}
                />
              ) : (
                <JournalListView
                  entries={entries}
                  onOpenEntry={setExpandedEntry}
                  onNewEntry={() => setShowEditor(true)}
                />
              )}
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              {/* Heatmap Calendar */}
              <JournalCalendarHeatmap entries={entries} />

              {/* Reflection Prompts as sticky notes */}
              <div className="surface-card p-4 gradient-warm">
                <h3 className="font-display font-semibold mb-3 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber" /> Reflection Prompts
                </h3>
                <div className="space-y-2">
                  {[
                    "What made you grateful today?",
                    "What did you learn today?",
                    "What moment made you smile?",
                    "What are you looking forward to?",
                  ].map((p, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 4, rotate: 0 }}
                      onClick={() => setShowEditor(true)}
                      className="w-full text-left p-3 rounded-xl text-sm cursor-pointer transition-all font-handwritten text-base shadow-sm"
                      style={{
                        background: "hsl(48 80% 90%)",
                        color: "hsl(35 30% 25%)",
                        transform: `rotate(${(i % 3) - 1}deg)`,
                      }}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Life Book CTA */}
              {!lifeBook && (
                <div className="surface-card p-4 gradient-coral">
                  <h3 className="font-display font-semibold mb-2 text-sm flex items-center gap-2">
                    <Feather className="h-4 w-4 text-accent" /> Life Story Book
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Write the guided story of your life — from childhood to dreams.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl w-full"
                    onClick={() => setShowLifeBookSetup(true)}
                  >
                    Create My Life Book
                  </Button>
                </div>
              )}

              {/* Writing streak */}
              <div className="surface-card p-4 gradient-teal text-center">
                <p className="font-handwritten text-lg text-muted-foreground">Writing streak</p>
                <p className="font-display text-4xl font-bold mt-1">{entries.length}</p>
                <p className="text-xs text-muted-foreground mt-1">entries written</p>
                {entries.length === 0 && (
                  <p className="font-handwritten text-sm text-muted-foreground/60 mt-2 italic">
                    Start writing to build your streak ✨
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Entry Editor */}
      <JournalEntryEditor
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSaveEntry}
      />

      {/* Expanded entry dialog */}
      <Dialog open={!!expandedEntry} onOpenChange={() => setExpandedEntry(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-border/40">
          {expandedEntry && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              {expandedEntry.photos.length > 0 && (
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    <img src={expandedEntry.photos[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  {expandedEntry.photos.length > 1 && (
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {expandedEntry.photos.slice(1).map((p, i) => (
                        <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-depth">
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Date(expandedEntry.date).toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/30">
                    <span className="text-sm">{moodEmoji[expandedEntry.mood] || "📝"}</span>
                    <span className="text-xs capitalize text-muted-foreground">{expandedEntry.mood}</span>
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">{expandedEntry.title}</h2>
                <p className="font-handwritten text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {expandedEntry.content}
                </p>
                {expandedEntry.hasVoiceNote && <VoiceNotePlayer />}
                {expandedEntry.stickers.length > 0 && (
                  <div className="flex gap-2">
                    {expandedEntry.stickers.map((s, i) => (
                      <span key={i} className="text-2xl">{s}</span>
                    ))}
                  </div>
                )}
                {expandedEntry.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {expandedEntry.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Life Book Setup Modal */}
      <LifeBookSetup
        open={showLifeBookSetup}
        onClose={() => setShowLifeBookSetup(false)}
        onCreateBook={handleCreateLifeBook}
      />
    </div>
  );
};

export default Journal;
