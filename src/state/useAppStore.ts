import {create} from 'zustand';
import { AppSettings, LevelDefinition, Postcard } from '../types/types';
import {LEVELS} from '../core/levels';
import {GENERATED_LEVELS} from '../core/levels_auto_generated';
import {FALLBACK_POSTCARDS} from './postcards';

export type ScreenName = 'home' | 'game' | 'settings' | 'levelSelect';

// El ile yapılan 10 level + solver ile doğrulanmış 100 üretilmiş level
const LOCAL_LEVELS = [...LEVELS.slice(0, 10), ...GENERATED_LEVELS];

interface AppState {
  currentScreen: ScreenName;
  currentLevel: number;
  remoteLevels: LevelDefinition[];
  levels: LevelDefinition[];
  postcards: Postcard[];
  appSettings: AppSettings;
  isMusicMuted: boolean;
  // Daily challenge yolculuğun parçası değil; arka planda kartpostal gösterilmez
  isDailyGame: boolean;
  setCurrentScreen: (screen: ScreenName) => void;
  setCurrentLevel: (level: number) => void;
  setRemoteLevels: (levels: LevelDefinition[]) => void;
  setRemotePostcards: (postcards: Postcard[]) => void;
  setAppSettings: (settings: AppSettings) => void;
  setMusicMuted: (muted: boolean) => void;
  setDailyGame: (isDaily: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'home',
  currentLevel: 0,
  remoteLevels: [],
  levels: LOCAL_LEVELS,
  postcards: FALLBACK_POSTCARDS,
  appSettings: {
    rewardedAdsActive: false,
    interstitialAdsActive: false,
    forceToShowHints: false,
  },
  isMusicMuted: true,
  isDailyGame: false,
  setCurrentScreen: (screen: ScreenName) => set({currentScreen: screen}),
  setCurrentLevel: (level: number) => set({currentLevel: level}),
  setRemoteLevels: (remoteLevels: LevelDefinition[]) =>
    set({
      remoteLevels,
      levels: [...LOCAL_LEVELS, ...remoteLevels],
    }),
  setRemotePostcards: (remotePostcards: Postcard[]) =>
    set({postcards: [...FALLBACK_POSTCARDS, ...remotePostcards]}),
  setAppSettings: (settings: AppSettings) => {
    set(state => ({appSettings: {...state.appSettings, ...settings}}))
  },
  setMusicMuted: (muted: boolean) => set({isMusicMuted: muted}),
  setDailyGame: (isDaily: boolean) => set({isDailyGame: isDaily}),
}));
