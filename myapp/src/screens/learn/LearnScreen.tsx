import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { educationalModules } from '../../data/educationalModules';
import { Card } from '../../components/common/Card';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import * as Haptics from 'expo-haptics';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
};

export default function LearnScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Simulate brief network refresh
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.38} showBottomPlants />
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#FFFFFF' }]}>{t('learn.title')}</Text>
        <Text style={[styles.subtitle, { color: '#F4F9F4' }]}>{t('learn.subtitle')}</Text>
      </View>
      
      <FlatList
        data={educationalModules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        renderItem={({ item }) => (
          <Card 
            style={styles.card} 
            onPress={() => navigation.navigate('ModuleDetail', { module: item })}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name={item.icon as any} size={24} color={isDark ? '#000' : colors.accent} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>
                {t(`learn.modules.m${item.id}.title`, { defaultValue: item.title })}
              </Text>
              <Text style={[styles.readTime, { color: colors.textMuted }]}>
                <Ionicons name="time-outline" size={14} /> {t(`learn.modules.m${item.id}.readTime`, { defaultValue: item.readTime })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Card>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', color: colors.textMuted }}>No modules available</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    fontFamily: typography.display,
    fontSize: rf(32),
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100, // padding for floating nav bar
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  readTime: {
    fontSize: 13,
    marginTop: spacing.xs,
  }
});
