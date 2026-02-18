import './src/i18n/i18n';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { GameScreen } from './src/ui/screens/GameScreen.tsx';
import { HomeScreen } from './src/ui/screens/HomeScreen.tsx';
import { SettingsScreen } from './src/ui/screens/SettingsScreen.tsx';
import { LevelSelectScreen } from './src/ui/screens/LevelSelectScreen.tsx';
import { NicknameScreen } from './src/ui/screens/NicknameScreen.tsx';
import { LeaderboardScreen } from './src/ui/screens/LeaderboardScreen.tsx';
import { ThemeProvider, createTheme } from '@rneui/themed';
import BackgroundImage from './src/ui/components/BackgroundImage.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './src/types/navigation.ts';
import { SoundManager } from './src/services/SoundManager.ts';
import { fetchAllLevels } from './src/services/supabase.ts';
import { useAppStore } from './src/state/useAppStore.ts';
import { initAds } from './src/services/AdManager.ts';
import { GameStorage } from './src/services/GameStorage.ts';
import { HapticsManager } from './src/services/HapticsManager.ts';
import { Analytics } from './src/services/Analytics.ts';

const theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
    background: 'transparent',
  },
  darkColors: {
    primary: '#000',
    background: 'transparent',
  },
  mode: 'light',
});

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack({ initialRoute }: { initialRoute: 'HomeScreen' | 'Nickname' }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Nickname" component={NicknameScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="GameScreen"
        component={GameScreen}
        initialParams={{ levelNumber: 1 }}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
}

function PostHogInit() {
  const posthog = usePostHog();

  useEffect(() => {
    Analytics.init(posthog);
  }, [posthog]);

  return null;
}

function App() {
  const setRemoteLevels = useAppStore(state => state.setRemoteLevels);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const routeNameRef = useRef<string | undefined>(undefined);
  const [initialRoute, setInitialRoute] = useState<'HomeScreen' | 'Nickname' | null>(null);

  useEffect(() => {
    const init = async () => {
      await SoundManager.init();
      const settings = await GameStorage.getSoundSettings();
      const { appSettings } = useAppStore.getState();

      // Nickname kontrolü
      const nickname = await GameStorage.getPlayerNickname();
      setInitialRoute(nickname ? 'HomeScreen' : 'Nickname');

      SoundManager.setEffectsMuted(!settings.effectsEnabled);
      SoundManager.setBackgroundVolume(settings.musicVolume);
      SoundManager.setEffectsVolume(settings.effectsVolume);
      HapticsManager.setEnabled(settings.hapticsEnabled);

      // Sync store with persisted setting
      useAppStore.setState({ isMusicMuted: !settings.musicEnabled });
      const shouldInitAds =
        appSettings.rewardedAdsActive || appSettings.interstitialAdsActive;

      // setMusicMuted handles resume → playGameMusic internally when unmuted
      SoundManager.setMusicMuted(!settings.musicEnabled);
      shouldInitAds && initAds();

      const levels = await fetchAllLevels();
      if (levels.length > 0) {
        setRemoteLevels(levels);
      }
    };

    init();

    return () => {
      SoundManager.release();
    };
  }, [setRemoteLevels]);

  if (!initialRoute) return null;

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <BackgroundImage />
          <SafeAreaView style={styles.safeArea}>
            <NavigationContainer
              ref={navigationRef}
              onReady={() => {
                routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
              }}
              onStateChange={() => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
                if (currentRouteName && previousRouteName !== currentRouteName) {
                  Analytics.logScreenView(currentRouteName);
                }
                routeNameRef.current = currentRouteName;
              }}
            >
              <PostHogProvider
                apiKey="phc_I1R5cQvmIOeeXfJgqQYoTKs2M8Uq0KLsH0Ow45lsi4g"
                options={{
                  host: 'https://eu.i.posthog.com',
                  enableSessionReplay: false,
                }}
                autocapture={{
                  // PostHog bug: captureScreens broken with React Navigation v7
                  // https://github.com/PostHog/posthog-js/issues/2349
                  captureScreens: false,
                  captureTouches: true,
                }}
              >
                <PostHogInit />
                <RootStack initialRoute={initialRoute} />
              </PostHogProvider>
            </NavigationContainer>
          </SafeAreaView>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default App;
