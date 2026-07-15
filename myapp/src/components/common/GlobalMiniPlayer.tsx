import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAudioStore } from '../../store/audioStore';
import { hp, wp } from '../../utils/responsive';

const SOUND_LABELS: Record<string, { label: string; icon: string }> = {
  rain:     { label: 'Heavy Rain',    icon: 'rainy' },
  forest:   { label: 'Forest Birds',  icon: 'leaf' },
  ocean:    { label: 'Ocean Waves',   icon: 'water' },
  stream:   { label: 'Flowing Stream', icon: 'water-outline' },
  thunders: { label: 'Thunderstorm',  icon: 'flash' },
  wind:     { label: 'Winter Wind',   icon: 'cloud' },
  frogs:    { label: 'Night Frogs',   icon: 'moon' },
};

export const GlobalMiniPlayer = () => {
  const { colors, isDark } = useTheme();
  const { activeSounds, isMasterPlaying, toggleMasterPlayPause, stopAll } = useAudioStore();

  const activeIds = Object.keys(activeSounds);
  const hasActiveSounds = activeIds.length > 0;

  // Slide-in/out animation
  const slideAnim = useRef(new RNAnimated.Value(100)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (hasActiveSounds) {
      RNAnimated.parallel([
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hasActiveSounds]);

  if (!hasActiveSounds) return null;

  // Build label text
  const soundNames = activeIds
    .map(id => SOUND_LABELS[id]?.label || id)
    .join(' + ');
  
  const displayLabel = activeIds.length === 1
    ? soundNames
    : `Mix: ${soundNames}`;

  const primaryIcon = SOUND_LABELS[activeIds[0]]?.icon || 'musical-notes';

  return (
    <RNAnimated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 120}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blurContainer,
          {
            borderColor: isDark ? 'rgba(93,191,110,0.3)' : 'rgba(90,156,58,0.25)',
            backgroundColor: isDark ? 'rgba(11,26,9,0.75)' : 'rgba(240,250,235,0.75)',
          },
        ]}
      >
        {/* Sound icon + label */}
        <View style={styles.infoRow}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(93,191,110,0.15)' : 'rgba(90,156,58,0.12)' }]}>
            <Ionicons name={primaryIcon as any} size={18} color={colors.accent} />
          </View>
          <View style={styles.textCol}>
            <Text style={[styles.nowPlayingLabel, { color: colors.textMuted }]} numberOfLines={1}>
              Now Playing
            </Text>
            <Text style={[styles.soundName, { color: colors.text }]} numberOfLines={1}>
              {displayLabel}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Play/Pause */}
          <TouchableOpacity
            onPress={toggleMasterPlayPause}
            style={[styles.controlBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isMasterPlaying ? 'pause' : 'play'}
              size={20}
              color={colors.accent}
            />
          </TouchableOpacity>

          {/* Stop */}
          <TouchableOpacity
            onPress={stopAll}
            style={[styles.controlBtn, { backgroundColor: isDark ? 'rgba(255,80,80,0.12)' : 'rgba(255,60,60,0.08)' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="stop" size={18} color="#FF5555" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp(2.2) + 72, // Float above the tab bar
    left: wp(3),
    right: wp(3),
    zIndex: 9998,
    elevation: 10,
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  soundName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
