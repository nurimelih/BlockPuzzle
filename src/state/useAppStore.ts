import {create} from 'zustand';

export type ScreenName = 'home' | 'game' | 'settings' | 'levelSelect';

interface AppState {
  currentScreen: ScreenName;
  currentLevel: number;
  setCurrentScreen: (screen: ScreenName) => void;
  setCurrentLevel: (level: number) => void;
}

export const useAppStore = create<AppState>(set => ({
  currentScreen: 'home',
  currentLevel: 0,
  setCurrentScreen: (screen: ScreenName) => set({currentScreen: screen}),
  setCurrentLevel: (level: number) => set({currentLevel: level}),
}));
