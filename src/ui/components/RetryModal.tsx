import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows, buttons } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';
import { formatTime } from '../../core/utils.ts';
import { LivesState, msUntilNextLife } from '../../core/progression.ts';

export type RetryReason = 'timeUp' | 'restart';

type Props = {
  reason: RetryReason | null;
  winStreak: number;
  streakMultiplier: number;
  livesState: LivesState;
  isAdAvailable: boolean;
  onUseLife: () => void;
  onWatchAd: () => void;
  onGiveUpStreak: () => void;
  onCancel: () => void;
};

/**
 * Shown when a timed level runs out of time (or the player tries to restart
 * one). Keeping the win streak costs a life, or an ad when lives are out.
 */
export const RetryModal: React.FC<Props> = ({
  reason,
  winStreak,
  streakMultiplier,
  livesState,
  isAdAvailable,
  onUseLife,
  onWatchAd,
  onGiveUpStreak,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());

  const visible = reason !== null;
  const hasStreak = winStreak > 0;
  const hasLives = livesState.lives > 0;

  // Live countdown to the next life while the player is out of them
  useEffect(() => {
    if (!visible || hasLives) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [visible, hasLives]);

  if (!visible) return null;

  const nextLifeMs = msUntilNextLife(livesState, now);

  return (
    <View style={styles.container}>
      <View style={styles.backdrop} />
      <View style={styles.card}>
        <Icon
          name={reason === 'timeUp' ? 'alarm-outline' : 'refresh-outline'}
          size={48}
          color={colors.primary}
        />
        <LabelButton style={styles.title}>
          {reason === 'timeUp'
            ? t('retry.timeUpTitle')
            : t('retry.restartTitle')}
        </LabelButton>

        {hasStreak ? (
          <View style={styles.stakeBox}>
            <View style={styles.stakeRow}>
              <Icon name="flame" size={22} color="#FF6B35" />
              <LabelButton style={styles.stakeValue}>
                {t('retry.streakValue', {
                  count: winStreak,
                  multiplier: streakMultiplier,
                })}
              </LabelButton>
            </View>
            <LabelButton style={styles.stakeText}>
              {t('retry.streakLoss')}
            </LabelButton>
          </View>
        ) : (
          <LabelButton style={styles.stakeText}>
            {t('retry.noStreak')}
          </LabelButton>
        )}

        <View style={styles.livesRow}>
          {Array.from({ length: Math.max(livesState.lives, 0) }).map((_, i) => (
            <Icon key={i} name="heart" size={22} color="#E53935" />
          ))}
          {!hasLives && (
            <LabelButton style={styles.nextLifeText}>
              {t('retry.nextLife', {
                time: formatTime(Math.ceil(nextLifeMs / 1000)),
              })}
            </LabelButton>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {hasStreak && hasLives && (
            <LabelButton
              pressableProps={{
                onPress: onUseLife,
                style: styles.primaryButton,
              }}
              style={styles.primaryButtonText}
            >
              {t('retry.useLife')}
            </LabelButton>
          )}

          {hasStreak && !hasLives && isAdAvailable && (
            <LabelButton
              pressableProps={{
                onPress: onWatchAd,
                style: styles.primaryButton,
              }}
              style={styles.primaryButtonText}
            >
              {t('retry.watchAd')}
            </LabelButton>
          )}

          <LabelButton
            pressableProps={{
              onPress: onGiveUpStreak,
              style: hasStreak ? styles.secondaryButton : styles.primaryButton,
            }}
            style={
              hasStreak ? styles.secondaryButtonText : styles.primaryButtonText
            }
          >
            {hasStreak ? t('retry.giveUpStreak') : t('common.retry')}
          </LabelButton>

          {reason === 'restart' && (
            <LabelButton
              pressableProps={{
                onPress: onCancel,
                style: styles.secondaryButton,
              }}
              style={styles.secondaryButtonText}
            >
              {t('retry.cancel')}
            </LabelButton>
          )}
        </View>
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
    width: '85%',
    gap: spacing.md,
    ...shadows.card,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stakeBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  stakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stakeValue: {
    fontSize: typography.fontSize.xxl,
    color: '#FF6B35',
  },
  stakeText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  livesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 24,
  },
  nextLifeText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    ...buttons.primary,
  },
  primaryButtonText: {
    ...buttons.primaryText,
  },
  secondaryButton: {
    ...buttons.secondary,
  },
  secondaryButtonText: {
    ...buttons.secondaryText,
  },
});
