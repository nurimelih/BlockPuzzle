import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from '../components/base/LabelButton.tsx';
import DeviceInfo from 'react-native-device-info';
import { useAppStore } from '../../state/useAppStore.ts';
import { fetchAdSettings } from '../../services/supabase.ts';
import { CompletedLevel, GameStorage } from '../../services/GameStorage.ts';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useDailyChallenge } from '../../state/useDailyChallenge.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const setCurrentScreen = useAppStore(state => state.setCurrentScreen);
  const setAppSettings = useAppStore(state => state.setAppSettings);
  const levels = useAppStore(state => state.levels);
  const [highestLevel, setHighestLevel] = useState(0);
  const [lastLevelStats, setLastLevelStats] = useState<CompletedLevel | null>(null);
  const { level: dailyLevel, streak, completedToday, reload: reloadDaily } = useDailyChallenge();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('home');
      fetchAdSettings().then(response => {
        setAppSettings(response);
      });

      const loadProgress = async () => {
        const level = await GameStorage.getHighestUnlockedLevel();
        setHighestLevel(level);
        if (level > 0) {
          const stats = await GameStorage.getLevelStats(level - 1);
          setLastLevelStats(stats);
        }
      };
      loadProgress();
      reloadDaily();

      if (__DEV__) {
        GameStorage.getAllSettings()
          .then(settings => console.log('All Settings', JSON.stringify(settings, null, 2)))
          .catch(e => console.log('error getting settings', e));
      }
    }, [setCurrentScreen, setAppSettings, reloadDaily]),
  );

  const allLevelsCompleted = highestLevel >= levels.length;

  const handleContinue = () => {
    navigation.navigate('GameScreen', { levelNumber: highestLevel });
  };

  const handlePlay = () => {
    navigation.navigate('GameScreen', { levelNumber: 0 });
  };

  const handleNewGame = () => {
    navigation.navigate('LevelSelect');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleLeaderboard = () => {
    navigation.navigate('Leaderboard');
  };

  const handleDailyChallenge = () => {
    if (!dailyLevel) return;
    navigation.navigate('GameScreen', { levelNumber: 0, dailyChallenge: dailyLevel, mode: 'daily' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <LabelButton style={styles.title}>{t('home.title')}</LabelButton>
      </View>

      <View style={styles.menuContainer}>
        <LabelButton
          pressableProps={{ onPress: handleDailyChallenge }}
          style={[styles.menuItem, styles.dailyButton, completedToday && styles.dailyButtonDone]}
        >
          <View style={styles.dailyContent} pointerEvents="none">
            <LabelButton style={styles.dailyText}>
              {completedToday ? t('home.dailyDone') : t('home.dailyChallenge')}
            </LabelButton>
            {streak > 0 && (
              <View style={styles.streakRow}>
                <Icon name="flame" size={14} color="#FF6B35" />
                <LabelButton style={styles.streakText}>
                  {t('home.streak', { count: streak })}
                </LabelButton>
              </View>
            )}
          </View>
        </LabelButton>

        {highestLevel > 0 ? (
          <>
            {!allLevelsCompleted && (
              <LabelButton
                pressableProps={{ onPress: handleContinue }}
                style={styles.menuItem}
              >
                <View style={styles.continueContent} pointerEvents="none">
                  <LabelButton style={styles.continueText}>{t('common.continue')}</LabelButton>
                  <View style={styles.continueDetails}>
                    <LabelButton style={styles.levelLabel}>
                      {t('home.level', { number: highestLevel + 1 })}
                    </LabelButton>
                    {lastLevelStats?.stars !== undefined && (
                      <View style={styles.starsRow}>
                        {[1, 2, 3].map(i => (
                          <Icon
                            key={i}
                            name={
                              lastLevelStats.stars! >= i
                                ? 'star'
                                : lastLevelStats.stars! >= i - 0.5
                                  ? 'star-half'
                                  : 'star-outline'
                            }
                            size={14}
                            color={
                              lastLevelStats.stars! >= i - 0.5
                                ? '#FFD700'
                                : colors.brown.light
                            }
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </LabelButton>
            )}

            <LabelButton
              pressableProps={{ onPress: handleNewGame }}
              style={styles.menuItem}
            >
              {t('common.newGame')}
            </LabelButton>
          </>
        ) : (
          <LabelButton
            pressableProps={{ onPress: handlePlay }}
            style={styles.menuItem}
          >
            {t('common.play')}
          </LabelButton>
        )}

        <LabelButton
          pressableProps={{ onPress: handleLeaderboard }}
          style={styles.menuItem}
        >
          {t('leaderboard.title')}
        </LabelButton>

        <LabelButton
          pressableProps={{ onPress: handleSettings }}
          style={styles.menuItem}
        >
          {t('common.settings')}
        </LabelButton>
      </View>

      <View style={styles.versionContainer}>
        <LabelButton
          style={styles.versionText}
          pressableProps={__DEV__ ? {
            onPress: () => {
              GameStorage.savePlayerNickname('').then(() =>
                GameStorage.savePlayerId(''),
              );
            },
          } : undefined}
        >
          v {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
        </LabelButton>
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
  dailyButton: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  dailyButtonDone: {
    borderColor: '#4CAF50',
  },
  dailyContent: {
    alignItems: 'center',
  },
  dailyText: {
    fontSize: 36,
    color: colors.text.light,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.fontSize.md,
    color: '#FF6B35',
  },
  continueContent: {
    alignItems: 'center',
  },
  continueText: {
    fontSize: 36,
    color: colors.text.light,
  },
  continueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.light,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.light,
  },
});
