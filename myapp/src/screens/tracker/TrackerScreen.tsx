import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useMoodStore } from '../../store/moodStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { spacing } from '../../../theme/spacing';
import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type TrackerNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Track'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: TrackerNavigationProp;
};

const MOODS = [
  { level: 1, emoji: '😢', label: 'Sad' },
  { level: 2, emoji: '😟', label: 'Anxious' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Calm' },
  { level: 5, emoji: '😁', label: 'Happy' },
];

const SYMPTOMS_LIST = [
  'Headache', 'Fatigue', 'Restlessness', 'Frustration', 'Anxiety', 'Nausea'
];

export default function TrackerScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const addEntry = useMoodStore((state) => state.addEntry);
  const getEntryByDate = useMoodStore((state) => state.getEntryByDate);

  const today = new Date().toISOString().split('T')[0];
  const existingEntry = getEntryByDate(today);

  const [moodLevel, setMoodLevel] = useState<number>(existingEntry?.moodLevel || 3);
  const [symptoms, setSymptoms] = useState<string[]>(existingEntry?.symptoms || []);
  const [sleepHours, setSleepHours] = useState<number>(existingEntry?.sleepHours || 7);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'okay' | 'good'>(existingEntry?.sleepQuality || 'okay');
const [thoughtDiary, setThoughtDiary] = useState<string>(existingEntry?.thoughtDiary || '');
  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSave = async () => {
    // 1. Validation Bouncer
    if (symptoms.length === 0 && (!thoughtDiary || thoughtDiary.trim() === '')) {
      Alert.alert("Empty Entry", "Please select a symptom or write a thought before saving.");
      return;
    }

    // 2. Prepare Payload (Keys must match the SQL table exactly)
    const payload = {
      log_date: today,
      mood_level: moodLevel,
      symptoms: symptoms,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      thought_diary: thoughtDiary,
    };

    try {
      // 3. Network Execution
      const { error } = await supabase
        .from('tracker_logs')
        .insert([payload]);

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message);
      }

      // 4. Local State Backup & Navigation
      addEntry({
        date: today,
        moodLevel,
        symptoms,
        sleepHours,
        sleepQuality,
        thoughtDiary,
      });
      
      navigation.navigate('TrackerHistory');

    } catch (err: any) {
      Alert.alert("Network Error", "Could not save to the database. " + err.message);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Daily Check-in</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TrackerHistory')}>
          <Text style={{ color: colors.accent }}>View History</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>How are you feeling?</Text>
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
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.moodLabel, { color: colors.textMuted }]}>
          {MOODS.find(m => m.level === moodLevel)?.label}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>Symptoms</Text>
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
        <Text style={[styles.label, { color: colors.text }]}>Sleep</Text>
        <View style={styles.sleepRow}>
          <Text style={{ color: colors.text }}>{sleepHours.toFixed(1)} hours</Text>
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
        
        <Text style={[styles.subLabel, { color: colors.textMuted, marginTop: spacing.md }]}>Quality</Text>
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
              <Text style={{ color: colors.text, textTransform: 'capitalize' }}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
<Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>Negative Thought Tracker</Text>
        <Text style={[styles.subLabel, { color: colors.textMuted }]}>Log a specific thought for reflection.</Text>
        
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
          placeholder="What is weighing on your mind?"
          placeholderTextColor={colors.textMuted}
          value={thoughtDiary}
          onChangeText={setThoughtDiary}
          textAlignVertical="top"
        />
      </Card>      

      <Button title={existingEntry ? "Update Entry" : "Save Entry"} onPress={handleSave} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
