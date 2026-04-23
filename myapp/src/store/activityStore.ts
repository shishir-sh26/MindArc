import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityState {
  stepsGoal: number;
  reminderTime: Date | null;
  setReminderTime: (time: Date | null) => void;
  setStepsGoal: (goal: number) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      stepsGoal: 10000,
      reminderTime: null,
      setReminderTime: (time) => set({ reminderTime: time }),
      setStepsGoal: (goal) => set({ stepsGoal: goal }),
    }),
    {
      name: 'mindspace-activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
