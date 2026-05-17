import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  moodLevel: number; // 1-5
  symptoms: string[];
  sleepHours: number;
  sleepQuality: 'poor' | 'okay' | 'good';
  thoughtDiary?: string; // ADDED: Must support the new diary text
  timestamp: number;
}

interface MoodState {
  entries: MoodEntry[];
  streak: number;
  addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  getEntryByDate: (date: string) => MoodEntry | undefined;
  setEntries: (entries: MoodEntry[]) => void;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      streak: 0,
      addEntry: (entryData) => {
        const newEntry: MoodEntry = {
          ...entryData,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };

        set((state) => {
          // BRUTAL FIX: We no longer delete entries from the same date.
          // We keep everything and sort by newest first.
          const newEntries = [...state.entries, newEntry].sort((a, b) => b.timestamp - a.timestamp);
          
          const latestStreak = state.streak + 1;

          return { entries: newEntries, streak: latestStreak };
        });
      },
      getEntryByDate: (date) => {
        // Return the MOST RECENT entry for that date to pre-fill the form,
        // but don't delete the others.
        return get().entries.find(e => e.date === date);
      },
      setEntries: (entries) => set({ entries })
    }),
    {
      name: 'mindspace-mood-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);