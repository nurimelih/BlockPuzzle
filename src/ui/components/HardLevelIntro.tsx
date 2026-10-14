import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows, buttons } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';

type Props = {
  visible: boolean;
  timeLimit: number;
  winStreak: number;
  streakMultiplier: number;
  lives: number;
  onStart: () => void;
};

/**
 * Announces a timed level before the clock starts, so the stakes (the streak)
 * are clear up front rather than only when time runs out.
 */
export const HardLevelIntro: React.FC<Props> = ({
  visible,
  timeLimit,
  winStreak,
  streakMultiplier,
  lives,
  onStart,
}) => {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.backdrop} />
      <View style={styles.card}>
        <Icon name="stopwatch-outline" size={48} color={colors.primary} />
        <LabelButton style={styles.title}>{t('hardLevel.title')}</LabelButton>
        <LabelButton style={styles.text}>
          {t('hardLevel.timeLimit', { seconds: timeLimit })}
        </LabelButton>

        {winStreak > 0 && (
          <View style={styles.row}>
            <Icon name="flame" size={20} color="#FF6B35" />
            <LabelButton style={styles.streakText}>
              {t('hardLevel.streakAtStake', {
                count: winStreak,
                multiplier: streakMultiplier,
              })}
            </LabelButton>
          </View>
        )}

        <View style={styles.row}>
          {Array.from({ length: lives }).map((_, i) => (
            <Icon key={i} name="heart" size={20} color="#E53935" />
          ))}
        </View>

        <LabelButton
          pressableProps={{ onPress: onStart, style: styles.primaryButton }}
          style={styles.primaryButtonText}
        >
          {t('hardLevel.start')}
        </LabelButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: colors.background.cream,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '80%',
    gap: spacing.md,
    ...shadows.card,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  text: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.fontSize.lg,
    color: '#FF6B35',
  },
  primaryButton: {
    ...buttons.primary,
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    ...buttons.primaryText,
  },
});
