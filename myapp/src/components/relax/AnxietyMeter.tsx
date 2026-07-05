import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolateColor, interpolate } from 'react-native-reanimated';
import { HapticFeedback } from '../../utils/HapticFeedback';
import * as Haptics from 'expo-haptics';

interface AnxietyMeterProps {
  onLevelChange: (level: 'low' | 'mid' | 'high') => void;
}

export const AnxietyMeter = ({ onLevelChange }: AnxietyMeterProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const stressVal = useSharedValue(0);
  const [level, setLevel] = useState<'low' | 'mid' | 'high'>('low');
  const [showInfo, setShowInfo] = useState(false);
  
  const handleTap = (val: number, label: 'low' | 'mid' | 'high') => {
    HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    stressVal.value = withSpring(val, { damping: 15 });
    onLevelChange(label);
    
    if (val < 40) setLevel('low');
    else if (val < 75) setLevel('mid');
    else setLevel('high');
  };

  const maxHeight = hp(20);
  const barStyle = useAnimatedStyle(() => {
    const height = interpolate(stressVal.value, [0, 100], [0, maxHeight]);
    const color = interpolateColor(
      stressVal.value,
      [0, 50, 100],
      [colors.calm, colors.warning, colors.danger]
    );
    return { height, backgroundColor: color };
  });

  const desc = level === 'low' 
    ? t('learn.sim.anxietyLowDesc', { defaultValue: "Calm and relaxed. Heart rate is steady, breathing is deep." }) 
    : level === 'mid' 
      ? t('learn.sim.anxietyMidDesc', { defaultValue: "Alert and focused. Mild tension, slightly elevated heart rate." }) 
      : t('learn.sim.anxietyHighDesc', { defaultValue: "High stress. Rapid breathing, muscle tension, fight-or-flight activated." });

  return (
    <View style={[simStyles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1) }}>
        <Text style={[simStyles.title, { color: colors.text, flex: 1, textAlign: 'left', fontWeight: 'bold' }]}>
          {t('learn.sim.anxietyTitle', { defaultValue: "Interactive Stress Meter" })}
        </Text>
        <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={{ padding: 4 }}>
          <Ionicons name={showInfo ? "close-circle-outline" : "information-circle-outline"} size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {showInfo && (
        <View style={{ backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, marginBottom: hp(1.5) }}>
          <Text style={{ fontFamily: typography.label, fontWeight: '700', fontSize: rf(13), color: colors.accentDeep, marginBottom: 4 }}>
            WHAT IT IS USED FOR:
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text, marginBottom: 8 }}>
            Visualizes body-mind tension ranges (low, medium, or high stress).
          </Text>
          
          <Text style={{ fontFamily: typography.label, fontWeight: '700', fontSize: rf(13), color: colors.accentDeep, marginBottom: 4 }}>
            HOW IT WORKS:
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text, marginBottom: 8 }}>
            Tap LOW, MED, or HIGH. The visual column fluctuates to simulate emotional arousal, and updates the coping checklist below.
          </Text>
          
          <Text style={{ fontFamily: typography.label, fontWeight: '700', fontSize: rf(13), color: colors.accentDeep, marginBottom: 4 }}>
            WHY IT IS USEFUL:
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text }}>
            Builds somatic self-awareness (interoception) and maps mental labels to physical sensations so you can choose the right coping tools.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: hp(20), marginVertical: hp(2), width: '100%', backgroundColor: colors.surfaceAlt, borderRadius: 12, overflow: 'hidden' }}>
        <Animated.View style={[{ width: '100%', position: 'absolute', bottom: 0 }, barStyle]} />
      </View>
      <Text style={[simStyles.desc, { color: colors.textMuted }]}>{desc}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(2) }}>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(20, 'low')}><Text style={{fontFamily: typography.label, color: colors.text}}>{t('learn.sim.low', { defaultValue: "LOW" })}</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(50, 'mid')}><Text style={{fontFamily: typography.label, color: colors.text}}>{t('learn.sim.med', { defaultValue: "MED" })}</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(90, 'high')}><Text style={{fontFamily: typography.label, color: colors.text}}>{t('learn.sim.high', { defaultValue: "HIGH" })}</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const simStyles = StyleSheet.create({
  container: {
    marginTop: hp(4),
    padding: hp(3),
    borderRadius: 24,
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontFamily: typography.display,
    fontSize: rf(20),
    textAlign: 'center',
  },
  desc: {
    fontFamily: typography.body,
    fontSize: rf(14),
    textAlign: 'center',
  },
  btn: {
    padding: hp(1.5),
    backgroundColor: '#F5EFE7',
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  }
});
