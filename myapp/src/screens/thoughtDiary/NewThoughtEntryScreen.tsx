import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useThoughtStore } from '../../store/thoughtStore';
import { Button } from '../../components/common/Button';
import { spacing } from '../../../theme/spacing';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewThoughtEntry'>;

export default function NewThoughtEntryScreen({ navigation }: Props) {
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

    addEntry({
      situation,
      automaticThought,
      emotion,
      intensity,
      evidenceFor,
      evidenceAgainst,
      balancedThought,
    });
    navigation.goBack();
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
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>1. The Situation</Text>
        <TextInput
          style={inputStyle}
          placeholder="What happened? Who, what, when, where?"
          placeholderTextColor={colors.textMuted}
          multiline
          value={situation}
          onChangeText={setSituation}
        />

        <Text style={[styles.heading, { color: colors.text }]}>2. Automatic Thought</Text>
        <TextInput
          style={inputStyle}
          placeholder="What went through your mind?"
          placeholderTextColor={colors.textMuted}
          multiline
          value={automaticThought}
          onChangeText={setAutomaticThought}
        />

        <Text style={[styles.heading, { color: colors.text }]}>3. Emotion & Intensity</Text>
        <TextInput
          style={[...inputStyle, { minHeight: 48 }]}
          placeholder="E.g., Anxious, Sad, Angry"
          placeholderTextColor={colors.textMuted}
          value={emotion}
          onChangeText={setEmotion}
        />
        <View style={styles.sliderRow}>
          <Text style={{ color: colors.textMuted }}>Intensity: {intensity}/10</Text>
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

        <Text style={[styles.heading, { color: colors.text }]}>4. Evidence FOR the thought</Text>
        <TextInput
          style={inputStyle}
          placeholder="Facts that support this thought"
          placeholderTextColor={colors.textMuted}
          multiline
          value={evidenceFor}
          onChangeText={setEvidenceFor}
        />

        <Text style={[styles.heading, { color: colors.text }]}>5. Evidence AGAINST the thought</Text>
        <TextInput
          style={inputStyle}
          placeholder="Facts that contradict this thought"
          placeholderTextColor={colors.textMuted}
          multiline
          value={evidenceAgainst}
          onChangeText={setEvidenceAgainst}
        />

        <Text style={[styles.heading, { color: colors.text }]}>6. Balanced Thought</Text>
        <TextInput
          style={inputStyle}
          placeholder="A more realistic, balanced perspective"
          placeholderTextColor={colors.textMuted}
          multiline
          value={balancedThought}
          onChangeText={setBalancedThought}
        />

        <Button 
          title="Save Entry" 
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
