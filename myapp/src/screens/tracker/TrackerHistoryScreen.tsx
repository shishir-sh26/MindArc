import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useMoodStore, MoodEntry } from '../../store/moodStore';
import { Card } from '../../components/common/Card';
import { MoodChart } from '../../components/tracker/MoodChart';
import { spacing } from '../../../theme/spacing';
import { getPast7Days } from '../../utils/dateHelpers';

export default function TrackerHistoryScreen() {
  const { colors } = useTheme();
  const entries = useMoodStore((state) => state.entries);

  // Get last 7 days mood averages
  const last7Days = getPast7Days();
  const chartData = last7Days.map(date => {
    // 1. Find ALL entries for this specific date
    const dayEntries = entries.filter(e => e.date === date);
    
    // 2. If no entries exist for this date, return null
    if (dayEntries.length === 0) return null;
    
    // 3. Calculate the sum of all mood levels for this date
    const sum = dayEntries.reduce((total, current) => total + current.moodLevel, 0);
    
    // 4. Return the mathematical average
    return sum / dayEntries.length;
  }).filter(val => val !== null) as number[];
  const renderItem = ({ item }: { item: MoodEntry }) => {
    // Convert the timestamp to a readable time (e.g., "1:18 PM")
    const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <Card style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={[styles.dateText, { color: colors.text }]}>{item.date} at {timeString}</Text>
          <Text style={[styles.moodText, { color: colors.textMuted }]}>
            Mood Level: {item.moodLevel}/5
          </Text>
        </View>
        
        {item.symptoms && item.symptoms.length > 0 && (
          <Text style={[styles.symptomsText, { color: colors.text }]}>
            Symptoms: {item.symptoms.join(', ')}
          </Text>
        )}
        
        <Text style={[styles.sleepText, { color: colors.textMuted, marginBottom: item.thoughtDiary ? spacing.sm : 0 }]}>
          Sleep: {item.sleepHours}h ({item.sleepQuality})
        </Text>

        {/* BRUTAL FIX: Actually render the thought diary if the user wrote one */}
        {item.thoughtDiary ? (
          <View style={{ backgroundColor: colors.surfaceAlt, padding: spacing.sm, borderRadius: 8 }}>
            <Text style={{ color: colors.text, fontStyle: 'italic' }}>"{item.thoughtDiary}"</Text>
          </View>
        ) : null}
      </Card>
    );
  };

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
