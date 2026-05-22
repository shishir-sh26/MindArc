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

export const DAILY_CHECKIN_REMINDER_ID = 'daily-checkin-reminder';
export const WELLNESS_PROMPTS_ID = 'wellness-prompts';

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
        lightColor: '#5DBF6E', // Bioluminescent Green
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
   * Schedules a daily check-in reminder at 20:00 (8:00 PM) to log entries.
   */
  scheduleDailyCheckInReminder: async (startFromTomorrow: boolean = false) => {
    try {
      const hasPermission = await NotificationController.requestPermissionsAsync();
      if (!hasPermission) {
        console.warn('Notification permission not granted.');
        return;
      }

      // Clear first to prevent duplicates
      await Notifications.cancelScheduledNotificationAsync(DAILY_CHECKIN_REMINDER_ID);

      if (startFromTomorrow) {
        // Schedule a one-time notification for tomorrow at 8:00 PM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(20, 0, 0, 0);

        await Notifications.scheduleNotificationAsync({
          identifier: DAILY_CHECKIN_REMINDER_ID,
          content: {
            title: "Daily Reflections 🌿",
            body: "Take a quiet moment to record your mood and complete your daily check-in.",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: tomorrow,
          } as any,
        });
        console.log("Postponed daily reminder to tomorrow at 8:00 PM");
      } else {
        // Schedule daily repeating reminder at 8:00 PM
        await Notifications.scheduleNotificationAsync({
          identifier: DAILY_CHECKIN_REMINDER_ID,
          content: {
            title: "Daily Reflections 🌿",
            body: "Take a quiet moment to record your mood and complete your daily check-in.",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 20,
            minute: 0,
            repeats: true,
          } as any,
        });
        console.log("Scheduled daily check-in reminder for 8:00 PM");
      }
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error);
    }
  },

  /**
   * Postpones the daily reminder to tomorrow. Call this when any check-in entry is made today.
   */
  postponeDailyReminderToTomorrow: async () => {
    // Re-schedule starting from tomorrow
    await NotificationController.scheduleDailyCheckInReminder(true);
  },

  /**
   * Cancels the daily check-in reminder.
   */
  cancelDailyCheckInReminder: async () => {
    await Notifications.cancelScheduledNotificationAsync(DAILY_CHECKIN_REMINDER_ID);
    console.log("Cancelled daily check-in reminder");
  },

  /**
   * Schedules a recurring wellness nudge every 2 hours (7200 seconds).
   */
  scheduleTwoHourWellnessPrompts: async () => {
    try {
      const hasPermission = await NotificationController.requestPermissionsAsync();
      if (!hasPermission) return;

      await Notifications.cancelScheduledNotificationAsync(WELLNESS_PROMPTS_ID);

      await Notifications.scheduleNotificationAsync({
        identifier: WELLNESS_PROMPTS_ID,
        content: {
          title: "Mindful Pause 🧘‍♂️",
          body: "Time for a gentle stretch or a quick yoga pose! Take a deep breath to reset your mind and relax.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 7200, // 2 hours
          repeats: true,
        } as any,
      });
      console.log("Scheduled 2-hour wellness and yoga prompts repeating");
    } catch (error) {
      console.error('Failed to schedule wellness prompts:', error);
    }
  },

  /**
   * Cancels the 2-hour wellness notifications.
   */
  cancelWellnessPrompts: async () => {
    await Notifications.cancelScheduledNotificationAsync(WELLNESS_PROMPTS_ID);
    console.log("Cancelled 2-hour wellness prompts");
  }
};
