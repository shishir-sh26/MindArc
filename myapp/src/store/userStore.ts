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
  vibrationEnabled: boolean;
  setProfile: (profile: Partial<UserProfile>) => void;
  setVibrationEnabled: (enabled: boolean) => void;
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
      vibrationEnabled: true,
      setProfile: (profileUpdates) => set((state) => ({
        profile: { ...state.profile, ...profileUpdates }
      })),
      setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
      clearProfile: () => set({ profile: DEFAULT_PROFILE, vibrationEnabled: true }),
    }),
    {
      name: 'mindspace-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
