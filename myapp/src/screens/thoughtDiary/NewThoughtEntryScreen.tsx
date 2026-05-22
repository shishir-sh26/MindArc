import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ForestBackground } from '../../components/common/ForestBackground';
import { db, auth } from '../../utils/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useThoughtStore } from '../../store/thoughtStore';
import { useMoodStore } from '../../store/moodStore';
import { updateUserStreak, isYesterday } from '../../utils/streakService';
import { Button } from '../../components/common/Button';
import { spacing } from '../../../theme/spacing';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewThoughtEntry'>;

export default function NewThoughtEntryScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const addEntry = useThoughtStore((state) => state.addEntry);

  const [situation, setSituation] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balancedThought, setBalancedThought] = useState('');

  const handleSave = () => {
    if (!situation || !automaticThought || !emotion) return; // Simple validation

    const today = new Date().toISOString().split('T')[0];
    const payload = {
      situation,
      automaticThought,
      emotion,
      intensity,
      evidenceFor,
      evidenceAgainst,
      balancedThought,
      created_at: new Date().toISOString()
    };

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save entries.");
      return;
    }

    // Generate Firestore document ID synchronously
    const docId = doc(collection(db, 'users', user.uid, 'thought_logs')).id;

    // 1. Optimistic Zustand Store update (instant local change!)
    addEntry({
      id: docId,
      ...payload
    });

    // 2. Optimistic Streak calculation
    try {
      const store = useMoodStore.getState();
      const currentStreak = store.streak;
      let lastPostDate = '';
      
      const uniqueDates = Array.from(new Set(store.entries.map(e => e.date))).sort((a, b) => b.localeCompare(a));
      const datesWithoutToday = uniqueDates.filter(d => d !== today);
      if (datesWithoutToday.length > 0) {
        lastPostDate = datesWithoutToday[0];
      }

      let newStreak = currentStreak;
      if (lastPostDate === '') {
        newStreak = 1;
      } else if (isYesterday(lastPostDate, today)) {
        newStreak = currentStreak + 1;
      } else if (lastPostDate !== today) {
        newStreak = 1;
      }

      store.setStreak(newStreak);
      store.setStreakBroken(false);
    } catch (streakErr) {
      console.warn("[NewThoughtEntryScreen] Failed to calculate optimistic streak:", streakErr);
    }

    // 3. Instant Navigation Back Transition (0ms UI lag)
    navigation.goBack();

    // 4. Background asynchronous Firebase persistence (non-blocking)
    (async () => {
      try {
        await setDoc(doc(db, 'users', user.uid, 'thought_logs', docId), {
          ...payload,
          user_id: user.uid
        });
        console.log("[NewThoughtEntryScreen] Background: Saved thought log in Firestore:", docId);

        // Update daily streak remotely
        await updateUserStreak(user.uid, today, 'thought', {
          situation: situation,
          intensity: intensity
        });
      } catch (err: any) {
        console.warn('[NewThoughtEntryScreen] Background thought save warning (offline/network issue):', err);
      }
    })();
  };

  const inputStyle = [
    styles.input,
    { 
      backgroundColor: colors.surfaceAlt, 
      color: colors.text,
      borderColor: colors.border
    }
  ];

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ForestBackground bgHeightRatio={0.36} showBottomPlants={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>{t('thoughtDiary.theSituation')}</Text>
        <TextInput
          style={inputStyle}
          placeholder={t('thoughtDiary.theSituationPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          value={situation}
          onChangeText={setSituation}
        />

        <Text style={[styles.heading, { color: colors.text }]}>{t('thoughtDiary.negativeThought')}</Text>
        <TextInput
          style={inputStyle}
          placeholder={t('thoughtDiary.negativeThoughtPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          value={automaticThought}
          onChangeText={setAutomaticThought}
        />

        <Text style={[styles.heading, { color: colors.text }]}>{t('thoughtDiary.emotion')}</Text>
        <TextInput
          style={[...inputStyle, { minHeight: 48 }]}
          placeholder={t('thoughtDiary.emotionPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={emotion}
          onChangeText={setEmotion}
        />
        <View style={styles.sliderRow}>
          <Text style={{ color: colors.textMuted }}>{t('thoughtDiary.intensity')}: {intensity}/10</Text>
          <Slider
            style={{ flex: 1, marginLeft: spacing.md }}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={intensity}
            onValueChange={setIntensity}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accentBlue}
          />
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>{t('thoughtDiary.evidenceFor')}</Text>
        <TextInput
          style={inputStyle}
          placeholder={t('thoughtDiary.evidenceForPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          value={evidenceFor}
          onChangeText={setEvidenceFor}
        />

        <Text style={[styles.heading, { color: colors.text }]}>{t('thoughtDiary.evidenceAgainst')}</Text>
        <TextInput
          style={inputStyle}
          placeholder={t('thoughtDiary.evidenceAgainstPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          value={evidenceAgainst}
          onChangeText={setEvidenceAgainst}
        />

        <Text style={[styles.heading, { color: colors.text }]}>{t('thoughtDiary.balancedThought')}</Text>
        <TextInput
          style={inputStyle}
          placeholder={t('thoughtDiary.balancedThoughtPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          value={balancedThought}
          onChangeText={setBalancedThought}
        />

        <Button 
          title={t('thoughtDiary.saveEntry')} 
          onPress={handleSave} 
          style={styles.saveBtn} 
          disabled={!situation || !automaticThought || !emotion}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.xxl,
  }
});
