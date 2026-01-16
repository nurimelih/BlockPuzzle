import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GameScreen } from './src/ui/screens/GameScreen.tsx';
import { ThemeProvider, createTheme } from '@rneui/themed';

const theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
    background: "red",
  },
  darkColors: {
    primary: '#000',
    background: 'red',
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
      <SafeAreaView style={[styles.container]}>
        <GameScreen initialLevelNumber={1} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
