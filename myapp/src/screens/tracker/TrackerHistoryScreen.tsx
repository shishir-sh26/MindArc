import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useMoodStore, MoodEntry } from '../../store/moodStore';
import { MoodIcon, getMoodColor, MOODS } from './TrackerScreen';
import { Card } from '../../components/common/Card';
import { MoodChart } from '../../components/tracker/MoodChart';
import { spacing } from '../../../theme/spacing';
import { getPast7Days } from '../../utils/dateHelpers';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../utils/firebase';
import { syncUserDataFromFirestore } from '../../utils/syncService';
import { syncStreakData } from '../../utils/streakService';
import { HapticFeedback } from '../../utils/HapticFeedback';
import * as Haptics from 'expo-haptics';

export default function TrackerHistoryScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { entries, streak, streakBroken, streakHistory } = useMoodStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const user = auth.currentUser;
    if (user) {
      try {
        await syncUserDataFromFirestore(user.uid);
        await syncStreakData(user.uid);
      } catch (err) {
        console.warn("[TrackerHistoryScreen] Re-sync failed:", err);
      }
    }
    setRefreshing(false);
  }, []);

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MoodIcon level={item.moodLevel} size={24} color={getMoodColor(item.moodLevel)} />
            <Text style={[styles.dateText, { color: colors.text }]}>{item.date} at {timeString}</Text>
          </View>
          <Text style={[styles.moodText, { color: getMoodColor(item.moodLevel), fontWeight: '700' }]}>
            {MOODS.find(m => m.level === item.moodLevel)?.label || `Mood: ${item.moodLevel}`}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={() => (
          <View>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>Check-in Streak</Text>
            <Card style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.streakNumberText, { color: streakBroken ? '#EF4444' : colors.text }]}>
                      {streakBroken ? 0 : streak}
                    </Text>
                    <Ionicons name="flame-outline" size={24} color={streakBroken ? '#EF4444' : colors.accent} />
                  </View>
                  <Text style={[styles.streakSubtitle, { color: colors.textMuted }]}>
                    {streakBroken ? 'Streak broken. Log entry today!' : 'Consecutive days active'}
                  </Text>
                </View>
                {streakBroken ? (
                  <View style={[styles.streakStatusBadge, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <Ionicons name="heart-dislike" size={14} color="#EF4444" />
                    <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12 }}>Broken</Text>
                  </View>
                ) : (
                  <View style={[styles.streakStatusBadge, { backgroundColor: isDark ? 'rgba(77, 191, 122, 0.15)' : 'rgba(77, 191, 122, 0.1)', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
                    <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 12 }}>Active</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.calendarTitle, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                Last 7 Days Breakdown
              </Text>
              {renderStreakCalendar()}
            </Card>

            <Text style={[styles.title, { color: '#FFFFFF' }]}>Past 7 Days Mood Trend</Text>
            <Card style={styles.chartCard}>
              <MoodChart data={chartData} />
            </Card>
            <Text style={[styles.title, { color: '#FFFFFF', marginTop: spacing.xl }]}>All Entries</Text>
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
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
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
