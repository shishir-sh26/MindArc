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
  timestamp: number;
}

interface MoodState {
  entries: MoodEntry[];
  streak: number;
  addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  getEntryByDate: (date: string) => MoodEntry | undefined;
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
          // Remove existing entry for same date if it exists
          const filteredEntries = state.entries.filter(e => e.date !== entryData.date);
          const newEntries = [...filteredEntries, newEntry].sort((a, b) => b.timestamp - a.timestamp);
          
          // Calculate streak (simplified version)
          const latestStreak = state.streak + 1; // Basic logic just to increment

          return { entries: newEntries, streak: latestStreak };
        });
      },
      getEntryByDate: (date) => {
        return get().entries.find(e => e.date === date);
      }
    }),
    {
      name: 'mindspace-mood-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
