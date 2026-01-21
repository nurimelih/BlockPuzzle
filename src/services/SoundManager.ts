import {
  AudioContext,
  AudioBuffer,
  AudioBufferSourceNode,
  GainNode,
} from 'react-native-audio-api';

const BACKGROUND_TRACKS = [
  require('../../assets/sounds/music.mp3'),
];

let audioContext: AudioContext | null = null;
let currentTrackIndex = 0;
let isBackgroundPlaying = false;
let backgroundVolume = 0.5;
let effectsVolume = 0.5;
let isMusicMuted = false;
let isEffectsMuted = false;
let currentSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
const audioBuffers = new Map<number, AudioBuffer>();

const loadSound = async (assetModule: number): Promise<AudioBuffer | null> => {
  if (!audioContext) return null;

  if (audioBuffers.has(assetModule)) {
    return audioBuffers.get(assetModule) || null;
  }

  try {
    const buffer = await audioContext.decodeAudioData(assetModule);
    audioBuffers.set(assetModule, buffer);
    console.log(`Loaded sound asset: ${assetModule}`);
    return buffer;
  } catch (error) {
    console.log('Failed to load sound:', assetModule, error);
    return null;
  }
};

const playCurrentTrack = async (): Promise<void> => {
  if (!audioContext || !gainNode || !isBackgroundPlaying || isMusicMuted) {
    return;
  }

  const currentAsset = BACKGROUND_TRACKS[currentTrackIndex];
  const buffer = audioBuffers.get(currentAsset);

  if (!buffer) {
    console.log('Buffer not found for track:', currentTrackIndex);
    return;
  }

  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // Ignore if already stopped
    }
  }

  currentSource = audioContext.createBufferSource();
  currentSource.buffer = buffer;
  currentSource.connect(gainNode);

  currentSource.onEnded = () => {
    if (isBackgroundPlaying) {
      currentTrackIndex = (currentTrackIndex + 1) % BACKGROUND_TRACKS.length;
      playCurrentTrack();
    }
  };

  currentSource.start(0, 7);
  console.log(`Playing track ${currentTrackIndex}`);
};

export const SoundManager = {
  init: async (): Promise<void> => {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = backgroundVolume;

    for (const track of BACKGROUND_TRACKS) {
      await loadSound(track);
    }
  },

  playBackgroundMusic: async (): Promise<void> => {
    if (!audioContext || isMusicMuted) return;
    isBackgroundPlaying = true;
    await playCurrentTrack();
  },

  stopBackgroundMusic: (): void => {
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
    if (isMusicMuted) return;
    isBackgroundPlaying = true;
    playCurrentTrack();
  },

  playEffect: async (assetModule: number): Promise<void> => {
    if (!audioContext || isEffectsMuted) return;

    const buffer = await loadSound(assetModule);
    if (!buffer) return;

    const effectGain = audioContext.createGain();
    effectGain.gain.value = effectsVolume ;
    effectGain.connect(audioContext.destination);

    const source = audioContext.createBufferSource();
    source.playbackRate.value = 1;
    source.buffer = buffer;
    source.connect(effectGain);
    source.start();
  },

  playPlaceEffect: (): void => {
    SoundManager.playEffect(require('../../assets/sounds/placed.mp3'));
  },

  playRotateEffect: (): void => {
    SoundManager.playEffect(require('../../assets/sounds/rotated.mp3'));
  },

  playWinEffect: (): void => {
    // SoundManager.playEffect(require('../../assets/sounds/win.mp3'));
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
