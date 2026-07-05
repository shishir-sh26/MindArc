import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { useAudioStore } from '../../store/audioStore';
import { hp } from '../../utils/responsive';

// Using local audio files added in myapp/assets/images
const SOUND_OPTIONS = [
  { id: 'rain', name: 'Heavy Rain', icon: 'rainy', file: require('../../../assets/images/heavyrain.mp3') },
  { id: 'forest', name: 'Forest Birds', icon: 'leaf', file: require('../../../assets/images/forestbirds.mp3') },
  { id: 'ocean', name: 'Ocean Waves', icon: 'water', file: require('../../../assets/images/oceanwaves.mp3') },
  { id: 'stream', name: 'Flowing Stream', icon: 'water-outline', file: require('../../../assets/images/stream-flowing.mp3') },
  { id: 'thunders', name: 'Thunderstorm', icon: 'flash', file: require('../../../assets/images/thunders.mp3') },
  { id: 'wind', name: 'Winter Wind', icon: 'cloud', file: require('../../../assets/images/winter-wind.mp3') },
  { id: 'frogs', name: 'Night Frogs', icon: 'moon', file: require('../../../assets/images/frogs-croaking-at-night.mp3') },
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
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.content, activeSoundId ? { paddingBottom: hp(28) } : {}]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>{t('sounds.title')}</Text>
          <Text style={[styles.subtitle, { color: '#F4F9F4' }]}>
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
      </ScrollView>

      {/* Media Player Controls (Sticky floating bar at the bottom) */}
      {activeSoundId && (
        <View style={[styles.playerContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, position: 'relative' },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },
  header: { marginBottom: spacing.xl, marginTop: spacing.md },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.5, height: 1.5 },
    textShadowRadius: 2.5,
  },
  subtitle: {
    fontFamily: typography.display,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.xs,
    textShadowColor: '#000000',
    textShadowOffset: { width: -1.2, height: 1.2 },
    textShadowRadius: 2.2,
  },
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
    position: 'absolute',
    bottom: hp(11),
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
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
