import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import type { EventSubscription } from 'expo-modules-core';

const HOMESCREEN_TRACK = require('../../assets/sounds/homescreen.mp3');
const GAME_TRACKS = [
  require('../../assets/sounds/game1.mp3'),
  require('../../assets/sounds/game2.mp3'),
  require('../../assets/sounds/game3.mp3'),
];

let backgroundPlayer: AudioPlayer | null = null;
let listenerSubscription: EventSubscription | null = null;
let isBackgroundPlaying = false;
let backgroundVolume = 0.05;
let effectsVolume = 0.1;
let isMusicMuted = false;
let isEffectsMuted = false;
let currentTrack: number | null = null;
let currentPlaylist: number[] | null = null;
let currentPlaylistIndex = 0;

const effectPlayers = new Map<number, AudioPlayer>();

const loadEffect = (assetModule: number): AudioPlayer | null => {
  if (effectPlayers.has(assetModule)) {
    return effectPlayers.get(assetModule) || null;
  }

  try {
    const player = createAudioPlayer(assetModule);
    effectPlayers.set(assetModule, player);
    return player;
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

const cleanupBackgroundPlayer = () => {
  if (listenerSubscription) {
    listenerSubscription.remove();
    listenerSubscription = null;
  }
  if (backgroundPlayer) {
    try {
      backgroundPlayer.pause();
      backgroundPlayer.remove();
    } catch {
      // Ignore
    }
    backgroundPlayer = null;
  }
};

const playTrack = async (
  track: number,
  loop: boolean = true,
): Promise<void> => {
  if (isMusicMuted) return;

  if (currentTrack === track && isBackgroundPlaying) return;

  cleanupBackgroundPlayer();

  try {
    const player = createAudioPlayer(track);
    player.loop = loop;
    player.volume = backgroundVolume;

    backgroundPlayer = player;
    currentTrack = track;
    isBackgroundPlaying = true;

    listenerSubscription = player.addListener(
      'playbackStatusUpdate',
      status => {
        if (status.didJustFinish) {
          isBackgroundPlaying = false;
          if (!loop && currentPlaylist) {
            playNextInPlaylist();
          }
        }
      },
    );

    player.play();
  } catch (error) {
    console.log('Failed to play track:', track, error);
  }
};

export const SoundManager = {
  init: async (): Promise<void> => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: false,
        shouldPlayInBackground: false,
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
    cleanupBackgroundPlayer();
  },

  pauseBackgroundMusic: async (): Promise<void> => {
    isBackgroundPlaying = false;
    if (backgroundPlayer) {
      try {
        backgroundPlayer.pause();
      } catch {
        // Ignore
      }
    }
  },

  resumeBackgroundMusic: async (): Promise<void> => {
    if (isMusicMuted) return;

    if (backgroundPlayer) {
      try {
        backgroundPlayer.play();
        isBackgroundPlaying = true;
      } catch {
        if (currentTrack) {
          await playTrack(currentTrack, true);
        }
      }
    } else if (currentTrack) {
      await playTrack(currentTrack, true);
    } else {
      await SoundManager.playGameMusic();
    }
  },

  playEffect: async (assetModule: number): Promise<void> => {
    if (isEffectsMuted) return;

    try {
      const player = loadEffect(assetModule);
      if (!player) return;

      player.volume = effectsVolume;
      await player.seekTo(0);
      player.play();
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

  setBackgroundVolume: (volume: number): void => {
    backgroundVolume = volume;
    if (backgroundPlayer) {
      try {
        backgroundPlayer.volume = backgroundVolume;
      } catch {
        // Ignore
      }
    }
  },

  setEffectsVolume: (volume: number): void => {
    effectsVolume = volume;
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

    for (const player of effectPlayers.values()) {
      try {
        player.remove();
      } catch {
        // Ignore
      }
    }
    effectPlayers.clear();
  },
};
