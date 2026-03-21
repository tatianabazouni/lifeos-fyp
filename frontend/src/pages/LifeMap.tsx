/**
 * LifeMap — Interactive world map with memory markers.
 * Memories with location data appear as glowing pins; clusters form when zoomed out.
 */
import { useState, useMemo, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe, MapPin, Filter, X, Plus, Camera, FileText, Mic, Video,
  Sparkles, ChevronDown, Flag,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

/* ─── Types ─── */
export interface MapMemory {
  id: string;
  title: string;
  description: string;
  date: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  type: "text" | "image" | "voice" | "video";
  emotion: "joy" | "calm" | "love" | "nostalgia" | "growth";
  imageUrl?: string;
  important: boolean;
}

const STORAGE_KEY = "lifeos-map-memories";

function loadMemories(): MapMemory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMemories(m: MapMemory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

/* ─── Marker icon factory ─── */
function makeIcon(emotion: string, important: boolean) {
  const colors: Record<string, string> = {
    joy: "hsl(44,100%,66%)",
    calm: "hsl(228,67%,41%)",
    love: "hsl(338,100%,39%)",
    nostalgia: "hsl(155,45%,43%)",
    growth: "hsl(155,45%,43%)",
  };
  const color = colors[emotion] || "hsl(155,45%,43%)";
  const size = important ? 18 : 12;
  const glow = important ? `0 0 12px ${color}, 0 0 24px ${color}` : `0 0 8px ${color}`;

  return L.divIcon({
    className: "",
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    html: `<div style="
      width:${size * 2}px;height:${size * 2}px;
      border-radius:50%;
      background:${color};
      box-shadow:${glow};
      border:2px solid white;
      transition:transform .2s;
      cursor:pointer;
    "></div>`,
  });
}

/* ─── Clustering logic (simple grid-based) ─── */
function clusterMemories(memories: MapMemory[], zoom: number) {
  if (zoom >= 8) return memories.map((m) => ({ ...m, count: 1, clustered: false }));

  const cellSize = 360 / Math.pow(2, zoom + 2);
  const clusters: Record<string, { items: MapMemory[]; lat: number; lng: number }> = {};

  memories.forEach((m) => {
    const key = `${Math.floor(m.lat / cellSize)}_${Math.floor(m.lng / cellSize)}`;
    if (!clusters[key]) clusters[key] = { items: [], lat: 0, lng: 0 };
    clusters[key].items.push(m);
    clusters[key].lat += m.lat;
    clusters[key].lng += m.lng;
  });

  return Object.values(clusters).map((c) => ({
    ...c.items[0],
    lat: c.lat / c.items.length,
    lng: c.lng / c.items.length,
    count: c.items.length,
    clustered: c.items.length > 1,
  }));
}

/* ─── Zoom tracker component ─── */
function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onZoom(map.getZoom());
    map.on("zoomend", handler);
    onZoom(map.getZoom());
    return () => { map.off("zoomend", handler); };
  }, [map, onZoom]);
  return null;
}

