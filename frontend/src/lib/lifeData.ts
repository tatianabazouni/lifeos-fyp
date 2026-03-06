export interface JournalEntryData {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
}

export interface GoalItemData {
  id: string;
  title: string;
  category: string;
  milestones: { id: string; text: string; done: boolean }[];
}

export interface MemoryEntryData {
  id: string;
  title: string;
  description: string;
  year: number;
  date: string;
  photo?: string;
}

const KEYS = {
  journal: 'lifeos_journal_entries',
  goals: 'lifeos_goals',
  memories: 'lifeos_memories',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('lifeos:data-updated', { detail: key }));
}

export const lifeData = {
  getJournalEntries: () => read<JournalEntryData[]>(KEYS.journal, []),
  setJournalEntries: (items: JournalEntryData[]) => write(KEYS.journal, items),
  getGoals: () => read<GoalItemData[]>(KEYS.goals, []),
  setGoals: (items: GoalItemData[]) => write(KEYS.goals, items),
  getMemories: () => read<MemoryEntryData[]>(KEYS.memories, []),
  setMemories: (items: MemoryEntryData[]) => write(KEYS.memories, items),
};
