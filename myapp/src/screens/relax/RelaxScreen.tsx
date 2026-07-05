import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { spacing } from '../../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

type RelaxNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Relax'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: RelaxNavigationProp;
};

export default function RelaxScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
        <Text style={[styles.title, { color: '#FFFFFF' }]}>{t('relax.title')}</Text>
        <Text style={[styles.subtitle, { color: '#F4F9F4' }]}>
          {t('relax.subtitle')}
        </Text>
      </View>

      <Card 
        style={styles.card} 
        onPress={() => navigation.navigate('Breathing')}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="medical-outline" size={32} color={colors.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('relax.boxBreathing')}</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            {t('relax.boxBreathingSub')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      </Card>

      <Card 
        style={styles.card} 
        onPress={() => navigation.navigate('NatureSounds')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
          <Ionicons name="musical-notes-outline" size={32} color={colors.accentBlue} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('relax.natureSounds')}</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            {t('relax.natureSoundsSub')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      </Card>
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
    paddingBottom: 100, // padding for floating nav bar
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  }
});
