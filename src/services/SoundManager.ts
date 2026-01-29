import {AudioBuffer, AudioBufferSourceNode, AudioContext, GainNode,} from 'react-native-audio-api';
import {Image} from 'react-native';

const HOMESCREEN_TRACK = require('../../assets/sounds/homescreen.mp3');

let audioContext: AudioContext | null = null;
let isBackgroundPlaying = false;
let backgroundVolume = 0.5;
let effectsVolume = 0.5;
let isMusicMuted = false;
let isEffectsMuted = false;
let currentSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let currentTrack: number | null = null;
const audioBuffers = new Map<number, AudioBuffer>();

const loadSound = async (assetModule: number): Promise<AudioBuffer | null> => {
  if (!audioContext) return null;

  if (audioBuffers.has(assetModule)) {
    return audioBuffers.get(assetModule) || null;
  }

  try {
    const assetSource = Image.resolveAssetSource(assetModule);
    const uri = assetSource?.uri;

    if (!uri) return null;

    const buffer = await audioContext.decodeAudioData(uri);
    audioBuffers.set(assetModule, buffer);
    return buffer;
  } catch (error) {
    console.log('Failed to load sound:', assetModule, error);
    return null;
  }
};

const playTrack = async (track: number, loop: boolean = true): Promise<void> => {
  if (!audioContext || !gainNode || isMusicMuted) return;

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // Ignore
    }
    currentSource = null;
  }

  const buffer = await loadSound(track);
  if (!buffer) return;

  currentSource = audioContext.createBufferSource();
  currentSource.buffer = buffer;
  currentSource.connect(gainNode);
  currentTrack = track;
  isBackgroundPlaying = true;

  if (loop) {
    currentSource.onEnded = () => {
      if (isBackgroundPlaying && currentTrack === track) {
        playTrack(track, true);
      }
    };
  }

  currentSource.start();
};

export const SoundManager = {
  init: async (): Promise<void> => {
    try {
      audioContext = new AudioContext();

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = backgroundVolume;
    } catch (error) {
      console.error('SoundManager init failed:', error);
    }
  },

  playHomeMusic: async (): Promise<void> => {
    await playTrack(HOMESCREEN_TRACK, true);
  },

  playGameMusic: async (): Promise<void> => {
    // await playTrack(GAME_TRACK, true);
  },

  stopBackgroundMusic: (): void => {
    isBackgroundPlaying = false;
    currentTrack = null;
    if (currentSource) {
      try {
        currentSource.stop();
      } catch {
        // Ignore
      }
      currentSource = null;
    }
  },

  pauseBackgroundMusic: (): void => {
    isBackgroundPlaying = false;
    if (currentSource) {
      try {
        currentSource.stop();
      } catch {
        // Ignore
      }
      currentSource = null;
    }
  },

  resumeBackgroundMusic: (): void => {
    if (isMusicMuted || !currentTrack) return;
    playTrack(currentTrack, true);
  },

  playEffect: async (assetModule: number): Promise<void> => {
    if (!audioContext || isEffectsMuted) return;

    const buffer = await loadSound(assetModule);
    if (!buffer) return;

    const effectGain = audioContext.createGain();
    effectGain.gain.value = effectsVolume;
    effectGain.connect(audioContext.destination);

    const source = audioContext.createBufferSource();
    source.playbackRate.value = 1;
    source.buffer = buffer;
    source.connect(effectGain);
    source.start();
  },

  playPlaceEffect: (): void => {
    try {
      SoundManager.playEffect(require('../../assets/sounds/placed.mp3'));
    } catch (error) {
      console.error('playPlaceEffect failed:', error);
    }
  },

  playRotateEffect: (): void => {
    SoundManager.playEffect(require('../../assets/sounds/rotated.mp3'));
  },

  playWinEffect: (): void => {
    SoundManager.playEffect(require('../../assets/sounds/win.mp3'));
  },

  setBackgroundVolume: (volume: number): void => {
    backgroundVolume = Math.max(0, Math.min(1, volume));
    if (gainNode) {
      gainNode.gain.value = backgroundVolume;
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

  release: (): void => {
    SoundManager.stopBackgroundMusic();
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    audioBuffers.clear();
  },
};
