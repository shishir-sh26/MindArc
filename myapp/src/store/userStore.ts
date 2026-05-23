import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  bio: string;
  age: string;
  gender: string;
  stepGoal: string;
  waterGoal: string;
  focusArea: string;
  preferredWorkout: string;
}

interface UserState {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  bio: '',
  age: '',
  gender: '',
  stepGoal: '6000',
  waterGoal: '8',
  focusArea: 'Anxiety Reduction',
  preferredWorkout: 'Yoga',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (profileUpdates) => set((state) => ({
        profile: { ...state.profile, ...profileUpdates }
      })),
      clearProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: 'mindspace-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
