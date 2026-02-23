import type PostHog from 'posthog-react-native';

let posthog: PostHog | null = null;

export const Analytics = {
  init: (posthogInstance: PostHog) => {
    posthog = posthogInstance;
  },

  logLevelStart: async (levelNumber: number) => {
    posthog?.capture('level_start', { level: levelNumber });
  },

  logLevelComplete: async (
    levelNumber: number,
    moves: number,
    time: number,
    score?: number,
    stars?: number,
    hintCount?: number,
  ) => {
    posthog?.capture('level_complete', {
      level: levelNumber,
      moves,
      time,
      ...(score !== undefined && { score }),
      ...(stars !== undefined && { stars }),
      ...(hintCount !== undefined && { hint_count: hintCount }),
    });
  },

  logScreenView: async (screenName: string) => {
    posthog?.screen(screenName);
  },

  logLevelAbandon: async (levelNumber: number, moves: number, time: number) => {
    posthog?.capture('level_abandon', { level: levelNumber, moves, time });
  },

  logLevelRestart: async (levelNumber: number, moves: number, time: number) => {
    posthog?.capture('level_restart', { level: levelNumber, moves, time });
  },

  logHintUsed: async (levelNumber: number, adWatched: boolean) => {
    posthog?.capture('hint_used', { level: levelNumber, ad_watched: adWatched });
  },

  logAdRewarded: async (levelNumber: number) => {
    posthog?.capture('ad_rewarded', { level: levelNumber });
  },

  logAdInterstitial: async (levelNumber: number) => {
    posthog?.capture('ad_interstitial', { level: levelNumber });
  },

  logLevelSelected: async (levelNumber: number, wasCompleted: boolean) => {
    posthog?.capture('level_selected', { level: levelNumber, was_completed: wasCompleted });
  },

  logHintSolveTime: async (levelNumber: number, solveMs: number, cached: boolean) => {
    posthog?.capture('hint_solve_ms', { level: levelNumber, hint_solve_ms: solveMs, cached });
  },
};
