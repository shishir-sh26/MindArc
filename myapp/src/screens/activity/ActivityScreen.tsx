import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, RefreshControl, TextInput, Alert, Modal } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { useActivityStore } from '../../store/activityStore';
import { wp, hp, rf } from '../../utils/responsive';
import { Card } from '../../components/common/Card';
import { yogaContent } from '../../data/yogaContent';
import { spacing } from '../../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NotificationController } from '../../utils/NotificationController';
import * as Haptics from 'expo-haptics';

type ActivityNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Activity'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ActivityNavigationProp;
};

export default function ActivityScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const uid = useActivityStore.getState().activeUserId;
    useActivityStore.getState().loadUserActivity(uid);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);
  
  const { 
    stepsCount, 
    stepsGoal, 
    isPedometerAvailable,
    dailyCheckInReminderEnabled,
    twoHourPromptsEnabled,
    addSteps,
    setStepsGoal,
    setDailyCheckInReminderEnabled,
    setTwoHourPromptsEnabled,
    checkMidnightReset
  } = useActivityStore();

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isSandboxExpanded, setIsSandboxExpanded] = useState(false);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  // Goal and Info Modal editing states
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(stepsGoal.toString());
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Perform midnight check whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      checkMidnightReset();
    }, [checkMidnightReset])
  );

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
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <Text style={[styles.title, { color: '#FFFFFF', marginBottom: spacing.xl }]}>{t('activity.title')}</Text>

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

          {/* Goal Settings & Info Action Row */}
          <View style={styles.goalActionRow}>
            <TouchableOpacity 
              onPress={() => {
                setTempGoal(stepsGoal.toString());
                setIsEditingGoal(true);
              }}
              style={[styles.editGoalBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Ionicons name="create-outline" size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.editGoalBtnText, { color: colors.text }]}>{t('activity.editGoal')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowInfoModal(true)}
              style={[styles.infoBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Ionicons name="information-circle-outline" size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.infoBtnText, { color: colors.text }]}>{t('activity.howItWorks')}</Text>
            </TouchableOpacity>
          </View>

          {/* Inline Goal Editor */}
          {isEditingGoal && (
            <View style={[styles.editGoalContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.editGoalTitle, { color: colors.text }]}>{t('activity.setDailyGoal')}</Text>
              <View style={styles.inlineEditRow}>
                <TextInput
                  style={[styles.goalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  keyboardType="numeric"
                  value={tempGoal}
                  onChangeText={setTempGoal}
                  maxLength={6}
                />
                <TouchableOpacity 
                  onPress={() => {
                    const newGoal = parseInt(tempGoal, 10);
                    if (!isNaN(newGoal) && newGoal > 0) {
                      setStepsGoal(newGoal);
                      setIsEditingGoal(false);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    } else {
                      Alert.alert(t('activity.invalidGoal'), t('activity.invalidGoalDesc'));
                    }
                  }}
                  style={[styles.saveGoalBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={styles.saveGoalBtnText}>{t('activity.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setIsEditingGoal(false)}
                  style={[styles.cancelGoalBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.cancelGoalBtnText, { color: colors.text }]}>{t('activity.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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

      {/* Step Counter Info Modal */}
      <Modal visible={showInfoModal} transparent animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
        <View style={styles.infoModalBg}>
          <View style={[styles.infoModalCard, { backgroundColor: isDark ? 'rgba(11,26,9,0.98)' : 'rgba(235,245,225,0.98)', borderColor: colors.border }]}>
            <View style={styles.infoModalHeader}>
              <Ionicons name="walk" size={28} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.infoModalTitle, { color: colors.text }]}>{t('activity.pedometerInfoTitle')}</Text>
            </View>
            
            <ScrollView style={styles.infoModalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.infoModalIntro, { color: colors.text }]}>
                {t('activity.pedometerInfoIntro')}
              </Text>
              
              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.accent }]}>{t('activity.pedometerInfoSec1Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>
                  {t('activity.pedometerInfoSec1Desc')}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.accent }]}>{t('activity.pedometerInfoSec2Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>
                  {t('activity.pedometerInfoSec2Desc')}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.accent }]}>{t('activity.pedometerInfoSec3Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>
                  {t('activity.pedometerInfoSec3Desc')}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.accent }]}>{t('activity.pedometerInfoSec4Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>
                  {t('activity.pedometerInfoSec4Desc')}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.accent }]}>{t('activity.pedometerInfoSec5Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>
                  {t('activity.pedometerInfoSec5Desc')}
                </Text>
              </View>

              {/* Walking Tips Divider */}
              <View style={[styles.tipsDivider, { borderColor: colors.border }]} />

              <View style={styles.infoSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Ionicons name="footsteps" size={20} color={colors.accent} />
                  <Text style={[styles.infoModalTitle, { color: colors.text, fontSize: 17 }]}>{t('activity.walkingTipsTitle')}</Text>
                </View>
                <Text style={[styles.infoModalIntro, { color: colors.textMuted, marginBottom: 10 }]}>
                  {t('activity.walkingTipsIntro')}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.text }]}>{t('activity.walkingTip1Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>{t('activity.walkingTip1Desc')}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.text }]}>{t('activity.walkingTip2Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>{t('activity.walkingTip2Desc')}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.text }]}>{t('activity.walkingTip3Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>{t('activity.walkingTip3Desc')}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.text }]}>{t('activity.walkingTip4Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>{t('activity.walkingTip4Desc')}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.text }]}>{t('activity.walkingTip5Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>{t('activity.walkingTip5Desc')}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.infoSecTitle, { color: colors.text }]}>{t('activity.walkingTip6Title')}</Text>
                <Text style={[styles.infoSecText, { color: colors.textMuted }]}>{t('activity.walkingTip6Desc')}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.infoCloseBtn, { backgroundColor: colors.accent }]}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.infoCloseBtnText}>{t('activity.gotIt')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, position: 'relative' },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: 100 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
  },
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
  yogaBadge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },

  // Goal Settings & Info Action Row
  goalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.md,
  },
  editGoalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  editGoalBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Inline Goal Editor
  editGoalContainer: {
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1.5,
    marginTop: spacing.md,
  },
  editGoalTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inlineEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalInput: {
    flex: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 14,
    fontWeight: '600',
  },
  saveGoalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveGoalBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelGoalBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelGoalBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Info Modal Styles
  infoModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  infoModalCard: {
    width: '92%',
    maxHeight: '80%',
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 24,
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoModalScroll: {
    maxHeight: hp(45),
    marginBottom: spacing.lg,
  },
  infoModalIntro: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  infoSection: {
    marginBottom: spacing.md,
  },
  infoSecTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoSecText: {
    fontSize: 12,
    lineHeight: 17,
  },
  infoCloseBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  infoCloseBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tipsDivider: {
    borderTopWidth: 1,
    marginVertical: spacing.md,
    marginHorizontal: 4,
  },
});
