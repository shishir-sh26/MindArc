import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { useAudioStore } from '../../store/audioStore';
import { hp, rf, wp } from '../../utils/responsive';

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
  const { colors, isDark } = useTheme();
  const [playMode, setPlayMode] = useState<'single' | 'mix'>('single');

  const {
    activeSounds,
    isMasterPlaying,
    toggleSound,
    playSingleSound,
    setVolume,
    toggleMasterPlayPause,
    stopAll
  } = useAudioStore();

  const activeCount = Object.keys(activeSounds).length;

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.40} showBottomPlants />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.content, activeCount > 0 ? { paddingBottom: hp(28) } : {}]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>{t('sounds.title')}</Text>
          <Text style={[styles.subtitle, { color: '#F4F9F4' }]}>
            {t('sounds.subtitle')}
          </Text>
        </View>

        {/* Playback Mode Selector */}
        <View style={[styles.modeToggleContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.45)', borderColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.modeTab, playMode === 'single' && { backgroundColor: colors.accent }]}
            onPress={async () => {
              await stopAll();
              setPlayMode('single');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="musical-note-outline" size={16} color={playMode === 'single' ? '#FFFFFF' : colors.textMuted} />
            <Text style={[styles.modeTabText, { color: playMode === 'single' ? '#FFFFFF' : colors.text }]}>
              {t('sounds.singleMode', { defaultValue: 'Single Sound' })}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeTab, playMode === 'mix' && { backgroundColor: colors.accent }]}
            onPress={async () => {
              await stopAll();
              setPlayMode('mix');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="options-outline" size={16} color={playMode === 'mix' ? '#FFFFFF' : colors.textMuted} />
            <Text style={[styles.modeTabText, { color: playMode === 'mix' ? '#FFFFFF' : colors.text }]}>
              {t('sounds.mixMode', { defaultValue: 'Soundscape Mixer' })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {SOUND_OPTIONS.map(opt => {
            const soundInfo = activeSounds[opt.id];
            const isActive = !!soundInfo;

            return (
              <View 
                key={opt.id}
                style={[
                  styles.soundCard, 
                  { 
                    backgroundColor: isActive 
                      ? (isDark ? 'rgba(29, 59, 26, 0.7)' : 'rgba(232, 242, 220, 0.7)') 
                      : colors.surface,
                    borderColor: isActive ? colors.accent : colors.border
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.cardHeader}
                  onPress={async () => {
                    if (playMode === 'single') {
                      await playSingleSound(opt.file, opt.id);
                    } else {
                      await toggleSound(opt.file, opt.id);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconAndTitle}>
                    <View style={[
                      styles.iconWrapper, 
                      { backgroundColor: isActive ? colors.accent : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }
                    ]}>
                      <Ionicons 
                        name={opt.icon as any} 
                        size={24} 
                        color={isActive ? '#FFFFFF' : colors.textMuted} 
                      />
                    </View>
                    <View style={{ marginLeft: spacing.md }}>
                      <Text style={[styles.soundTitle, { color: colors.text }]}>
                        {t(`sounds.options.${opt.id}`)}
                      </Text>
                      <Text style={[styles.soundStatus, { color: colors.textMuted }]}>
                        {isActive 
                          ? t('sounds.playing', { defaultValue: 'Active' }) 
                          : playMode === 'single' 
                            ? t('sounds.tapToPlay', { defaultValue: 'Tap to play' }) 
                            : t('sounds.tapToMix', { defaultValue: 'Tap to mix' })}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.toggleWrapper}>
                    <Ionicons 
                      name={isActive ? "close-circle-outline" : (playMode === 'single' ? "arrow-forward-circle-outline" : "add-circle-outline")} 
                      size={26} 
                      color={isActive ? colors.danger : colors.accent} 
                    />
                  </View>
                </TouchableOpacity>

                {isActive && (
                  <View style={styles.sliderContainer}>
                    <Ionicons name="volume-mute-outline" size={16} color={colors.textMuted} />
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1}
                      value={soundInfo.volume}
                      onValueChange={(val) => setVolume(opt.id, val)}
                      minimumTrackTintColor={colors.accent}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.accentBlue}
                    />
                    <Ionicons name="volume-high-outline" size={16} color={colors.textMuted} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Custom Soundscape Mixer Panel */}
      {activeCount > 0 && (
        <View style={[
          styles.playerContainer, 
          { 
            backgroundColor: isDark ? 'rgba(17, 30, 15, 0.92)' : 'rgba(240, 247, 232, 0.92)', 
            borderColor: colors.accentSoft 
          }
        ]}>
          <Text style={[styles.playerTitle, { color: colors.text }]}>
            {playMode === 'single' 
              ? `${t('sounds.nowPlaying', { defaultValue: 'Now Playing:' })} ${t(`sounds.options.${Object.keys(activeSounds)[0]}`)}`
              : `${t('sounds.mixerActive', { defaultValue: 'Soundscape Mixer' })} (${activeCount} ${activeCount === 1 ? t('sounds.track', { defaultValue: 'track' }) : t('sounds.tracks', { defaultValue: 'tracks' })})`
            }
          </Text>
          
          <View style={styles.controlsRow}>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                onPress={toggleMasterPlayPause} 
                style={[styles.playBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
              >
                <Ionicons name={isMasterPlaying ? "pause" : "play"} size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={stopAll} 
                style={[styles.playBtn, { backgroundColor: colors.danger }]}
                activeOpacity={0.8}
              >
                <Ionicons name="stop" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mixerStatus}>
              <Text style={{ fontFamily: typography.mono, fontSize: rf(11), color: colors.textMuted }}>
                {isMasterPlaying ? t('sounds.playingLive', { defaultValue: 'PLAYING LIVE' }) : t('sounds.paused', { defaultValue: 'PAUSED' })}
              </Text>
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
  header: { marginBottom: spacing.lg, marginTop: spacing.md },
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
  modeToggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: 4
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6
  },
  modeTabText: {
    fontFamily: typography.label,
    fontSize: rf(12),
    fontWeight: '700'
  },
  listContainer: {
    gap: spacing.md
  },
  soundCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  soundTitle: {
    fontFamily: typography.body,
    fontSize: 16,
    fontWeight: '700'
  },
  soundStatus: {
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: 2
  },
  toggleWrapper: {
    padding: 4
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  playerContainer: {
    position: 'absolute',
    bottom: hp(11),
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  playerTitle: {
    fontFamily: typography.body,
    fontSize: 15,
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
    gap: 12,
  },
  playBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixerStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  }
});
