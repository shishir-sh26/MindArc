import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationController } from '../utils/NotificationController';
import { useActivityStore } from './activityStore';

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  moodLevel: number; // 1-5
  symptoms: string[];
  sleepHours: number;
  sleepQuality: 'poor' | 'okay' | 'good';
  thoughtDiary?: string; // ADDED: Must support the new diary text
  appetite?: 'poor' | 'low' | 'normal' | 'high' | 'excessive';
  timestamp: number;
}

interface MoodState {
  entries: MoodEntry[];
  streak: number;
  streakBroken: boolean;
  streakHistory: Record<string, any>;
  addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'> & { id?: string }) => void;
  getEntryByDate: (date: string) => MoodEntry | undefined;
  setEntries: (entries: MoodEntry[]) => void;
  setStreak: (streak: number) => void;
  setStreakBroken: (broken: boolean) => void;
  setStreakHistory: (history: Record<string, any>) => void;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      streak: 0,
      streakBroken: false,
      streakHistory: {},
      addEntry: (entryData) => {
        // Postpone check-in reminder if enabled
        try {
          const isReminderEnabled = useActivityStore.getState().dailyCheckInReminderEnabled;
          if (isReminderEnabled) {
            NotificationController.postponeDailyReminderToTomorrow();
          }
        } catch (e) {
          console.warn('Failed to postpone check-in reminder:', e);
        }

        set((state) => {
          const existingIndex = state.entries.findIndex(e => e.date === entryData.date);
          let newEntries = [...state.entries];
          
          if (existingIndex !== -1) {
            // Update existing entry while preserving ID or taking the new one
            newEntries[existingIndex] = {
              ...newEntries[existingIndex],
              ...entryData,
              id: entryData.id || newEntries[existingIndex].id,
              timestamp: Date.now(),
            };
          } else {
            // Add new entry
            const newEntry: MoodEntry = {
              id: entryData.id || Date.now().toString(),
              date: entryData.date,
              moodLevel: entryData.moodLevel,
              symptoms: entryData.symptoms,
              sleepHours: entryData.sleepHours,
              sleepQuality: entryData.sleepQuality,
              thoughtDiary: entryData.thoughtDiary,
              appetite: entryData.appetite,
              timestamp: Date.now(),
            };
            newEntries.push(newEntry);
          }
          
          newEntries.sort((a, b) => b.timestamp - a.timestamp);
          return { entries: newEntries };
        });
      },
      getEntryByDate: (date) => {
        // Return the MOST RECENT entry for that date to pre-fill the form,
        // but don't delete the others.
        return get().entries.find(e => e.date === date);
      },
      setEntries: (entries) => set({ entries }),
      setStreak: (streak) => set({ streak }),
      setStreakBroken: (streakBroken) => set({ streakBroken }),
      setStreakHistory: (streakHistory) => set({ streakHistory }),
    }),
    {
      name: 'mindspace-mood-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);