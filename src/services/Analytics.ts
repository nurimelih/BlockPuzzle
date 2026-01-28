import analytics from '@react-native-firebase/analytics';

export const Analytics = {
  logLevelStart: async (levelNumber: number) => {
    await analytics().logEvent('level_start', { level: levelNumber });
  },

  logLevelComplete: async (
    levelNumber: number,
    moves: number,
    time: number,
  ) => {
    await analytics().logEvent('level_complete', {
      level: levelNumber,
      moves,
      time,
    });
  },

  logScreenView: async (screenName: string) => {
    await analytics().logScreenView({ screen_name: screenName });
  },
};
