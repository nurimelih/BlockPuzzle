import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GameScreen } from './src/ui/screens/GameScreen.tsx';
import { ThemeProvider, createTheme } from '@rneui/themed';
import Background from './src/ui/components/Background.tsx';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <View style={styles.container}>
      <Background />
      <SafeAreaView style={styles.safeArea}>
        <GameScreen initialLevelNumber={1} />
      </SafeAreaView>
    </View>
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
