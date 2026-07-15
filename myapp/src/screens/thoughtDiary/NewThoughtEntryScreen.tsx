import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ForestBackground } from '../../components/common/ForestBackground';
import { db, auth } from '../../utils/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useThoughtStore } from '../../store/thoughtStore';
import { useMoodStore } from '../../store/moodStore';
import { updateUserStreak, isYesterday } from '../../utils/streakService';
import { Button } from '../../components/common/Button';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'NewThoughtEntry'>;

const COGNITIVE_DISTORTIONS = [
  { id: 'all_nothing', name: 'All-or-Nothing', desc: 'Viewing situations in black-and-white. E.g., "If I make one mistake, I am a complete failure."' },
  { id: 'catastrophizing', name: 'Catastrophizing', desc: 'Predicting the worst-case scenario regardless of facts. E.g., "I will mess up this speech and get fired."' },
  { id: 'mind_reading', name: 'Mind Reading', desc: 'Believing you know what others are thinking without proof. E.g., "Everyone in the room thinks I am boring."' },
  { id: 'emotional_reasoning', name: 'Emotional Reasoning', desc: 'Assuming your emotions represent objective truth. E.g., "I feel so anxious, which means this environment is dangerous."' },
  { id: 'overgeneralization', name: 'Overgeneralization', desc: 'Viewing a single negative event as a perpetual cycle of defeat. E.g., "I failed this test, I will never succeed at anything."' }
];

