import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserActivityData {
  stepsGoal: number;
  stepsCount: number;
  lastUpdatedDate: string;
  dailyCheckInReminderEnabled: boolean;
  twoHourPromptsEnabled: boolean;
  reminderTime: string | null;
}

interface ActivityState {
  // Current active variables
  stepsGoal: number;
  reminderTime: string | null;
  stepsCount: number;
  lastUpdatedDate: string;
  isPedometerAvailable: string;
  dailyCheckInReminderEnabled: boolean;
  twoHourPromptsEnabled: boolean;

  // Multi-user state mapping
  userActivities: Record<string, UserActivityData>;
  activeUserId: string | null;

  setReminderTime: (time: Date | null) => void;
  setStepsGoal: (goal: number) => void;
  setStepsCount: (count: number) => void;
  setPedometerAvailable: (status: string) => void;
  addSteps: (amount: number) => void;
  checkMidnightReset: () => void;
  setDailyCheckInReminderEnabled: (enabled: boolean) => void;
  setTwoHourPromptsEnabled: (enabled: boolean) => void;
  loadUserActivity: (userId: string | null) => void;
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      stepsGoal: 10000,
      reminderTime: null,
      stepsCount: 0,
      lastUpdatedDate: getTodayString(),
      isPedometerAvailable: 'checking',
      dailyCheckInReminderEnabled: false,
      twoHourPromptsEnabled: false,

      // Initialize dictionary and active user
      userActivities: {},
      activeUserId: null,

      loadUserActivity: (userId) => {
        const uid = userId || 'guest';
        const userActivities = get().userActivities || {};

        if (!userActivities[uid]) {
          userActivities[uid] = {
            stepsGoal: 10000,
            stepsCount: 0,
            lastUpdatedDate: getTodayString(),
            dailyCheckInReminderEnabled: false,
            twoHourPromptsEnabled: false,
            reminderTime: null,
          };
        }

        const userData = userActivities[uid];

        set({
          activeUserId: userId,
          userActivities,
          stepsGoal: userData.stepsGoal,
          stepsCount: userData.stepsCount,
          lastUpdatedDate: userData.lastUpdatedDate,
          dailyCheckInReminderEnabled: userData.dailyCheckInReminderEnabled,
          twoHourPromptsEnabled: userData.twoHourPromptsEnabled,
          reminderTime: userData.reminderTime,
        });

        get().checkMidnightReset();
      },

      setReminderTime: (time) => {
        const uid = get().activeUserId || 'guest';
        const strTime = time ? time.toISOString() : null;
        set((state) => {
          const userActivities = { ...state.userActivities };
          if (!userActivities[uid]) {
            userActivities[uid] = {
              stepsGoal: 10000,
              stepsCount: 0,
              lastUpdatedDate: getTodayString(),
              dailyCheckInReminderEnabled: false,
              twoHourPromptsEnabled: false,
              reminderTime: null,
            };
          }
          userActivities[uid] = { ...userActivities[uid], reminderTime: strTime };
          return { reminderTime: strTime, userActivities };
        });
      },

      setStepsGoal: (goal) => {
        const uid = get().activeUserId || 'guest';
        set((state) => {
          const userActivities = { ...state.userActivities };
          if (!userActivities[uid]) {
            userActivities[uid] = {
              stepsGoal: 10000,
              stepsCount: 0,
              lastUpdatedDate: getTodayString(),
              dailyCheckInReminderEnabled: false,
              twoHourPromptsEnabled: false,
              reminderTime: null,
            };
          }
          userActivities[uid] = { ...userActivities[uid], stepsGoal: goal };
          return { stepsGoal: goal, userActivities };
        });
      },
      
      setStepsCount: (count) => {
        get().checkMidnightReset();
        const uid = get().activeUserId || 'guest';
        set((state) => {
          const userActivities = { ...state.userActivities };
          if (!userActivities[uid]) {
            userActivities[uid] = {
              stepsGoal: 10000,
              stepsCount: 0,
              lastUpdatedDate: getTodayString(),
              dailyCheckInReminderEnabled: false,
              twoHourPromptsEnabled: false,
              reminderTime: null,
            };
          }
          userActivities[uid] = { ...userActivities[uid], stepsCount: count };
          return { stepsCount: count, userActivities };
        });
      },

      setPedometerAvailable: (status) => set({ isPedometerAvailable: status }),

      addSteps: (amount) => {
        get().checkMidnightReset();
        const uid = get().activeUserId || 'guest';
        set((state) => {
          const newSteps = state.stepsCount + amount;
          const userActivities = { ...state.userActivities };
          if (!userActivities[uid]) {
            userActivities[uid] = {
              stepsGoal: 10000,
              stepsCount: 0,
              lastUpdatedDate: getTodayString(),
              dailyCheckInReminderEnabled: false,
              twoHourPromptsEnabled: false,
              reminderTime: null,
            };
          }
          userActivities[uid] = { ...userActivities[uid], stepsCount: newSteps };
          return { stepsCount: newSteps, userActivities };
        });
      },

      checkMidnightReset: () => {
        const today = getTodayString();
        if (get().lastUpdatedDate !== today) {
          const uid = get().activeUserId || 'guest';
          set((state) => {
            const userActivities = { ...state.userActivities };
            if (!userActivities[uid]) {
              userActivities[uid] = {
                stepsGoal: 10000,
                stepsCount: 0,
                lastUpdatedDate: getTodayString(),
                dailyCheckInReminderEnabled: false,
                twoHourPromptsEnabled: false,
                reminderTime: null,
              };
            }
            userActivities[uid] = { ...userActivities[uid], stepsCount: 0, lastUpdatedDate: today };
            return {
              stepsCount: 0,
              lastUpdatedDate: today,
              userActivities,
            };
          });
        }
      },

      setDailyCheckInReminderEnabled: (enabled) => {
        const uid = get().activeUserId || 'guest';
        set((state) => {
          const userActivities = { ...state.userActivities };
          if (!userActivities[uid]) {
            userActivities[uid] = {
              stepsGoal: 10000,
              stepsCount: 0,
              lastUpdatedDate: getTodayString(),
              dailyCheckInReminderEnabled: false,
              twoHourPromptsEnabled: false,
              reminderTime: null,
            };
          }
          userActivities[uid] = { ...userActivities[uid], dailyCheckInReminderEnabled: enabled };
          return { dailyCheckInReminderEnabled: enabled, userActivities };
        });
      },

      setTwoHourPromptsEnabled: (enabled) => {
        const uid = get().activeUserId || 'guest';
        set((state) => {
          const userActivities = { ...state.userActivities };
          if (!userActivities[uid]) {
            userActivities[uid] = {
              stepsGoal: 10000,
              stepsCount: 0,
              lastUpdatedDate: getTodayString(),
              dailyCheckInReminderEnabled: false,
              twoHourPromptsEnabled: false,
              reminderTime: null,
            };
          }
          userActivities[uid] = { ...userActivities[uid], twoHourPromptsEnabled: enabled };
          return { twoHourPromptsEnabled: enabled, userActivities };
        });
      },
    }),
    {
      name: 'mindspace-activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
