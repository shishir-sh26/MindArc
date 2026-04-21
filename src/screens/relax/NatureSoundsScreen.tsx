import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Mocking with external URLs to ensure playability without local assets
const SOUND_OPTIONS = [
  { id: 'rain', name: 'Heavy Rain', icon: 'rainy', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_6b5d92e62a.mp3' },
  { id: 'forest', name: 'Forest Birds', icon: 'leaf', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_209772ee54.mp3' },
  { id: 'ocean', name: 'Ocean Waves', icon: 'water', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_8bd0cd16aa.mp3' },
];

export default function NatureSoundsScreen() {
  const { colors } = useTheme();
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  async function playSound(url: string, id: string) {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: true, volume }
      );
      setSound(newSound);
      setActiveSoundId(id);
      setIsPlaying(true);
    } catch (e) {
      console.warn("Couldn't load sound", e);
    }
  }

  async function togglePlayPause() {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }

  async function changeVolume(val: number) {
    setVolume(val);
    if (sound) {
      await sound.setVolumeAsync(val);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Nature Sounds</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Put on your headphones and drift away.
        </Text>
      </View>

      <View style={styles.grid}>
        {SOUND_OPTIONS.map(opt => {
          const isActive = activeSoundId === opt.id;
          return (
            <TouchableOpacity 
              key={opt.id}
              style={[
                styles.soundCard, 
                { 
                  backgroundColor: isActive ? colors.accentSoft : colors.surface,
                  borderColor: isActive ? colors.accent : colors.border
                }
              ]}
              onPress={() => {
                if (isActive) togglePlayPause();
                else playSound(opt.url, opt.id);
              }}
            >
              <Ionicons 
                name={opt.icon as any} 
                size={42} 
                color={isActive ? colors.accent : colors.textMuted} 
              />
              <Text style={[styles.soundTitle, { color: isActive ? colors.text : colors.textMuted }]}>
                {opt.name}
              </Text>
              
              {isActive && (
                <View style={styles.activeIndicator}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={16} color={colors.accent} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Media Player Controls */}
      {activeSoundId && (
        <View style={[styles.playerContainer, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.playerTitle, { color: colors.text }]}>
            Now Playing: {SOUND_OPTIONS.find(s => s.id === activeSoundId)?.name}
          </Text>
          
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={togglePlayPause} style={[styles.playBtn, { backgroundColor: colors.accent }]}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.volumeContainer}>
              <Ionicons name="volume-low" size={20} color={colors.textMuted} />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={changeVolume}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.accentBlue}
              />
              <Ionicons name="volume-high" size={20} color={colors.textMuted} />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { marginBottom: spacing.xl, marginTop: spacing.md },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: spacing.xs },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    gap: spacing.md
  },
  soundCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  soundTitle: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: '600'
  },
  activeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  playerContainer: {
    marginTop: spacing.xxl,
    padding: spacing.xl,
    borderRadius: 24,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xl,
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  }
});
