import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ForestBackground } from '../../components/common/ForestBackground';
import { db, auth } from '../../utils/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useMoodStore } from '../../store/moodStore';
import { updateUserStreak, isYesterday } from '../../utils/streakService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { spacing } from '../../../theme/spacing';
import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types';
import { CompositeNavigationProp, useIsFocused } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Svg, { Circle, Path } from 'react-native-svg';

type TrackerNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Track'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: TrackerNavigationProp;
};

const MOODS = [
  { level: 1, label: 'Sad' },
  { level: 2, label: 'Anxious' },
  { level: 3, label: 'Neutral' },
  { level: 4, label: 'Calm' },
  { level: 5, label: 'Happy' },
];

export const MoodIcon = ({ level, size = 32, color = '#5A9C3A' }: { level: number, size?: number, color?: string }) => {
  switch (level) {
    case 1: // Sad
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
          <Circle cx="9" cy="9" r="1.5" fill={color} />
          <Circle cx="15" cy="9" r="1.5" fill={color} />
          <Path d="M8 17C8 17 9 15 12 15C15 15 16 17 16 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 2: // Anxious
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
          <Circle cx="9" cy="9" r="1.5" fill={color} />
          <Circle cx="15" cy="9" r="1.5" fill={color} />
          <Path d="M8 15.5C9 14.5 10 16.5 12 15.5C14 14.5 15 16.5 16 15.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 3: // Neutral
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
          <Circle cx="9" cy="9" r="1.5" fill={color} />
          <Circle cx="15" cy="9" r="1.5" fill={color} />
          <Path d="M8 15H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 4: // Calm / Content
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
          <Path d="M8 9.5C8.5 10.5 9.5 10.5 10 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M14 9.5C14.5 10.5 15.5 10.5 16 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M9 15C9.5 16 14.5 16 15 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 5: // Happy
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
          <Circle cx="9" cy="9" r="1.5" fill={color} />
          <Circle cx="15" cy="9" r="1.5" fill={color} />
          <Path d="M8 14C8 14 9.5 17 12 17C14.5 17 16 14 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    default:
      return null;
  }
};

const SYMPTOMS_LIST = [
  'Headache', 'Fatigue', 'Restlessness', 'Frustration', 'Anxiety', 'Nausea'
];