export default function NewThoughtEntryScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const addEntry = useThoughtStore((state) => state.addEntry);

  const [currentStep, setCurrentStep] = useState(0); // 0 to 5
  const [showDistortions, setShowDistortions] = useState(false);
  const [expandedDistortion, setExpandedDistortion] = useState<string | null>(null);

  // Form Fields
  const [situation, setSituation] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balancedThought, setBalancedThought] = useState('');

  // Reanimated transitions for step swapping
  const cardOpacity = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);

  const triggerCardTransition = (direction: 'next' | 'back', callback: () => void) => {
    const exitX = direction === 'next' ? -50 : 50;
    const enterX = direction === 'next' ? 50 : -50;

    cardOpacity.value = withTiming(0, { duration: 150 }, () => {
      // Execute the state change
      cardTranslateX.value = enterX;
      cardOpacity.value = withTiming(1, { duration: 200 });
      cardTranslateX.value = withTiming(0, { duration: 200 });
    });
    
    // Slight timeout before callback to prevent visual pop
    setTimeout(callback, 100);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      triggerCardTransition('next', () => {
        setCurrentStep(prev => prev + 1);
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      triggerCardTransition('back', () => {
        setCurrentStep(prev => prev - 1);
      });
    }
  };

  const handleSave = () => {
    if (!situation.trim() || !automaticThought.trim() || !emotion.trim() || !balancedThought.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const payload = {
      situation,
      automaticThought,
      emotion,
      intensity,
      evidenceFor,
      evidenceAgainst,
      balancedThought,
      created_at: new Date().toISOString()
    };

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save entries.");
      return;
    }

    const docId = doc(collection(db, 'users', user.uid, 'thought_logs')).id;

    // 1. Optimistic local update
    addEntry({
      id: docId,
      ...payload
    });

    // 2. Optimistic streak calculation
    try {
      const store = useMoodStore.getState();
      const currentStreak = store.streak;
      let lastPostDate = '';
      
      const uniqueDates = Array.from(new Set(store.entries.map(e => e.date))).sort((a, b) => b.localeCompare(a));
      const datesWithoutToday = uniqueDates.filter(d => d !== today);
      if (datesWithoutToday.length > 0) {
        lastPostDate = datesWithoutToday[0];
      }

      let newStreak = currentStreak;
      if (lastPostDate === '') {
        newStreak = 1;
      } else if (isYesterday(lastPostDate, today)) {
        newStreak = currentStreak + 1;
      } else if (lastPostDate !== today) {
        newStreak = 1;
      }

      store.setStreak(newStreak);
      store.setStreakBroken(false);
    } catch (streakErr) {
      console.warn("[NewThoughtEntryScreen] Failed to calculate optimistic streak:", streakErr);
    }

    // 3. Navigation transition back immediately
    navigation.goBack();

    // 4. Remote background sync
    (async () => {
      try {
        await setDoc(doc(db, 'users', user.uid, 'thought_logs', docId), {
          ...payload,
          user_id: user.uid
        });
        console.log("[NewThoughtEntryScreen] Background: Saved thought log in Firestore:", docId);

        // Update streak remotely
        await updateUserStreak(user.uid, today, 'thought', {
          situation: situation,
          intensity: intensity
        });
      } catch (err: any) {
        console.warn('[NewThoughtEntryScreen] Background thought save warning (offline/network issue):', err);
      }
    })();
  };

  // Helper validation to prevent empty forward navigation
  const isNextDisabled = () => {
    if (currentStep === 0) return !situation.trim();
    if (currentStep === 1) return !automaticThought.trim();
    if (currentStep === 2) return !emotion.trim();
    if (currentStep === 5) return !balancedThought.trim();
    return false;
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }]
  }));

  const inputStyle = [
    styles.input,
    { 
      backgroundColor: colors.surfaceAlt, 
      color: colors.text,
      borderColor: colors.border
    }
  ];

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ForestBackground bgHeightRatio={0.34} showBottomPlants={false} />
      
      {/* Step Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressTextRow}>
          <Text style={[styles.progressSubtitle, { color: isDark ? colors.accent : colors.accentDeep }]}>
            {t('thoughtDiary.balancedThought', { defaultValue: 'CBT REFRAMING' })}
          </Text>
          <Text style={[styles.progressSteps, { color: colors.textMuted }]}>
            {currentStep + 1} / 6
          </Text>
        </View>
        
        {/* Sleek Progress Bar */}
        <View style={[styles.progressBarBg, { backgroundColor: colors.borderLight }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${((currentStep + 1) / 6) * 100}%`,
                backgroundColor: colors.accent
              }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Animated Card Stack Container */}
        <Animated.View style={[
          styles.stepCard, 
          { 
            backgroundColor: isDark ? 'rgba(12,28,10,0.65)' : 'rgba(255,255,255,0.7)', 
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'
          },
          animatedCardStyle
        ]}>
          
          {/* STEP 1: SITUATION */}
          {currentStep === 0 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t('thoughtDiary.theSituation')}</Text>
              <Text style={[styles.stepTip, { color: colors.textMuted }]}>
                {t('thoughtDiary.theSituationTip', { defaultValue: 'Describe the situation factually. Who, what, when, where?' })}
              </Text>
              <TextInput
                style={inputStyle}
                placeholder={t('thoughtDiary.theSituationPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                value={situation}
                onChangeText={setSituation}
              />
            </View>
          )}

          {/* STEP 2: AUTOMATIC THOUGHT */}
          {currentStep === 1 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t('thoughtDiary.negativeThought')}</Text>
              <Text style={[styles.stepTip, { color: colors.textMuted }]}>
                {t('thoughtDiary.negativeThoughtTip', { defaultValue: 'What automatic negative thoughts crossed your mind?' })}
              </Text>
              <TextInput
                style={inputStyle}
                placeholder={t('thoughtDiary.negativeThoughtPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                value={automaticThought}
                onChangeText={setAutomaticThought}
              />

              {/* Cognitive Distortions Drawer button */}
              <TouchableOpacity 
                style={[styles.distortionToggle, { borderColor: colors.accent }]}
                onPress={() => setShowDistortions(!showDistortions)}
                activeOpacity={0.8}
              >
                <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                <Text style={[styles.distortionToggleText, { color: colors.accentDeep }]}>
                  {showDistortions ? 'Hide Cognitive Distortions' : 'Identify Distortions Help'}
                </Text>
              </TouchableOpacity>

              {showDistortions && (
                <View style={[styles.distortionsBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight }]}>
                  {COGNITIVE_DISTORTIONS.map(dist => {
                    const isExpanded = expandedDistortion === dist.id;
                    return (
                      <View key={dist.id} style={styles.distortionItem}>
                        <TouchableOpacity 
                          style={styles.distortionHeader}
                          onPress={() => setExpandedDistortion(isExpanded ? null : dist.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.distortionName, { color: colors.text }]}>• {dist.name}</Text>
                          <Ionicons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={14} 
                            color={colors.textMuted} 
                          />
                        </TouchableOpacity>
                        {isExpanded && (
                          <Text style={[styles.distortionDesc, { color: colors.textMuted }]}>{dist.desc}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* STEP 3: EMOTION */}
          {currentStep === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t('thoughtDiary.emotion')}</Text>
              <Text style={[styles.stepTip, { color: colors.textMuted }]}>
                {t('thoughtDiary.emotionTip', { defaultValue: 'What emotions did you feel? Rate their intensity.' })}
              </Text>
              <TextInput
                style={[...inputStyle, { minHeight: 48, paddingVertical: 10 }]}
                placeholder={t('thoughtDiary.emotionPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={emotion}
                onChangeText={setEmotion}
              />
              <View style={styles.sliderRow}>
                <Text style={{ fontFamily: typography.label, color: colors.text, fontSize: rf(13) }}>
                  {t('thoughtDiary.intensity')}: {intensity}/10
                </Text>
                <Slider
                  style={{ flex: 1, marginLeft: spacing.md }}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  value={intensity}
                  onValueChange={setIntensity}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.accentBlue}
                />
              </View>
            </View>
          )}

          {/* STEP 4: EVIDENCE FOR */}
          {currentStep === 3 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t('thoughtDiary.evidenceFor')}</Text>
              <Text style={[styles.stepTip, { color: colors.textMuted }]}>
                {t('thoughtDiary.evidenceForTip', { defaultValue: 'What objective evidence supports this automatic thought?' })}
              </Text>
              <TextInput
                style={inputStyle}
                placeholder={t('thoughtDiary.evidenceForPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                value={evidenceFor}
                onChangeText={setEvidenceFor}
              />
            </View>
          )}

          {/* STEP 5: EVIDENCE AGAINST */}
          {currentStep === 4 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t('thoughtDiary.evidenceAgainst')}</Text>
              <Text style={[styles.stepTip, { color: colors.textMuted }]}>
                {t('thoughtDiary.evidenceAgainstTip', { defaultValue: 'What facts or experiences contradict this thought?' })}
              </Text>
              <TextInput
                style={inputStyle}
                placeholder={t('thoughtDiary.evidenceAgainstPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                value={evidenceAgainst}
                onChangeText={setEvidenceAgainst}
              />
            </View>
          )}

          {/* STEP 6: BALANCED PERSPECTIVE */}
          {currentStep === 5 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t('thoughtDiary.balancedThought')}</Text>
              <Text style={[styles.stepTip, { color: colors.textMuted }]}>
                {t('thoughtDiary.balancedThoughtTip', { defaultValue: 'Write a realistic, balanced perspective reframing the situation.' })}
              </Text>
              <TextInput
                style={inputStyle}
                placeholder={t('thoughtDiary.balancedThoughtPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                value={balancedThought}
                onChangeText={setBalancedThought}
              />
            </View>
          )}

        </Animated.View>

        {/* Navigation Buttons Row */}
        <View style={styles.buttonRow}>
          {currentStep > 0 ? (
            <TouchableOpacity 
              style={[styles.navBtn, { borderColor: colors.border, borderWidth: 1 }]} 
              onPress={prevStep}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
              <Text style={[styles.navBtnText, { color: colors.text, marginLeft: 6 }]}>
                {t('common.back', { defaultValue: 'Back' })}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {currentStep < 5 ? (
            <TouchableOpacity 
              style={[
                styles.navBtn, 
                { backgroundColor: isNextDisabled() ? colors.border : colors.accent },
                isNextDisabled() && { opacity: 0.6 }
              ]} 
              onPress={nextStep}
              disabled={isNextDisabled()}
              activeOpacity={0.8}
            >
              <Text style={[styles.navBtnText, { color: '#FFFFFF', marginRight: 6 }]}>
                {t('common.next', { defaultValue: 'Next' })}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.navBtn, 
                { backgroundColor: isNextDisabled() ? colors.border : colors.accent },
                isNextDisabled() && { opacity: 0.6 }
              ]} 
              onPress={handleSave}
              disabled={isNextDisabled()}
              activeOpacity={0.8}
            >
              <Text style={[styles.navBtnText, { color: '#FFFFFF', marginRight: 6 }]}>
                {t('thoughtDiary.saveEntry')}
              </Text>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  progressHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: hp(2.5),
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  progressSubtitle: {
    fontFamily: typography.label,
    fontSize: rf(11),
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressSteps: {
    fontFamily: typography.mono,
    fontSize: rf(12),
    fontWeight: '700'
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  stepCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    minHeight: hp(45),
  },
  stepTitle: {
    fontFamily: typography.display,
    fontSize: rf(18),
    fontWeight: '800',
    marginBottom: spacing.xs
  },
  stepTip: {
    fontFamily: typography.body,
    fontSize: rf(13),
    lineHeight: 18,
    marginBottom: spacing.md
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: spacing.md,
    minHeight: hp(22),
    fontSize: 16,
    textAlignVertical: 'top',
    fontFamily: typography.body,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.xs
  },
  distortionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6
  },
  distortionToggleText: {
    fontFamily: typography.label,
    fontSize: rf(12),
    fontWeight: '700'
  },
  distortionsBox: {
    marginTop: spacing.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: 10
  },
  distortionItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    paddingBottom: 6
  },
  distortionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  distortionName: {
    fontFamily: typography.body,
    fontSize: rf(13),
    fontWeight: '700'
  },
  distortionDesc: {
    fontFamily: typography.body,
    fontSize: rf(12),
    marginTop: 4,
    lineHeight: 16
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: 16
  },
  navBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  navBtnText: {
    fontFamily: typography.label,
    fontSize: rf(14),
    fontWeight: '700',
  }
});
