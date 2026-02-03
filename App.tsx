import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
  const init_sound = async () => {
    await SoundManager.init();
    SoundManager.playGameMusic();
  };

  useEffect(() => {
    init_sound();

    return () => {
      SoundManager.release();
    };
  }, []);

  return (
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
