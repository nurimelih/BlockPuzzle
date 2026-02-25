import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Block Puzzle',
  slug: 'block-puzzle',
  version: '1.0.0',
  orientation: 'portrait',
  ios: {
    bundleIdentifier: 'com.nurimelih.blockpuzzle',
    buildNumber: '1',
  },
  android: {
    package: 'com.nurimelih.blockpuzzle',
    versionCode: 1,
  },
  extra: {
    eas: {
      projectId: '10f43049-6f71-4498-a61b-f384fb000dbe',
    },
  },
  updates: {
    url: 'https://u.expo.dev/10f43049-6f71-4498-a61b-f384fb000dbe',
  },
  runtimeVersion: '1.0.0',
  plugins: [
    'expo-localization',
    [
      'expo-updates',
      {
        username: 'nurimelih',
      },
    ],
  ],
});
