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
  FREE_HINT_COUNT: 'freeHintCount',
} as const;

const LEVELS_PER_FREE_HINT = 5;

export type CompletedLevel = {
  levelIndex: number;
  moves: number;
  time: number;
  stars?: number;
  score?: number;
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
    stars?: number,
    score?: number,
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
        // Always update stars/score if better
        if (stars !== undefined && (existing.stars === undefined || stars > existing.stars)) {
          existing.stars = stars;
        }
        if (score !== undefined && (existing.score === undefined || score > existing.score)) {
          existing.score = score;
        }
      } else {
        completed.push({ levelIndex, moves, time, stars, score });
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

  getFreeHintCount: async (): Promise<number> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FREE_HINT_COUNT);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  },

  saveFreeHintCount: async (count: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FREE_HINT_COUNT, count.toString());
    } catch (error) {
      console.log('Failed to save free hint count:', error);
    }
  },

  /**
   * Check if a free hint should be awarded after completing a level.
   * Awards 1 free hint every LEVELS_PER_FREE_HINT completed levels.
   * Returns the new free hint count.
   */
  checkAndAwardFreeHint: async (): Promise<number> => {
    const completed = await GameStorage.getCompletedLevels();
    const totalCompleted = completed.length;

    // Calculate earned hints based on total completions
    const earnedHints = Math.floor(totalCompleted / LEVELS_PER_FREE_HINT);

    // Get current stored count to figure out used hints
    const currentCount = await GameStorage.getFreeHintCount();

    // Only award if new milestone reached (earned > what was previously calculated)
    // We track: stored = earned - used. When new earned > old earned, add difference.
    const previousEarned = Math.floor((totalCompleted - 1) / LEVELS_PER_FREE_HINT);
    if (earnedHints > previousEarned) {
      const newCount = currentCount + 1;
      await GameStorage.saveFreeHintCount(newCount);
      return newCount;
    }

    return currentCount;
  },

  useFreeHint: async (): Promise<boolean> => {
    const count = await GameStorage.getFreeHintCount();
    if (count <= 0) return false;
    await GameStorage.saveFreeHintCount(count - 1);
    return true;
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.COMPLETED_LEVELS,
        STORAGE_KEYS.CURRENT_LEVEL,
        STORAGE_KEYS.FREE_HINT_COUNT,
      ]);
    } catch (error) {
      console.log('Failed to clear storage:', error);
    }
  },
};
