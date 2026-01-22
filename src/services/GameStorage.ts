import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  COMPLETED_LEVELS: 'completedLevels',
  CURRENT_LEVEL: 'currentLevel',
};

type CompletedLevel = {
  levelIndex: number;
  moves: number;
  time: number;
};

export const GameStorage = {
  getCompletedLevels: async (): Promise<CompletedLevel[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_LEVELS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCompletedLevel: async (levelIndex: number, moves: number, time: number): Promise<void> => {
    try {
      const completed = await GameStorage.getCompletedLevels();
      const existing = completed.find(l => l.levelIndex === levelIndex);

      if (existing) {
        // Update if better score
        if (moves < existing.moves) {
          existing.moves = moves;
          existing.time = time;
        }
      } else {
        completed.push({ levelIndex, moves, time });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_LEVELS, JSON.stringify(completed));
    } catch (error) {
      console.log('Failed to save completed level:', error);
    }
  },

  isLevelCompleted: async (levelIndex: number): Promise<boolean> => {
    const completed = await GameStorage.getCompletedLevels();
    return completed.some(l => l.levelIndex === levelIndex);
  },

  getLevelStats: async (levelIndex: number): Promise<CompletedLevel | null> => {
    const completed = await GameStorage.getCompletedLevels();
    return completed.find(l => l.levelIndex === levelIndex) || null;
  },

  getCurrentLevel: async (): Promise<number> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  },

  saveCurrentLevel: async (levelIndex: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, levelIndex.toString());
    } catch (error) {
      console.log('Failed to save current level:', error);
    }
  },

  getHighestUnlockedLevel: async (): Promise<number> => {
    const completed = await GameStorage.getCompletedLevels();
    if (completed.length === 0) return 0;
    const maxCompleted = Math.max(...completed.map(l => l.levelIndex));
    return maxCompleted + 1;
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.COMPLETED_LEVELS,
        STORAGE_KEYS.CURRENT_LEVEL,
      ]);
    } catch (error) {
      console.log('Failed to clear storage:', error);
    }
  },
};
