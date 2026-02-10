const firebaseEnabled = process.env.FIREBASE_ENABLED === 'true';

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
  dependencies: firebaseEnabled
    ? {}
    : {
        '@react-native-firebase/app': {
          platforms: {
            ios: null,
            android: null,
          },
        },
        '@react-native-firebase/analytics': {
          platforms: {
            ios: null,
            android: null,
          },
        },
      },
};
