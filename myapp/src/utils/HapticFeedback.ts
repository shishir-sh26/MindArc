import * as Haptics from 'expo-haptics';
import { useUserStore } from '../store/userStore';

export const HapticFeedback = {
  ImpactFeedbackStyle: Haptics.ImpactFeedbackStyle,
  NotificationFeedbackType: Haptics.NotificationFeedbackType,
  impactAsync: async (style: Haptics.ImpactFeedbackStyle) => {
    const enabled = useUserStore.getState().vibrationEnabled ?? true;
    if (enabled) {
      try {
        await Haptics.impactAsync(style);
      } catch (e) {
        console.warn('Haptic feedback error:', e);
      }
    }
  },
  notificationAsync: async (type: Haptics.NotificationFeedbackType) => {
    const enabled = useUserStore.getState().vibrationEnabled ?? true;
    if (enabled) {
      try {
        await Haptics.notificationAsync(type);
      } catch (e) {
        console.warn('Haptic feedback error:', e);
      }
    }
  },
  selectionAsync: async () => {
    const enabled = useUserStore.getState().vibrationEnabled ?? true;
    if (enabled) {
      try {
        await Haptics.selectionAsync();
      } catch (e) {
        console.warn('Haptic feedback error:', e);
      }
    }
  }
};
