import type PostHog from 'posthog-react-native';

const FIREBASE_ENABLED = process.env.FIREBASE_ENABLED === 'true';

let posthog: PostHog | null = null;
let analytics: any = null;

if (FIREBASE_ENABLED) {
  try {
    analytics = require('@react-native-firebase/analytics').default;
  } catch (e) {
    console.log('Firebase Analytics not available');
  }
}

export const Analytics = {
  init: (posthogInstance: PostHog) => {
    posthog = posthogInstance;
  },

  logLevelStart: async (levelNumber: number) => {
    if (analytics) {
      await analytics().logEvent('level_start', { level: levelNumber });
    }
    posthog?.capture('level_start', { level: levelNumber });
  },

  logLevelComplete: async (
    levelNumber: number,
    moves: number,
    time: number,
  ) => {
    if (analytics) {
      await analytics().logEvent('level_complete', {
        level: levelNumber,
        moves,
        time,
      });
    }
    posthog?.capture('level_complete', {
      level: levelNumber,
      moves,
      time,
    });
  },

  logScreenView: async (screenName: string) => {
    if (analytics) {
      await analytics().logScreenView({ screen_name: screenName });
    }
    posthog?.screen(screenName);
  },

  logLevelAbandon: async (levelNumber: number, moves: number, time: number) => {
    if (analytics) {
      await analytics().logEvent('level_abandon', { level: levelNumber, moves, time });
    }
    posthog?.capture('level_abandon', { level: levelNumber, moves, time });
  },

  logLevelRestart: async (levelNumber: number, moves: number, time: number) => {
    if (analytics) {
      await analytics().logEvent('level_restart', { level: levelNumber, moves, time });
    }
    posthog?.capture('level_restart', { level: levelNumber, moves, time });
  },

  logHintUsed: async (levelNumber: number, adWatched: boolean) => {
    if (analytics) {
      await analytics().logEvent('hint_used', { level: levelNumber, ad_watched: adWatched });
    }
    posthog?.capture('hint_used', { level: levelNumber, ad_watched: adWatched });
  },

  logAdRewarded: async (levelNumber: number) => {
    if (analytics) {
      await analytics().logEvent('ad_rewarded', { level: levelNumber });
    }
    posthog?.capture('ad_rewarded', { level: levelNumber });
  },

  logAdInterstitial: async (levelNumber: number) => {
    if (analytics) {
      await analytics().logEvent('ad_interstitial', { level: levelNumber });
    }
    posthog?.capture('ad_interstitial', { level: levelNumber });
  },

  logLevelSelected: async (levelNumber: number, wasCompleted: boolean) => {
    if (analytics) {
      await analytics().logEvent('level_selected', { level: levelNumber, was_completed: wasCompleted });
    }
    posthog?.capture('level_selected', { level: levelNumber, was_completed: wasCompleted });
  },
};
