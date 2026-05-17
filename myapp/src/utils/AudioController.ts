import { Audio } from 'expo-av';

class AudioControllerService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  constructor() {
    // Setup audio session to play in background and mix with others if needed
    // This satisfies: "If the user navigates away from the audio screen, the audio should continue playing in the background"
    this.initAudioMode();
  }

  private async initAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error initializing audio mode:', error);
    }
  }

  /**
   * Loads a sound. Only one track can play at a time.
   * @param source Require'd asset or URI
   */
  async loadSound(source: any) {
    try {
      if (this.sound) {
        await this.stopSound();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        source,
        { isLooping: true, shouldPlay: false } // Constraint: Audio MUST loop seamlessly
      );
      this.sound = sound;
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  }

  /**
   * Plays the currently loaded sound.
   */
  async playSound() {
    if (this.sound) {
      try {
        await this.sound.playAsync();
        this.isPlaying = true;
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    } else {
      console.warn('No sound loaded to play');
    }
  }

  /**
   * Stops the currently loaded sound.
   * Global floating "Stop Audio" method can consume this.
   */
  async stopSound() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        this.isPlaying = false;
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
    }
  }

  /**
   * Sets the volume of the currently loaded sound.
   * @param volume Number between 0.0 and 1.0
   */
  async setVolume(volume: number) {
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying() {
    return this.isPlaying;
  }
}

// Export a singleton instance for global control
export const AudioController = new AudioControllerService();
