import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RelievingGames } from '../../components/relax/RelievingGames';
import * as HapticsAPI from 'expo-haptics';
import { HapticFeedback } from '../../utils/HapticFeedback';

export default function RelievingGamesScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

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
          <View style={styles.titleRow}>
            <Ionicons 
              name="game-controller" 
              size={30} 
              color="#FFFFFF" 
              style={styles.headerIcon} 
            />
            <Text style={[styles.title, { color: '#FFFFFF' }]}>
              {t('relax.gamesTitle', { defaultValue: "Relieving Games" })}
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>
            {t('relax.gamesSubtitle', { defaultValue: "Ground yourself in the present moment with interactive activities" })}
          </Text>
        </View>

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerIcon: {
    marginRight: spacing.sm,
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
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
