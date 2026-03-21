import { useState, useCallback, useEffect } from "react";
import type { MemoryItem } from "@/components/life-capsule/MemoryVaultScene";
import { createMemory, deleteMemory as removeMemory, getMemories, updateMemory as patchMemory } from "@/api/memoryApi";

const mapMemory = (memory: any): MemoryItem => ({
  id: String(memory.id || memory._id),
  title: memory.title || "Untitled",
  description: memory.description || "",
  date: memory.date || new Date().toISOString(),
  chapter: memory.chapter || memory.category || "reflections",
  type: memory.type || "text",
  imageUrl: memory.imageUrl || memory.mediaUrl || "",
  location: memory.location || "",
  people: Array.isArray(memory.people) ? memory.people : [],
  emotion: memory.emotion || "calm",
  tags: Array.isArray(memory.tags) ? memory.tags : [],
  chapterId: memory.chapterId || memory.chapter,
});

export function useMemories() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getMemories();
        setMemories(data.map(mapMemory));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load memories");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addMemory = useCallback(async (memory: MemoryItem) => {
    const created = await createMemory(memory as unknown as Record<string, unknown>);
    setMemories((prev) => [mapMemory(created), ...prev]);
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    await removeMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMemory = useCallback(async (id: string, updates: Partial<MemoryItem>) => {
    const updated = await patchMemory(id, updates as Record<string, unknown>);
    setMemories((prev) => prev.map((m) => (m.id === id ? mapMemory(updated) : m)));
  }, []);

  return { memories, addMemory, deleteMemory, updateMemory, loading, error };
}
