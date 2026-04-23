import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS,
  withRepeat,
  cancelAnimation
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { hp, wp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as HapticsAPI from 'expo-haptics';

export default function BreathingScreen() {
  const { colors } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [phaseText, setPhaseText] = useState('prepare');
  
  const [breaths, setBreaths] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const scale = useSharedValue(1);
  const opacityText = useSharedValue(1);

  // Time tracking
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const updatePhase = (newPhase: string, addBreath = false) => {
    setPhaseText(newPhase);
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
    
    opacityText.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );

    if (addBreath) setBreaths(b => b + 1);
  };

  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: (scale.value - 1) / 0.6 * 0.8 + 0.1
  }));

  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: (scale.value - 1) / 0.6 * 0.5 + 0.1
  }));

  const ringStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: (scale.value - 1) / 0.6 * 0.2 + 0.1
  }));

  const runBreathingCycle = () => {
    scale.value = withRepeat(
      withSequence(
        // Inhale 4s
        withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.sin) }, (finished) => { if (finished) runOnJS(updatePhase)('hold'); }),
        // Hold 4s
        withTiming(1.6, { duration: 4000 }),
        // Exhale 4s (using negative timing to sync text)
        withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.sin) }, (finished) => { if (finished) runOnJS(updatePhase)('hold'); }),
        // Hold 4s
        withTiming(1.0, { duration: 4000 }, (finished) => { if (finished) runOnJS(updatePhase)('inhale', true); }) // add breath at end
      ),
      -1, // infinite
      false // don't reverse automatically
    );
  };

  useEffect(() => {
    if (isActive) {
      updatePhase('inhale');
      runBreathingCycle();
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1);
      if (breaths > 0) {
        setShowSummary(true);
      } else {
        setPhaseText('prepare');
        setBreaths(0);
        setTimeSpent(0);
      }
    }
  }, [isActive]);

  const closeSummary = () => {
    setShowSummary(false);
    setBreaths(0);
    setTimeSpent(0);
    setPhaseText('prepare');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const textStyle = useAnimatedStyle(() => ({ opacity: opacityText.value }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Box Breathing</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          A simple technique to quickly physically calm down. Follow the circle.
        </Text>
      </View>

      <View style={styles.animationContainer}>
        {/* Concentric Decorative Rings */}
        <Animated.View style={[styles.ring, { borderColor: colors.calmDark || colors.calm, borderWidth: 1, width: 220, height: 220, borderRadius: 110 }, ringStyle3]} />
        <Animated.View style={[styles.ring, { borderColor: colors.calmDark || colors.calm, borderWidth: 2, width: 180, height: 180, borderRadius: 90 }, ringStyle2]} />
        
        {/* Main animated circle */}
        <Animated.View style={[ styles.circle, { backgroundColor: colors.calmLight }, animatedStyle ]}>
          <Animated.Text style={[styles.phaseText, { color: colors.calmDark || colors.calm }, textStyle]}>
            {phaseText}
          </Animated.Text>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <Text style={[styles.statsText, { color: colors.textMuted }]}>
          {breaths > 0 ? `${breaths} breaths • ${Math.floor(timeSpent/60)}m ${timeSpent%60}s` : ''}
        </Text>
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: isActive ? colors.surfaceAlt : colors.accent }]}
          onPress={() => setIsActive(!isActive)}
        >
          <Ionicons name={isActive ? "stop" : "play"} size={24} color={isActive ? colors.danger : colors.surface} />
          <Text style={[styles.btnText, { color: isActive ? colors.danger : colors.surface }]}>
            {isActive ? "End Session" : "Begin"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Modal */}
      <Modal visible={showSummary} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>you did well.</Text>
            <Text style={[styles.modalStat, { color: colors.textMuted }]}>
              Completed <Text style={{color: colors.text, fontWeight: 'bold'}}>{breaths}</Text> breath cycles
            </Text>
            <Text style={[styles.modalStat, { color: colors.textMuted }]}>
              Total Time: <Text style={{color: colors.text, fontWeight: 'bold'}}>{Math.floor(timeSpent/60)}m {timeSpent%60}s</Text>
            </Text>
            
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.accent }]} onPress={closeSummary}>
              <Text style={styles.modalBtnText}>Done</Text>
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
    marginTop: hp(8),
  },
  title: {
    fontFamily: typography.display,
    fontSize: rf(32),
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: rf(16),
    textAlign: 'center',
    marginTop: hp(1),
    lineHeight: rf(24),
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontFamily: typography.display,
    fontStyle: 'italic',
    fontSize: rf(26),
  },
  controls: {
    padding: hp(5),
    alignItems: 'center',
    paddingBottom: hp(12),
  },
  statsText: {
    fontFamily: typography.mono,
    fontSize: rf(12),
    marginBottom: hp(2),
    height: 20,
    letterSpacing: 0.5,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(8),
    borderRadius: radii.pill,
    elevation: 3,
    shadowColor: '#C4A882',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  btnText: {
    fontFamily: typography.label,
    fontSize: rf(14),
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 8,
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
  }
});
