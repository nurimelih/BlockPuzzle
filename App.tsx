import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PostHogProvider } from 'posthog-react-native';
import { GameScreen } from './src/ui/screens/GameScreen.tsx';
import { HomeScreen } from './src/ui/screens/HomeScreen.tsx';
import { SettingsScreen } from './src/ui/screens/SettingsScreen.tsx';
import { LevelSelectScreen } from './src/ui/screens/LevelSelectScreen.tsx';
import { ThemeProvider, createTheme } from '@rneui/themed';
import Background from './src/ui/components/Background.tsx';
import BackgroundImage from './src/ui/components/BackgroundImage.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import type { RootStackParamList } from './src/types/navigation.ts';
import { SoundManager } from './src/services/SoundManager.ts';
import { fetchAllLevels } from './src/services/supabase.ts';
import { useAppStore } from './src/state/useAppStore.ts';
import { initAds } from './src/services/AdManager.ts';
import { GameStorage } from './src/services/GameStorage.ts';

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

function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="GameScreen"
        component={GameScreen}
        initialParams={{ levelNumber: 1 }}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
    </Stack.Navigator>
  );
}

function App() {
  const setRemoteLevels = useAppStore(state => state.setRemoteLevels);

  useEffect(() => {
    const init = async () => {
      await SoundManager.init();
      const settings = await GameStorage.getSoundSettings();

      SoundManager.setEffectsMuted(!settings.effectsEnabled);
      SoundManager.setBackgroundVolume(settings.musicVolume);
      SoundManager.setEffectsVolume(settings.effectsVolume);

      // Sync store with persisted setting
      useAppStore.setState({isMusicMuted: !settings.musicEnabled});

      // setMusicMuted handles resume → playGameMusic internally when unmuted
      SoundManager.setMusicMuted(!settings.musicEnabled);
      initAds();

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

  return (
    <PostHogProvider
      apiKey="phc_I1R5cQvmIOeeXfJgqQYoTKs2M8Uq0KLsH0Ow45lsi4g"
      options={{
        host: 'https://eu.i.posthog.com',
        enableSessionReplay: false,
      }}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
      }}
    >
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <View style={styles.container}>
            <BackgroundImage />
            <SafeAreaView style={styles.safeArea}>
              <NavigationContainer>
                <RootStack />
              </NavigationContainer>
            </SafeAreaView>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    </PostHogProvider>
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
