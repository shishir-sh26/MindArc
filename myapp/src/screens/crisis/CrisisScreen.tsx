import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { crisisContacts } from '../../data/crisisContacts';
import { Card } from '../../components/common/Card';
import { spacing, radii } from '../../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

export default function CrisisScreen() {
  const { colors } = useTheme();

  const handleCall = (number: string) => {
    // Standardize number format by removing non-digits for tel: scheme
    const formattedNumber = number.replace(/[^\d+]/g, '');
    const url = `tel:${formattedNumber}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Calling is not supported on this device.');
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart" size={48} color={colors.danger} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>You are not alone.</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          There are people who want to listen and help. Reach out to one of the free support lines below.
        </Text>
      </View>

      {crisisContacts.map(contact => (
        <Card key={contact.id} style={styles.card}>
          <View style={styles.cardContent}>
            <View>
              <Text style={[styles.orgName, { color: colors.text }]}>{contact.name}</Text>
              <Text style={[styles.hours, { color: colors.textMuted }]}>
                <Ionicons name="time-outline" size={14} /> {contact.hours}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.callBtn, { backgroundColor: colors.danger }]}
              onPress={() => handleCall(contact.number)}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callBtnText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
      
      <View style={styles.footer}>
        <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
          If you are in immediate physical danger, please contact local emergency services immediately.
        </Text>
      </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  hours: {
    fontSize: 14,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  callBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  }
});
