import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/AppText.tsx';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const menuHeight = useSharedValue(0);
  const menuOpacity = useSharedValue(0);

  const togglePlayMenu = () => {
    if (playMenuOpen) {
      menuHeight.value = withTiming(0, { duration: 200 });
      menuOpacity.value = withTiming(0, { duration: 150 });
    } else {
      menuHeight.value = withTiming(80, { duration: 200 });
      menuOpacity.value = withTiming(1, { duration: 200 });
    }
    setPlayMenuOpen(!playMenuOpen);
  };

  const handleNewGame = () => {
    navigation.navigate('GameScreen', { levelNumber: 1 });
  };

  const handleLoadGame = () => {
    navigation.navigate('GameScreen', { levelNumber: 1 });
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const animatedMenuStyle = useAnimatedStyle(() => ({
    height: menuHeight.value,
    opacity: menuOpacity.value,
    overflow: 'hidden',
  }));

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Block Puzzle</Text>
      </View>

      <View style={styles.menuContainer}>
        <Pressable onPress={togglePlayMenu}>
          <Text style={styles.menuItem}>Play</Text>
        </Pressable>

        <Animated.View style={[styles.subMenu, animatedMenuStyle]}>
          <Pressable onPress={handleNewGame}>
            <Text style={styles.subMenuItem}>New Game</Text>
          </Pressable>
          <Pressable onPress={handleLoadGame}>
            <Text style={styles.subMenuItem}>Level Select</Text>
          </Pressable>
        </Animated.View>

        <Pressable onPress={handleSettings}>
          <Text style={styles.menuItem}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v 0.0.1</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxxxl * 2,
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
  },
  title: {
    fontSize: 48,
    color: colors.text.light,
  },
  menuContainer: {
    alignItems: 'center',
  },
  menuItem: {
    fontSize: 36,
    color: colors.text.light,
    marginVertical: spacing.md,
  },
  subMenu: {
    alignItems: 'center',
  },
  subMenuItem: {
    fontSize: typography.fontSize.xl,
    color: colors.text.light,
    marginVertical: spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.light,
  },
});
