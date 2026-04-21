import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThoughtEntry {
  id: string;
  timestamp: number;
  situation: string;
  automaticThought: string;
  emotion: string;
  intensity: number; // 0-10
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
}

interface ThoughtState {
  entries: ThoughtEntry[];
  addEntry: (entry: Omit<ThoughtEntry, 'id' | 'timestamp'>) => void;
  deleteEntry: (id: string) => void;
}

export const useThoughtStore = create<ThoughtState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entryData) => {
        const newEntry: ThoughtEntry = {
          ...entryData,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter(e => e.id !== id),
        }));
      }
    }),
    {
      name: 'mindspace-thought-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
