import { create } from 'zustand';
import { Audio } from 'expo-av';

interface AudioState {
  sound: Audio.Sound | null;
  activeSoundId: string | null;
  isPlaying: boolean;
  volume: number;
  playSound: (file: any, id: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  changeVolume: (val: number) => Promise<void>;
  stopAndUnload: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  sound: null,
  activeSoundId: null,
  isPlaying: false,
  volume: 0.5,

  playSound: async (file, id) => {
    const { sound: currentSound, volume } = get();

    // 1. Unload current sound if exists
    if (currentSound) {
      try {
        await currentSound.unloadAsync();
      } catch (e) {
        console.warn('Error unloading current sound:', e);
      }
    }

    try {
      // Configure audio mode for background active playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        file,
        { shouldPlay: true, isLooping: true, volume }
      );

      set({
        sound: newSound,
        activeSoundId: id,
        isPlaying: true,
      });
    } catch (e) {
      console.warn("Couldn't load sound in global store", e);
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying } = get();
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        set({ isPlaying: false });
      } else {
        await sound.playAsync();
        set({ isPlaying: true });
      }
    } catch (e) {
      console.warn('Error toggling play/pause:', e);
    }
  },

  changeVolume: async (val) => {
    const { sound } = get();
    set({ volume: val });
    if (sound) {
      try {
        await sound.setVolumeAsync(val);
      } catch (e) {
        console.warn('Error updating volume:', e);
      }
    }
  },

  stopAndUnload: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (e) {
        console.warn('Error stopping sound:', e);
      }
    }
    set({
      sound: null,
      activeSoundId: null,
      isPlaying: false,
    });
  }
}));
