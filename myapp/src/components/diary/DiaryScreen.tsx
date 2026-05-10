import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
export interface ThoughtEntry {
  _id: string;
  userId: string;
  originalThought: string;
  emotions: string[];
  reframedThought?: string;
  intensity: number;
  createdAt: string;
}

const AVAILABLE_EMOTIONS = [
  'Anxious',
  'Frustrated',
  'Sad',
  'Overwhelmed',
  'Stressed',
  'Lonely',
  'Angry',
  'Tired'
];

export default function DiaryScreen() {
  const [entries, setEntries] = useState<ThoughtEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [originalThought, setOriginalThought] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [reframedThought, setReframedThought] = useState('');
  const [intensity, setIntensity] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);

  // Hardcoded for demo purposes as requested to wire frontend to API
  const userId = 'demo-user-123';
  const API_BASE_URL = 'http://localhost:3000/api/thoughts'; // Update to your actual backend URL

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      // Fetch newest first
      const response = await fetch(`${API_BASE_URL}?userId=${userId}&page=1&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const json = await response.json();
      if (json.data) {
        setEntries(json.data);
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = async () => {
    if (!originalThought.trim() || selectedEmotions.length === 0) {
      // Show alert or error message
      return;
    }

    try {
      setSubmitting(true);
      const newEntry = {
        userId,
        originalThought,
        emotions: selectedEmotions,
        reframedThought,
        intensity,
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error('Failed to create entry');

      const savedEntry = await response.json();
      
      // Update local state and reset form
      setEntries([savedEntry, ...entries]);
      setOriginalThought('');
      setSelectedEmotions([]);
      setReframedThought('');
      setIntensity(5);

    } catch (error) {
      console.error('Error submitting entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEntry = ({ item }: { item: ThoughtEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        <View style={styles.intensityBadge}>
          <Text style={styles.intensityText}>Lvl {item.intensity}</Text>
        </View>
      </View>
      
      <Text style={styles.thoughtText} numberOfLines={3}>
        "{item.originalThought}"
      </Text>

      {item.reframedThought ? (
        <View style={styles.reframeContainerCard}>
          <Text style={styles.reframeTitleCard}>Reframed:</Text>
          <Text style={styles.reframeTextCard} numberOfLines={2}>{item.reframedThought}</Text>
        </View>
      ) : null}

      <View style={styles.tagsContainer}>
        {item.emotions.map((emotion, index) => (
          <View key={index} style={styles.tagBadge}>
            <Text style={styles.tagText}>{emotion}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.newEntrySection}>
      <Text style={styles.sectionTitle}>What's on your mind?</Text>
      
      <View style={styles.inputCard}>
        <TextInput
          style={styles.textArea}
          placeholder="I'm feeling..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={4}
          value={originalThought}
          onChangeText={setOriginalThought}
          textAlignVertical="top"
        />
      </View>

      <Text style={styles.subLabel}>Tag your emotions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipContainer}>
          {AVAILABLE_EMOTIONS.map((emotion) => {
            const isSelected = selectedEmotions.includes(emotion);
            return (
              <TouchableOpacity
                key={emotion}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleEmotion(emotion)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {emotion}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedEmotions.length > 0 && originalThought.length > 0 && (
        <View style={styles.reframeSection}>
          <Text style={styles.reframeLabel}>Challenge the negative thought</Text>
          <Text style={styles.reframeHint}>How could you look at this differently?</Text>
          <View style={[styles.inputCard, styles.reframeInputCard]}>
            <TextInput
              style={styles.textArea}
              placeholder="Reframed thought..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={reframedThought}
              onChangeText={setReframedThought}
              textAlignVertical="top"
            />
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.submitButton, (!originalThought || selectedEmotions.length === 0) && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={submitting || !originalThought || selectedEmotions.length === 0}
      >
        {submitting ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text style={styles.submitButtonText}>Save Entry</Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Past Entries</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {loading && entries.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E6E6FA" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
          renderItem={renderEntry}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Midnight Navy
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  newEntrySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E2E8F0', // Soft gray-white
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  inputCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // Semi-transparent deep slate
    borderRadius: 20, // Zero sharp corners
    borderWidth: 1,
    borderColor: '#334155', // Subtle border
    padding: 16,
    marginBottom: 20,
    // Soft shadow for glassmorphism
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  textArea: {
    color: '#E2E8F0',
    fontSize: 16,
    minHeight: 100,
    lineHeight: 24,
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E6E6FA', // Lavender accent
    marginBottom: 12,
  },
  chipScroll: {
    marginBottom: 24,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipSelected: {
    backgroundColor: 'rgba(230, 230, 250, 0.15)', // Light lavender wash
    borderColor: '#E6E6FA', // Lavender
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#E6E6FA',
    fontWeight: '600',
  },
  reframeSection: {
    marginBottom: 20,
  },
  reframeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8FBC8F', // Sage Green accent
    marginBottom: 4,
  },
  reframeHint: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  reframeInputCard: {
    borderColor: 'rgba(143, 188, 143, 0.3)', // Sage green tinted border
    backgroundColor: 'rgba(143, 188, 143, 0.05)',
  },
  submitButton: {
    backgroundColor: '#E6E6FA', // Lavender
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#E6E6FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 32,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', // Deep slate
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  intensityBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  intensityText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  thoughtText: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  reframeContainerCard: {
    backgroundColor: 'rgba(143, 188, 143, 0.1)', // Sage green tint
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8FBC8F',
  },
  reframeTitleCard: {
    color: '#8FBC8F',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reframeTextCard: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: 'rgba(230, 230, 250, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 250, 0.2)',
  },
  tagText: {
    color: '#E6E6FA',
    fontSize: 12,
    fontWeight: '500',
  },
});
