import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { Pedometer } from 'expo-sensors';
import * as Notifications from 'expo-notifications';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useActivityStore } from '../../store/activityStore';
import { Card } from '../../components/common/Card';
import { yogaContent } from '../../data/yogaContent';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type ActivityNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Activity'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ActivityNavigationProp;
};

// Setup notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function ActivityScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { stepsGoal, reminderTime, setReminderTime } = useActivityStore();

  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [reminderEnabled, setReminderEnabled] = useState(!!reminderTime);

  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;
    
    // Check permission & availability
    Pedometer.requestPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Pedometer.isAvailableAsync().then(
          result => {
            setIsPedometerAvailable(String(result));
            if (result) {
              // Get today's steps up to now
              const end = new Date();
              const start = new Date();
              start.setHours(0, 0, 0, 0);
              Pedometer.getStepCountAsync(start, end).then(
                result => setCurrentStepCount(result.steps),
                error => console.warn(error)
              );

              // Listen for current steps
              subscription = Pedometer.watchStepCount(result => {
                setCurrentStepCount(prev => prev + result.steps);
              });
            }
          },
          error => setIsPedometerAvailable('Could not get isAvailable: ' + error)
        );
      } else {
        setIsPedometerAvailable('Permission Denied');
      }
    });

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const handleToggleReminder = async (val: boolean) => {
    setReminderEnabled(val);
    if (val) {
      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setReminderEnabled(false);
        return;
      }
      // Schedule a daily reminder at 18:00 (mock time for this build)
      const mockTime = new Date();
      mockTime.setHours(18, 0, 0, 0);
      setReminderTime(mockTime);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to move! 🏃‍♂️",
          body: "Don't forget to take a break and get some steps in or do a little yoga.",
        },
        trigger: {
          hour: 18,
          minute: 0,
          repeats: true,
        } as Notifications.NotificationTriggerInput,
      });
    } else {
      setReminderTime(null);
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const progress = Math.min(currentStepCount / stepsGoal, 1);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text, marginBottom: spacing.xl }]}>Activity</Text>

      {/* Pedometer Section */}
      <Card style={styles.stepsCard}>
        <Text style={[styles.cardHeading, { color: colors.text }]}>Daily Steps</Text>
        <View style={styles.statsRow}>
          <View style={styles.progressContainer}>
            <Svg width={140} height={140}>
              <Circle
                stroke={colors.border}
                fill="none"
                cx={70}
                cy={70}
                r={radius}
                strokeWidth={12}
              />
              <Circle
                stroke={colors.accent}
                fill="none"
                cx={70}
                cy={70}
                r={radius}
                strokeWidth={12}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="70, 70"
              />
            </Svg>
            <View style={styles.progressTextContainer}>
              <Ionicons name="walk" size={24} color={colors.accent} />
            </View>
          </View>
          <View style={styles.stepsInfo}>
            <Text style={[styles.stepCount, { color: colors.text }]}>{currentStepCount}</Text>
            <Text style={[styles.stepGoal, { color: colors.textMuted }]}>/ {stepsGoal} goal</Text>
            {isPedometerAvailable !== 'true' && (
              <Text style={{ color: colors.danger, fontSize: 10, marginTop: 4 }}>
                Sensor: {isPedometerAvailable}
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* Reminder Section */}
      <Card style={styles.reminderCard}>
        <View style={styles.reminderText}>
          <Text style={[styles.cardHeading, { color: colors.text }]}>Daily Reminder</Text>
          <Text style={[styles.reminderSub, { color: colors.textMuted }]}>
            Get a daily nudge to stay active (6:00 PM)
          </Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={handleToggleReminder}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#fff"
        />
      </Card>

      {/* Yoga Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Yoga & Stretching</Text>
      {yogaContent.map(yoga => (
        <TouchableOpacity 
          key={yoga.id} 
          style={[styles.yogaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('YogaPlayer', { videoUrl: yoga.videoUrl, title: yoga.title })}
        >
          <Image source={{ uri: yoga.thumbnailUrl }} style={styles.yogaThumb} />
          <View style={styles.yogaInfo}>
            <Text style={[styles.yogaTitle, { color: colors.text }]}>{yoga.title}</Text>
            <View style={styles.yogaMeta}>
              <Text style={[styles.yogaBadge, { backgroundColor: colors.surfaceAlt, color: colors.textMuted }]}>
                {yoga.duration}
              </Text>
              <Text style={[styles.yogaBadge, { backgroundColor: colors.surfaceAlt, color: colors.textMuted }]}>
                {yoga.level}
              </Text>
            </View>
          </View>
          <Ionicons name="play-circle" size={32} color={colors.accent} style={{ padding: spacing.sm }} />
        </TouchableOpacity>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: 28, fontWeight: 'bold' },
  cardHeading: { fontSize: 18, fontWeight: '600', marginBottom: spacing.md },
  stepsCard: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  progressContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  progressTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  stepsInfo: { marginLeft: spacing.xl, flex: 1 },
  stepCount: { fontSize: 36, fontWeight: 'bold' },
  stepGoal: { fontSize: 16 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  reminderText: { flex: 1, marginRight: spacing.md },
  reminderSub: { fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: spacing.md },
  yogaCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  yogaThumb: { width: 100, height: 100 },
  yogaInfo: { flex: 1, padding: spacing.md },
  yogaTitle: { fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  yogaMeta: { flexDirection: 'row', gap: spacing.xs },
  yogaBadge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' }
});
