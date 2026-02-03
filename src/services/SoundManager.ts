import {Audio, AVPlaybackStatus} from 'expo-av';

const HOMESCREEN_TRACK = require('../../assets/sounds/homescreen.mp3');
const GAME_TRACKS = [
  require('../../assets/sounds/game1.mp3'),
  require('../../assets/sounds/game2.mp3'),
  require('../../assets/sounds/game3.mp3'),
];

let backgroundSound: Audio.Sound | null = null;
let isBackgroundPlaying = false;
let backgroundVolume = 0.5;
let effectsVolume = 0.5;
let isMusicMuted = false;
let isEffectsMuted = false;
let currentTrack: number | null = null;
let currentPlaylist: number[] | null = null;
let currentPlaylistIndex = 0;

const effectSounds = new Map<number, Audio.Sound>();

const loadEffect = async (assetModule: number): Promise<Audio.Sound | null> => {
  if (effectSounds.has(assetModule)) {
    return effectSounds.get(assetModule) || null;
  }

  try {
    const {sound} = await Audio.Sound.createAsync(assetModule);
    effectSounds.set(assetModule, sound);
    return sound;
  } catch (error) {
    console.log('Failed to load effect:', assetModule, error);
    return null;
  }
};

const playNextInPlaylist = async (): Promise<void> => {
  if (!currentPlaylist || currentPlaylist.length === 0) return;

  currentPlaylistIndex = (currentPlaylistIndex + 1) % currentPlaylist.length;
  await playTrack(currentPlaylist[currentPlaylistIndex], false);
};

const playTrack = async (track: number, loop: boolean = true): Promise<void> => {
  if (isMusicMuted) return;

  if (currentTrack === track && isBackgroundPlaying) return;

  if (backgroundSound) {
    try {
      await backgroundSound.stopAsync();
      await backgroundSound.unloadAsync();
    } catch {
      // Ignore
    }
    backgroundSound = null;
  }

  try {
    const {sound} = await Audio.Sound.createAsync(track, {
      isLooping: loop,
      volume: backgroundVolume,
    });

    backgroundSound = sound;
    currentTrack = track;
    isBackgroundPlaying = true;

    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        isBackgroundPlaying = false;
        if (!loop && currentPlaylist) {
          playNextInPlaylist();
        }
      }
    });

    await sound.playAsync();
  } catch (error) {
    console.log('Failed to play track:', track, error);
  }
};

export const SoundManager = {
  init: async (): Promise<void> => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('SoundManager init failed:', error);
    }
  },

  playHomeMusic: async (): Promise<void> => {
    currentPlaylist = null;
    await playTrack(HOMESCREEN_TRACK, true);
  },

  playGameMusic: async (): Promise<void> => {
    currentPlaylist = GAME_TRACKS;
    currentPlaylistIndex = 0;
    await playTrack(GAME_TRACKS[0], false);
  },

  stopBackgroundMusic: async (): Promise<void> => {
    isBackgroundPlaying = false;
    currentTrack = null;
    currentPlaylist = null;
    currentPlaylistIndex = 0;
    if (backgroundSound) {
      try {
        await backgroundSound.stopAsync();
        await backgroundSound.unloadAsync();
      } catch {
        // Ignore
      }
      backgroundSound = null;
    }
  },

  pauseBackgroundMusic: async (): Promise<void> => {
    isBackgroundPlaying = false;
    if (backgroundSound) {
      try {
        await backgroundSound.pauseAsync();
      } catch {
        // Ignore
      }
    }
  },

  resumeBackgroundMusic: async (): Promise<void> => {
    if (isMusicMuted) return;

    if (backgroundSound) {
      try {
        await backgroundSound.playAsync();
        isBackgroundPlaying = true;
      } catch {
        if (currentTrack) {
          await playTrack(currentTrack, true);
        }
      }
    } else if (currentTrack) {
      await playTrack(currentTrack, true);
    }
  },

  playEffect: async (assetModule: number): Promise<void> => {
    if (isEffectsMuted) return;

    try {
      const sound = await loadEffect(assetModule);
      if (!sound) return;

      await sound.setVolumeAsync(effectsVolume);
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.log('Failed to play effect:', error);
    }
  },

  playPlaceEffect: (): void => {
    SoundManager.playEffect(require('../../assets/sounds/placed.mp3'));
  },

  playRotateEffect: (): void => {
    SoundManager.playEffect(require('../../assets/sounds/rotated.mp3'));
  },

  playWinEffect: (): void => {
    SoundManager.playEffect(require('../../assets/sounds/win.mp3'));
  },

  setBackgroundVolume: async (volume: number): Promise<void> => {
    backgroundVolume = Math.max(0, Math.min(1, volume));
    if (backgroundSound) {
      try {
        await backgroundSound.setVolumeAsync(backgroundVolume);
      } catch {
        // Ignore
      }
    }
  },

  setEffectsVolume: (volume: number): void => {
    effectsVolume = Math.max(0, Math.min(1, volume));
  },

  setMusicMuted: (muted: boolean): void => {
    isMusicMuted = muted;
    if (muted) {
      SoundManager.pauseBackgroundMusic();
    } else {
      SoundManager.resumeBackgroundMusic();
    }
  },

  setEffectsMuted: (muted: boolean): void => {
    isEffectsMuted = muted;
  },

  isMusicMutedState: (): boolean => {
    return isMusicMuted;
  },

  isEffectsMutedState: (): boolean => {
    return isEffectsMuted;
  },

  getBackgroundVolume: (): number => {
    return backgroundVolume;
  },

  getEffectsVolume: (): number => {
    return effectsVolume;
  },

  release: async (): Promise<void> => {
    await SoundManager.stopBackgroundMusic();

    for (const sound of effectSounds.values()) {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore
      }
    }
    effectSounds.clear();
  },
};
