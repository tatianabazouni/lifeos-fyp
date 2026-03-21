/**
 * LifeMovie — Cinematic year-in-review generator.
 * Pulls memories, journal entries, goals, and dreams from localStorage
 * and presents them as an animated, music-backed slideshow.
 */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play, Pause, SkipForward, SkipBack, Film, Sparkles, Heart,
  Calendar, Target, Star, Music, Volume2, VolumeX, ChevronRight,
  Trophy, MapPin, BookOpen, Image as ImageIcon, Clapperboard,
  RefreshCw,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ─── Data aggregation ─── */
interface Scene {
  id: string;
  type: "title" | "memory" | "journal" | "goal" | "dream" | "stat" | "closing";
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  emotion?: string;
  icon?: typeof Star;
  stat?: { label: string; value: string | number };
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function buildScenes(year: number): Scene[] {
  const scenes: Scene[] = [];

  // Title scene
  scenes.push({
    id: "title",
    type: "title",
    title: `Your ${year} Story`,
    subtitle: "A cinematic journey through your year",
    icon: Film,
  });

  // Memories
  const memories = loadFromStorage<any[]>("lifeos-memories", []);
  const yearMemories = memories.filter((m) => new Date(m.date).getFullYear() === year);
  const mapMemories = loadFromStorage<any[]>("lifeos-map-memories", []);
  const yearMapMemories = mapMemories.filter((m) => new Date(m.date).getFullYear() === year);

  // Journal entries
  const journal = loadFromStorage<any[]>("lifeos-journal-entries", []);
  const yearJournal = journal.filter((j) => new Date(j.date).getFullYear() === year);

  // Goals
  const goals = loadFromStorage<any[]>("lifeos-goals", []);

  // Dreams
  const dreams = loadFromStorage<any[]>("lifeos-dreams", []);

  // Stats scene
  const totalMemories = yearMemories.length + yearMapMemories.length;
  if (totalMemories > 0 || yearJournal.length > 0 || goals.length > 0) {
    scenes.push({
      id: "stats",
      type: "stat",
      title: "Your Year at a Glance",
      icon: Sparkles,
      stat: {
        label: "moments captured",
        value: totalMemories + yearJournal.length,
      },
    });
  }

  // Best memories (by emotion: joy, love first)
  const sortedMemories = [...yearMemories].sort((a, b) => {
    const priority: Record<string, number> = { joy: 0, love: 1, growth: 2, nostalgia: 3, calm: 4 };
    return (priority[a.emotion] ?? 5) - (priority[b.emotion] ?? 5);
  });

  sortedMemories.slice(0, 5).forEach((m, i) => {
    scenes.push({
      id: `memory-${m.id}`,
      type: "memory",
      title: m.title,
      description: m.description,
      date: m.date,
      imageUrl: m.imageUrl,
      emotion: m.emotion,
      icon: Heart,
    });
  });

  // Map memories (places)
  yearMapMemories.slice(0, 3).forEach((m) => {
    scenes.push({
      id: `map-${m.id}`,
      type: "memory",
      title: m.title,
      subtitle: `${m.city}, ${m.country}`,
      description: m.description,
      date: m.date,
      emotion: m.emotion,
      icon: MapPin,
    });
  });

  // Journal highlights
  const longestEntries = [...yearJournal]
    .sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))
    .slice(0, 3);

  longestEntries.forEach((j) => {
    scenes.push({
      id: `journal-${j.id}`,
      type: "journal",
      title: j.title || "Journal Entry",
      description: j.content?.slice(0, 200) + (j.content?.length > 200 ? "…" : ""),
      date: j.date,
      emotion: j.mood,
      icon: BookOpen,
    });
  });

  // Goals achieved
  const completedGoals = goals.filter((g) => g.completed || g.progress >= 100);
  completedGoals.slice(0, 3).forEach((g) => {
    scenes.push({
      id: `goal-${g.id}`,
      type: "goal",
      title: g.title,
      description: g.description,
      icon: Trophy,
    });
  });

  // Dreams
  dreams.slice(0, 2).forEach((d) => {
    scenes.push({
      id: `dream-${d.id}`,
      type: "dream",
      title: d.title,
      description: d.description,
      imageUrl: d.imageUrl,
      icon: Star,
    });
  });

  // Countries visited stat
  const countries = new Set(yearMapMemories.map((m: any) => m.country));
  if (countries.size > 0) {
    scenes.push({
      id: "countries",
      type: "stat",
      title: "Places Explored",
      icon: MapPin,
      stat: { label: "countries visited", value: countries.size },
    });
  }

  // Closing
  scenes.push({
    id: "closing",
    type: "closing",
    title: `Here's to ${year + 1}`,
    subtitle: "Your story continues…",
    icon: Sparkles,
  });

  return scenes;
}