export default function TrackerScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const addEntry = useMoodStore((state) => state.addEntry);
  const getEntryByDate = useMoodStore((state) => state.getEntryByDate);

  const isFocused = useIsFocused();
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);

  const existingEntry = getEntryByDate(todayDate);

  const [moodLevel, setMoodLevel] = useState<number>(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'okay' | 'good'>('okay');
  const [thoughtDiary, setThoughtDiary] = useState<string>('');
  const [appetite, setAppetite] = useState<'poor' | 'low' | 'normal' | 'high' | 'excessive'>('normal');

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    const entry = getEntryByDate(todayDate);
    if (entry) {
      setMoodLevel(entry.moodLevel);
      setSymptoms(entry.symptoms);
      setSleepHours(entry.sleepHours);
      setSleepQuality(entry.sleepQuality);
      setThoughtDiary(entry.thoughtDiary || '');
      setAppetite(entry.appetite || 'normal');
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, [todayDate, getEntryByDate]);

  // Dynamic reset / re-initialization on screen focus or date shifts
  useEffect(() => {
    if (isFocused) {
      const currentToday = new Date().toISOString().split('T')[0];
      setTodayDate(currentToday);
      
      const entry = getEntryByDate(currentToday);
      setMoodLevel(entry?.moodLevel || 3);
      setSymptoms(entry?.symptoms || []);
      setSleepHours(entry?.sleepHours || 7);
      setSleepQuality(entry?.sleepQuality || 'okay');
      setThoughtDiary(entry?.thoughtDiary || '');
      setAppetite(entry?.appetite || 'normal');
    }
  }, [isFocused]);

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSave = () => {
    // 1. Prepare Payload & Determine ID
    const payload = {
      log_date: todayDate,
      mood_level: moodLevel,
      symptoms: symptoms,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      thought_diary: thoughtDiary,
      appetite: appetite,
    };

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save entries.");
      return;
    }

    // Generate/Reuse Firestore document ID synchronously
    const docId = existingEntry?.id || doc(collection(db, 'users', user.uid, 'tracker_logs')).id;

    // 2. Optimistic Zustand Store update
    addEntry({
      id: docId,
      date: todayDate,
      moodLevel,
      symptoms,
      sleepHours,
      sleepQuality,
      thoughtDiary,
      appetite,
    });

    // 3. Optimistic Streak calculation
    try {
      const store = useMoodStore.getState();
      const currentStreak = store.streak;
      let lastPostDate = '';
      
      const uniqueDates = Array.from(new Set(store.entries.map(e => e.date))).sort((a, b) => b.localeCompare(a));
      const datesWithoutToday = uniqueDates.filter(d => d !== todayDate);
      if (datesWithoutToday.length > 0) {
        lastPostDate = datesWithoutToday[0];
      }

      let newStreak = currentStreak;
      if (lastPostDate === '') {
        newStreak = 1;
      } else if (isYesterday(lastPostDate, todayDate)) {
        newStreak = currentStreak + 1;
      } else if (lastPostDate !== todayDate) {
        newStreak = 1;
      }

      store.setStreak(newStreak);
      store.setStreakBroken(false);
    } catch (streakErr) {
      console.warn("[TrackerScreen] Failed to calculate optimistic streak:", streakErr);
    }

    // 4. Instant Navigation Transition (0ms UI lag)
    navigation.navigate('TrackerHistory');

    // 5. Background asynchronous Firebase persistence (non-blocking)
    (async () => {
      try {
        if (existingEntry && existingEntry.id) {
          // Update existing
          await setDoc(doc(db, 'users', user.uid, 'tracker_logs', existingEntry.id), {
            ...payload,
            user_id: user.uid,
            updated_at: new Date().toISOString()
          }, { merge: true });
          console.log("[TrackerScreen] Background: Updated entry in Firestore");
        } else {
          // Create new using synchronously pre-generated ID
          await setDoc(doc(db, 'users', user.uid, 'tracker_logs', docId), {
            ...payload,
            user_id: user.uid,
            created_at: new Date().toISOString()
          });
          console.log("[TrackerScreen] Background: Created new entry in Firestore:", docId);
        }

        // Background remote streak calculation and sync
        await updateUserStreak(user.uid, todayDate, 'tracker', {
          symptomsCount: symptoms.length,
          sleepHours: sleepHours,
          sleepQuality: sleepQuality,
          hasThoughtDiary: !!thoughtDiary
        });
      } catch (backgroundErr: any) {
        console.warn("[TrackerScreen] Background Firestore write warning (offline/network issue):", backgroundErr);
      }
    })();
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.38} showBottomPlants />
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
        <Text style={[styles.title, { color: '#FFFFFF' }]}>{t('tracker.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TrackerHistory')}>
          <Text style={{ color: colors.accent }}>{t('tracker.history')}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>{t('tracker.howAreYou')}</Text>
        <View style={styles.moodRow}>
          {MOODS.map(m => (
            <TouchableOpacity 
              key={m.level} 
              onPress={() => setMoodLevel(m.level)}
              style={[
                styles.moodBtn, 
                { backgroundColor: moodLevel === m.level ? colors.accentSoft : colors.surfaceAlt }
              ]}
            >
              <MoodIcon 
                level={m.level} 
                size={34} 
                color={moodLevel === m.level ? colors.accent : colors.textMuted} 
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.moodLabel, { color: colors.textMuted }]}>
          {MOODS.find(m => m.level === moodLevel)?.label}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>{t('tracker.symptoms')}</Text>
        <View style={styles.chipsRow}>
          {SYMPTOMS_LIST.map(sym => {
            const isSelected = symptoms.includes(sym);
            return (
              <TouchableOpacity
                key={sym}
                onPress={() => toggleSymptom(sym)}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: isSelected ? colors.accent : colors.surfaceAlt,
                    borderColor: isSelected ? colors.accent : colors.border
                  }
                ]}
              >
                <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: 13 }}>{sym}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>{t('tracker.sleep')}</Text>
        <View style={styles.sleepRow}>
          <Text style={{ color: colors.text }}>{t('tracker.sleepHours', { hours: sleepHours.toFixed(1) })}</Text>
        </View>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={12}
          step={0.5}
          value={sleepHours}
          onValueChange={setSleepHours}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accentBlue}
        />
        
        <Text style={[styles.subLabel, { color: colors.textMuted, marginTop: spacing.md }]}>{t('tracker.quality')}</Text>
        <View style={styles.qualityRow}>
          {['poor', 'okay', 'good'].map(q => (
            <TouchableOpacity
              key={q}
              onPress={() => setSleepQuality(q as any)}
              style={[
                styles.qualityBtn,
                { backgroundColor: sleepQuality === q ? colors.accentSoft : colors.surfaceAlt }
              ]}
            >
              <Text style={{ color: colors.text, textTransform: 'capitalize' }}>{t(`tracker.sleepQuality.${q}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>{t('tracker.appetite')}</Text>
        <View style={styles.appetiteRow}>
          {(['poor', 'low', 'normal', 'high', 'excessive'] as const).map(level => {
            const isSelected = appetite === level;
            return (
              <TouchableOpacity
                key={level}
                onPress={() => setAppetite(level)}
                style={[
                  styles.appetiteBtn,
                  { 
                    backgroundColor: isSelected ? colors.accentSoft : colors.surfaceAlt,
                    borderColor: isSelected ? colors.accent : colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.appetiteBtnText,
                  { color: isSelected ? colors.accent : colors.text }
                ]}>
                  {t(`tracker.appetiteLevels.${level}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>{t('home.thoughtDiary')}</Text>
        <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t('home.logThoughts')}</Text>
        
        <TextInput
          style={[
            styles.textInput, 
            { 
              backgroundColor: colors.surfaceAlt, 
              color: colors.text,
              borderColor: colors.border
            }
          ]}
          multiline={true}
          numberOfLines={4}
          placeholder={t('thoughtDiary.theSituationPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={thoughtDiary}
          onChangeText={setThoughtDiary}
          textAlignVertical="top"
        />
      </Card>      

      <Button title={existingEntry ? t('tracker.updateEntry') : t('tracker.saveEntry')} onPress={handleSave} style={{ marginTop: spacing.lg }} />
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
  },
  sleepRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  qualityBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 100,
    marginTop: spacing.sm,
  },
  appetiteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  appetiteBtn: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  appetiteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});
