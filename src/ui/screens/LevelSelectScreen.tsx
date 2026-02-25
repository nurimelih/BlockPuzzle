import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography, shadows } from '../../theme';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { CompletedLevel, GameStorage } from '../../services/GameStorage.ts';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../state/useAppStore.ts';
import { Analytics } from '../../services/Analytics.ts';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

export const LevelSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const levels = useAppStore(state => state.levels);
  const [completedLevels, setCompletedLevels] = useState<CompletedLevel[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadCompletedLevels = async () => {
        const completed = await GameStorage.getCompletedLevels();
        setCompletedLevels(completed);
      };
      loadCompletedLevels();
    }, [])
  );

  const handleLevelSelect = (levelIndex: number) => {
    Analytics.logLevelSelected(levelIndex, isCompleted(levelIndex));
    navigation.navigate('GameScreen', { levelNumber: levelIndex });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClearProgress = () => {
    Alert.alert(
      t('levels.clearProgress'),
      t('levels.clearProgressConfirm'),
      [
        { text: t('levels.clearProgressCancel'), style: 'cancel' },
        {
          text: t('levels.clearProgressConfirmButton'),
          style: 'destructive',
          onPress: async () => {
            await GameStorage.clearAll();
            setCompletedLevels([]);
          },
        },
      ],
    );
  };

  const isCompleted = (index: number) => completedLevels.some(l => l.levelIndex === index);
  const getLevelStats = (index: number) => completedLevels.find(l => l.levelIndex === index);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color={colors.text.light} />
        </Pressable>
        <LabelButton style={styles.title}>{t('levels.title')}</LabelButton>
        <Pressable onPress={handleClearProgress} style={styles.clearButton}>
          <Icon name="trash-outline" size={22} color={colors.text.light} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {levels.map((_, index) => {
          const stats = getLevelStats(index);
          const completed = !!stats;
          return (
            <Pressable
              key={index}
              style={[styles.levelCard, completed && styles.levelCardCompleted]}
              onPress={() => handleLevelSelect(index)}
            >
              <LabelButton style={styles.levelNumber}>{index + 1}</LabelButton>
              {completed && stats.stars !== undefined && (
                <View style={styles.starsRow}>
                  {[1, 2, 3].map(i => (
                    <Icon
                      key={i}
                      name={
                        stats.stars! >= i
                          ? 'star'
                          : stats.stars! >= i - 0.5
                            ? 'star-half'
                            : 'star-outline'
                      }
                      size={12}
                      color={stats.stars! >= i - 0.5 ? '#FFD700' : colors.brown.light}
                    />
                  ))}
                </View>
              )}
              {completed && !stats.stars && (
                <Icon name="checkmark-circle" size={16} color={colors.primary} style={styles.checkIcon} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    color: colors.text.light,
  },
  clearButton: {
    padding: spacing.sm,
    width: 44,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  levelCard: {
    width: 70,
    height: 70,
    backgroundColor: colors.brown.medium,
    borderRadius: spacing.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.cardSmall,
  },
  levelCardCompleted: {
    backgroundColor: colors.brown.dark,
  },
  levelNumber: {
    fontSize: typography.fontSize.xxl,
    color: colors.text.light,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  starsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 1,
  },
});
