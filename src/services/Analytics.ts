const FIREBASE_ENABLED = process.env.FIREBASE_ENABLED !== 'false';

let analytics: any = null;

if (FIREBASE_ENABLED) {
  try {
    analytics = require('@react-native-firebase/analytics').default;
  } catch (e) {
    console.log('Firebase Analytics not available');
  }
}

export const Analytics = {
  logLevelStart: async (levelNumber: number) => {
    if (analytics) {
      await analytics().logEvent('level_start', { level: levelNumber });
    }
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
  },

  logScreenView: async (screenName: string) => {
    if (analytics) {
      await analytics().logScreenView({ screen_name: screenName });
    }
  },
};
