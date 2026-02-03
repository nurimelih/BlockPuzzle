import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { SoundManager } from '../../services/SoundManager.ts';
import DeviceInfo from 'react-native-device-info';
import { useAppStore } from '../../state/useAppStore.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const setCurrentScreen = useAppStore(state => state.setCurrentScreen);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const menuHeight = useSharedValue(0);
  const menuOpacity = useSharedValue(0);

  useEffect(() => {
    setCurrentScreen('home');
  }, [setCurrentScreen]);

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
    navigation.navigate('GameScreen', { levelNumber: 0 });
  };

  const handleLevelSelect = () => {
    navigation.navigate('LevelSelect');
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
        <LabelButton style={styles.title}>Block Puzzle</LabelButton>
      </View>

      <View style={styles.menuContainer}>
        <LabelButton
          pressableProps={{ onPress: togglePlayMenu }}
          style={styles.menuItem}
        >
          Play
        </LabelButton>

        <Animated.View style={[styles.subMenu, animatedMenuStyle]}>
          <LabelButton
            pressableProps={{ onPress: handleNewGame }}
            style={[styles.subMenuItem]}
          >
            New Games
          </LabelButton>

          <LabelButton
            pressableProps={{ onPress: handleLevelSelect }}
            style={styles.subMenuItem}
          >
            Level Select
          </LabelButton>
        </Animated.View>

        <LabelButton
          pressableProps={{ onPress: handleSettings }}
          style={styles.menuItem}
        >
          Settings
        </LabelButton>
      </View>

      <View style={styles.versionContainer}>
        <LabelButton style={styles.versionText}>v {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})</LabelButton>
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
    fontSize: 64,
    color: colors.text.light,
    shadowColor: colors.brown.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  menuContainer: {
    alignItems: 'center',
  },
  menuItem: {
    fontSize: 36,
    color: colors.text.light,
    marginVertical: spacing.md,
    backgroundColor: colors.background.brownWithOpacity,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
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
