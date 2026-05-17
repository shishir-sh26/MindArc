import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { useAudioStore } from '../../store/audioStore';

// Using local audio files added in myapp/assets/images
const SOUND_OPTIONS = [
  { id: 'rain', name: 'Heavy Rain', icon: 'rainy', file: require('../../../assets/images/heavyrain.mp3') },
  { id: 'forest', name: 'Forest Birds', icon: 'leaf', file: require('../../../assets/images/forestbirds.mp3') },
  { id: 'ocean', name: 'Ocean Waves', icon: 'water', file: require('../../../assets/images/oceanwaves.mp3') },
];

export default function NatureSoundsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    activeSoundId,
    isPlaying,
    volume,
    playSound,
    togglePlayPause,
    changeVolume,
    stopAndUnload
  } = useAudioStore();

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.40} showBottomPlants />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('sounds.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('sounds.subtitle')}
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
                  else playSound(opt.file, opt.id);
                }}
              >
                <Ionicons 
                  name={opt.icon as any} 
                  size={42} 
                  color={isActive ? colors.accent : colors.textMuted} 
                />
                <Text style={[styles.soundTitle, { color: isActive ? colors.text : colors.textMuted }]}>
                  {t(`sounds.options.${opt.id}`)}
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
              {t('sounds.nowPlaying')} {t(`sounds.options.${activeSoundId}`)}
            </Text>
            
            <View style={styles.controlsRow}>
              <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={togglePlayPause} style={[styles.playBtn, { backgroundColor: colors.accent }]}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={stopAndUnload} style={[styles.playBtn, { backgroundColor: colors.danger }]}>
                  <Ionicons name="stop" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
              
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
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, position: 'relative' },
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
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.lg,
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  }
});
