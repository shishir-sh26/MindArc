import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set global notification handler behaviors
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationController = {
  /**
   * Request permission from the user to display notifications.
   */
  requestPermissionsAsync: async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8FBC8F', // Sage Green accent
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  /**
   * Schedules a daily reminder to stretch or be active.
   * @param hour The hour of the day (0-23)
   * @param minute The minute of the hour (0-59)
   */
  scheduleDailyActivityReminder: async (hour: number = 10, minute: number = 0) => {
    try {
      const hasPermission = await NotificationController.requestPermissionsAsync();
      if (!hasPermission) {
        console.warn('Notification permission not granted.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Move 🌿",
          body: "Take a 5-minute somatic stretching break to reset your nervous system.",
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        } as any,
      });
      console.log(`Scheduled daily reminder for ${hour}:${minute < 10 ? '0'+minute : minute}`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  },

  /**
   * Cancels all scheduled notifications.
   */
  cancelAllScheduledNotifications: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};
