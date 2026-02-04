import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { GameStorage } from '../../services/GameStorage.ts';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../state/useAppStore.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

export const LevelSelectScreen: React.FC<Props> = ({ navigation }) => {
  const levels = useAppStore(state => state.levels);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadCompletedLevels = async () => {
        const completed = await GameStorage.getCompletedLevels();
        setCompletedLevels(completed.map(l => l.levelIndex));
      };
      loadCompletedLevels();
    }, [])
  );

  const handleLevelSelect = (levelIndex: number) => {
    navigation.navigate('GameScreen', { levelNumber: levelIndex });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isCompleted = (index: number) => completedLevels.includes(index);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color={colors.text.light} />
        </Pressable>
        <LabelButton style={styles.title}>Levels</LabelButton>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.grid}>
        {levels.map((_, index) => (
          <Pressable
            key={index}
            style={[styles.levelCard, isCompleted(index) && styles.levelCardCompleted]}
            onPress={() => handleLevelSelect(index)}
          >
            <LabelButton style={styles.levelNumber}>{index + 1}</LabelButton>
            {isCompleted(index) && (
              <Icon name="checkmark-circle" size={16} color={colors.primary} style={styles.checkIcon} />
            )}
          </Pressable>
        ))}
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
  placeholder: {
    width: 44,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
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
});
