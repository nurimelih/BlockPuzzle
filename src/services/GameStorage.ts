import AsyncStorage from '@react-native-async-storage/async-storage';

export type SoundSettings = {
  musicEnabled: boolean;
  effectsEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
};

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  musicEnabled: true,
  effectsEnabled: true,
  musicVolume: 0.05,
  effectsVolume: 0.1,
};

const STORAGE_KEYS = {
  COMPLETED_LEVELS: 'completedLevels',
  CURRENT_LEVEL: 'currentLevel',
  SOUND_SETTINGS: 'soundSettings',
} as const;

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

  saveCompletedLevel: async (
    levelIndex: number,
    moves: number,
    time: number,
  ): Promise<void> => {
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

      await AsyncStorage.setItem(
        STORAGE_KEYS.COMPLETED_LEVELS,
        JSON.stringify(completed),
      );
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
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_LEVEL,
        levelIndex.toString(),
      );
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

  saveSoundSettings: async (settings: SoundSettings): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SOUND_SETTINGS,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.log('Failed to save sound settings:', error);
    }
  },

  getSoundSettings: async (): Promise<SoundSettings> => {
    try {
      const result = await AsyncStorage.getItem(STORAGE_KEYS.SOUND_SETTINGS);
      return result ? JSON.parse(result) : DEFAULT_SOUND_SETTINGS;
    } catch (e) {
      console.log('Error when getting sound setting', e);
      return DEFAULT_SOUND_SETTINGS;
    }
  },

  getAllSettings: async () => {
    return {
      completedLevels: await GameStorage.getCompletedLevels(),
      currentLevel: await GameStorage.getCurrentLevel(),
      highestUnlockedLevel: await GameStorage.getHighestUnlockedLevel(),
      soundSettings: await GameStorage.getSoundSettings(),
    };
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
