import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useMoodStore, MoodEntry } from '../../store/moodStore';
import { Card } from '../../components/common/Card';
import { MoodChart } from '../../components/tracker/MoodChart';
import { spacing } from '../../../theme/spacing';
import { getPast7Days } from '../../utils/dateHelpers';
import { Ionicons } from '@expo/vector-icons';

export default function TrackerHistoryScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { entries, streak, streakBroken, streakHistory } = useMoodStore();

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

  const renderStreakCalendar = () => {
    return (
      <View style={styles.calendarContainer}>
        {last7Days.map((dateStr) => {
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
          const dayNum = dateObj.getDate();
          
          const historyEntry = streakHistory[dateStr];
          const hasRecorded = !!historyEntry && historyEntry.recorded;
          const acts = historyEntry?.activities || {};
          
          return (
            <View key={dateStr} style={styles.calendarDayCol}>
              <Text style={[styles.dayNameText, { color: colors.textMuted }]}>{dayName}</Text>
              <Text style={[styles.dayNumText, { color: colors.text }]}>{dayNum}</Text>
              
              <View style={styles.statusIconWrapper}>
                {hasRecorded ? (
                  <Ionicons name="flame" size={24} color="#EF4444" />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={colors.border} />
                )}
              </View>
              
              <View style={styles.dayBadgesContainer}>
                {hasRecorded ? (
                  <>
                    {acts.mood && (
                      <View style={[styles.miniBadge, { backgroundColor: isDark ? 'rgba(77,191,122,0.15)' : 'rgba(77,191,122,0.1)' }]}>
                        <Text style={[styles.miniBadgeText, { color: colors.accent }]}>Mood</Text>
                      </View>
                    )}
                    {acts.tracker && (
                      <View style={[styles.miniBadge, { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' }]}>
                        <Text style={[styles.miniBadgeText, { color: '#3B82F6' }]}>Log</Text>
                      </View>
                    )}
                    {acts.thought && (
                      <View style={[styles.miniBadge, { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)' }]}>
                        <Text style={[styles.miniBadgeText, { color: '#8B5CF6' }]}>CBT</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={[styles.emptyDayText, { color: colors.textMuted }]}>-</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

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
          {t('tracker.sleepLabel')}: {item.sleepHours}h ({t(`tracker.sleepQuality.${item.sleepQuality}`)}) • {t('tracker.appetiteLabel')}: {t(`tracker.appetiteLevels.${item.appetite || 'normal'}`)}
        </Text>

        {/* BRUTAL FIX: Actually render the thought diary if the user wrote one */}
        {item.thoughtDiary ? (
          <View style={{ backgroundColor: colors.surfaceAlt, padding: spacing.sm, borderRadius: 8 }}>
            <Text style={{ color: colors.text, fontStyle: 'italic' }}>&quot;{item.thoughtDiary}&quot;</Text>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.35} showBottomPlants />
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Check-in Streak</Text>
            <Card style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <View>
                  <Text style={[styles.streakNumberText, { color: streakBroken ? '#EF4444' : colors.text }]}>
                    {streakBroken ? 0 : streak} 🔥
                  </Text>
                  <Text style={[styles.streakSubtitle, { color: colors.textMuted }]}>
                    {streakBroken ? 'Streak broken. Log entry today!' : 'Consecutive days active'}
                  </Text>
                </View>
                {streakBroken ? (
                  <View style={[styles.streakStatusBadge, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12 }}>Broken 💔</Text>
                  </View>
                ) : (
                  <View style={[styles.streakStatusBadge, { backgroundColor: isDark ? 'rgba(77, 191, 122, 0.15)' : 'rgba(77, 191, 122, 0.1)' }]}>
                    <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 12 }}>Active 👍</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.calendarTitle, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                Last 7 Days Breakdown
              </Text>
              {renderStreakCalendar()}
            </Card>

            <Text style={[styles.title, { color: colors.text }]}>Past 7 Days Mood Trend</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  chartCard: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
  },
  streakCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: spacing.md,
  },
  streakNumberText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  streakStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  calendarTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  calendarDayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayNumText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 3,
  },
  statusIconWrapper: {
    marginVertical: 4,
    height: 26,
    justifyContent: 'center',
  },
  dayBadgesContainer: {
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
    minHeight: 50,
  },
  miniBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  miniBadgeText: {
    fontSize: 8,
    fontWeight: '700',
  },
  emptyDayText: {
    fontSize: 12,
  },
});
