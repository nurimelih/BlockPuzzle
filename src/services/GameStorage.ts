import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AdPacing,
  freezesAfterCompletion,
  LIVES_MAX,
  LivesState,
} from '../core/progression.ts';
import { PieceDirection } from '../types/types.ts';

export type SoundSettings = {
  musicEnabled: boolean;
  effectsEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  hapticsEnabled: boolean;
};

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  musicEnabled: true,
  effectsEnabled: true,
  musicVolume: 0.05,
  effectsVolume: 0.1,
  hapticsEnabled: true,
};

const STORAGE_KEYS = {
  COMPLETED_LEVELS: 'completedLevels',
  CURRENT_LEVEL: 'currentLevel',
  SOUND_SETTINGS: 'soundSettings',
  FREE_HINT_COUNT: 'freeHintCount',
  TUTORIAL_SEEN: 'tutorialSeen',
  LANGUAGE: 'language',
  DAILY_LAST_DATE: 'dailyLastDate',
  DAILY_STREAK: 'dailyStreak',
  DAILY_COMPLETED: 'dailyCompleted',
  PLAYER_ID: 'playerId',
  PLAYER_NICKNAME: 'playerNickname',
  LIVES: 'lives',
  WIN_STREAK: 'winStreak',
  AD_PACING: 'adPacing',
  LEVEL_PROGRESS: 'levelProgress',
  STREAK_FREEZES: 'streakFreezes',
} as const;

// Keep in-progress snapshots for the most recent few levels only
const MAX_LEVEL_PROGRESS_ENTRIES = 5;

export type LevelProgressSnapshot = {
  // Detects remote level edits: a snapshot for a different board is ignored
  signature: string;
  pieces: {
    id: string;
    rotation: PieceDirection;
    placed?: boolean;
    boardX?: number;
    boardY?: number;
  }[];
  moveCount: number;
  hintCount: number;
  elapsed: number;
  savedAt: number;
};

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? { ...fallback, ...JSON.parse(data) } : fallback;
  } catch {
    return fallback;
  }
};

// Serializes read-modify-write updates of the level progress map
let levelProgressQueue: Promise<void> = Promise.resolve();
const enqueueLevelProgress = (task: () => Promise<void>): Promise<void> => {
  levelProgressQueue = levelProgressQueue.then(task, task);
  return levelProgressQueue;
};

const writeJson = async (key: string, value: unknown): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(`Failed to save ${key}:`, error);
  }
};

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
      if (!result) return DEFAULT_SOUND_SETTINGS;
      const parsed = JSON.parse(result);
      return { ...DEFAULT_SOUND_SETTINGS, ...parsed };
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

  getTutorialSeen: async (): Promise<boolean> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TUTORIAL_SEEN);
      return data === 'true';
    } catch {
      return false;
    }
  },

  setTutorialSeen: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TUTORIAL_SEEN, 'true');
    } catch (error) {
      console.log('Failed to save tutorial seen:', error);
    }
  },

  getLanguage: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    } catch {
      return null;
    }
  },

  saveLanguage: async (language: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.log('Failed to save language:', error);
    }
  },

  markDailyCompleted: async (): Promise<void> => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LAST_DATE);
    if (lastDate === dateStr) return; // zaten tamamlandı

    const savedStreak = await GameStorage.getDailyStreak();
    const newStreak = savedStreak + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LAST_DATE, dateStr);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STREAK, newStreak.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_COMPLETED, 'true');

    const freezes = await GameStorage.getStreakFreezes();
    await GameStorage.setStreakFreezes(freezesAfterCompletion(newStreak, freezes));
  },

  getStreakFreezes: async (): Promise<number> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_FREEZES);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  },

  setStreakFreezes: async (count: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_FREEZES, count.toString());
    } catch {}
  },

  getDailyLastDate: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LAST_DATE);
    } catch {
      return null;
    }
  },

  setDailyLastDate: async (date: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LAST_DATE, date);
    } catch {}
  },

  getDailyStreak: async (): Promise<number> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STREAK);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  },

  setDailyStreak: async (count: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STREAK, count.toString());
    } catch {}
  },

  getDailyCompleted: async (): Promise<boolean> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_COMPLETED);
      return data === 'true';
    } catch {
      return false;
    }
  },

  setDailyCompleted: async (completed: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_COMPLETED, completed ? 'true' : 'false');
    } catch {}
  },

  getPlayerId: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    } catch {
      return null;
    }
  },

  savePlayerId: async (id: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_ID, id);
    } catch {}
  },

  getPlayerNickname: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_NICKNAME);
    } catch {
      return null;
    }
  },

  savePlayerNickname: async (nickname: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_NICKNAME, nickname);
    } catch {}
  },

  getLivesState: (): Promise<LivesState> =>
    readJson<LivesState>(STORAGE_KEYS.LIVES, {
      lives: LIVES_MAX,
      regenStartedAt: Date.now(),
    }),

  saveLivesState: (state: LivesState): Promise<void> =>
    writeJson(STORAGE_KEYS.LIVES, state),

  getWinStreak: async (): Promise<number> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WIN_STREAK);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  },

  setWinStreak: async (count: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WIN_STREAK, count.toString());
    } catch {}
  },

  getAdPacing: (): Promise<AdPacing> =>
    readJson<AdPacing>(STORAGE_KEYS.AD_PACING, { levelsSinceAd: 0, lastAdAt: 0 }),

  saveAdPacing: (pacing: AdPacing): Promise<void> =>
    writeJson(STORAGE_KEYS.AD_PACING, pacing),

  getLevelProgress: async (key: string): Promise<LevelProgressSnapshot | null> => {
    const all = await readJson<Record<string, LevelProgressSnapshot>>(
      STORAGE_KEYS.LEVEL_PROGRESS,
      {},
    );
    return all[key] ?? null;
  },

  saveLevelProgress: (
    key: string,
    snapshot: LevelProgressSnapshot,
  ): Promise<void> => enqueueLevelProgress(async () => {
    const all = await readJson<Record<string, LevelProgressSnapshot>>(
      STORAGE_KEYS.LEVEL_PROGRESS,
      {},
    );
    all[key] = snapshot;
    const kept = Object.entries(all)
      .sort(([, a], [, b]) => b.savedAt - a.savedAt)
      .slice(0, MAX_LEVEL_PROGRESS_ENTRIES);
    await writeJson(STORAGE_KEYS.LEVEL_PROGRESS, Object.fromEntries(kept));
  }),

  clearLevelProgress: (key: string): Promise<void> => enqueueLevelProgress(async () => {
    const all = await readJson<Record<string, LevelProgressSnapshot>>(
      STORAGE_KEYS.LEVEL_PROGRESS,
      {},
    );
    if (!(key in all)) return;
    delete all[key];
    await writeJson(STORAGE_KEYS.LEVEL_PROGRESS, all);
  }),

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.COMPLETED_LEVELS,
        STORAGE_KEYS.CURRENT_LEVEL,
        STORAGE_KEYS.FREE_HINT_COUNT,
        STORAGE_KEYS.LEVEL_PROGRESS,
        STORAGE_KEYS.WIN_STREAK,
      ]);
    } catch (error) {
      console.log('Failed to clear storage:', error);
    }
  },
};
