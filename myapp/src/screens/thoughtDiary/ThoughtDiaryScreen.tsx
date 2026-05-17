import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { useThoughtStore, ThoughtEntry } from '../../store/thoughtStore';
import { Card } from '../../components/common/Card';
import { spacing } from '../../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function ThoughtDiaryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { entries, deleteEntry } = useThoughtStore();

  const renderItem = ({ item }: { item: ThoughtEntry }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        <TouchableOpacity onPress={() => deleteEntry(item.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.situation, { color: colors.text }]} numberOfLines={2}>
        {item.situation}
      </Text>
      <View style={[styles.emotionBadge, { backgroundColor: colors.accentSoft }]}>
        <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>
          {item.emotion} ({item.intensity}/10)
        </Text>
      </View>
      <View style={styles.thoughtSection}>
        <Text style={[styles.label, { color: colors.danger, fontSize: 12 }]}>Automatic Thought</Text>
        <Text style={{ color: colors.text }} numberOfLines={2}>{item.automaticThought}</Text>
      </View>
      <View style={styles.thoughtSection}>
        <Text style={[styles.label, { color: colors.success, fontSize: 12 }]}>Balanced Thought</Text>
        <Text style={{ color: colors.text }} numberOfLines={2}>{item.balancedThought}</Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.36} showBottomPlants />
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No thoughts recorded yet. Start challenging your negative thoughts!
            </Text>
          </View>
        )}
      />
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => navigation.navigate('NewThoughtEntry')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100, // For FAB
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: 14,
  },
  situation: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emotionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  thoughtSection: {
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  label: {
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});
