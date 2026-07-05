import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AnxietyMeter } from '../../components/relax/AnxietyMeter';
import { RelievingGames } from '../../components/relax/RelievingGames';
import * as HapticsAPI from 'expo-haptics';
import { HapticFeedback } from '../../utils/HapticFeedback';

export default function RelievingGamesScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stressLevel, setStressLevel] = useState<'low' | 'mid' | 'high' | null>(null);

  const levelSpecificTips = {
    low: [
      t('learn.levelTips.low.0', { defaultValue: "Maintenance is key: keep up with your daily daily mindfulness to stay balanced." }),
      t('learn.levelTips.low.1', { defaultValue: "This is a great time for a light walk or reading to reinforce calm." }),
      t('learn.levelTips.low.2', { defaultValue: "Acknowledge and appreciate your current state of mental clarity." })
    ],
    mid: [
      t('learn.levelTips.mid.0', { defaultValue: "Notice where you're holding tension—usually shoulders, jaw, or neck." }),
      t('learn.levelTips.mid.1', { defaultValue: "A 5-minute 'reset' break can prevent your stress from escalating further." }),
      t('learn.levelTips.mid.2', { defaultValue: "Take small sips of water and practice one round of box breathing." })
    ],
    high: [
      t('learn.levelTips.high.0', { defaultValue: "PRIORITY: Stop what you are doing immediately and follow the Breathing Box below." }),
      t('learn.levelTips.high.1', { defaultValue: "Splash cold water on your face—this helps trigger your body's natural relaxation reflex." }),
      t('learn.levelTips.high.2', { defaultValue: "Immediate Grounding: Name 5 things you can see and 4 things you can touch right now." })
    ]
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    HapticFeedback.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.40} showBottomPlants />
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>{t('relax.gamesTitle', { defaultValue: "Calming Hub Games" })}</Text>
          <Text style={[styles.subtitle, { color: '#F4F9F4' }]}>
            {t('relax.gamesSubtitle', { defaultValue: "Ground yourself in the present moment with interactive activities" })}
          </Text>
        </View>

        {/* Anxiety/Stress Meter component */}
        <AnxietyMeter onLevelChange={(lvl) => setStressLevel(lvl)} />

        {/* Dynamic tips based on Stress Meter selection */}
        {stressLevel && (
          <View style={{ marginTop: hp(3) }}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              COPING STRATEGIES: {stressLevel.toUpperCase()} STRESS
            </Text>
            {levelSpecificTips[stressLevel].map((tip, idx) => (
              <View key={idx} style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(93, 191, 110, 0.1)' : 'rgba(90, 156, 58, 0.08)', borderLeftWidth: 4, borderLeftColor: colors.accent }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} style={{ marginRight: spacing.sm, marginTop: 1 }} />
                <Text style={[styles.tipText, { color: colors.text, fontWeight: '600' }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Relieving Games Component */}
        <RelievingGames />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 120, // extra padding for floating nav bar
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
  },
  subtitle: {
    fontFamily: typography.display,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.xs,
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.2, height: 1.2 },
    textShadowRadius: 2.2,
  },
  tipsTitle: {
    fontFamily: typography.display,
    fontSize: rf(20),
    fontWeight: 'bold',
    marginBottom: hp(1.5),
    marginTop: hp(2),
  },
  tipCard: {
    flexDirection: 'row',
    padding: hp(2),
    borderRadius: radii.md,
    marginBottom: hp(1.5),
    shadowColor: '#C4A882',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipText: {
    fontFamily: typography.body,
    fontSize: rf(14),
    flex: 1,
  }
});
