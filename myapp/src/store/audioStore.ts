import { create } from 'zustand';
import { Audio } from 'expo-av';

interface ActiveSoundInfo {
  sound: Audio.Sound;
  volume: number;
  isPlaying: boolean;
}

interface AudioState {
  activeSounds: Record<string, ActiveSoundInfo>;
  isMasterPlaying: boolean;
  toggleSound: (file: any, id: string) => Promise<void>;
  playSingleSound: (file: any, id: string) => Promise<void>;
  setVolume: (id: string, val: number) => Promise<void>;
  toggleMasterPlayPause: () => Promise<void>;
  stopAll: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  activeSounds: {},
  isMasterPlaying: false,

  toggleSound: async (file, id) => {
    const { activeSounds } = get();
    
    // 1. If sound is already loaded, unload and remove it
    if (activeSounds[id]) {
      const soundInfo = activeSounds[id];
      try {
        await soundInfo.sound.stopAsync();
        await soundInfo.sound.unloadAsync();
      } catch (e) {
        console.warn(`Error unloading sound ${id}:`, e);
      }
      
      const newActive = { ...activeSounds };
      delete newActive[id];
      
      const hasAnyPlaying = Object.values(newActive).some(s => s.isPlaying);
      set({
        activeSounds: newActive,
        isMasterPlaying: hasAnyPlaying
      });
      return;
    }

    // 2. Otherwise, load and start playing this sound
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        file,
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );

      const newActive = {
        ...activeSounds,
        [id]: {
          sound: newSound,
          volume: 0.5,
          isPlaying: true
        }
      };

      set({
        activeSounds: newActive,
        isMasterPlaying: true
      });
    } catch (e) {
      console.warn(`Couldn't load sound ${id}:`, e);
    }
  },

  playSingleSound: async (file, id) => {
    const { activeSounds, stopAll } = get();
    
    // If the selected sound is already active, we want to toggle it (stop it)
    if (activeSounds[id]) {
      await stopAll();
      return;
    }
    
    // Otherwise, stop all sounds first to prevent overlay
    await stopAll();
    
    // Now play the new sound
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        file,
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );

      set({
        activeSounds: {
          [id]: {
            sound: newSound,
            volume: 0.5,
            isPlaying: true
          }
        },
        isMasterPlaying: true
      });
    } catch (e) {
      console.warn(`Couldn't load single sound ${id}:`, e);
    }
  },

  setVolume: async (id, val) => {
    const { activeSounds } = get();
    if (!activeSounds[id]) return;

    try {
      await activeSounds[id].sound.setVolumeAsync(val);
      
      const newActive = { ...activeSounds };
      newActive[id] = { ...newActive[id], volume: val };
      
      set({ activeSounds: newActive });
    } catch (e) {
      console.warn(`Error setting volume for ${id}:`, e);
    }
  },

  toggleMasterPlayPause: async () => {
    const { activeSounds, isMasterPlaying } = get();
    const nextPlaying = !isMasterPlaying;

    for (const id of Object.keys(activeSounds)) {
      const soundInfo = activeSounds[id];
      try {
        if (nextPlaying) {
          await soundInfo.sound.playAsync();
          soundInfo.isPlaying = true;
        } else {
          await soundInfo.sound.pauseAsync();
          soundInfo.isPlaying = false;
        }
      } catch (e) {
        console.warn(`Error toggling playback for ${id}:`, e);
      }
    }

    set({
      isMasterPlaying: nextPlaying,
      activeSounds: { ...activeSounds }
    });
  },

  stopAll: async () => {
    const { activeSounds } = get();
    
    for (const id of Object.keys(activeSounds)) {
      const soundInfo = activeSounds[id];
      try {
        await soundInfo.sound.stopAsync();
        await soundInfo.sound.unloadAsync();
      } catch (e) {
        console.warn(`Error unloading sound ${id} during stopAll:`, e);
      }
    }

    set({
      activeSounds: {},
      isMasterPlaying: false
    });
  }
}));
