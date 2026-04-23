import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
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
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Relax</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Simple tools to help you find your calm.
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
          <Text style={[styles.cardTitle, { color: colors.text }]}>Box Breathing</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            A 4-step breathing technique to reduce stress and regain focus.
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
          <Text style={[styles.cardTitle, { color: colors.text }]}>Nature Sounds</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Immersive audio to quiet your mind.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    lineHeight: 20,
  }
});