/* ─── Emotion colors ─── */
const emotionGradients: Record<string, string> = {
  joy: "from-[hsl(44,100%,66%/0.15)] to-[hsl(38,92%,50%/0.08)]",
  calm: "from-[hsl(228,67%,41%/0.12)] to-[hsl(220,20%,97%/0.05)]",
  love: "from-[hsl(338,100%,39%/0.12)] to-[hsl(338,80%,50%/0.06)]",
  nostalgia: "from-[hsl(155,45%,43%/0.1)] to-[hsl(228,67%,41%/0.06)]",
  growth: "from-[hsl(155,45%,43%/0.12)] to-[hsl(155,55%,35%/0.06)]",
};

const emotionEmojis: Record<string, string> = {
  joy: "☀️", calm: "🌙", love: "❤️", nostalgia: "✨", growth: "🌿",
  happy: "😊", sad: "😢", excited: "🎉", grateful: "🙏", anxious: "😰",
  peaceful: "☮️", inspired: "💡", reflective: "🪞",
};

/* ─── Particle field ─── */
function CinematicParticles() {
  const particles = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Scene renderer ─── */
function SceneView({ scene, isActive }: { scene: Scene; isActive: boolean }) {
  const emotionGrad = scene.emotion ? emotionGradients[scene.emotion] || "" : "";
  const emoji = scene.emotion ? emotionEmojis[scene.emotion] || "" : "";

  if (scene.type === "title" || scene.type === "closing") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isActive ? { scale: 1 } : {}}
          transition={{ type: "spring", delay: 0.3, damping: 12 }}
          className="mb-8"
        >
          {scene.type === "title" ? (
            <Clapperboard className="h-20 w-20 text-primary mx-auto" />
          ) : (
            <Sparkles className="h-20 w-20 text-golden mx-auto" />
          )}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="font-display text-5xl md:text-6xl font-bold mb-4 text-foreground"
        >
          {scene.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-xl text-muted-foreground font-handwritten"
        >
          {scene.subtitle}
        </motion.p>
        {scene.type === "closing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ delay: 1.6 }}
            className="mt-8 flex gap-1"
          >
            {["❤️", "✨", "🌟", "✨", "❤️"].map((e, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={isActive ? { scale: 1 } : {}}
                transition={{ delay: 1.8 + i * 0.15, type: "spring" }}
                className="text-2xl"
              >
                {e}
              </motion.span>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (scene.type === "stat") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isActive ? { scale: 1 } : {}}
          transition={{ type: "spring", delay: 0.3 }}
        >
          {scene.icon && <scene.icon className="h-12 w-12 text-primary mx-auto mb-6" />}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="font-display text-3xl font-bold mb-8 text-foreground"
        >
          {scene.title}
        </motion.h2>
        {scene.stat && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={isActive ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.8, type: "spring", damping: 10 }}
          >
            <span className="text-7xl font-display font-bold text-gradient-hero">
              {scene.stat.value}
            </span>
            <p className="text-lg text-muted-foreground mt-2">{scene.stat.label}</p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Memory / Journal / Goal / Dream scenes
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isActive ? { opacity: 1 } : { opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={`absolute inset-0 flex items-center justify-center px-8 bg-gradient-to-br ${emotionGrad}`}
    >
      {/* Background emoji watermark */}
      {emoji && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={isActive ? { opacity: 0.08, scale: 1, rotate: 15 } : {}}
          transition={{ delay: 0.2, duration: 1 }}
          className="absolute text-[12rem] select-none pointer-events-none"
        >
          {emoji}
        </motion.span>
      )}

      <div className="relative z-10 max-w-2xl w-full">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Image */}
          {scene.imageUrl && (
            <motion.div
              initial={{ opacity: 0, x: -40, rotate: -3 }}
              animate={isActive ? { opacity: 1, x: 0, rotate: -2 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="polaroid flex-shrink-0"
            >
              <img
                src={scene.imageUrl}
                alt={scene.title}
                className="w-52 h-52 object-cover rounded-sm"
              />
            </motion.div>
          )}

          {/* Text content */}
          <div className={`flex-1 ${scene.imageUrl ? "text-left" : "text-center"}`}>
            {/* Scene type badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-3 rounded-full bg-primary/10 text-primary border-0 text-xs">
                {scene.icon && <scene.icon className="h-3 w-3 mr-1" />}
                {scene.type === "memory" ? "Memory" : scene.type === "journal" ? "Journal" : scene.type === "goal" ? "Achievement" : "Dream"}
              </Badge>
            </motion.div>

            {/* Date */}
            {scene.date && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 1 } : {}}
                transition={{ delay: 0.35 }}
                className="text-xs text-muted-foreground mb-2 flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                {new Date(scene.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </motion.p>
            )}

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2"
            >
              {scene.title}
            </motion.h2>

            {/* Subtitle */}
            {scene.subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 1 } : {}}
                transition={{ delay: 0.55 }}
                className="text-sm text-muted-foreground mb-3 flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" /> {scene.subtitle}
              </motion.p>
            )}

            {/* Description */}
            {scene.description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={isActive ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-foreground/70 text-sm leading-relaxed font-handwritten text-lg"
              >
                {scene.description}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Progress timeline ─── */
function TimelineBar({ scenes, current, onSeek }: { scenes: Scene[]; current: number; onSeek: (i: number) => void }) {
  const typeColors: Record<string, string> = {
    title: "bg-primary",
    memory: "bg-accent",
    journal: "bg-secondary",
    goal: "bg-golden",
    dream: "bg-golden",
    stat: "bg-primary",
    closing: "bg-primary",
  };

  return (
    <div className="flex items-center gap-1 w-full max-w-lg mx-auto">
      {scenes.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onSeek(i)}
          className="group relative flex-1 h-1.5 rounded-full overflow-hidden transition-all"
          title={s.title}
        >
          <div className="absolute inset-0 bg-muted/40 rounded-full" />
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${typeColors[s.type] || "bg-primary"}`}
            initial={false}
            animate={{ width: i < current ? "100%" : i === current ? "100%" : "0%" }}
            transition={{ duration: 0.4 }}
            style={{ opacity: i <= current ? 1 : 0.3 }}
          />
          {i === current && (
            <motion.div
              layoutId="timeline-dot"
              className="absolute -top-1.5 right-0 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-glow-primary"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Waveform visualizer ─── */
function AudioWaveform({ playing }: { playing: boolean }) {
  const bars = 16;
  return (
    <div className="flex items-end gap-[2px] h-5">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-primary/40"
          animate={playing ? {
            height: [4, Math.random() * 16 + 4, 4],
          } : { height: 4 }}
          transition={{
            duration: 0.5 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Empty state ─── */
function EmptyMovieState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-8"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Film className="h-20 w-20 text-primary/30 mx-auto mb-6" />
        </motion.div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          No scenes yet
        </h2>
        <p className="text-muted-foreground mb-2">
          Start creating memories, journal entries, and goals to generate your cinematic year recap.
        </p>
        <p className="text-sm text-muted-foreground/60 font-handwritten text-lg">
          Your life movie writes itself as you live it ✨
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Main page ─── */
const SCENE_DURATION = 6000; // ms per scene in autoplay

export default function LifeMovie() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build scenes when year changes
  useEffect(() => {
    setScenes(buildScenes(year));
    setCurrentScene(0);
    setPlaying(false);
    setShowIntro(true);
  }, [year]);

  // Autoplay
  useEffect(() => {
    if (!playing || showIntro) return;
    timerRef.current = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene((p) => p + 1);
      } else {
        setPlaying(false);
      }
    }, SCENE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, currentScene, scenes.length, showIntro]);

  const startMovie = () => {
    setShowIntro(false);
    setCurrentScene(0);
    setPlaying(true);
  };

  const togglePlay = () => setPlaying((p) => !p);
  const prev = () => { if (currentScene > 0) setCurrentScene((p) => p - 1); };
  const next = () => { if (currentScene < scenes.length - 1) setCurrentScene((p) => p + 1); };
  const seek = (i: number) => setCurrentScene(i);
  const regenerate = () => {
    setScenes(buildScenes(year));
    setCurrentScene(0);
    setShowIntro(true);
  };

  const hasContent = scenes.length > 2; // more than just title + closing
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="relative flex flex-col h-[calc(100vh-2rem)] rounded-xl overflow-hidden border border-border/30 bg-background">
      <CinematicParticles />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <Film className="h-5 w-5 text-primary" />
          <h1 className="font-display text-lg font-bold">Life Movie</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={regenerate} title="Regenerate">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main viewport */}
      {!hasContent ? (
        <EmptyMovieState />
      ) : showIntro ? (
        /* Intro / poster screen */
        <div className="flex-1 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg px-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Clapperboard className="h-24 w-24 text-primary mx-auto mb-6" />
            </motion.div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 text-foreground">
              Your {year} Story
            </h2>
            <p className="text-muted-foreground mb-2">
              {scenes.length - 2} scene{scenes.length - 2 !== 1 ? "s" : ""} from your year
            </p>
            <p className="text-sm text-muted-foreground/60 mb-8 font-handwritten text-lg">
              Sit back and relive the moments that mattered ✨
            </p>
            <Button onClick={startMovie} size="lg" className="gap-2 shadow-glow-primary">
              <Play className="h-5 w-5" /> Watch Your Movie
            </Button>
          </motion.div>
        </div>
      ) : (
        /* Scene viewport */
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <SceneView key={scenes[currentScene]?.id} scene={scenes[currentScene]} isActive />
          </AnimatePresence>
        </div>
      )}

      {/* Controls bar */}
      {!showIntro && hasContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-4 border-t border-border/20 space-y-3"
        >
          {/* Timeline */}
          <TimelineBar scenes={scenes} current={currentScene} onSeek={seek} />

          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMusicEnabled((p) => !p)}
              >
                {musicEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <AudioWaveform playing={playing && musicEnabled} />
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={prev} disabled={currentScene === 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button onClick={togglePlay} size="icon" className="h-10 w-10 rounded-full">
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={next} disabled={currentScene === scenes.length - 1}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground tabular-nums min-w-[60px] text-right">
              {currentScene + 1} / {scenes.length}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
