import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useMoodStore, MoodEntry } from '../../store/moodStore';
import { Card } from '../../components/common/Card';
import { MoodChart } from '../../components/tracker/MoodChart';
import { spacing } from '../../theme/spacing';
import { getPast7Days } from '../../utils/dateHelpers';

export default function TrackerHistoryScreen() {
  const { colors } = useTheme();
  const entries = useMoodStore((state) => state.entries);

  // Get last 7 days mood values
  const last7Days = getPast7Days();
  const chartData = last7Days.map(date => {
    const entry = entries.find(e => e.date === date);
    return entry ? entry.moodLevel : null;
  }).filter(val => val !== null) as number[];

  const renderItem = ({ item }: { item: MoodEntry }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
        <Text style={[styles.moodText, { color: colors.textMuted }]}>
          Mood Level: {item.moodLevel}/5
        </Text>
      </View>
      {item.symptoms.length > 0 && (
        <Text style={[styles.symptomsText, { color: colors.text }]}>
          Symptoms: {item.symptoms.join(', ')}
        </Text>
      )}
      <Text style={[styles.sleepText, { color: colors.textMuted }]}>
        Sleep: {item.sleepHours}h ({item.sleepQuality})
      </Text>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Past 7 Days</Text>
            <Card style={styles.chartCard}>
              <MoodChart data={chartData} />
            </Card>
            <Text style={[styles.title, { color: colors.text, marginTop: spacing.xl }]}>All Entries</Text>
          </View>
        )}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }}>
            No journal entries yet.
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  chartCard: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryCard: {
    marginBottom: spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  moodText: {
    fontWeight: '500',
  },
  symptomsText: {
    marginBottom: spacing.xs,
  },
  sleepText: {
    fontSize: 13,
  }
});
