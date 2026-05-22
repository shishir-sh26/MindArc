import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationController } from '../utils/NotificationController';
import { useActivityStore } from './activityStore';

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
  addEntry: (entry: Omit<ThoughtEntry, 'id' | 'timestamp'> & { id?: string }) => void;
  deleteEntry: (id: string) => void;
  setEntries: (entries: ThoughtEntry[]) => void;
}

export const useThoughtStore = create<ThoughtState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entryData) => {
        const newEntry: ThoughtEntry = {
          ...entryData,
          id: entryData.id || Date.now().toString(),
          timestamp: Date.now(),
        };

        // Postpone check-in reminder if enabled
        try {
          const isReminderEnabled = useActivityStore.getState().dailyCheckInReminderEnabled;
          if (isReminderEnabled) {
            NotificationController.postponeDailyReminderToTomorrow();
          }
        } catch (e) {
          console.warn('Failed to postpone check-in reminder:', e);
        }

        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter(e => e.id !== id),
        }));
      },
      setEntries: (entries) => set({ entries })
    }),
    {
      name: 'mindspace-thought-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
