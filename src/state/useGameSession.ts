import { useCallback, useEffect } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.ts';
import { Analytics } from '../services/Analytics.ts';
import { useAppStore } from './useAppStore.ts';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'GameScreen'>;

export const useGameSession = (
  navigation: Navigation,
  currentLevelNumber: number,
  moveCount: number,
  getElapsedTime: () => number,
  isOver: boolean,
) => {
  const setCurrentScreen = useAppStore(state => state.setCurrentScreen);
  const setCurrentLevel = useAppStore(state => state.setCurrentLevel);

  useEffect(() => {
    setCurrentScreen('game');
  }, [setCurrentScreen]);

  useEffect(() => {
    setCurrentLevel(currentLevelNumber);
    Analytics.logLevelStart(currentLevelNumber);
  }, [currentLevelNumber, setCurrentLevel]);

  const handleHome = useCallback(() => {
    if (!isOver) {
      Analytics.logLevelAbandon(currentLevelNumber, moveCount, getElapsedTime());
    }
    navigation.navigate('HomeScreen');
  }, [isOver, currentLevelNumber, moveCount, getElapsedTime, navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const logRestart = useCallback(() => {
    Analytics.logLevelRestart(currentLevelNumber, moveCount, getElapsedTime());
  }, [currentLevelNumber, moveCount, getElapsedTime]);

  return {
    handleHome,
    handleSettings,
    logRestart,
  };
};
