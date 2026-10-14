// Progression rules: lives, win streak, timed levels, ad pacing, daily streak freeze.
// Pure functions only — persistence lives in GameStorage.
import { LevelDefinition } from '../types/types.ts';

// ---------- Lives ----------

export const LIVES_MAX = 3;
export const LIFE_REGEN_MS = 30 * 60 * 1000;

export type LivesState = {
  lives: number;
  // Timestamp the next regen countdown started from. Ignored while lives are full.
  regenStartedAt: number;
};

export const regenLives = (state: LivesState, now: number): LivesState => {
  if (state.lives >= LIVES_MAX) {
    return { lives: LIVES_MAX, regenStartedAt: now };
  }
  const gained = Math.floor(
    Math.max(0, now - state.regenStartedAt) / LIFE_REGEN_MS,
  );
  if (gained === 0) return state;

  const lives = Math.min(LIVES_MAX, state.lives + gained);
  return {
    lives,
    regenStartedAt:
      lives >= LIVES_MAX ? now : state.regenStartedAt + gained * LIFE_REGEN_MS,
  };
};

export const consumeLife = (
  state: LivesState,
  now: number,
): LivesState | null => {
  const current = regenLives(state, now);
  if (current.lives <= 0) return null;
  return {
    lives: current.lives - 1,
    // Losing the first life from full starts the regen clock now
    regenStartedAt: current.lives >= LIVES_MAX ? now : current.regenStartedAt,
  };
};

export const msUntilNextLife = (state: LivesState, now: number): number => {
  if (state.lives >= LIVES_MAX) return 0;
  return Math.max(0, state.regenStartedAt + LIFE_REGEN_MS - now);
};

// ---------- Win streak ----------

const STREAK_TIERS: { minStreak: number; multiplier: number }[] = [
  { minStreak: 10, multiplier: 3 },
  { minStreak: 6, multiplier: 2 },
  { minStreak: 3, multiplier: 1.5 },
];

export const getStreakMultiplier = (streak: number): number =>
  STREAK_TIERS.find(t => streak >= t.minStreak)?.multiplier ?? 1;

// ---------- Timed (hard) levels ----------

export type TimedLevelConfig = {
  // Every Nth level is timed (1-based: 5 → levels 15, 20, 25...)
  interval: number;
  // Levels before this index are never timed (onboarding)
  firstTimedIndex: number;
  // Time limit = expected solve time * factor
  timeFactor: number;
};

export const DEFAULT_TIMED_LEVEL_CONFIG: TimedLevelConfig = {
  interval: 5,
  firstTimedIndex: 10,
  timeFactor: 1.5,
};

// Mirrors scoring.ts: the time at which the time bonus starts dropping
export const getExpectedSolveTime = (level: LevelDefinition): number => {
  const boardSize = level.board.length * level.board[0].length;
  return level.pieces.length * 10 + boardSize * 0.5;
};

/**
 * Returns the time limit in seconds, or undefined for an untimed level.
 * An explicit level.timeLimit (from Supabase) always wins; 0 disables the timer.
 */
export const getTimeLimit = (
  level: LevelDefinition,
  levelIndex: number,
  config: TimedLevelConfig = DEFAULT_TIMED_LEVEL_CONFIG,
): number | undefined => {
  if (level.timeLimit !== undefined && level.timeLimit !== null) {
    return level.timeLimit > 0 ? level.timeLimit : undefined;
  }
  if (config.interval <= 0 || levelIndex < config.firstTimedIndex)
    return undefined;
  if ((levelIndex + 1) % config.interval !== 0) return undefined;
  return Math.ceil((getExpectedSolveTime(level) * config.timeFactor) / 5) * 5;
};

// ---------- Interstitial pacing ----------

export type AdPacing = {
  levelsSinceAd: number;
  lastAdAt: number;
};

export type AdPacingConfig = {
  levelsBetweenAds: number;
  minSecondsBetweenAds: number;
  // No interstitials until the player has completed this many levels in total
  minCompletedLevels: number;
};

export const DEFAULT_AD_PACING_CONFIG: AdPacingConfig = {
  levelsBetweenAds: 4,
  minSecondsBetweenAds: 180,
  minCompletedLevels: 5,
};

export const shouldShowInterstitial = (
  pacing: AdPacing,
  now: number,
  totalCompletedLevels: number,
  config: AdPacingConfig = DEFAULT_AD_PACING_CONFIG,
): boolean =>
  totalCompletedLevels >= config.minCompletedLevels &&
  pacing.levelsSinceAd >= config.levelsBetweenAds &&
  now - pacing.lastAdAt >= config.minSecondsBetweenAds * 1000;

// ---------- Daily streak + freeze ----------

export const MAX_STREAK_FREEZES = 2;
export const DAYS_PER_FREEZE_REWARD = 7;

export type DailyStreakState = {
  lastDate: string | null; // YYYY-MM-DD of the last completed daily
  streak: number;
  freezes: number;
};

const toUtcDay = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};

export const daysBetween = (from: string, to: string) =>
  toUtcDay(to) - toUtcDay(from);

/**
 * Called when the app looks at the daily streak on a new day.
 * A single missed day is bridged by a freeze; longer gaps reset the streak.
 */
export const resolveDailyStreak = (
  state: DailyStreakState,
  today: string,
): DailyStreakState & { usedFreeze: boolean } => {
  if (!state.lastDate) return { ...state, streak: 0, usedFreeze: false };

  const gap = daysBetween(state.lastDate, today);
  if (gap <= 1) return { ...state, usedFreeze: false };

  const missedDays = gap - 1;
  if (state.streak > 0 && missedDays <= state.freezes) {
    // Move lastDate to yesterday so today's completion continues the streak
    const lastDate = new Date((toUtcDay(today) - 1) * 86400000)
      .toISOString()
      .slice(0, 10);
    return {
      lastDate,
      streak: state.streak,
      freezes: state.freezes - missedDays,
      usedFreeze: true,
    };
  }
  return { ...state, streak: 0, usedFreeze: false };
};

export const freezesAfterCompletion = (newStreak: number, freezes: number) =>
  newStreak > 0 && newStreak % DAYS_PER_FREEZE_REWARD === 0
    ? Math.min(MAX_STREAK_FREEZES, freezes + 1)
    : freezes;
