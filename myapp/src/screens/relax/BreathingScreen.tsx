import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  cancelAnimation
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { hp, wp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { HapticFeedback } from '../../utils/HapticFeedback';
import * as HapticsAPI from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';

interface Phase {
  name: 'inhale' | 'hold' | 'exhale' | 'prepare';
  duration: number;
  targetScale: number;
}

interface PatternInfo {
  id: string;
  name: string;
  desc: string;
  timingLabel: string;
  phases: Phase[];
}

const PATTERNS: Record<string, PatternInfo> = {
  box: {
    id: 'box',
    name: 'Box Breathing',
    desc: 'For concentration and focus',
    timingLabel: '4-4-4-4',
    phases: [
      { name: 'inhale', duration: 4000, targetScale: 1.6 },
      { name: 'hold', duration: 4000, targetScale: 1.6 },
      { name: 'exhale', duration: 4000, targetScale: 1.0 },
      { name: 'hold', duration: 4000, targetScale: 1.0 }
    ]
  },
  '478': {
    id: '478',
    name: '4-7-8 Technique',
    desc: 'For deep calming and sleep',
    timingLabel: '4-7-8',
    phases: [
      { name: 'inhale', duration: 4000, targetScale: 1.6 },
      { name: 'hold', duration: 7000, targetScale: 1.6 },
      { name: 'exhale', duration: 8000, targetScale: 1.0 }
    ]
  },
  coherent: {
    id: 'coherent',
    name: 'Coherent Breathing',
    desc: 'For heart-rate variability',
    timingLabel: '5-5',
    phases: [
      { name: 'inhale', duration: 5000, targetScale: 1.6 },
      { name: 'exhale', duration: 5000, targetScale: 1.0 }
    ]
  }
};

export default function BreathingScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [selectedPattern, setSelectedPattern] = useState<string>('box');
  const [isActive, setIsActive] = useState(false);
  const [phaseText, setPhaseText] = useState<'inhale' | 'hold' | 'exhale' | 'prepare'>('prepare');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [transitionSound, setTransitionSound] = useState<Audio.Sound | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const [breaths, setBreaths] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const scale = useSharedValue(1);
  const opacityText = useSharedValue(1);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(false);

  // Load Chime sound via local asset file
  useEffect(() => {
    let soundObj: Audio.Sound | null = null;
    const loadSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/images/chime.wav'),
          { volume: 0.35 }
        );
        soundObj = sound;
        setTransitionSound(sound);
      } catch (e) {
        console.warn("Failed to load chime sound:", e);
      }
    };
    loadSound();

    return () => {
      if (soundObj) {
        soundObj.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Time tracker effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const playChime = async () => {
    if (soundEnabledRef.current && transitionSound) {
      try {
        await transitionSound.replayAsync();
      } catch (e) {
        // Silently catch in case of loading glitches
      }
    }
  };

  const runPhase = (phaseIndex: number) => {
    if (!isActiveRef.current) return;

    const pattern = PATTERNS[selectedPattern];
    const phase = pattern.phases[phaseIndex];

    // Trigger transition feedback & chime
    playChime();
    setPhaseText(phase.name);
    HapticFeedback.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light).catch(() => {});

    opacityText.value = withSequence(
      withTiming(0, { duration: 250 }),
      withTiming(1, { duration: 250 })
    );

    // Scale circle timing
    scale.value = withTiming(phase.targetScale, {
      duration: phase.duration
    });

    // Schedule next block
    timerRef.current = setTimeout(() => {
      let nextIndex = phaseIndex + 1;
      if (nextIndex >= pattern.phases.length) {
        nextIndex = 0;
        setBreaths(b => b + 1);
      }
      runPhase(nextIndex);
    }, phase.duration);
  };

  const startBreathing = () => {
    isActiveRef.current = true;
    setIsActive(true);
    runPhase(0);
  };

  const stopBreathing = () => {
    isActiveRef.current = false;
    setIsActive(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    cancelAnimation(scale);
    scale.value = withTiming(1, { duration: 300 });

    if (breaths > 0) {
      setShowSummary(true);
    } else {
      setPhaseText('prepare');
      setBreaths(0);
      setTimeSpent(0);
    }
  };

  const closeSummary = () => {
    setShowSummary(false);
    setBreaths(0);
    setTimeSpent(0);
    setPhaseText('prepare');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacityText.value
  }));

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.36} showBottomPlants />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#FFFFFF' }]}>{t('breathing.title')}</Text>
        <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>
          {t('breathing.subtitle')}
        </Text>
      </View>

      {/* Space-Saving Horizontal Pattern Selector Tab bar */}
      {!isActive && (
        <View style={[styles.horizontalSelector, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.45)', borderColor: colors.borderLight }]}>
          {Object.values(PATTERNS).map(pattern => {
            const isSelected = selectedPattern === pattern.id;
            return (
              <TouchableOpacity
                key={pattern.id}
                style={[
                  styles.tabPill,
                  isSelected && { backgroundColor: colors.accent }
                ]}
                onPress={() => setSelectedPattern(pattern.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.tabText, 
                  { color: isSelected ? '#FFFFFF' : colors.text }
                ]}>
                  {pattern.timingLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Active Pattern Name / Description / Chime & Info Toggle Buttons */}
      <View style={styles.patternDetailRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.activePatternName, { color: colors.text }]}>
            {t(`breathing.${selectedPattern}Title`, { defaultValue: PATTERNS[selectedPattern].name })}
          </Text>
          <Text style={[styles.activePatternDesc, { color: colors.textMuted }]}>
            {PATTERNS[selectedPattern].desc}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Information Trigger Button */}
          <TouchableOpacity 
            style={[styles.floatingSoundBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => setShowInfo(true)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={22} 
              color={colors.accent} 
            />
          </TouchableOpacity>

          {/* Floating Sound Toggle Icon */}
          <TouchableOpacity 
            style={[styles.floatingSoundBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => setSoundEnabled(!soundEnabled)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={soundEnabled ? "volume-medium" : "volume-mute"} 
              size={20} 
              color={soundEnabled ? colors.accent : colors.textMuted} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Breathing Circle (Tappable Trigger) */}
      <View style={styles.animationContainer}>
        {/* Helper guide text placed neatly above circle */}
        {isActive && (
          <Text style={[styles.statsProgressText, { color: colors.textMuted }]}>
            {breaths} {t('breathing.breathCycles')} • {Math.floor(timeSpent/60)}m {timeSpent%60}s
          </Text>
        )}

        <TouchableOpacity
          onPress={() => isActive ? stopBreathing() : startBreathing()}
          activeOpacity={0.9}
          style={styles.circleButton}
        >
          <Animated.View style={[
            styles.circle, 
            { 
              backgroundColor: isDark ? 'rgba(77,191,122,0.18)' : 'rgba(232,242,220,0.85)', 
              borderColor: colors.accent, 
              borderWidth: 2
            }, 
            animatedStyle
          ]}>
            {isActive ? (
              <Animated.Text style={[styles.phaseText, { color: colors.accentDeep }, textStyle]}>
                {t(`breathing.${phaseText}`)}
              </Animated.Text>
            ) : (
              <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>
                <Ionicons name="play-circle-outline" size={28} color={colors.accentDeep} style={{ marginBottom: 4 }} />
                <Text style={[styles.tapToStartText, { color: colors.accentDeep }]}>
                  TAP TO START
                </Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Spacer to balance plants bottom layout */}
      <View style={{ height: hp(10) }} />

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { width: wp(90), maxHeight: hp(80), backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.infoModalTitle, { color: colors.text }]}>
                {t('breathing.guideTitle', { defaultValue: 'Breathing Techniques Guide' })}
              </Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: spacing.md }} showsVerticalScrollIndicator={false}>
              {/* Box Breathing */}
              <View style={styles.infoSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <View style={[styles.smallBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.smallBadgeText}>4-4-4-4</Text>
                  </View>
                  <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
                    {t('breathing.boxTitle', { defaultValue: 'Box Breathing' })}
                  </Text>
                </View>
                <Text style={[styles.infoSectionText, { color: colors.text }]}>
                  {t('breathing.boxDesc', { defaultValue: "A clinical breathing technique used by Navy SEALs, athletes, and first responders to regain absolute composure and calm under high stress. By equalizing the duration of inhaling, holding, exhaling, and holding, it halts the body's fight-or-flight response and resets the autonomic nervous system." })}
                </Text>
              </View>

              {/* 4-7-8 Technique */}
              <View style={[styles.infoSection, { marginTop: spacing.md }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <View style={[styles.smallBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.smallBadgeText}>4-7-8</Text>
                  </View>
                  <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
                    {t('breathing.sleepTitle', { defaultValue: '4-7-8 Sleep Technique' })}
                  </Text>
                </View>
                <Text style={[styles.infoSectionText, { color: colors.text }]}>
                  {t('breathing.sleepDesc', { defaultValue: 'Developed by Dr. Andrew Weil, this pattern acts as a natural tranquilizer for the nervous system. By holding your breath for 7 seconds and exhaling slowly for 8 seconds, you force oxygen deep into your lungs and trigger the parasympathetic nervous system. Excellent for insomnia and severe anxiety relief.' })}
                </Text>
              </View>

              {/* Coherent Breathing */}
              <View style={[styles.infoSection, { marginTop: spacing.md }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <View style={[styles.smallBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.smallBadgeText}>5-5</Text>
                  </View>
                  <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
                    {t('breathing.coherentTitle', { defaultValue: 'Coherent Breathing' })}
                  </Text>
                </View>
                <Text style={[styles.infoSectionText, { color: colors.text }]}>
                  {t('breathing.coherentDesc', { defaultValue: 'Also known as Resonant Breathing, this style focuses on balancing your breathing pace at exactly 5 seconds in and 5 seconds out. This pattern has been scientifically proven to optimize Heart Rate Variability (HRV), reduce blood pressure, and create a state of biological coherence and calm.' })}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Summary Modal */}
      <Modal visible={showSummary} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('breathing.youDidWell')}</Text>
            <Text style={[styles.modalStat, { color: colors.textMuted }]}>
              {t('breathing.completed')} <Text style={{color: colors.text, fontWeight: 'bold'}}>{breaths}</Text> {t('breathing.breathCycles')}
            </Text>
            <Text style={[styles.modalStat, { color: colors.textMuted }]}>
              {t('breathing.totalTime')} <Text style={{color: colors.text, fontWeight: 'bold'}}>{Math.floor(timeSpent/60)}m {timeSpent%60}s</Text>
            </Text>
            
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.accent }]} onPress={closeSummary}>
              <Text style={styles.modalBtnText}>{t('breathing.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: wp(5),
    alignItems: 'center',
    marginTop: hp(7),
    marginBottom: hp(1)
  },
  title: {
    fontFamily: typography.display,
    fontSize: rf(32),
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
  },
  subtitle: {
    fontFamily: typography.display,
    fontSize: rf(16),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: hp(1),
    lineHeight: rf(24),
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.2, height: 1.2 },
    textShadowRadius: 2.2,
  },
  horizontalSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: hp(2),
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabText: {
    fontFamily: typography.label,
    fontSize: rf(12),
    fontWeight: '700',
  },
  patternDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: hp(2.5),
    paddingHorizontal: spacing.xs
  },
  activePatternName: {
    fontFamily: typography.body,
    fontSize: rf(15),
    fontWeight: '800'
  },
  activePatternDesc: {
    fontFamily: typography.body,
    fontSize: rf(12),
    marginTop: 2
  },
  floatingSoundBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1)
  },
  statsProgressText: {
    fontFamily: typography.mono,
    fontSize: rf(12),
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: 0.5
  },
  circleButton: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  phaseText: {
    fontFamily: typography.display,
    fontWeight: '800',
    fontSize: rf(26),
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  tapToStartText: {
    fontFamily: typography.label,
    fontWeight: '800',
    fontSize: rf(12),
    letterSpacing: 0.5
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(44, 36, 32, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCard: {
    width: wp(80),
    padding: hp(4),
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center'
  },
  modalTitle: {
    fontFamily: typography.display,
    fontStyle: 'italic',
    fontSize: rf(32),
    marginBottom: hp(3),
  },
  modalStat: {
    fontFamily: typography.body,
    fontSize: rf(16),
    marginBottom: hp(1),
  },
  modalBtn: {
    marginTop: hp(4),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: radii.pill,
  },
  modalBtnText: {
    color: '#fff',
    fontFamily: typography.label,
    fontSize: rf(14),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: spacing.sm
  },
  infoModalTitle: {
    fontFamily: typography.display,
    fontSize: rf(20),
    fontWeight: '800'
  },
  infoSection: {
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    width: '100%'
  },
  infoSectionTitle: {
    fontFamily: typography.body,
    fontSize: rf(14),
    fontWeight: '800'
  },
  infoSectionText: {
    fontFamily: typography.body,
    fontSize: rf(12),
    lineHeight: rf(18),
    marginTop: 4
  },
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  smallBadgeText: {
    fontFamily: typography.mono,
    fontSize: rf(9),
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});
