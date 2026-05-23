import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.40} showBottomPlants />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('relax.title')}</Text>
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
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
