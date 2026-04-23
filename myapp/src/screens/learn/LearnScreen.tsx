import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { educationalModules } from '../../data/educationalModules';
import { Card } from '../../components/common/Card';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
};

export default function LearnScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Educational modules to help you understand your mind.</Text>
      </View>
      
      <FlatList
        data={educationalModules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card 
            style={styles.card} 
            onPress={() => navigation.navigate('ModuleDetail', { module: item })}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name={item.icon as any} size={24} color={isDark ? '#000' : colors.accent} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.readTime, { color: colors.textMuted }]}>
                <Ionicons name="time-outline" size={14} /> {item.readTime}
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
  },
  subtitle: {
    fontSize: 16,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
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