/* ─── Empty state ─── */
function EmptyMapOverlay({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none"
    >
      <div className="bg-background/90 backdrop-blur-md rounded-2xl p-8 max-w-md text-center shadow-lg border border-border/30 pointer-events-auto">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mx-auto mb-4"
        >
          <Globe className="h-16 w-16 text-primary mx-auto" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Your world awaits
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Pin your memories to the map and watch how your life expanded across the globe.
        </p>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add your first memory
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Memory detail card ─── */
function MemoryCard({ memory, onClose, onDelete }: { memory: MapMemory; onClose: () => void; onDelete: (id: string) => void }) {
  const typeIcons = { text: FileText, image: Camera, voice: Mic, video: Video };
  const TypeIcon = typeIcons[memory.type] || FileText;
  const emotionEmojis: Record<string, string> = {
    joy: "☀️", calm: "🌙", love: "❤️", nostalgia: "✨", growth: "🌿",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 25 }}
      className="absolute right-4 top-4 bottom-4 w-80 z-[1000] bg-background/95 backdrop-blur-lg rounded-2xl border border-border/30 shadow-2xl flex flex-col overflow-hidden"
    >
      {memory.imageUrl && (
        <div className="h-40 overflow-hidden rounded-t-2xl">
          <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {memory.city}, {memory.country}
            </p>
            <h3 className="font-display text-xl font-bold mt-1">{memory.title}</h3>
          </div>
          <span className="text-2xl">{emotionEmojis[memory.emotion]}</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {memory.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TypeIcon className="h-3.5 w-3.5" />
          <span className="capitalize">{memory.type}</span>
          <span>•</span>
          <span>{new Date(memory.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        {memory.important && (
          <Badge className="bg-golden/20 text-golden border-0 rounded-full text-xs">
            <Sparkles className="h-3 w-3 mr-1" /> Important location
          </Badge>
        )}
      </div>
      <div className="p-4 border-t border-border/20 flex gap-2">
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { onDelete(memory.id); onClose(); }}>
          Delete
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>Close</Button>
      </div>
    </motion.div>
  );
}

/* ─── Add memory form ─── */
function AddMemoryDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (m: MapMemory) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [type, setType] = useState<MapMemory["type"]>("text");
  const [emotion, setEmotion] = useState<MapMemory["emotion"]>("joy");
  const [important, setImportant] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = () => {
    if (!title.trim() || !lat || !lng || !city.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      country: country.trim() || "Unknown",
      city: city.trim(),
      type,
      emotion,
      imageUrl: undefined,
      important,
    });
    setTitle(""); setDescription(""); setCity(""); setCountry(""); setLat(""); setLng("");
    setImportant(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Pin a Memory
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A moment to remember…" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened here?" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" /></div>
            <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="France" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Latitude</Label><Input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="48.8566" /></div>
            <div><Label>Longitude</Label><Input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="2.3522" /></div>
          </div>
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as MapMemory["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">📝 Text</SelectItem>
                  <SelectItem value="image">📷 Image</SelectItem>
                  <SelectItem value="voice">🎙️ Voice</SelectItem>
                  <SelectItem value="video">🎬 Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Emotion</Label>
              <Select value={emotion} onValueChange={(v) => setEmotion(v as MapMemory["emotion"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="joy">☀️ Joy</SelectItem>
                  <SelectItem value="calm">🌙 Calm</SelectItem>
                  <SelectItem value="love">❤️ Love</SelectItem>
                  <SelectItem value="nostalgia">✨ Nostalgia</SelectItem>
                  <SelectItem value="growth">🌿 Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="rounded border-border" />
            <Flag className="h-3.5 w-3.5 text-golden" /> Mark as important life location
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !lat || !lng || !city.trim()}>
            <MapPin className="h-4 w-4 mr-1" /> Pin Memory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Stats bar ─── */
function StatsBar({ memories }: { memories: MapMemory[] }) {
  const countries = useMemo(() => new Set(memories.map((m) => m.country)).size, [memories]);
  const cities = useMemo(() => new Set(memories.map((m) => m.city)).size, [memories]);
  const important = useMemo(() => memories.filter((m) => m.important).length, [memories]);

  if (memories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-3"
    >
      {[
        { icon: Globe, label: "Countries", value: countries },
        { icon: MapPin, label: "Cities", value: cities },
        { icon: Sparkles, label: "Memories", value: memories.length },
        { icon: Flag, label: "Key places", value: important },
      ].map((s) => (
        <div
          key={s.label}
          className="bg-background/90 backdrop-blur-md rounded-xl px-4 py-2 border border-border/30 shadow-md flex items-center gap-2"
        >
          <s.icon className="h-4 w-4 text-primary" />
          <div className="text-center">
            <p className="text-lg font-bold leading-none">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function LifeMap() {
  const [memories, setMemories] = useState<MapMemory[]>(loadMemories);
  const [zoom, setZoom] = useState(3);
  const [selected, setSelected] = useState<MapMemory | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set(["text", "image", "voice", "video"]));

  useEffect(() => saveMemories(memories), [memories]);

  const filtered = useMemo(
    () => memories.filter((m) => typeFilter.has(m.type)),
    [memories, typeFilter]
  );

  const clustered = useMemo(() => clusterMemories(filtered, zoom), [filtered, zoom]);

  const handleZoom = useCallback((z: number) => setZoom(z), []);

  const addMemory = (m: MapMemory) => setMemories((prev) => [m, ...prev]);
  const deleteMemory = (id: string) => setMemories((prev) => prev.filter((m) => m.id !== id));

  const toggleType = (t: string) => {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  return (
    <div className="relative h-[calc(100vh-2rem)] w-full rounded-xl overflow-hidden border border-border/30">
      {/* Map */}
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom
        className="h-full w-full z-0"
        style={{ background: "hsl(220,20%,97%)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &amp; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomTracker onZoom={handleZoom} />

        {clustered.map((item) =>
          (item as any).clustered ? (
            <CircleMarker
              key={item.id + "-cluster"}
              center={[item.lat, item.lng]}
              radius={Math.min(30, 12 + (item as any).count * 3)}
              pathOptions={{
                fillColor: "hsl(155,45%,43%)",
                fillOpacity: 0.7,
                color: "white",
                weight: 2,
              }}
            >
              <Popup>
                <span className="font-display font-bold">{(item as any).count} memories</span>
              </Popup>
            </CircleMarker>
          ) : (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={makeIcon(item.emotion, item.important)}
              eventHandlers={{ click: () => setSelected(item) }}
            />
          )
        )}
      </MapContainer>

      {/* Stats */}
      <StatsBar memories={memories} />

      {/* Controls */}
      <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
        <Button onClick={() => setAddOpen(true)} className="gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Add Memory
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-background/90 backdrop-blur-md shadow-lg">
              <Filter className="h-4 w-4" /> Filter <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              { value: "text", label: "📝 Text" },
              { value: "image", label: "📷 Image" },
              { value: "voice", label: "🎙️ Voice" },
              { value: "video", label: "🎬 Video" },
            ].map((t) => (
              <DropdownMenuCheckboxItem
                key={t.value}
                checked={typeFilter.has(t.value)}
                onCheckedChange={() => toggleType(t.value)}
              >
                {t.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty state */}
      {memories.length === 0 && <EmptyMapOverlay onAdd={() => setAddOpen(true)} />}

      {/* Detail card */}
      <AnimatePresence>
        {selected && (
          <MemoryCard memory={selected} onClose={() => setSelected(null)} onDelete={deleteMemory} />
        )}
      </AnimatePresence>

      {/* Add dialog */}
      <AddMemoryDialog open={addOpen} onClose={() => setAddOpen(false)} onSave={addMemory} />
    </div>
  );
}
