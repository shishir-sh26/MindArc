import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useActivityStore } from '../../store/activityStore';
import { Card } from '../../components/common/Card';
import { yogaContent } from '../../data/yogaContent';
import { spacing } from '../../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NotificationController } from '../../utils/NotificationController';

type ActivityNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Activity'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ActivityNavigationProp;
};

export default function ActivityScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  
  const { 
    stepsCount, 
    stepsGoal, 
    isPedometerAvailable,
    dailyCheckInReminderEnabled,
    twoHourPromptsEnabled,
    addSteps,
    setDailyCheckInReminderEnabled,
    setTwoHourPromptsEnabled,
    checkMidnightReset
  } = useActivityStore();

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isSandboxExpanded, setIsSandboxExpanded] = useState(false);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  // Perform midnight check on focus/mount
  useEffect(() => {
    checkMidnightReset();
  }, []);

  // Auto-walk Simulation Interval
  useEffect(() => {
    let timer: any;
    if (isAutoWalking) {
      timer = setInterval(() => {
        addSteps(12);
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoWalking]);

  // Handle Switches
  const handleToggleDailyCheckIn = async (val: boolean) => {
    setDailyCheckInReminderEnabled(val);
    if (val) {
      const hasPermission = await NotificationController.requestPermissionsAsync();
      if (hasPermission) {
        await NotificationController.scheduleDailyCheckInReminder();
      } else {
        setDailyCheckInReminderEnabled(false);
      }
    } else {
      await NotificationController.cancelDailyCheckInReminder();
    }
  };

  const handleToggleTwoHourPrompts = async (val: boolean) => {
    setTwoHourPromptsEnabled(val);
    if (val) {
      const hasPermission = await NotificationController.requestPermissionsAsync();
      if (hasPermission) {
        await NotificationController.scheduleTwoHourWellnessPrompts();
      } else {
        setTwoHourPromptsEnabled(false);
      }
    } else {
      await NotificationController.cancelWellnessPrompts();
    }
  };

  const progress = Math.min(stepsCount / stepsGoal, 1);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.38} showBottomPlants />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text, marginBottom: spacing.xl }]}>{t('activity.title')}</Text>

        {/* Pedometer Section */}
        <Card style={styles.stepsCard}>
          <View style={styles.headerRow}>
            <Text style={[styles.cardHeading, { color: colors.text, marginBottom: 0 }]}>
              {t('activity.pedometer')}
            </Text>
            
            {/* Sandbox Walk toggle badge */}
            <TouchableOpacity 
              onPress={() => setIsSandboxExpanded(!isSandboxExpanded)}
              style={[styles.sandboxToggle, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Ionicons name="construct" size={12} color={colors.accent} />
              <Text style={[styles.sandboxToggleText, { color: colors.textMuted }]}>
                {isSandboxExpanded ? "Hide Sim" : "Walk Sim"}
              </Text>
            </TouchableOpacity>
          </View>

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
              <Text style={[styles.stepCount, { color: colors.text }]}>{stepsCount}</Text>
              <Text style={[styles.stepGoal, { color: colors.textMuted }]}>/ {stepsGoal} {t('activity.goal')}</Text>
              
              <View style={[styles.statusBadge, { backgroundColor: colors.surfaceAlt, marginTop: spacing.sm }]}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: isPedometerAvailable === 'true' ? colors.accent : colors.warning }
                ]} />
                <Text style={[styles.statusText, { color: colors.textMuted }]}>
                  {isPedometerAvailable === 'true' 
                    ? "Pedometer Active" 
                    : isPedometerAvailable === 'checking'
                    ? "Checking Sensors..."
                    : "Shake / Use Sim"
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Sandbox controls inside ActivityScreen */}
          {isSandboxExpanded && (
            <View style={[styles.sandboxContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginTop: spacing.md }]}>
              <View style={styles.sandboxHeader}>
                <Ionicons name="walk" size={14} color={colors.accent} />
                <Text style={[styles.sandboxTitle, { color: colors.text }]}>Walk & Steps Simulator</Text>
              </View>
              <Text style={[styles.sandboxSub, { color: colors.textMuted }]}>
                Simulate physical steps to test progress meters, goal-completion triggers, and visual rings.
              </Text>
              
              <View style={styles.sandboxActions}>
                <TouchableOpacity 
                  onPress={() => addSteps(100)}
                  style={[styles.sandboxBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.sandboxBtnText, { color: colors.accent }]}>+100 Steps</Text>
                </TouchableOpacity>

                <View style={styles.walkSimToggleRow}>
                  <Text style={[styles.walkSimLabel, { color: colors.text }]}>Auto-Walk</Text>
                  <Switch
                    value={isAutoWalking}
                    onValueChange={setIsAutoWalking}
                    trackColor={{ false: colors.border, true: colors.accent }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Reminders & Notifications Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.md }]}>
          {t('activity.notifications')}
        </Text>
        
        <Card style={styles.notificationsContainer}>
          {/* Switch 1: Daily Check-in */}
          <View style={styles.notificationItem}>
            <View style={styles.notificationTextContainer}>
              <View style={styles.notificationTitleRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.notificationTitle, { color: colors.text }]}>
                  {t('activity.dailyCheckInReminder')}
                </Text>
              </View>
              <Text style={[styles.notificationSub, { color: colors.textMuted }]}>
                {t('activity.dailyCheckInReminderSub')}
              </Text>
            </View>
            <Switch
              value={dailyCheckInReminderEnabled}
              onValueChange={handleToggleDailyCheckIn}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Switch 2: 2-Hour Wellness Prompts */}
          <View style={styles.notificationItem}>
            <View style={styles.notificationTextContainer}>
              <View style={styles.notificationTitleRow}>
                <Ionicons name="rose-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.notificationTitle, { color: colors.text }]}>
                  {t('activity.twoHourWellnessPrompts')}
                </Text>
              </View>
              <Text style={[styles.notificationSub, { color: colors.textMuted }]}>
                {t('activity.twoHourWellnessPromptsSub')}
              </Text>
            </View>
            <Switch
              value={twoHourPromptsEnabled}
              onValueChange={handleToggleTwoHourPrompts}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Yoga Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.md }]}>{t('activity.yoga')}</Text>
        {yogaContent.map(yoga => (
          <View 
            key={yoga.id} 
            style={[styles.yogaCard, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'column', alignItems: 'stretch' }]}
          >
            {activeVideoId === yoga.id ? (
              <View style={{ width: '100%' }}>
                <YoutubeIframe
                  height={220}
                  videoId={yoga.videoId}
                  play={true}
                />
                <TouchableOpacity onPress={() => setActiveVideoId(null)} style={{ padding: spacing.sm, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('activity.closeVideo')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}
                onPress={() => setActiveVideoId(yoga.id)}
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
            )}
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, position: 'relative' },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: 28, fontWeight: 'bold' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeading: { fontSize: 18, fontWeight: '600' },
  stepsCard: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  progressContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  progressTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  stepsInfo: { marginLeft: spacing.xl, flex: 1, justifyContent: 'center' },
  stepCount: { fontSize: 36, fontWeight: 'bold', lineHeight: 40 },
  stepGoal: { fontSize: 16 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sandboxToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  sandboxToggleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sandboxContainer: {
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sandboxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  sandboxSub: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.md,
  },
  sandboxActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sandboxBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sandboxBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  walkSimToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  walkSimLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsContainer: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  notificationSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
    width: '100%',
  },
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
