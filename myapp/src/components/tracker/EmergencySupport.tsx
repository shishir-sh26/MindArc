import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';

const THEME = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#E2E8F0',
  crimson: '#E11D48', // Deep Coral / Muted Crimson
  radius: 20,
};

export const EmergencySupport = ({ helplineNumber = '988' }) => {
  const triggerCall = async () => {
    const url = `tel:${helplineNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unavailable', 'Device cannot make calls directly.');
      }
    } catch (error) {
      console.error('Call Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        activeOpacity={0.8}
        onPress={triggerCall}
      >
        <View style={styles.contentRow}>
          <Text style={styles.icon}>🆘</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Crisis Support</Text>
            <Text style={styles.subtitle}>Connect with a counselor immediately</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(225, 29, 72, 0.12)', // Subtle crimson background
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.4)', // Crimson border
    borderRadius: THEME.radius,
    padding: 16,
    shadowColor: THEME.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 26,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FDA4AF', // Soft contrast crimson for perfect legibility
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: THEME.text,
    fontSize: 13,
    opacity: 0.85,
  },
});
