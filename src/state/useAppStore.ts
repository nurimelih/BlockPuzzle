import {create} from 'zustand';
import { AppSettings, LevelDefinition } from '../types/types';
import {LEVELS} from '../core/levels';

export type ScreenName = 'home' | 'game' | 'settings' | 'levelSelect';

// İlk 10 level her zaman local
const LOCAL_LEVELS = LEVELS.slice(0, 10);

interface AppState {
  currentScreen: ScreenName;
  currentLevel: number;
  remoteLevels: LevelDefinition[];
  levels: LevelDefinition[];
  appSettings: AppSettings;
  setCurrentScreen: (screen: ScreenName) => void;
  setCurrentLevel: (level: number) => void;
  setRemoteLevels: (levels: LevelDefinition[]) => void;
  setAppSettings: (settings: AppSettings) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'home',
  currentLevel: 0,
  remoteLevels: [],
  levels: LOCAL_LEVELS,
  appSettings: {
    rewardedAdsActive: false,
    interstitialAdsActive: false,
  },
  setCurrentScreen: (screen: ScreenName) => set({currentScreen: screen}),
  setCurrentLevel: (level: number) => set({currentLevel: level}),
  setRemoteLevels: (remoteLevels: LevelDefinition[]) =>
    set({
      remoteLevels,
      levels: [...LOCAL_LEVELS, ...remoteLevels],
    }),
  setAppSettings: (settings: AppSettings) => {
    set({appSettings: settings})
  }

}));
